"use client";

import React, { useState } from 'react';
import { Zap, Calculator, Brain, Plus, DollarSign } from 'lucide-react';
import QuickEstimateModal from '@/components/QuickEstimateModal';
import ExplainLineItemButton from '@/components/ExplainLineItemButton';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/components/auth-provider';
import { BudgetRow } from '@/lib/supabase';

export default function BudgetEditor() {
  const { user, signOut } = useAuth();
  const [isQuickEstimateOpen, setIsQuickEstimateOpen] = useState(false);
  const [budgetRows, setBudgetRows] = useState<BudgetRow[]>([
    // Sample data for demonstration
    {
      id: '1',
      project_id: 'sample-project',
      category: 'compute',
      subcategory: 'gpu_training',
      description: 'GPU training (A100) - 24.0 hours',
      quantity: 24,
      unit_cost: 1.80,
      total_cost: 43.20,
      unit_type: 'hours',
      source: 'ai_estimate',
      confidence_score: 0.85,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      project_id: 'sample-project',
      category: 'team',
      subcategory: 'data_scientist',
      description: 'Data Scientist - 40 hours @ $85/hr',
      quantity: 40,
      unit_cost: 85,
      total_cost: 3400,
      unit_type: 'hours',
      source: 'manual',
      confidence_score: 0.90,
      created_at: new Date().toISOString()
    }
  ]);

  const handleImportEstimate = (newRows: BudgetRow[]) => {
    // Convert the AI estimate format to our budget row format
    const formattedRows: BudgetRow[] = newRows.map((row, index) => ({
      ...row,
      id: `imported-${Date.now()}-${index}` // Generate temporary IDs
    }));
    
    setBudgetRows([...budgetRows, ...formattedRows]);
  };

  const totalCost = budgetRows.reduce((sum, row) => sum + row.total_cost, 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:from-purple-50 light:via-white light:to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Budget Editor</h1>
                <p className="text-muted-foreground">Build and manage your AI project budget</p>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    {user?.email}
                  </span>
                  <button
                    onClick={signOut}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">${totalCost.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Estimate</div>
                </div>
              </div>
            </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setIsQuickEstimateOpen(true)}
              className="btn-cyber bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Quick Estimate</span>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Calculator className="w-4 h-4" />
              <span>Custom Calculator</span>
            </button>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Insights</span>
            </button>
          </div>
        </div>

        {/* Budget Table */}
        <div className="glass-dark rounded-2xl border border-blue-500/20 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Cost Breakdown</h2>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Row</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-muted-foreground font-medium">Description</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Quantity</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Unit Cost</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Total</th>
                  <th className="text-center p-4 text-muted-foreground font-medium">Confidence</th>
                  <th className="text-center p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgetRows.map((row, index) => (
                  <tr key={row.id} className={index % 2 === 0 ? 'bg-muted/20' : 'bg-transparent'}>
                    <td className="p-4">
                      <div>
                        <div className="text-foreground font-medium">{row.description}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                            {row.category}
                          </span>
                          <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                            {row.subcategory}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right text-muted-foreground">
                      {row.quantity} {row.unit_type}
                    </td>
                    <td className="p-4 text-right text-muted-foreground">
                      ${row.unit_cost.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-foreground font-semibold">
                          {row.total_cost.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center space-x-1">
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                            style={{ width: `${(row.confidence_score || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {Math.round((row.confidence_score || 0) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <ExplainLineItemButton budgetRowId={row.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {budgetRows.length === 0 && (
            <div className="p-12 text-center">
              <Calculator className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">No budget items yet</h3>
              <p className="text-slate-500 mb-6">Get started by creating a quick estimate or adding items manually</p>
              <button
                onClick={() => setIsQuickEstimateOpen(true)}
                className="btn-cyber bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 mx-auto"
              >
                <Zap className="w-4 h-4" />
                <span>Create Quick Estimate</span>
              </button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="glass-dark p-6 rounded-xl border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Compute Costs</span>
              <Calculator className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              ${budgetRows.filter(r => r.category === 'compute').reduce((sum, r) => sum + r.total_cost, 0).toLocaleString()}
            </div>
          </div>

          <div className="glass-dark p-6 rounded-xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Team Costs</span>
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              ${budgetRows.filter(r => r.category === 'team').reduce((sum, r) => sum + r.total_cost, 0).toLocaleString()}
            </div>
          </div>

          <div className="glass-dark p-6 rounded-xl border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Line Items</span>
              <Plus className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {budgetRows.length}
            </div>
          </div>

          <div className="glass-dark p-6 rounded-xl border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Avg Confidence</span>
              <Brain className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {budgetRows.length > 0 ? 
                Math.round(budgetRows.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / budgetRows.length * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Quick Estimate Modal */}
      <QuickEstimateModal
        isOpen={isQuickEstimateOpen}
        onClose={() => setIsQuickEstimateOpen(false)}
        onImport={handleImportEstimate}
      />
      </div>
    </ProtectedRoute>
  );
}