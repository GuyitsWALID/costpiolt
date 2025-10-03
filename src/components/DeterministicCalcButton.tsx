/**
 * Module 2: Deterministic Calculator UI Button Component
 * Triggers the deterministic budget calculation API
 */

'use client';

import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Typography, Box, Collapse, FormControlLabel, Checkbox } from '@mui/material';
import { Calculator as CalculatorIcon, CheckCircle as CheckIcon, AlertCircle as ErrorIcon } from 'lucide-react';
import type { DeterministicInput, DeterministicResult } from '../utils/calcDeterministic';

interface DeterministicCalcButtonProps {
  /** Input data for the calculation */
  input: DeterministicInput;
  /** Optional project ID to save budget data to */
  saveToProject?: string;
  /** Optional authentication token */
  authToken?: string;
  /** Callback when calculation completes successfully */
  onSuccess?: (result: DeterministicResult & { budget_rows_created?: number }) => void;
  /** Callback when calculation fails */
  onError?: (error: string) => void;
  /** Button text override */
  buttonText?: string;
  /** Button variant */
  variant?: 'contained' | 'outlined' | 'text';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Disabled state */
  disabled?: boolean;
  /** Show save option */
  showSaveOption?: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: DeterministicResult & { budget_rows_created?: number };
  error?: {
    message: string;
    details?: string[];
  };
}

export default function DeterministicCalcButton({
  input,
  saveToProject,
  authToken,
  onSuccess,
  onError,
  buttonText = 'Calculate Budget',
  variant = 'contained',
  size = 'medium',
  disabled = false,
  showSaveOption = false
}: DeterministicCalcButtonProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<DeterministicResult & { budget_rows_created?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [shouldSave, setShouldSave] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const requestBody = {
        ...input,
        ...(shouldSave && saveToProject && { save_to_project: saveToProject })
      };

      const response = await fetch('/api/calc/deterministic', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error?.message || `HTTP ${response.status}: Request failed`;
        const errorDetails = data.error?.details?.join(', ') || '';
        const fullError = errorDetails ? `${errorMessage} - ${errorDetails}` : errorMessage;
        
        setError(fullError);
        onError?.(fullError);
        return;
      }

      if (data.data) {
        setResult(data.data);
        onSuccess?.(data.data);
        setShowDetails(true);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error or unexpected response';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Box>
      {showSaveOption && saveToProject && (
        <Box mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={shouldSave}
                onChange={(e) => setShouldSave(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                Save budget breakdown to project
              </Typography>
            }
          />
        </Box>
      )}

      <Button
        variant={variant}
        size={size}
        onClick={handleCalculate}
        disabled={disabled || isCalculating}
        startIcon={
          isCalculating ? (
            <CircularProgress size={20} color="inherit" />
          ) : result ? (
            <CheckIcon />
          ) : (
            <CalculatorIcon />
          )
        }
        sx={{
          minWidth: 160,
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        {isCalculating ? 'Calculating...' : result ? (shouldSave ? 'Save & Recalculate' : 'Recalculate') : buttonText}
      </Button>

      {/* Error Display */}
      {error && (
        <Box mt={2}>
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            sx={{ alignItems: 'center' }}
          >
            <Typography variant="body2" component="div">
              <strong>Calculation Failed:</strong> {error}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Success Result Display */}
      {result && (
        <Box mt={2}>
          <Alert 
            severity="success" 
            icon={<CheckIcon />}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
            }
          >
            <Typography variant="body2" component="div">
              <strong>Total Budget:</strong> {formatCurrency(result.total_cost)}
              {result.budget_rows_created !== undefined && (
                <span> • {result.budget_rows_created} line items saved</span>
              )}
            </Typography>
          </Alert>

          <Collapse in={showDetails}>
            <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1} border="1px solid" borderColor="divider">
              <Typography variant="h6" gutterBottom>
                Budget Breakdown
              </Typography>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Compute</Typography>
                  <Typography variant="h6">{formatCurrency(result.summary.compute_cost)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Data</Typography>
                  <Typography variant="h6">{formatCurrency(result.summary.data_cost)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Team</Typography>
                  <Typography variant="h6">{formatCurrency(result.summary.team_cost)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Monthly Ops</Typography>
                  <Typography variant="h6">{formatCurrency(result.summary.monthly_operational_cost)}</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Line Items ({result.line_items.length})
              </Typography>
              
              {result.line_items.map((item, index) => (
                <Box 
                  key={index} 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  py={1}
                  borderBottom={index < result.line_items.length - 1 ? "1px solid" : "none"}
                  borderColor="divider"
                >
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={500}>
                      {item.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.quantity.toLocaleString()} {item.unit_type} × {formatCurrency(item.unit_cost)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(item.total_cost)}
                  </Typography>
                </Box>
              ))}

              <Box mt={2} pt={1} borderTop="1px solid" borderColor="divider">
                <Typography variant="caption" color="text.secondary">
                  Calculated: {new Date(result.metadata.calculation_timestamp).toLocaleString()}
                  {' • '}
                  Hash: {result.metadata.input_hash}
                  {' • '}
                  v{result.metadata.version}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}