"use client";

import React, { useState } from 'react';
import { X, Zap, DollarSign, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface TeamMember {
  role: string;
  hours: number;
  hourly_rate: number;
}

interface QuickEstimateRequest {
  projectId?: string | null;
  projectName: string;
  projectType: 'prototype' | 'fine_tune' | 'production';
  modelApproach: 'api_only' | 'fine_tune' | 'from_scratch';
  dataset_gb: number;
  label_count: number;
  monthly_tokens: number;
  team: TeamMember[];
}

interface BudgetRow {
  category: string;
  subcategory: string;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  unit_type: string;
  confidence_score: number;
}

interface QuickEstimateResponse {
  success: boolean;
  projectId: string;
  line_items: BudgetRow[];
  warnings: string[];
  total_estimate: number;
}

interface QuickEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (lineItems: BudgetRow[], projectId: string) => void;
}

export default function QuickEstimateModal({ isOpen, onClose, onImport }: QuickEstimateModalProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [formData, setFormData] = useState<QuickEstimateRequest>({
    projectName: '',
    projectType: 'prototype',
    modelApproach: 'api_only',
    dataset_gb: 1,
    label_count: 1000,
    monthly_tokens: 100000,
    team: [
      { role: 'Data Scientist', hours: 40, hourly_rate: 85 },
      { role: 'ML Engineer', hours: 20, hourly_rate: 95 }
    ]
  });
  const [results, setResults] = useState<QuickEstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setError(null);

    try {
      // Get auth token (assuming you have Supabase auth set up)
      const token = localStorage.getItem('sb-access-token'); // Adjust based on your auth implementation
      
      const response = await fetch('/api/edge/quick-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate estimate');
      }

      const data: QuickEstimateResponse = await response.json();
      setResults(data);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('form');
    }
  };

  const handleImport = () => {
    if (results && onImport) {
      onImport(results.line_items, results.projectId);
      onClose();
    }
  };

  const resetModal = () => {
    setStep('form');
    setResults(null);
    setError(null);
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      team: [...formData.team, { role: '', hours: 20, hourly_rate: 75 }]
    });
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string | number) => {
    const updatedTeam = [...formData.team];
    updatedTeam[index] = { ...updatedTeam[index], [field]: value };
    setFormData({ ...formData, team: updatedTeam });
  };

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      team: formData.team.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-blue-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Quick Estimate</h2>
              <p className="text-sm text-slate-400">AI-powered budget forecasting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Basics */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="My AI Project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Type
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="prototype">Prototype/POC</option>
                    <option value="fine_tune">Fine-tuning Existing Model</option>
                    <option value="production">Production System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Model Approach
                  </label>
                  <select
                    value={formData.modelApproach}
                    onChange={(e) => setFormData({ ...formData, modelApproach: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="api_only">API-only (OpenAI, etc.)</option>
                    <option value="fine_tune">Fine-tune Existing Model</option>
                    <option value="from_scratch">Train from Scratch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monthly API Tokens
                  </label>
                  <input
                    type="number"
                    value={formData.monthly_tokens}
                    onChange={(e) => setFormData({ ...formData, monthly_tokens: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dataset Size (GB)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dataset_gb}
                    onChange={(e) => setFormData({ ...formData, dataset_gb: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Label Count
                  </label>
                  <input
                    type="number"
                    value={formData.label_count}
                    onChange={(e) => setFormData({ ...formData, label_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Team Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Team</h3>
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Add Member
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.team.map((member, index) => (
                    <div key={index} className="grid grid-cols-4 gap-3 p-4 bg-slate-800/50 rounded-lg">
                      <input
                        type="text"
                        placeholder="Role"
                        value={member.role}
                        onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:border-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Hours"
                        value={member.hours}
                        onChange={(e) => updateTeamMember(index, 'hours', parseInt(e.target.value) || 0)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:border-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Rate/hr"
                        value={member.hourly_rate}
                        onChange={(e) => updateTeamMember(index, 'hourly_rate', parseInt(e.target.value) || 0)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 btn-cyber bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Generate Estimate</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {step === 'loading' && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-white mb-2">Generating Your Estimate</h3>
              <p className="text-slate-400">Our AI is analyzing your project requirements...</p>
            </div>
          )}

          {step === 'results' && results && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-blue-300">Total Estimate</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${results.total_estimate.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-green-300">Line Items</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {results.line_items.length}
                  </div>
                </div>

                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-purple-300">Avg Confidence</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(results.line_items.reduce((sum, item) => sum + item.confidence_score, 0) / results.line_items.length * 100)}%
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {results.warnings.length > 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-300">Warnings</span>
                  </div>
                  <ul className="space-y-1">
                    {results.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-200">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Line Items */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Cost Breakdown</h3>
                <div className="space-y-2">
                  {results.line_items.map((item, index) => (
                    <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-white">{item.description}</h4>
                          <p className="text-sm text-slate-400">
                            {item.quantity} {item.unit_type} × ${item.unit_cost.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
                            ${item.total_cost.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-400">
                            {Math.round(item.confidence_score * 100)}% confidence
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                          {item.category}
                        </span>
                        <span className="inline-block px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
                          {item.subcategory}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={handleImport}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Import to Budget</span>
                </button>
                <button
                  onClick={resetModal}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  New Estimate
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}