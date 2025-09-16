"use client";

import React, { useState } from 'react';
import { HelpCircle, X, Lightbulb, TrendingDown, AlertCircle } from 'lucide-react';

interface ExplainLineItemButtonProps {
  budgetRowId: string;
  className?: string;
}

interface ExplanationResponse {
  success: boolean;
  explanation: string;
  optimization_tips: string[];
}

export default function ExplainLineItemButton({ budgetRowId, className = '' }: ExplainLineItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get auth token (adjust based on your auth implementation)
      const token = localStorage.getItem('sb-access-token');
      
      const response = await fetch('/api/edge/explain-line-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ budgetRowId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }

      const data: ExplanationResponse = await response.json();
      setExplanation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    setIsOpen(true);
    if (!explanation) {
      fetchExplanation();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleClick}
        className={`inline-flex items-center space-x-1 text-slate-400 hover:text-blue-400 transition-colors ${className}`}
        title="Explain this cost"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="text-sm">Explain</span>
      </button>

      {/* Explanation Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-dark max-w-lg w-full rounded-2xl border border-blue-500/20">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Cost Explanation</h2>
                  <p className="text-sm text-slate-400">AI-powered cost breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-slate-400">Analyzing cost component...</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300">{error}</span>
                  </div>
                </div>
              )}

              {explanation && (
                <div className="space-y-6">
                  {/* Main Explanation */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <span>What this cost covers</span>
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {explanation.explanation}
                    </p>
                  </div>

                  {/* Optimization Tips */}
                  {explanation.optimization_tips.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
                        <TrendingDown className="w-5 h-5 text-green-400" />
                        <span>Cost Optimization Tips</span>
                      </h3>
                      <div className="space-y-3">
                        {explanation.optimization_tips.map((tip, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-green-400 text-sm font-medium">{index + 1}</span>
                            </div>
                            <p className="text-green-200 text-sm leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Got it
                    </button>
                    <button
                      onClick={() => {
                        setExplanation(null);
                        fetchExplanation();
                      }}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}