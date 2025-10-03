/**
 * Integration tests for the deterministic budget calculator API endpoint
 * Module 2: Deterministic Budget Calculator
 */

import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/calc/deterministic';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn()
      }))
    }))
  }))
}));

describe('/api/calc/deterministic', () => {
  const validRequestBody = {
    projectId: null,
    dataset_gb: 10.0,
    model_size: 'medium',
    epochs_per_gb: 2,
    label_count: 1000,
    monthly_tokens: 100000,
    team: [
      { role: 'developer', hours: 40, hourly_rate: 50 }
    ],
    price_map: {
      gpu_hours: {
        small: 1.5,
        medium: 3.2,
        large: 7.0
      },
      token_unit_cost: 0.00002,
      label_unit_cost: 0.06
    }
  };

  beforeEach(() => {
    // Reset environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  test('should handle POST request successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: validRequestBody
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.total_cost).toBeGreaterThan(0);
    expect(data.data.line_items).toBeInstanceOf(Array);
    expect(data.data.summary).toBeDefined();
    expect(data.data.metadata).toBeDefined();
  });

  test('should reject non-POST methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      body: validRequestBody
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Method not allowed. Use POST.');
  });

  test('should validate input data', async () => {
    const invalidBody = {
      ...validRequestBody,
      dataset_gb: -1, // Invalid negative value
      model_size: 'invalid' // Invalid model size
    };

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: invalidBody
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Invalid input data');
    expect(data.error.details).toBeInstanceOf(Array);
    expect(data.error.details.length).toBeGreaterThan(0);
  });

  test('should handle missing required fields', async () => {
    const incompleteBody = {
      dataset_gb: 10.0,
      // Missing required fields
    };

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: incompleteBody
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error.details).toBeInstanceOf(Array);
    expect(data.error.details.length).toBeGreaterThan(0);
  });

  test('should return consistent results for same input', async () => {
    const { req: req1, res: res1 } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: validRequestBody
    });

    const { req: req2, res: res2 } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: validRequestBody
    });

    await handler(req1, res1);
    await handler(req2, res2);

    expect(res1._getStatusCode()).toBe(200);
    expect(res2._getStatusCode()).toBe(200);

    const data1 = JSON.parse(res1._getData());
    const data2 = JSON.parse(res2._getData());

    expect(data1.data.total_cost).toBe(data2.data.total_cost);
    expect(data1.data.metadata.input_hash).toBe(data2.data.metadata.input_hash);
  });

  test('should calculate expected line items', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: validRequestBody
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    const lineItems = data.data.line_items;

    // Should have GPU training, labeling, tokens, and team items
    expect(lineItems.some((item: any) => item.subcategory === 'gpu_training')).toBe(true);
    expect(lineItems.some((item: any) => item.subcategory === 'labeling')).toBe(true);
    expect(lineItems.some((item: any) => item.subcategory === 'api_calls')).toBe(true);
    expect(lineItems.some((item: any) => item.subcategory === 'developer')).toBe(true);

    // All items should be marked as deterministic
    lineItems.forEach((item: any) => {
      expect(item.source).toBe('deterministic');
      expect(item.confidence_score).toBe(1.0);
    });
  });

  test('should include proper response metadata', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: validRequestBody
    });

    await handler(req, res);

    const data = JSON.parse(res._getData());
    
    expect(data.data.metadata.version).toBe('1.0.0');
    expect(data.data.metadata.input_hash).toMatch(/^[0-9a-f]+$/);
    expect(data.data.metadata.calculation_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('should handle zero values correctly', async () => {
    const zeroBody = {
      ...validRequestBody,
      dataset_gb: 0,
      label_count: 0,
      monthly_tokens: 0,
      team: []
    };

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: zeroBody
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.data.total_cost).toBe(0);
    expect(data.data.line_items).toHaveLength(0);
  });

  test('should handle authentication header gracefully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        'authorization': 'Bearer invalid-token'
      },
      body: validRequestBody
    });

    // Mock Supabase auth failure
    const mockSupabase = require('@supabase/supabase-js').createClient();
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Invalid authentication token');
  });

  test('should handle server errors gracefully', async () => {
    // Mock calculation function to throw error
    const originalCalc = require('../src/utils/calcDeterministic').calcDeterministic;
    const mockCalc = jest.fn(() => {
      throw new Error('Calculation failed');
    });
    
    // Replace the function temporarily
    require('../src/utils/calcDeterministic').calcDeterministic = mockCalc;

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: validRequestBody
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Internal server error during calculation');

    // Restore original function
    require('../src/utils/calcDeterministic').calcDeterministic = originalCalc;
  });
});