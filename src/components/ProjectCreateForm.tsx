'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { X } from 'lucide-react';

interface PriceMap {
  gpu_hours: {
    small: number;
    medium: number;
    large: number;
  };
  token_unit_cost: number;
  label_unit_cost: number;
  timestamp: number;
}

interface CostEstimation {
  total_estimated_cost: number;
  cost_breakdown: Record<string, number>;
}

interface ProjectCreateFormProps {
  onCancel?: () => void;
  onSuccess?: (projectId: string) => void;
}

const PROJECT_TYPES = [
  { value: 'image_classification', label: 'Image Classification' },
  { value: 'object_detection', label: 'Object Detection' },
  { value: 'nlp', label: 'Natural Language Processing' },
  { value: 'recommendation_system', label: 'Recommendation System' },
  { value: 'time_series', label: 'Time Series Analysis' }
];

const MODEL_APPROACHES = [
  { value: 'simple', label: 'Simple/Pre-trained Model' },
  { value: 'custom', label: 'Custom Model Training' },
  { value: 'llm_fine_tuning', label: 'LLM Fine-tuning' }
];

const GPU_TYPES = [
  { value: 'small', label: 'Small (T4/V100 - 16GB VRAM)' },
  { value: 'medium', label: 'Medium (RTX 4090/A100 - 24GB VRAM)' },
  { value: 'large', label: 'Large (H100 - 80GB VRAM)' }
];

const LLM_PROVIDERS = [
  { value: 'openai-gpt-4', label: 'OpenAI GPT-4' },
  { value: 'openai-gpt-3.5-turbo', label: 'OpenAI GPT-3.5 Turbo' },
  { value: 'anthropic-claude-3', label: 'Anthropic Claude 3' },
  { value: 'anthropic-claude-2', label: 'Anthropic Claude 2' },
  { value: 'google-gemini-pro', label: 'Google Gemini Pro' },
  { value: 'meta-llama-2-70b', label: 'Meta Llama 2 70B' }
];

const LABELING_SERVICES = [
  { value: 'scale-ai', label: 'Scale AI' },
  { value: 'amazon-mechanical-turk', label: 'Amazon Mechanical Turk' },
  { value: 'appen', label: 'Appen' },
  { value: 'clickworker', label: 'Clickworker' },
  { value: 'toloka', label: 'Toloka' }
];

export default function ProjectCreateForm({ onCancel, onSuccess }: ProjectCreateFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: '',
    model_approach: '',
    dataset_gb: '',
    label_count: '',
    monthly_tokens: '',
    llm_provider_model: '',
    gpu_type: '',
    labeling_service_provider: ''
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [costEstimation, setCostEstimation] = useState<CostEstimation | null>(null);
  const [priceWarnings, setPriceWarnings] = useState<string[]>([]);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.project_type) {
      newErrors.project_type = 'Project type is required';
    }
    if (!formData.model_approach) {
      newErrors.model_approach = 'Model approach is required';
    }

    // Conditional validation
    if (formData.model_approach === 'custom') {
      if (!formData.dataset_gb || isNaN(Number(formData.dataset_gb)) || Number(formData.dataset_gb) <= 0) {
        newErrors.dataset_gb = 'Valid dataset size is required for custom models';
      }
      if (!formData.label_count || isNaN(Number(formData.label_count)) || Number(formData.label_count) <= 0) {
        newErrors.label_count = 'Valid label count is required for custom models';
      }
      if (!formData.gpu_type) {
        newErrors.gpu_type = 'GPU type is required for custom models';
      }
    }

    if (formData.model_approach === 'llm_fine_tuning') {
      if (!formData.monthly_tokens || isNaN(Number(formData.monthly_tokens)) || Number(formData.monthly_tokens) <= 0) {
        newErrors.monthly_tokens = 'Valid monthly tokens is required for LLM fine-tuning';
      }
      if (!formData.llm_provider_model) {
        newErrors.llm_provider_model = 'LLM provider model is required for fine-tuning';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setPriceWarnings([]);

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Prepare request body
      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        project_type: formData.project_type,
        model_approach: formData.model_approach,
        ...(formData.dataset_gb && { dataset_gb: Number(formData.dataset_gb) }),
        ...(formData.label_count && { label_count: Number(formData.label_count) }),
        ...(formData.monthly_tokens && { monthly_tokens: Number(formData.monthly_tokens) }),
        ...(formData.llm_provider_model && { llm_provider_model: formData.llm_provider_model }),
        ...(formData.gpu_type && { gpu_type: formData.gpu_type }),
        ...(formData.labeling_service_provider && { labeling_service_provider: formData.labeling_service_provider })
      };

      // Create project via API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create project');
      }

      // Set cost estimation and warnings
      if (result.project.cost_estimation) {
        setCostEstimation(result.project.cost_estimation);
        setShowCostBreakdown(true);
      }
      
      if (result.warnings) {
        setPriceWarnings(result.warnings);
      }

      // Success callback or navigation
      if (onSuccess) {
        onSuccess(result.project.id);
      } else {
        // Navigate to the new project's budget editor
        router.push(`/projects/${result.project.id}/budget-editor`);
      }

    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to create project' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, supabase.auth, onSuccess, router]);

  const shouldShowCustomFields = formData.model_approach === 'custom';
  const shouldShowLLMFields = formData.model_approach === 'llm_fine_tuning';

  return (
    <div className="max-w-2xl w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Project
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Define your ML project parameters to get accurate cost estimations
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Close"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Brief description of your project"
            />
          </div>
        </div>

        {/* Project Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Configuration
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Type *
            </label>
            <select
              value={formData.project_type}
              onChange={(e) => handleInputChange('project_type', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.project_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select project type</option>
              {PROJECT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.project_type && (
              <p className="mt-1 text-sm text-red-600">{errors.project_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model Approach *
            </label>
            <select
              value={formData.model_approach}
              onChange={(e) => handleInputChange('model_approach', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.model_approach ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select model approach</option>
              {MODEL_APPROACHES.map(approach => (
                <option key={approach.value} value={approach.value}>
                  {approach.label}
                </option>
              ))}
            </select>
            {errors.model_approach && (
              <p className="mt-1 text-sm text-red-600">{errors.model_approach}</p>
            )}
          </div>
        </div>

        {/* Custom Model Fields */}
        {shouldShowCustomFields && (
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">
              Custom Model Configuration
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dataset Size (GB) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.dataset_gb}
                  onChange={(e) => handleInputChange('dataset_gb', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.dataset_gb ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 10.5"
                />
                {errors.dataset_gb && (
                  <p className="mt-1 text-sm text-red-600">{errors.dataset_gb}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Labels *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.label_count}
                  onChange={(e) => handleInputChange('label_count', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.label_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 1000"
                />
                {errors.label_count && (
                  <p className="mt-1 text-sm text-red-600">{errors.label_count}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GPU Type *
              </label>
              <select
                value={formData.gpu_type}
                onChange={(e) => handleInputChange('gpu_type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.gpu_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select GPU type</option>
                {GPU_TYPES.map(gpu => (
                  <option key={gpu.value} value={gpu.value}>
                    {gpu.label}
                  </option>
                ))}
              </select>
              {errors.gpu_type && (
                <p className="mt-1 text-sm text-red-600">{errors.gpu_type}</p>
              )}
            </div>
          </div>
        )}

        {/* LLM Fine-tuning Fields */}
        {shouldShowLLMFields && (
          <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">
              LLM Fine-tuning Configuration
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Tokens *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.monthly_tokens}
                  onChange={(e) => handleInputChange('monthly_tokens', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.monthly_tokens ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 1000000"
                />
                {errors.monthly_tokens && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthly_tokens}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  LLM Provider & Model *
                </label>
                <select
                  value={formData.llm_provider_model}
                  onChange={(e) => handleInputChange('llm_provider_model', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.llm_provider_model ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select LLM provider</option>
                  {LLM_PROVIDERS.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
                {errors.llm_provider_model && (
                  <p className="mt-1 text-sm text-red-600">{errors.llm_provider_model}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Optional Labeling Service */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Optional Services
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Labeling Service
            </label>
            <select
              value={formData.labeling_service_provider}
              onChange={(e) => handleInputChange('labeling_service_provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">No labeling service needed</option>
              {LABELING_SERVICES.map(service => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select if you need professional data labeling services
            </p>
          </div>
        </div>

        {/* Cost Estimation Display */}
        {costEstimation && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                Estimated Total Cost: ${costEstimation.total_estimated_cost}
              </h4>
              <button
                type="button"
                onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showCostBreakdown ? 'Hide' : 'Show'} Breakdown
              </button>
            </div>
            
            {showCostBreakdown && (
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {Object.entries(costEstimation.cost_breakdown).map(([category, cost]) => (
                  <div key={category} className="flex justify-between">
                    <span className="capitalize">{category.replace('_', ' ')}:</span>
                    <span>${cost}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price Warnings */}
        {priceWarnings.length > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Pricing Information
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <ul className="list-disc list-inside space-y-1">
                    {priceWarnings.map((warning, index) => (
                      <li key={index}>
                        {warning.includes('fallback') 
                          ? 'Using fallback pricing due to API limitations'
                          : warning
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errors.submit && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Project...' : 'Create Project & Estimate Costs'}
          </button>
        </div>
      </form>
    </div>
  );
}