"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Slider,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Calculate,
  Info,
  Warning,
  TrendingUp,
  AttachMoney,
  People,
  Storage,
  FlashOn,
  Security,
  BarChart,
  Description,
  Refresh,
  ExpandMore
} from '@mui/icons-material';
import { supabase } from '@/lib/supabaseClient';

interface FormData {
  // Stage 1: Project Foundation
  projectName: string;
  projectDescription: string;
  developmentStage: string;
  projectTimeline: string;
  expectedLaunchDate: string;
  
  // Stage 2: Technical Configuration
  projectType: string;
  modelApproach: string;
  modelSize: string;
  
  // Stage 3: Infrastructure & Resources
  gpuType: string;
  gpuCount: number[];
  trainingHours: string;
  trainingRuns: number[];
  llmProvider: string;
  backupProvider: string;
  inputTokens: string;
  outputTokens: string;
  
  // Stage 4: Data Requirements
  datasetSize: string;
  storageType: string;
  retentionPeriod: string;
  redundancyRequirements: string;
  labelCount: string;
  labeledDataStatus: string;
  labelingProvider: string;
  labelingVolume: string;
  
  // Stage 5: Cloud & Deployment
  cloudProvider: string;
  primaryRegion: string;
  deploymentArchitecture: string[];
  dailyApiCalls: number[];
  peakTrafficMultiplier: string;
  latencyRequirements: string;
  
  // Stage 6: Scale & Growth Projections
  usersMonth1to3: string;
  usersMonth6: string;
  usersMonth12: string;
  usersMonth24: string;
  growthPattern: string;
  revenueModel: string;
  
  // Stage 7: Team & Development
  mlEngineers: { junior: string; mid: string; senior: string; lead: string };
  devopsEngineers: string;
  externalConsultants: boolean;
  consultantHours: string;
  developmentApproach: string;
  developmentDuration: string;
  
  // Stage 8: Advanced Infrastructure
  experimentTracking: string;
  modelVersions: string;
  monitoringRequirements: string;
  loggingVolume: string;
  cicdRequirements: string;
  
  // Stage 9: Compliance & Security
  complianceRequirements: string[];
  dataResidency: string;
  securityPosture: string;
  
  // Stage 10: Financial Parameters
  budgetPhilosophy: string;
  riskBuffer: string;
  currency: string;
  fundingStatus: string;
  
  // Stage 11: Hidden Costs Awareness
  hiddenCostsAcknowledged: string[];
}

interface EnterpriseProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
  projectCount: number;
}

const STAGES = [
  { id: 1, title: "Project Foundation", icon: Description },
  { id: 2, title: "Technical Configuration", icon: FlashOn },
  { id: 3, title: "Infrastructure & Resources", icon: Storage },
  { id: 4, title: "Data Requirements", icon: BarChart },
  { id: 5, title: "Cloud & Deployment", icon: TrendingUp },
  { id: 6, title: "Scale & Growth", icon: People },
  { id: 7, title: "Team & Development", icon: People },
  { id: 8, title: "Advanced Infrastructure", icon: Refresh },
  { id: 9, title: "Compliance & Security", icon: Security },
  { id: 10, title: "Financial Parameters", icon: AttachMoney },
  { id: 11, title: "Cost Awareness", icon: Warning }
];

export default function EnterpriseProjectForm({ open, onClose, onSuccess, projectCount }: EnterpriseProjectFormProps) {
  const [currentStage, setCurrentStage] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Initialize with default values
    projectName: '',
    projectDescription: '',
    developmentStage: '',
    projectTimeline: '',
    expectedLaunchDate: '',
    projectType: '',
    modelApproach: '',
    modelSize: '',
    gpuType: '',
    gpuCount: [1],
    trainingHours: '',
    trainingRuns: [1],
    llmProvider: '',
    backupProvider: '',
    inputTokens: '',
    outputTokens: '',
    datasetSize: '',
    storageType: '',
    retentionPeriod: '',
    redundancyRequirements: '',
    labelCount: '',
    labeledDataStatus: '',
    labelingProvider: '',
    labelingVolume: '',
    cloudProvider: '',
    primaryRegion: '',
    deploymentArchitecture: [],
    dailyApiCalls: [1000],
    peakTrafficMultiplier: '',
    latencyRequirements: '',
    usersMonth1to3: '',
    usersMonth6: '',
    usersMonth12: '',
    usersMonth24: '',
    growthPattern: '',
    revenueModel: '',
    mlEngineers: { junior: '', mid: '', senior: '', lead: '' },
    devopsEngineers: '',
    externalConsultants: false,
    consultantHours: '',
    developmentApproach: '',
    developmentDuration: '',
    experimentTracking: '',
    modelVersions: '',
    monitoringRequirements: '',
    loggingVolume: '',
    cicdRequirements: '',
    complianceRequirements: [],
    dataResidency: '',
    securityPosture: '',
    budgetPhilosophy: '',
    riskBuffer: '',
    currency: 'USD',
    fundingStatus: '',
    hiddenCostsAcknowledged: []
  });

  const [estimatedCost, setEstimatedCost] = useState({
    monthly: 0,
    total: 0,
    breakdown: {
      infrastructure: 0,
      data: 0,
      apis: 0,
      monitoring: 0,
      compliance: 0,
      personnel: 0
    }
  });

  const [saving, setSaving] = useState(false);
  const [showCostPreview, setShowCostPreview] = useState(false);

  // Calculate estimated costs based on form data
  useEffect(() => {
    calculateEstimatedCost();
  }, [formData]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (formData.projectName) {
        localStorage.setItem('enterpriseProjectForm', JSON.stringify({ formData, currentStage }));
      }
    }, 30000);

    return () => clearInterval(autoSave);
  }, [formData, currentStage]);

  // Load saved form data on mount
  useEffect(() => {
    const saved = localStorage.getItem('enterpriseProjectForm');
    if (saved) {
      const { formData: savedData, currentStage: savedStage } = JSON.parse(saved);
      setFormData(savedData);
      setCurrentStage(savedStage);
    }
  }, []);

  const calculateEstimatedCost = () => {
    let monthly = 0;
    let breakdown = {
      infrastructure: 0,
      data: 0,
      apis: 0,
      monitoring: 0,
      compliance: 0,
      personnel: 0
    };

    // GPU Infrastructure Costs
    if (formData.modelApproach === 'training_from_scratch' || formData.modelApproach === 'fine_tuning') {
      const gpuHourlyRates: { [key: string]: number } = {
        'H100': 4.5,
        'A100_80GB': 3.2,
        'A100_40GB': 2.1,
        'V100': 1.5,
        'T4': 0.35,
        'L4': 0.75
      };
      
      const rate = gpuHourlyRates[formData.gpuType] || 1;
      const hours = parseInt(formData.trainingHours) || 0;
      const gpus = formData.gpuCount[0] || 1;
      const runs = formData.trainingRuns[0] || 1;
      
      breakdown.infrastructure = rate * hours * gpus * runs;
    }

    // API Costs
    if (formData.modelApproach === 'api_only' || formData.modelApproach === 'hybrid') {
      const inputTokens = parseFloat(formData.inputTokens) || 0;
      const outputTokens = parseFloat(formData.outputTokens) || 0;
      
      // Rough pricing for major providers (per million tokens)
      const inputCost = inputTokens * 0.03; // $0.03 per million input tokens
      const outputCost = outputTokens * 0.06; // $0.06 per million output tokens
      
      breakdown.apis = inputCost + outputCost;
    }

    // Data Storage Costs
    const dataSize = parseFloat(formData.datasetSize) || 0;
    if (dataSize > 0) {
      const storageCostPerGB = 0.023; // S3 standard pricing
      breakdown.data = dataSize * storageCostPerGB;
      
      // Add redundancy costs
      if (formData.redundancyRequirements === 'multi_region') {
        breakdown.data *= 2;
      } else if (formData.redundancyRequirements === 'global') {
        breakdown.data *= 3;
      }
    }

    // Monitoring & Logging
    const loggingGB = parseFloat(formData.loggingVolume) || 1;
    breakdown.monitoring = loggingGB * 0.50; // CloudWatch/equivalent pricing

    // Compliance overhead
    if (formData.complianceRequirements.length > 0) {
      breakdown.compliance = 500 * formData.complianceRequirements.length;
    }

    // Personnel costs (if provided)
    const { junior, mid, senior, lead } = formData.mlEngineers;
    const salaryRates = { junior: 8000, mid: 12000, senior: 16000, lead: 20000 }; // Monthly rates
    
    breakdown.personnel = 
      (parseInt(junior) || 0) * salaryRates.junior +
      (parseInt(mid) || 0) * salaryRates.mid +
      (parseInt(senior) || 0) * salaryRates.senior +
      (parseInt(lead) || 0) * salaryRates.lead;

    monthly = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0);
    
    // Apply risk buffer
    const bufferMultiplier = {
      '10': 1.1,
      '25': 1.25,
      '40': 1.4,
      '60': 1.6
    }[formData.riskBuffer] || 1.25;

    monthly *= bufferMultiplier;

    const timelineMonths = {
      '3_months': 3,
      '6_months': 6,
      '12_months': 12,
      '18_months': 18,
      '24_months': 24
    }[formData.projectTimeline] || 12;

    setEstimatedCost({
      monthly,
      total: monthly * timelineMonths,
      breakdown
    });
  };

  const handleNext = () => {
    if (validateCurrentStage()) {
      setCurrentStage(prev => Math.min(prev + 1, STAGES.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStage(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStage = (): boolean => {
    // Add validation logic for each stage
    switch (currentStage) {
      case 1:
        return !!(formData.projectName && formData.projectDescription && formData.developmentStage);
      case 2:
        return !!(formData.projectType && formData.modelApproach);
      // Add validation for other stages
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');

      const projectData = {
        user_id: user.id,
        name: formData.projectName,
        description: formData.projectDescription,
        project_type: formData.projectType,
        model_approach: formData.modelApproach,
        dataset_gb: parseFloat(formData.datasetSize) || 0,
        monthly_tokens: parseFloat(formData.inputTokens) + parseFloat(formData.outputTokens) || 0,
        estimated_monthly_cost: estimatedCost.monthly,
        estimated_total_cost: estimatedCost.total,
        form_data: JSON.stringify(formData),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      // Clear saved form data
      localStorage.removeItem('enterpriseProjectForm');
      
      onSuccess(data.id);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderStage = () => {
    switch (currentStage) {
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Project Name *"
              value={formData.projectName}
              onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
              placeholder="e.g., AI-Powered Customer Support Chatbot"
              fullWidth
              variant="outlined"
            />
            
            <TextField
              label="Project Description *"
              value={formData.projectDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
              placeholder="Describe your AI project, its goals, and key features..."
              multiline
              rows={4}
              fullWidth
              variant="outlined"
            />
            
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Development Stage *</InputLabel>
                  <Select
                    value={formData.developmentStage}
                    onChange={(e) => setFormData(prev => ({ ...prev, developmentStage: e.target.value }))}
                    label="Development Stage *"
                  >
                    <MenuItem value="research_poc">Research/POC</MenuItem>
                    <MenuItem value="mvp_development">MVP Development</MenuItem>
                    <MenuItem value="production_ready">Production Ready</MenuItem>
                    <MenuItem value="scaling_phase">Scaling Phase</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Project Timeline *</InputLabel>
                  <Select
                    value={formData.projectTimeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectTimeline: e.target.value }))}
                    label="Project Timeline *"
                  >
                    <MenuItem value="3_months">3 months</MenuItem>
                    <MenuItem value="6_months">6 months</MenuItem>
                    <MenuItem value="12_months">12 months</MenuItem>
                    <MenuItem value="18_months">18 months</MenuItem>
                    <MenuItem value="24_months">24+ months</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <TextField
              label="Expected Launch Date"
              type="month"
              value={formData.expectedLaunchDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedLaunchDate: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Project Type *</InputLabel>
              <Select
                value={formData.projectType}
                onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value }))}
                label="Project Type *"
              >
                <MenuItem value="classification">Classification</MenuItem>
                <MenuItem value="generation">Generation</MenuItem>
                <MenuItem value="analysis">Analysis</MenuItem>
                <MenuItem value="chatbot">Chatbot/Conversational AI</MenuItem>
                <MenuItem value="computer_vision">Computer Vision</MenuItem>
                <MenuItem value="nlp">Natural Language Processing</MenuItem>
                <MenuItem value="recommendation">Recommendation System</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Model Approach *</InputLabel>
              <Select
                value={formData.modelApproach}
                onChange={(e) => setFormData(prev => ({ ...prev, modelApproach: e.target.value }))}
                label="Model Approach *"
              >
                <MenuItem value="training_from_scratch">Training from Scratch</MenuItem>
                <MenuItem value="fine_tuning">Fine-tuning Existing Model</MenuItem>
                <MenuItem value="api_only">Using Pre-trained APIs Only</MenuItem>
                <MenuItem value="hybrid">Hybrid Approach</MenuItem>
              </Select>
            </FormControl>
            
            {(formData.modelApproach === 'training_from_scratch' || formData.modelApproach === 'fine_tuning') && (
              <FormControl fullWidth>
                <InputLabel>Model Size/Complexity *</InputLabel>
                <Select
                  value={formData.modelSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelSize: e.target.value }))}
                  label="Model Size/Complexity *"
                >
                  <MenuItem value="small">Small (&lt;1B parameters)</MenuItem>
                  <MenuItem value="medium">Medium (1-10B parameters)</MenuItem>
                  <MenuItem value="large">Large (10-100B parameters)</MenuItem>
                  <MenuItem value="very_large">Very Large (100B+ parameters)</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {(formData.modelApproach === 'training_from_scratch' || formData.modelApproach === 'fine_tuning') && (
              <Card variant="outlined">
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FlashOn />
                      <Typography variant="h6">GPU Configuration</Typography>
                    </Box>
                  }
                />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>GPU Type *</InputLabel>
                    <Select
                      value={formData.gpuType}
                      onChange={(e) => setFormData(prev => ({ ...prev, gpuType: e.target.value }))}
                      label="GPU Type *"
                    >
                      <MenuItem value="H100">NVIDIA H100 ($4.50/hr)</MenuItem>
                      <MenuItem value="A100_80GB">NVIDIA A100 80GB ($3.20/hr)</MenuItem>
                      <MenuItem value="A100_40GB">NVIDIA A100 40GB ($2.10/hr)</MenuItem>
                      <MenuItem value="V100">NVIDIA V100 ($1.50/hr)</MenuItem>
                      <MenuItem value="L4">NVIDIA L4 ($0.75/hr)</MenuItem>
                      <MenuItem value="T4">NVIDIA T4 ($0.35/hr)</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box>
                    <Typography gutterBottom>
                      Number of GPUs Needed Simultaneously: {formData.gpuCount[0]}
                    </Typography>
                    <Slider
                      value={formData.gpuCount[0]}
                      onChange={(_, value) => setFormData(prev => ({ ...prev, gpuCount: [value as number] }))}
                      max={64}
                      min={1}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  
                  <TextField
                    label="Estimated Total GPU Training Hours *"
                    type="number"
                    value={formData.trainingHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, trainingHours: e.target.value }))}
                    placeholder="Include experimentation buffer"
                    fullWidth
                  />
                  
                  <Box>
                    <Typography gutterBottom>
                      Training Runs Expected: {formData.trainingRuns[0]}
                    </Typography>
                    <Slider
                      value={formData.trainingRuns[0]}
                      onChange={(_, value) => setFormData(prev => ({ ...prev, trainingRuns: [value as number] }))}
                      max={100}
                      min={1}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Account for experiments and iterations
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {(formData.modelApproach === 'api_only' || formData.modelApproach === 'hybrid') && (
              <Card variant="outlined">
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Storage />
                      <Typography variant="h6">API Configuration</Typography>
                    </Box>
                  }
                />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Primary LLM Provider/Model *</InputLabel>
                    <Select
                      value={formData.llmProvider}
                      onChange={(e) => setFormData(prev => ({ ...prev, llmProvider: e.target.value }))}
                      label="Primary LLM Provider/Model *"
                    >
                      <MenuItem value="openai_gpt4">OpenAI GPT-4 (Premium)</MenuItem>
                      <MenuItem value="openai_gpt35">OpenAI GPT-3.5 (Standard)</MenuItem>
                      <MenuItem value="anthropic_claude">Anthropic Claude (Premium)</MenuItem>
                      <MenuItem value="google_palm">Google PaLM (Standard)</MenuItem>
                      <MenuItem value="cohere">Cohere (Budget)</MenuItem>
                      <MenuItem value="huggingface">Hugging Face (Budget)</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel>Backup/Secondary Provider</InputLabel>
                    <Select
                      value={formData.backupProvider}
                      onChange={(e) => setFormData(prev => ({ ...prev, backupProvider: e.target.value }))}
                      label="Backup/Secondary Provider"
                    >
                      <MenuItem value="none">None</MenuItem>
                      <MenuItem value="openai_gpt35">OpenAI GPT-3.5</MenuItem>
                      <MenuItem value="anthropic_claude">Anthropic Claude</MenuItem>
                      <MenuItem value="google_palm">Google PaLM</MenuItem>
                      <MenuItem value="cohere">Cohere</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Grid container spacing={2}>
                    <Grid xs={12} md={6}>
                      <TextField
                        label="Input Tokens (millions/month) *"
                        type="number"
                        inputProps={{ step: 0.1 }}
                        value={formData.inputTokens}
                        onChange={(e) => setFormData(prev => ({ ...prev, inputTokens: e.target.value }))}
                        placeholder="e.g., 10.5"
                        fullWidth
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <TextField
                        label="Output Tokens (millions/month) *"
                        type="number"
                        inputProps={{ step: 0.1 }}
                        value={formData.outputTokens}
                        onChange={(e) => setFormData(prev => ({ ...prev, outputTokens: e.target.value }))}
                        placeholder="e.g., 5.2"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                  <Typography variant="caption" color="text.secondary">
                    Provide conservative estimates; we'll calculate growth scenarios
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      // Add cases for stages 4-11...
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              Stage {currentStage} content coming soon...
            </Typography>
          </Box>
        );
    }
  };

  const progress = (currentStage / STAGES.length) * 100;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calculate />
          Enterprise Budget Forecasting
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'auto' }}>
        {/* Progress Bar */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              Stage {currentStage} of {STAGES.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}% Complete
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        {/* Cost Preview */}
        {estimatedCost.monthly > 0 && (
          <Alert 
            severity="info" 
            sx={{ 
              background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
            : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
            <Typography variant="body2" color="text.secondary">
              Estimated Monthly Cost
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              ${estimatedCost.monthly.toLocaleString()}
            </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Total Project Cost
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              ${estimatedCost.total.toLocaleString()}
            </Typography>
              </Box>
            </Box>
          </Alert>
        )}

        {/* Stage Navigation */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stepper activeStep={currentStage - 1} alternativeLabel sx={{ flexWrap: 'wrap' }}>
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <Step key={stage.id} onClick={() => setCurrentStage(stage.id)} sx={{ cursor: 'pointer' }}>
                  <StepLabel 
                    icon={<Icon />}
                    StepIconProps={{
                      sx: { 
                        color: currentStage === stage.id ? 'primary.main' : 
                               currentStage > stage.id ? 'success.main' : 'action.disabled'
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                      {stage.title}
                    </Typography>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Paper>

        {/* Current Stage Content */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {React.createElement(STAGES[currentStage - 1].icon)}
            {STAGES[currentStage - 1].title}
          </Typography>
          {renderStage()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentStage === 1}
          startIcon={<ChevronLeft />}
        >
          Previous
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              localStorage.setItem('enterpriseProjectForm', JSON.stringify({ formData, currentStage }));
            }}
            startIcon={<Save />}
          >
            Save Progress
          </Button>
          
          {currentStage < STAGES.length ? (
            <Button 
              variant="contained"
              onClick={handleNext} 
              disabled={!validateCurrentStage()}
              endIcon={<ChevronRight />}
            >
              Next
            </Button>
          ) : (
            <Button 
              variant="contained"
              onClick={handleSubmit} 
              disabled={saving || !validateCurrentStage()}
            >
              {saving ? 'Creating...' : 'Generate Budget Forecast'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
