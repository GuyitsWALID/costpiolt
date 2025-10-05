'use client';

import { useState } from 'react';
import { Calculator, Loader2 } from 'lucide-react';
import { calcDeterministic, validateDeterministicInput } from '@/utils/calcDeterministic';
import type { DeterministicInput, DeterministicResult } from '@/utils/calcDeterministic';

interface DeterministicCalcButtonProps {
  input: DeterministicInput;
  onResult: (result: DeterministicResult | { error: string }) => void;
  className?: string;
}

export default function DeterministicCalcButton({
  input,
  onResult,
  className = ''
}: DeterministicCalcButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      // Validate input
      const validation = validateDeterministicInput(input);
      if (!validation.isValid) {
        throw new Error('Invalid input: ' + validation.errors.join(', '));
      }

      // Calculate result
      const result = calcDeterministic(input);
      onResult(result);
    } catch (error) {
      console.error('Calculation error:', error);
      onResult({ error: error instanceof Error ? error.message : 'Calculation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCalculate}
      disabled={loading}
      className={`inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Calculating...</span>
        </>
      ) : (
        <>
          <Calculator className="h-4 w-4" />
          <span>Calculate Budget</span>
        </>
      )}
    </button>
  );
}