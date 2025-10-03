/**
 * Unit tests for the deterministic budget calculation function
 * Module 2: Deterministic Budget Calculator
 */

import { calcDeterministic, validateDeterministicInput, type DeterministicInput } from '../src/utils/calcDeterministic';

describe('calcDeterministic', () => {
  const mockPriceMap = {
    gpu_hours: {
      small: 1.5,
      medium: 3.2,
      large: 7.0
    },
    token_unit_cost: 0.00002,
    label_unit_cost: 0.06
  };

  const baseInput: DeterministicInput = {
    projectId: null,
    dataset_gb: 10.0,
    model_size: 'medium',
    epochs_per_gb: 2,
    label_count: 1000,
    monthly_tokens: 100000,
    team: [
      { role: 'developer', hours: 40, hourly_rate: 50 },
      { role: 'data_scientist', hours: 20, hourly_rate: 80 }
    ],
    price_map: mockPriceMap
  };

  test('should calculate budget deterministically', () => {
    const result1 = calcDeterministic(baseInput);
    const result2 = calcDeterministic(baseInput);

    // Results should be identical
    expect(result1.total_cost).toBe(result2.total_cost);
    expect(result1.metadata.input_hash).toBe(result2.metadata.input_hash);
    expect(result1.line_items).toEqual(result2.line_items);
  });

  test('should calculate correct GPU training costs', () => {
    const result = calcDeterministic(baseInput);
    
    // Expected: 10GB * 2 epochs * 0.5 hours/epoch/GB * $3.2/hour = $32
    const gpuLineItem = result.line_items.find(item => item.subcategory === 'gpu_training');
    expect(gpuLineItem).toBeDefined();
    expect(gpuLineItem!.quantity).toBe(10); // 10GB * 2 epochs * 0.5 hours
    expect(gpuLineItem!.unit_cost).toBe(3.2);
    expect(gpuLineItem!.total_cost).toBe(32);
  });

  test('should calculate correct labeling costs', () => {
    const result = calcDeterministic(baseInput);
    
    // Expected: 1000 labels * $0.06/label = $60
    const labelingItem = result.line_items.find(item => item.subcategory === 'labeling');
    expect(labelingItem).toBeDefined();
    expect(labelingItem!.quantity).toBe(1000);
    expect(labelingItem!.unit_cost).toBe(0.06);
    expect(labelingItem!.total_cost).toBe(60);
  });

  test('should calculate correct token costs', () => {
    const result = calcDeterministic(baseInput);
    
    // Expected: 100000 tokens * $0.00002/token = $2
    const tokenItem = result.line_items.find(item => item.subcategory === 'api_calls');
    expect(tokenItem).toBeDefined();
    expect(tokenItem!.quantity).toBe(100000);
    expect(tokenItem!.unit_cost).toBe(0.00002);
    expect(tokenItem!.total_cost).toBe(2);
  });

  test('should calculate correct team costs', () => {
    const result = calcDeterministic(baseInput);
    
    const teamItems = result.line_items.filter(item => item.category === 'team');
    expect(teamItems).toHaveLength(2);

    const developerItem = teamItems.find(item => item.subcategory === 'developer');
    expect(developerItem).toBeDefined();
    expect(developerItem!.total_cost).toBe(2000); // 40 * $50

    const dataScientistItem = teamItems.find(item => item.subcategory === 'data_scientist');
    expect(dataScientistItem).toBeDefined();
    expect(dataScientistItem!.total_cost).toBe(1600); // 20 * $80
  });

  test('should calculate correct total and summary', () => {
    const result = calcDeterministic(baseInput);
    
    // Expected totals:
    // GPU: $32, Labeling: $60, Tokens: $2, Team: $3600
    // Total: $3694
    expect(result.total_cost).toBe(3694);
    expect(result.summary.compute_cost).toBe(34); // GPU + Tokens: $32 + $2
    expect(result.summary.data_cost).toBe(60); // Labeling: $60
    expect(result.summary.team_cost).toBe(3600); // Team: $2000 + $1600
    expect(result.summary.monthly_operational_cost).toBe(2); // Monthly tokens: $2
  });

  test('should handle zero values correctly', () => {
    const zeroInput: DeterministicInput = {
      ...baseInput,
      dataset_gb: 0,
      label_count: 0,
      monthly_tokens: 0,
      team: []
    };

    const result = calcDeterministic(zeroInput);
    expect(result.total_cost).toBe(0);
    expect(result.line_items).toHaveLength(0);
  });

  test('should handle different model sizes', () => {
    const smallModel = calcDeterministic({ ...baseInput, model_size: 'small' });
    const largeModel = calcDeterministic({ ...baseInput, model_size: 'large' });

    const smallGpuItem = smallModel.line_items.find(item => item.subcategory === 'gpu_training');
    const largeGpuItem = largeModel.line_items.find(item => item.subcategory === 'gpu_training');

    expect(smallGpuItem!.unit_cost).toBe(1.5);
    expect(largeGpuItem!.unit_cost).toBe(7.0);
    expect(largeGpuItem!.total_cost).toBeGreaterThan(smallGpuItem!.total_cost);
  });

  test('should include proper metadata', () => {
    const result = calcDeterministic(baseInput);
    
    expect(result.metadata.version).toBe('1.0.0');
    expect(result.metadata.input_hash).toMatch(/^[0-9a-f]+$/);
    expect(result.metadata.calculation_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('should mark all items as deterministic source', () => {
    const result = calcDeterministic(baseInput);
    
    result.line_items.forEach(item => {
      expect(item.source).toBe('deterministic');
      expect(item.confidence_score).toBe(1.0);
    });
  });
});

describe('validateDeterministicInput', () => {
  const validInput: DeterministicInput = {
    projectId: null,
    dataset_gb: 10.0,
    model_size: 'medium',
    epochs_per_gb: 2,
    label_count: 1000,
    monthly_tokens: 100000,
    team: [{ role: 'developer', hours: 40, hourly_rate: 50 }],
    price_map: {
      gpu_hours: { small: 1.5, medium: 3.2, large: 7.0 },
      token_unit_cost: 0.00002,
      label_unit_cost: 0.06
    }
  };

  test('should validate correct input', () => {
    const result = validateDeterministicInput(validInput);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject negative dataset_gb', () => {
    const invalidInput = { ...validInput, dataset_gb: -1 };
    const result = validateDeterministicInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('dataset_gb must be a non-negative number');
  });

  test('should reject invalid model_size', () => {
    const invalidInput = { ...validInput, model_size: 'invalid' };
    const result = validateDeterministicInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('model_size must be one of: small, medium, large');
  });

  test('should reject non-positive epochs_per_gb', () => {
    const invalidInput = { ...validInput, epochs_per_gb: 0 };
    const result = validateDeterministicInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('epochs_per_gb must be a positive number');
  });

  test('should reject non-integer label_count', () => {
    const invalidInput = { ...validInput, label_count: 10.5 };
    const result = validateDeterministicInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('label_count must be a non-negative integer');
  });

  test('should reject invalid team member data', () => {
    const invalidInput = {
      ...validInput,
      team: [{ role: '', hours: -1, hourly_rate: -10 }]
    };
    const result = validateDeterministicInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('team[0].role must be a non-empty string');
    expect(result.errors).toContain('team[0].hours must be a non-negative number');
    expect(result.errors).toContain('team[0].hourly_rate must be a non-negative number');
  });

  test('should reject missing price_map fields', () => {
    const invalidInput = {
      ...validInput,
      price_map: {
        gpu_hours: { small: 1.5 }, // missing medium, large
        // missing token_unit_cost, label_unit_cost
      }
    };
    const result = validateDeterministicInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});