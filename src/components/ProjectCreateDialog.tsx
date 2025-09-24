'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Paper,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Collapse,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

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

interface ProjectCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

// Schema-matching constants
const PROJECT_TYPES = [
  { value: 'prototype', label: 'Prototype' },
  { value: 'fine_tune', label: 'Fine Tune' },
  { value: 'production', label: 'Production' }
];

const MODEL_APPROACHES = [
  { value: 'api_only', label: 'API Only' },
  { value: 'fine_tune', label: 'Fine Tune' },
  { value: 'from_scratch', label: 'From Scratch' }
];

const GPU_TYPES = [
  { value: 'small', label: 'Small (T4/V100 - 16GB VRAM)' },
  { value: 'medium', label: 'Medium (RTX 4090/A100 - 24GB VRAM)' },
  { value: 'large', label: 'Large (H100 - 80GB VRAM)' }
];

const LLM_PROVIDERS = [
  { value: 'openai-gpt-4', label: 'OpenAI GPT-4' },
  { value: 'openai-gpt-3.5-turbo', label: 'OpenAI GPT-3.5 Turbo' },
  { value: 'anthropic-claude', label: 'Anthropic Claude' },
  { value: 'google-gemini', label: 'Google Gemini' },
  { value: 'local-llm', label: 'Local LLM (Self-hosted)' }
];

const LABELING_SERVICES = [
  { value: '', label: 'None - I have labeled data' },
  { value: 'amazon-mechanical-turk', label: 'Amazon Mechanical Turk' },
  { value: 'appen', label: 'Appen' },
  { value: 'clickworker', label: 'Clickworker' },
  { value: 'toloka', label: 'Toloka' }
];

export default function ProjectCreateDialog({ open, onClose, onSuccess }: ProjectCreateDialogProps) {
  const router = useRouter();

  // Form state - exactly matching database schema
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
    estimated_gpu_hours: '',
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

    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.project_type) newErrors.project_type = 'Project type is required';
    if (!formData.model_approach) newErrors.model_approach = 'Model approach is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      project_type: '',
      model_approach: '',
      dataset_gb: '',
      label_count: '',
      monthly_tokens: '',
      llm_provider_model: '',
      gpu_type: '',
      estimated_gpu_hours: '',
      labeling_service_provider: ''
    });
    setErrors({});
    setCostEstimation(null);
    setPriceWarnings([]);
    setShowCostBreakdown(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const projectData = {
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        project_type: formData.project_type,
        model_approach: formData.model_approach,
        dataset_gb: formData.dataset_gb ? parseFloat(formData.dataset_gb) : null,
        label_count: formData.label_count ? parseInt(formData.label_count) : null,
        monthly_tokens: formData.monthly_tokens ? parseInt(formData.monthly_tokens) : null,
        llm_provider_model: formData.llm_provider_model || null,
        gpu_type: formData.gpu_type || null,
        estimated_gpu_hours: formData.estimated_gpu_hours ? parseFloat(formData.estimated_gpu_hours) : null,
        labeling_service_provider: formData.labeling_service_provider || null,
        price_snapshot: costEstimation || null
      };

      const { data: project, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      resetForm();
      onSuccess?.(project.id);
      onClose();
    } catch (error: any) {
      console.error('Error creating project:', error);
      setErrors({ submit: error.message || 'Failed to create project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, isSubmitting, supabase, costEstimation, onSuccess, onClose, resetForm]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  }, [isSubmitting, resetForm, onClose]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h5" component="h2">
            Create New Project
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Define your ML project parameters to get accurate cost estimations
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'blue.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Basic Information
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your project"
              />
            </Stack>
          </Paper>

          {/* Project Configuration */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'blue.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Project Configuration
            </Typography>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <FormControl fullWidth error={!!errors.project_type}>
                  <InputLabel required>Project Type</InputLabel>
                  <Select
                    value={formData.project_type}
                    onChange={(e) => handleInputChange('project_type', e.target.value)}
                    label="Project Type"
                  >
                    {PROJECT_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.project_type && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.project_type}
                    </Typography>
                  )}
                </FormControl>
                <FormControl fullWidth error={!!errors.model_approach}>
                  <InputLabel required>Model Approach</InputLabel>
                  <Select
                    value={formData.model_approach}
                    onChange={(e) => handleInputChange('model_approach', e.target.value)}
                    label="Model Approach"
                  >
                    {MODEL_APPROACHES.map((approach) => (
                      <MenuItem key={approach.value} value={approach.value}>
                        {approach.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.model_approach && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.model_approach}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Stack>
          </Paper>

          {/* Dataset & Resource Configuration */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'green.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="success.main">
              Dataset & Resource Configuration
            </Typography>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  label="Dataset Size (GB)"
                  type="number"
                  value={formData.dataset_gb}
                  onChange={(e) => handleInputChange('dataset_gb', e.target.value)}
                  inputProps={{ min: 0, step: 0.1 }}
                  helperText="Size of your training dataset in GB"
                />
                <TextField
                  fullWidth
                  label="Label Count"
                  type="number"
                  value={formData.label_count}
                  onChange={(e) => handleInputChange('label_count', e.target.value)}
                  inputProps={{ min: 0, step: 1 }}
                  helperText="Number of different labels/classes"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  label="Monthly Tokens"
                  type="number"
                  value={formData.monthly_tokens}
                  onChange={(e) => handleInputChange('monthly_tokens', e.target.value)}
                  inputProps={{ min: 0 }}
                  helperText="Expected monthly token usage"
                />
                <TextField
                  fullWidth
                  label="Estimated GPU Hours"
                  type="number"
                  value={formData.estimated_gpu_hours}
                  onChange={(e) => handleInputChange('estimated_gpu_hours', e.target.value)}
                  inputProps={{ min: 0, step: 0.1 }}
                  helperText="Estimated GPU training hours needed"
                />
              </Box>
            </Stack>
          </Paper>

          {/* Technical Configuration */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'purple.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              Technical Configuration
            </Typography>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <FormControl fullWidth>
                  <InputLabel>GPU Type</InputLabel>
                  <Select
                    value={formData.gpu_type}
                    onChange={(e) => handleInputChange('gpu_type', e.target.value)}
                    label="GPU Type"
                  >
                    {GPU_TYPES.map((gpu) => (
                      <MenuItem key={gpu.value} value={gpu.value}>
                        {gpu.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>LLM Provider/Model</InputLabel>
                  <Select
                    value={formData.llm_provider_model}
                    onChange={(e) => handleInputChange('llm_provider_model', e.target.value)}
                    label="LLM Provider/Model"
                  >
                    {LLM_PROVIDERS.map((provider) => (
                      <MenuItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <FormControl fullWidth>
                <InputLabel>Labeling Service Provider</InputLabel>
                <Select
                  value={formData.labeling_service_provider}
                  onChange={(e) => handleInputChange('labeling_service_provider', e.target.value)}
                  label="Labeling Service Provider"
                >
                  {LABELING_SERVICES.map((service) => (
                    <MenuItem key={service.value} value={service.value}>
                      {service.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Cost Estimation Display */}
          {costEstimation && (
            <Paper elevation={2} sx={{ p: 3, bgcolor: 'info.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" color="info.main">
                  Cost Estimation
                </Typography>
                <IconButton
                  onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                  size="small"
                  sx={{ ml: 'auto' }}
                >
                  {showCostBreakdown ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Box>
              
              <Typography variant="h4" color="info.main" gutterBottom>
                ${costEstimation.total_estimated_cost.toLocaleString()}
              </Typography>
              
              <Collapse in={showCostBreakdown}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cost Breakdown:
                  </Typography>
                  {Object.entries(costEstimation.cost_breakdown).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ${value.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>
              
              {priceWarnings.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    {priceWarnings.join('. ')}
                  </Typography>
                </Alert>
              )}
            </Paper>
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}