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
  dataProcessingComplexity?: string; // New optional field
  requiresDataVersioning?: boolean;  // New optional field
  requiresDataValidation?: boolean;  // New optional field
  
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
    dataProcessingComplexity: '',
    requiresDataVersioning: false,
    requiresDataValidation: false,
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
      case 3:
        if (formData.modelApproach === 'training_from_scratch' || formData.modelApproach === 'fine_tuning') {
          return !!(formData.gpuType && formData.trainingHours);
        }
        if (formData.modelApproach === 'api_only' || formData.modelApproach === 'hybrid') {
          return !!(formData.llmProvider && formData.inputTokens && formData.outputTokens);
        }
        return true;
      case 4:
        const hasBasicDataRequirements = !!(formData.datasetSize && formData.storageType && formData.retentionPeriod && formData.redundancyRequirements);
        
        // Check supervised learning requirements if applicable
        const isSupervisedLearning = formData.projectType === 'classification' || 
                                   formData.projectType === 'computer_vision' || 
                                   formData.projectType === 'nlp' ||
                                   (formData.projectType === 'other' && formData.modelApproach !== 'api_only');
        
        if (isSupervisedLearning) {
          const hasLabelRequirements = !!(formData.labelCount && formData.labeledDataStatus);
          const needsLabeling = formData.labeledDataStatus === 'unlabeled_need_service' || 
                               formData.labeledDataStatus.includes('partially_labeled');
          
          if (needsLabeling) {
            return hasBasicDataRequirements && hasLabelRequirements && !!formData.labelingVolume;
          }
          return hasBasicDataRequirements && hasLabelRequirements;
        }
        
        return hasBasicDataRequirements;
      case 5:
        // Validate Stage 5: Cloud & Deployment
        const hasCloudBasics = !!(formData.cloudProvider && formData.primaryRegion);
        const hasArchitecture = formData.deploymentArchitecture.length > 0;
        const hasVolumeSettings = !!(formData.dailyApiCalls[0] && formData.peakTrafficMultiplier && formData.latencyRequirements);
        
        return hasCloudBasics && hasArchitecture && hasVolumeSettings;
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
              <Grid size={{xs:12, md:6}}>
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
              
              <Grid size={{xs:12, md:6}}>
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
                    <Grid size={{xs:12, md:6}}>
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
                    <Grid size={{xs:12, md:6}}>
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

      case 4:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChart />
                    <Typography variant="h6">Data Storage Requirements</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Dataset Size (GB) *"
                  type="number"
                  value={formData.datasetSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, datasetSize: e.target.value }))}
                  placeholder="e.g., 500"
                  fullWidth
                  inputProps={{ min: 0, step: 0.1 }}
                  helperText="Enter the total size of your dataset in GB"
                />

                <Grid container spacing={2}>
                  <Grid size={{xs:12, md:6}}>
                    <FormControl fullWidth>
                      <InputLabel>Storage Type *</InputLabel>
                      <Select
                        value={formData.storageType}
                        onChange={(e) => setFormData(prev => ({ ...prev, storageType: e.target.value }))}
                        label="Storage Type *"
                      >
                        <MenuItem value="object_storage">Object Storage (S3/GCS)</MenuItem>
                        <MenuItem value="block_storage">Block Storage</MenuItem>
                        <MenuItem value="database">Database</MenuItem>
                        <MenuItem value="hybrid">Hybrid</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{xs:12, md:6}}>
                    <FormControl fullWidth>
                      <InputLabel>Data Retention Period *</InputLabel>
                      <Select
                        value={formData.retentionPeriod}
                        onChange={(e) => setFormData(prev => ({ ...prev, retentionPeriod: e.target.value }))}
                        label="Data Retention Period *"
                      >
                        <MenuItem value="3_months">3 months</MenuItem>
                        <MenuItem value="6_months">6 months</MenuItem>
                        <MenuItem value="1_year">1 year</MenuItem>
                        <MenuItem value="2_plus_years">2+ years</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <FormControl fullWidth>
                  <InputLabel>Redundancy Requirements *</InputLabel>
                  <Select
                    value={formData.redundancyRequirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, redundancyRequirements: e.target.value }))}
                    label="Redundancy Requirements *"
                  >
                    <MenuItem value="single_region">Single region</MenuItem>
                    <MenuItem value="multi_region">Multi-region</MenuItem>
                    <MenuItem value="global">Global</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* Conditional Supervised Learning Section */}
            {(formData.projectType === 'classification' || 
              formData.projectType === 'computer_vision' || 
              formData.projectType === 'nlp' ||
              (formData.projectType === 'other' && formData.modelApproach !== 'api_only')) && (
              <Card variant="outlined">
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Storage />
                      <Typography variant="h6">Supervised Learning Data Requirements</Typography>
                    </Box>
                  }
                />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Label Count * (Number of classes)"
                    type="number"
                    value={formData.labelCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, labelCount: e.target.value }))}
                    placeholder="e.g., 10"
                    fullWidth
                    inputProps={{ min: 1, step: 1 }}
                    helperText="How many different categories/classes will your model predict?"
                  />

                  <FormControl fullWidth>
                    <InputLabel>Labeled Data Status *</InputLabel>
                    <Select
                      value={formData.labeledDataStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, labeledDataStatus: e.target.value }))}
                      label="Labeled Data Status *"
                    >
                      <MenuItem value="fully_labeled">Fully Labeled</MenuItem>
                      <MenuItem value="partially_labeled_25">Partially Labeled (25%)</MenuItem>
                      <MenuItem value="partially_labeled_50">Partially Labeled (50%)</MenuItem>
                      <MenuItem value="partially_labeled_75">Partially Labeled (75%)</MenuItem>
                      <MenuItem value="unlabeled_need_service">Unlabeled - Need Service</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Show labeling fields if data needs labeling */}
                  {(formData.labeledDataStatus === 'unlabeled_need_service' || 
                    formData.labeledDataStatus.includes('partially_labeled')) && (
                    <>
                      <FormControl fullWidth>
                        <InputLabel>Labeling Service Provider</InputLabel>
                        <Select
                          value={formData.labelingProvider}
                          onChange={(e) => setFormData(prev => ({ ...prev, labelingProvider: e.target.value }))}
                          label="Labeling Service Provider"
                        >
                          <MenuItem value="get_recommendations">Get Recommendations</MenuItem>
                          <MenuItem value="scale_ai">Scale AI</MenuItem>
                          <MenuItem value="appen">Appen</MenuItem>
                          <MenuItem value="labelbox">Labelbox</MenuItem>
                          <MenuItem value="amazon_sagemaker_ground_truth">Amazon SageMaker Ground Truth</MenuItem>
                          <MenuItem value="internal_team">Internal Team</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        label="Expected Labeling Volume * (Number of data points)"
                        type="number"
                        value={formData.labelingVolume}
                        onChange={(e) => setFormData(prev => ({ ...prev, labelingVolume: e.target.value }))}
                        placeholder="e.g., 50000"
                        fullWidth
                        inputProps={{ min: 1, step: 1 }}
                        helperText="How many data points need to be labeled?"
                      />

                      {formData.labelingProvider === 'get_recommendations' && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Labeling Service Recommendations:</strong>
                            <br />
                            • <strong>Scale AI:</strong> Best for complex tasks, higher quality, premium pricing
                            <br />
                            • <strong>Appen:</strong> Good for large volumes, competitive pricing
                            <br />
                            • <strong>Labelbox:</strong> Great tooling and workflow management
                            <br />
                            • <strong>Amazon Ground Truth:</strong> Integrated with AWS, good for standard tasks
                          </Typography>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Data Processing & Pipeline Requirements */}
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Refresh />
                    <Typography variant="h6">Data Processing Pipeline</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Data Processing Complexity</InputLabel>
                  <Select
                    value={formData.dataProcessingComplexity || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataProcessingComplexity: e.target.value }))}
                    label="Data Processing Complexity"
                  >
                    <MenuItem value="minimal">Minimal (Clean data, ready to use)</MenuItem>
                    <MenuItem value="moderate">Moderate (Some cleaning and preprocessing needed)</MenuItem>
                    <MenuItem value="extensive">Extensive (Raw data, significant preprocessing required)</MenuItem>
                    <MenuItem value="real_time">Real-time processing required</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.requiresDataVersioning || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiresDataVersioning: e.target.checked }))}
                    />
                  }
                  label="Requires data versioning and lineage tracking"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.requiresDataValidation || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiresDataValidation: e.target.checked }))}
                    />
                  }
                  label="Requires automated data quality validation"
                />
              </CardContent>
            </Card>
          </Box>
        );

      case 5:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp />
                    <Typography variant="h6">Cloud Provider & Region</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{xs:12, md:6}}>
                    <FormControl fullWidth>
                      <InputLabel>Cloud Provider Preference *</InputLabel>
                      <Select
                        value={formData.cloudProvider}
                        onChange={(e) => setFormData(prev => ({ ...prev, cloudProvider: e.target.value }))
                        }
                        label="Cloud Provider Preference *"
                      >
                        <MenuItem value="aws">AWS</MenuItem>
                        <MenuItem value="google_cloud">Google Cloud</MenuItem>
                        <MenuItem value="azure">Azure</MenuItem>
                        <MenuItem value="multi_cloud">Multi-cloud</MenuItem>
                        <MenuItem value="on_premise">On-premise</MenuItem>
                        <MenuItem value="undecided">Undecided</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{xs:12, md:6}}>
                    <FormControl fullWidth>
                      <InputLabel>Primary Region/Geography *</InputLabel>
                      <Select
                        value={formData.primaryRegion}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryRegion: e.target.value }))}
                        label="Primary Region/Geography *"
                      >
                        <MenuItem value="us_east">US East (N. Virginia)</MenuItem>
                        <MenuItem value="us_west">US West (Oregon)</MenuItem>
                        <MenuItem value="us_central">US Central (Iowa)</MenuItem>
                        <MenuItem value="canada_central">Canada Central (Toronto)</MenuItem>
                        <MenuItem value="europe_west">Europe West (Ireland)</MenuItem>
                        <MenuItem value="europe_central">Europe Central (Frankfurt)</MenuItem>
                        <MenuItem value="uk_south">UK South (London)</MenuItem>
                        <MenuItem value="asia_pacific_southeast">Asia Pacific Southeast (Singapore)</MenuItem>
                        <MenuItem value="asia_pacific_northeast">Asia Pacific Northeast (Tokyo)</MenuItem>
                        <MenuItem value="asia_pacific_south">Asia Pacific South (Mumbai)</MenuItem>
                        <MenuItem value="australia_southeast">Australia Southeast (Sydney)</MenuItem>
                        <MenuItem value="south_america_east">South America East (São Paulo)</MenuItem>
                        <MenuItem value="other">Other Region</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Regional Pricing Impact:</strong> Some regions may have 10-30% price differences. 
                    US East typically offers the lowest prices, while specialized regions (Middle East, Africa) may be premium.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Storage />
                    <Typography variant="h6">Deployment Architecture</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select all deployment patterns that apply to your project *
                </Typography>
                
                <Box>
                  {[{
                    value: 'real_time_api', 
                    label: 'Real-time API (Low latency required)',
                    description: 'Synchronous API calls with sub-second response requirements'
                  },
                  {
                    value: 'batch_processing', 
                    label: 'Batch Processing',
                    description: 'Process large volumes of data in scheduled batches'
                  },
                  {
                    value: 'edge_deployment', 
                    label: 'Edge Deployment',
                    description: 'Deploy models closer to users for reduced latency'
                  },
                  {
                    value: 'hybrid', 
                    label: 'Hybrid',
                    description: 'Combination of real-time and batch processing'
                  }
                  ].map((arch) => (
                    <Box key={arch.value} sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.deploymentArchitecture.includes(arch.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  deploymentArchitecture: [...prev.deploymentArchitecture, arch.value]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  deploymentArchitecture: prev.deploymentArchitecture.filter(a => a !== arch.value)
                                }));
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {arch.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {arch.description}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </Box>

                {formData.deploymentArchitecture.length === 0 && (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      Please select at least one deployment architecture to proceed.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlashOn />
                    <Typography variant="h6">Request Volume & Performance</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box>
                  <Typography gutterBottom fontWeight="medium">
                    Expected Daily API Calls/Inferences *
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current estimate: {formData.dailyApiCalls[0]?.toLocaleString() || '0'} calls/day
                  </Typography>
                  <Slider
                    value={Math.log10(formData.dailyApiCalls[0] || 1000)}
                    onChange={(_, value) => {
                      const actualValue = Math.round(Math.pow(10, value as number));
                      setFormData(prev => ({ ...prev, dailyApiCalls: [actualValue] }));
                    }}
                    min={3} // 10^3 = 1,000
                    max={8} // 10^8 = 100,000,000
                    step={0.1}
                    marks={[
                      { value: 3, label: '1K' },
                      { value: 4, label: '10K' },
                      { value: 5, label: '100K' },
                      { value: 6, label: '1M' },
                      { value: 7, label: '10M' },
                      { value: 8, label: '100M+' }
                    ]}
                    valueLabelDisplay="off"
                    sx={{ mt: 2, mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Use logarithmic scale for large ranges. Consider your peak expected usage.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{xs:12, md:6}}>
                    <FormControl fullWidth>
                      <InputLabel>Peak Traffic Multiplier *</InputLabel>
                      <Select
                        value={formData.peakTrafficMultiplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, peakTrafficMultiplier: e.target.value }))
                        }
                        label="Peak Traffic Multiplier *"
                      >
                        <MenuItem value="1x">1x (Steady traffic)</MenuItem>
                        <MenuItem value="2-5x">2-5x (Normal variance)</MenuItem>
                        <MenuItem value="5-10x">5-10x (High variance)</MenuItem>
                        <MenuItem value="10x_plus">10x+ (Viral potential)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{xs:12, md:6}}>
                    <FormControl fullWidth>
                      <InputLabel>Latency Requirements *</InputLabel>
                      <Select
                        value={formData.latencyRequirements}
                        onChange={(e) => setFormData(prev => ({ ...prev, latencyRequirements: e.target.value }))}
                        label="Latency Requirements *"
                      >
                        <MenuItem value="sub_100ms">&lt;100ms (Real-time interactive)</MenuItem>
                        <MenuItem value="sub_500ms">&lt;500ms (Near real-time)</MenuItem>
                        <MenuItem value="sub_2s">&lt;2s (Standard web response)</MenuItem>
                        <MenuItem value="over_2s_acceptable">&gt;2s acceptable (Batch-friendly)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Performance Impact:</strong> Lower latency requirements and higher traffic volumes 
                    significantly increase infrastructure costs. Consider caching and CDN strategies for optimization.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            {/* Cost Implications Summary */}
            <Card variant="outlined" sx={{ backgroundColor: 'action.hover' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info />
                  Deployment Cost Factors
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{xs:12, md:4}}>
                    <Typography variant="subtitle2" gutterBottom>Cloud Provider</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.cloudProvider === 'aws' && 'AWS: Generally most cost-effective for large scale'}
                      {formData.cloudProvider === 'google_cloud' && 'Google Cloud: Competitive ML/AI pricing'}
                      {formData.cloudProvider === 'azure' && 'Azure: Good enterprise integration'}
                      {formData.cloudProvider === 'multi_cloud' && 'Multi-cloud: Higher complexity, redundancy benefits'}
                      {formData.cloudProvider === 'on_premise' && 'On-premise: High upfront, lower operational'}
                      {formData.cloudProvider === 'undecided' && 'We\'ll provide recommendations'}
                      {!formData.cloudProvider && 'Select a provider to see cost implications'}
                    </Typography>
                  </Grid>
                  <Grid size={{xs:12, md:4}}>
                    <Typography variant="subtitle2" gutterBottom>Architecture Impact</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.deploymentArchitecture.includes('real_time_api') && '• Real-time: Higher compute costs'}
                      <br />
                      {formData.deploymentArchitecture.includes('batch_processing') && '• Batch: More cost-effective'}
                      <br />
                      {formData.deploymentArchitecture.includes('edge_deployment') && '• Edge: Premium pricing, lower latency'}
                      <br />
                      {formData.deploymentArchitecture.includes('hybrid') && '• Hybrid: Balanced cost/performance'}
                    </Typography>
                  </Grid>
                  <Grid size={{xs:12, md:4}}>
                    <Typography variant="subtitle2" gutterBottom>Scale Considerations</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Daily volume: {formData.dailyApiCalls[0]?.toLocaleString() || 'Not set'}
                      <br />
                      Peak multiplier: {formData.peakTrafficMultiplier || 'Not set'}
                      <br />
                      Latency target: {formData.latencyRequirements?.replace('_', ' ') || 'Not set'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      // Add cases for stages 6-11...
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
