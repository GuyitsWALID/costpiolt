"use client";

import { useState } from 'react';
import { Calculator, Download, RefreshCw } from 'lucide-react';
import { calcDeterministic, validateDeterministicInput } from '@/utils/calcDeterministic';
import type { DeterministicInput, DeterministicResult } from '@/utils/calcDeterministic';

export default function BudgetTool() {
  const [input, setInput] = useState<DeterministicInput>({
    dataset_gb: 10,
    model_size: 'medium' as const,
    epochs_per_gb: 5,
    label_count: 1000,
    monthly_tokens: 100000,
    team: [
      { role: 'ML Engineer', hours: 160, hourly_rate: 75 },
      { role: 'Data Scientist', hours: 120, hourly_rate: 85 }
    ],
    price_map: {
      gpu_hours: {
        small: 0.50,
        medium: 1.20,
        large: 2.80
      },
      token_unit_cost: 0.002,
      label_unit_cost: 0.05
    }
  });
  
  const [result, setResult] = useState<DeterministicResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate input
      const validation = validateDeterministicInput(input);
      if (!validation.isValid) {
        throw new Error('Validation failed: ' + validation.errors.join(', '));
      }

      // Calculate deterministic result
      const calcResult = calcDeterministic(input);
      setResult(calcResult);
    } catch (err) {
      console.error('Calculation error:', err);
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = () => {
    setInput(prev => ({
      ...prev,
      team: [...prev.team, { role: 'New Role', hours: 80, hourly_rate: 60 }]
    }));
  };

  const updateTeamMember = (index: number, field: keyof typeof input.team[0], value: string | number) => {
    setInput(prev => ({
      ...prev,
      team: prev.team.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const removeTeamMember = (index: number) => {
    setInput(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Budget Calculator</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Calculate accurate budget estimates for your AI projects using deterministic pricing models.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Project Parameters</h2>
            
            <div className="space-y-6">
              {/* Dataset & Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dataset Size (GB)
                  </label>
                  <input
                    type="number"
                    value={input.dataset_gb}
                    onChange={(e) => setInput(prev => ({ ...prev, dataset_gb: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model Size
                  </label>
                  <select
                    value={input.model_size}
                    onChange={(e) => setInput(prev => ({ ...prev, model_size: e.target.value as 'small' | 'medium' | 'large' }))}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              {/* Training & Usage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Epochs per GB
                  </label>
                  <input
                    type="number"
                    value={input.epochs_per_gb}
                    onChange={(e) => setInput(prev => ({ ...prev, epochs_per_gb: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Tokens
                  </label>
                  <input
                    type="number"
                    value={input.monthly_tokens}
                    onChange={(e) => setInput(prev => ({ ...prev, monthly_tokens: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Label Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Labels to Process
                </label>
                <input
                  type="number"
                  value={input.label_count}
                  onChange={(e) => setInput(prev => ({ ...prev, label_count: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Team Members
                  </label>
                  <button
                    onClick={addTeamMember}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Member
                  </button>
                </div>
                <div className="space-y-3">
                  {input.team.map((member, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-end">
                      <input
                        type="text"
                        placeholder="Role"
                        value={member.role}
                        onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                        className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder="Hours"
                        value={member.hours}
                        onChange={(e) => updateTeamMember(index, 'hours', parseFloat(e.target.value) || 0)}
                        className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder="$/hr"
                        value={member.hourly_rate}
                        onChange={(e) => updateTeamMember(index, 'hourly_rate', parseFloat(e.target.value) || 0)}
                        className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => removeTeamMember(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                        disabled={input.team.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    <span>Calculate Budget</span>
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Budget Breakdown</h2>
              {result && (
                <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-6">
                {/* Total Cost */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Project Cost</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      ${result.total_cost.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Compute</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      ${result.summary.compute_cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Data</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      ${result.summary.data_cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Team</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      ${result.summary.team_cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Ops</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      ${result.summary.monthly_operational_cost.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Detailed Breakdown</h3>
                  <div className="space-y-2">
                    {result.line_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.description}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {item.quantity} {item.unit_type} × ${item.unit_cost}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${item.total_cost.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Enter your project parameters and click &quot;Calculate Budget&quot; to see the cost breakdown.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}