"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  FormGroup,
  FormHelperText
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
  AccessTime,
  Cloud,
  Dns,
  GroupWork,
  MonetizationOn,
  Policy,
  BugReport,
  Check
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
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
  hasActiveSubscription: boolean;
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

export default function EnterpriseProjectForm({ 
  open, 
  onClose, 
  onSuccess, 
  projectCount,
  hasActiveSubscription 
}: EnterpriseProjectFormProps) {
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
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Calculate estimated costs based on form data
  const calculateEstimatedCost = useCallback(() => {
    let monthly = 0;
    const breakdown = {
      infrastructure: 0,
      data: 0,
      apis: 0,
      monitoring: 0,
      compliance: 0,
      personnel: 0,
      mlPlatform: 0,
      contingency: 0
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
  }, [formData]);

  // Calculate estimated costs based on form data
  useEffect(() => {
    calculateEstimatedCost();
  }, [calculateEstimatedCost]);

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

  // Check if user needs to upgrade on mount
  useEffect(() => {
    if (open && projectCount >= 1 && !hasActiveSubscription) {
      setShowUpgradePrompt(true);
    } else {
      setShowUpgradePrompt(false);
    }
  }, [open, projectCount, hasActiveSubscription]);

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
      case 6:
        const hasUserProjections = !!(
          formData.usersMonth1to3 && 
          formData.usersMonth6 && 
          formData.usersMonth12
        );
        
        // Check if Month 24 is required and filled
        const needsMonth24 = formData.projectTimeline === '18_months' || formData.projectTimeline === '24_months';
        const hasMonth24 = needsMonth24 ? !!formData.usersMonth24 : true;
        
        const hasGrowthDetails = !!(formData.growthPattern && formData.revenueModel);
        
        // Validate logical growth progression
        const month3 = parseInt(formData.usersMonth1to3) || 0;
        const month6 = parseInt(formData.usersMonth6) || 0;
        const month12 = parseInt(formData.usersMonth12) || 0;
        const month24 = parseInt(formData.usersMonth24) || 0;
        
        const logicalProgression = month6 >= month3 && month12 >= month6 && (!needsMonth24 || month24 >= month12);
        
        return hasUserProjections && hasMonth24 && hasGrowthDetails && logicalProgression;
      case 7:
        // Validate Stage 7: Team & Development
        const hasTeamMembers = 
          (parseInt(formData.mlEngineers.junior) || 0) > 0 ||
          (parseInt(formData.mlEngineers.mid) || 0) > 0 ||
          (parseInt(formData.mlEngineers.senior) || 0) > 0 ||
          (parseInt(formData.mlEngineers.lead) || 0) > 0 ||
          (parseInt(formData.devopsEngineers) || 0) > 0;
        
        const hasConsultantDetails = !formData.externalConsultants || 
          (formData.externalConsultants && !!formData.consultantHours);
        
        const hasDevelopmentDetails = !!(formData.developmentApproach && formData.developmentDuration);
        
        return hasTeamMembers && hasConsultantDetails && hasDevelopmentDetails;
      
      case 8:
        // Validate Stage 8: Advanced Infrastructure
        return !!(
          formData.experimentTracking && 
          formData.modelVersions && 
          formData.monitoringRequirements && 
          formData.loggingVolume && 
          formData.cicdRequirements
        );
      
      case 9:
        // Validate Stage 9: Compliance & Security
        const hasComplianceSelection = formData.complianceRequirements.length > 0;
        const hasDataResidency = !!formData.dataResidency;
        const hasSecurityPosture = !!formData.securityPosture;
        
        return hasComplianceSelection && hasDataResidency && hasSecurityPosture;
      
      case 10:
        // Validate Stage 10: Financial Parameters
        return !!(
          formData.budgetPhilosophy && 
          formData.riskBuffer && 
          formData.currency && 
          formData.fundingStatus
        );
      
      case 11:
        // Validate Stage 11: Cost Awareness
        // Require at least 8 acknowledged cost areas
        return formData.hiddenCostsAcknowledged.length >= 8;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Check if user has reached free project limit
    if (projectCount >= 1 && !hasActiveSubscription) {
      setShowUpgradePrompt(true);
      return;
    }

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
      alert('Failed to create project. Please try again.');
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
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
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
            </Box>
            
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
                  
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <TextField
                      label="Input Tokens (millions/month) *"
                      type="number"
                      inputProps={{ step: 0.1 }}
                      value={formData.inputTokens}
                      onChange={(e) => setFormData(prev => ({ ...prev, inputTokens: e.target.value }))}
                      placeholder="e.g., 10.5"
                      fullWidth
                    />
                    <TextField
                      label="Output Tokens (millions/month) *"
                      type="number"
                      inputProps={{ step: 0.1 }}
                      value={formData.outputTokens}
                      onChange={(e) => setFormData(prev => ({ ...prev, outputTokens: e.target.value }))}
                      placeholder="e.g., 5.2"
                      fullWidth
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Provide conservative estimates; we will calculate your growth scenarios
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

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
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
                </Box>

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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
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
                </Box>

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

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
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
                </Box>

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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
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
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
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
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <Typography variant="subtitle2" gutterBottom>Scale Considerations</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Daily volume: {formData.dailyApiCalls[0]?.toLocaleString() || 'Not set'}
                      <br />
                      Peak multiplier: {formData.peakTrafficMultiplier || 'Not set'}
                      <br />
                      Latency target: {formData.latencyRequirements?.replace('_', ' ') || 'Not set'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 6:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People />
                    <Typography variant="h6">Expected User Base Growth</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Provide realistic estimates for your user base growth. These projections will help calculate infrastructure scaling costs.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Month 1-3 Users *"
                    type="number"
                    value={formData.usersMonth1to3}
                    onChange={(e) => setFormData(prev => ({ ...prev, usersMonth1to3: e.target.value }))
                    }
                    placeholder="e.g., 1000"
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                    helperText="Expected active users in first 3 months"
                    sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}
                  />
                  
                  <TextField
                    label="Month 6 Users *"
                    type="number"
                    value={formData.usersMonth6}
                    onChange={(e) => setFormData(prev => ({ ...prev, usersMonth6: e.target.value }))
                    }
                    placeholder="e.g., 5000"
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                    helperText="Expected active users at 6 months"
                    sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}
                  />
                  
                  <TextField
                    label="Month 12 Users *"
                    type="number"
                    value={formData.usersMonth12}
                    onChange={(e) => setFormData(prev => ({ ...prev, usersMonth12: e.target.value }))
                    }
                    placeholder="e.g., 25000"
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                    helperText="Expected active users at 1 year"
                    sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}
                  />
                  
                  {/* Show Month 24 field if timeline is longer than 12 months */}
                  {(formData.projectTimeline === '18_months' || formData.projectTimeline === '24_months') && (
                    <TextField
                      label="Month 24 Users *"
                      type="number"
                      value={formData.usersMonth24}
                      onChange={(e) => setFormData(prev => ({ ...prev, usersMonth24: e.target.value }))
                      }
                      placeholder="e.g., 100000"
                      fullWidth
                      inputProps={{ min: 0, step: 1 }}
                      helperText="Expected active users at 2 years"
                      sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}
                    />
                  )}
                </Box>

                {/* User Growth Validation */}
                {formData.usersMonth1to3 && formData.usersMonth6 && formData.usersMonth12 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Growth Rate Analysis:</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {(() => {
                        const month3 = parseInt(formData.usersMonth1to3) || 0;
                        const month6 = parseInt(formData.usersMonth6) || 0;
                        const month12 = parseInt(formData.usersMonth12) || 0;
                        
                        const growth6m = month3 > 0 ? ((month6 - month3) / month3 * 100).toFixed(1) : '0';
                        const growth12m = month6 > 0 ? ((month12 - month6) / month6 * 100).toFixed(1) : '0';
                        
                        return (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              3-6mo: +{growth6m}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              6-12mo: +{growth12m}%
                            </Typography>
                            {month12 && (
                              <Typography variant="body2" color="text.secondary">
                                12-24mo: +{((parseInt(formData.usersMonth24) - month12) / month12 * 100).toFixed(1)}%
                              </Typography>
                            )}
                          </>
                        );
                      })()}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp />
                    <Typography variant="h6">Growth Pattern & Business Model</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Growth Pattern *</InputLabel>
                  <Select
                    value={formData.growthPattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, growthPattern: e.target.value }))}
                    label="Growth Pattern *"
                  >
                    <MenuItem value="linear">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Linear</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Steady, consistent growth month over month
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="exponential">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Exponential</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Accelerating growth, each month growing faster than the last
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="seasonal">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Seasonal</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Growth varies by season/time of year (e.g., holiday shopping, tax season)
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="viral_spike_expected">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Viral Spike Expected</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expecting sudden, large spikes in usage (requires burst scaling)
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="uncertain">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Uncertain</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Growth pattern unclear, need flexible scaling approach
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                  <FormHelperText>
                    This affects infrastructure auto-scaling configuration and cost buffers
                  </FormHelperText>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Revenue Model Status *</InputLabel>
                  <Select
                    value={formData.revenueModel}
                    onChange={(e) => setFormData(prev => ({ ...prev, revenueModel: e.target.value }))}
                    label="Revenue Model Status *"
                  >
                    <MenuItem value="pre_revenue">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Pre-revenue</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Still in development/testing phase, no revenue yet
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="freemium">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Freemium</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Free tier with paid upgrades (affects infrastructure cost allocation)
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="paid_from_launch">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Paid from Launch</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Users pay from day one (revenue can offset infrastructure costs)
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="enterprise_sales">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Enterprise Sales</Typography>
                        <Typography variant="caption" color="text.secondary">
                          B2B model with larger contracts (predictable revenue, custom requirements)
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                  <FormHelperText>
                    Revenue model affects cost optimization strategy and infrastructure priorities
                  </FormHelperText>
                </FormControl>
              </CardContent>
            </Card>

            {/* Growth Pattern Implications */}
            <Card variant="outlined" sx={{ backgroundColor: 'action.hover' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info />
                  Scaling Cost Implications
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <Typography variant="subtitle2" gutterBottom>Growth Pattern Impact</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.growthPattern === 'linear' && 
                        'Linear growth allows for predictable scaling and cost planning. Infrastructure can be sized incrementally.'}
                      {formData.growthPattern === 'exponential' && 
                        'Exponential growth requires aggressive auto-scaling and higher cost buffers. Consider reserved instances for base load.'}
                      {formData.growthPattern === 'seasonal' && 
                        'Seasonal patterns allow for scheduled scaling. Plan for peak season capacity and off-season cost optimization.'}
                      {formData.growthPattern === 'viral_spike_expected' && 
                        'Viral spikes need burst capacity planning. Consider CDN, caching, and emergency scaling procedures.'}
                      {formData.growthPattern === 'uncertain' && 
                        'Uncertain patterns require flexible, pay-as-you-go infrastructure with strong monitoring and alerts.'}
                      {!formData.growthPattern && 'Select a growth pattern to see cost implications.'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <Typography variant="subtitle2" gutterBottom>Revenue Model Impact</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.revenueModel === 'pre_revenue' && 
                        'Pre-revenue: Focus on cost optimization and efficient scaling. Consider spot instances and dev/staging environments.'}
                      {formData.revenueModel === 'freemium' && 
                        'Freemium: Balance free tier costs vs paid conversions. Monitor cost per user and conversion rates.'}
                      {formData.revenueModel === 'paid_from_launch' && 
                        'Paid model: Can justify higher infrastructure costs for better performance and reliability.'}
                      {formData.revenueModel === 'enterprise_sales' && 
                        'Enterprise: Premium infrastructure justified. Focus on reliability, security, and dedicated resources.'}
                      {!formData.revenueModel && 'Select a revenue model to see cost implications.'}
                    </Typography>
                  </Box>
                </Box>

                {/* Usage Cost Projection */}
                {formData.usersMonth12 && formData.dailyApiCalls?.[0] && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Projected Scale at 12 Months</Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                        <Typography variant="caption" color="text.secondary">Users</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {parseInt(formData.usersMonth12).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                        <Typography variant="caption" color="text.secondary">Daily API Calls</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {(formData.dailyApiCalls[0] * (parseInt(formData.usersMonth12) / (parseInt(formData.usersMonth1to3) || 1))).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                        <Typography variant="caption" color="text.secondary">Monthly API Volume</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {(formData.dailyApiCalls[0] * 30 * (parseInt(formData.usersMonth12) / (parseInt(formData.usersMonth1to3) || 1))).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                        <Typography variant="caption" color="text.secondary">Scale Factor</Typography>
                        <Typography variant="body2" fontWeight="medium" color="primary">
                          {((parseInt(formData.usersMonth12) / (parseInt(formData.usersMonth1to3) || 1))).toFixed(1)}x
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Scaling Recommendations */}
            {formData.growthPattern && formData.revenueModel && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Recommended Scaling Strategy:</strong><br />
                  {(() => {
                    if (formData.growthPattern === 'exponential' && formData.revenueModel === 'pre_revenue') {
                      return 'Focus on cost-effective auto-scaling with aggressive monitoring. Consider spot instances and efficient caching.';
                    } else if (formData.growthPattern === 'viral_spike_expected') {
                      return 'Implement CDN, horizontal auto-scaling, and load testing. Plan for 10-50x traffic spikes.';
                    } else if (formData.revenueModel === 'enterprise_sales') {
                      return 'Prioritize reliability and dedicated resources. Consider reserved instances and premium support tiers.';
                    } else if (formData.growthPattern === 'seasonal') {
                      return 'Implement scheduled scaling with seasonal capacity planning. Use predictive scaling policies.';
                    } else {
                      return 'Balanced approach with monitoring-driven scaling and cost optimization based on growth metrics.';
                    }
                  })()}
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 7:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People />
                    <Typography variant="h6">ML/AI Team Composition</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Specify the number of engineers by experience level. Leave blank if not hiring for a role.
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <TextField
                    label="Junior ML Engineers"
                    type="number"
                    value={formData.mlEngineers.junior}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      mlEngineers: { ...prev.mlEngineers, junior: e.target.value }
                    }))}
                    placeholder="0"
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                    helperText="0-2 years experience (~$100k/year)"
                  />
                  
                  <TextField
                    label="Mid-level ML Engineers"
                    type="number"
                    value={formData.mlEngineers.mid}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      mlEngineers: { ...prev.mlEngineers, mid: e.target.value }
                    }))}
                    placeholder="0"
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                    helperText="2-5 years experience (~$140k/year)"
                  />
                  
                  <TextField
                    label="Senior ML Engineers"
                    type="number"
                    value={formData.mlEngineers.senior}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      mlEngineers: { ...prev.mlEngineers, senior: e.target.value }
                    }))}
                    placeholder="0"
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                    helperText="5-10 years experience (~$190k/year)"
                  />
                  
                  <TextField
                    label="Lead/Staff ML Engineers"
                    type="number"
                    value={formData.mlEngineers.lead}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      mlEngineers: { ...prev.mlEngineers, lead: e.target.value }
                    }))}
                    placeholder="0"
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                    helperText="10+ years experience (~$240k/year)"
                  />
                </Box>

                <TextField
                  label="DevOps/MLOps Engineers"
                  type="number"
                  value={formData.devopsEngineers}
                  onChange={(e) => setFormData(prev => ({ ...prev, devopsEngineers: e.target.value }))
                  }
                  placeholder="0"
                  fullWidth
                  inputProps={{ min: 0, step: 1 }}
                  helperText="For infrastructure, deployment, and monitoring (~$150k/year)"
                />

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Team Size Impact:</strong> Personnel costs typically represent 60-80% of total project costs. 
                    Consider starting lean and scaling the team as needed.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupWork />
                    <Typography variant="h6">External Resources & Consultants</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.externalConsultants}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        externalConsultants: e.target.checked,
                        consultantHours: e.target.checked ? prev.consultantHours : ''
                      }))}
                    />
                  }
                  label="Planning to use external consultants or contractors"
                />

                {formData.externalConsultants && (
                  <TextField
                    label="Expected Consultant Hours per Month"
                    type="number"
                    value={formData.consultantHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, consultantHours: e.target.value }))
                    }
                    placeholder="e.g., 80"
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                    helperText="Typical rates: $150-300/hour depending on expertise"
                  />
                )}

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Development Approach *</InputLabel>
                    <Select
                      value={formData.developmentApproach}
                      onChange={(e) => setFormData(prev => ({ ...prev, developmentApproach: e.target.value }))
                      }
                      label="Development Approach *"
                    >
                      <MenuItem value="agile_iterative">Agile/Iterative (2-week sprints)</MenuItem>
                      <MenuItem value="waterfall">Waterfall (Sequential phases)</MenuItem>
                      <MenuItem value="lean_mvp">Lean MVP (Minimum viable product first)</MenuItem>
                      <MenuItem value="research_first">Research-first (Extensive experimentation)</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel>Development Duration *</InputLabel>
                    <Select
                      value={formData.developmentDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, developmentDuration: e.target.value }))
                      }
                      label="Development Duration *"
                    >
                      <MenuItem value="1-3_months">1-3 months (Rapid prototype)</MenuItem>
                      <MenuItem value="3-6_months">3-6 months (Standard MVP)</MenuItem>
                      <MenuItem value="6-12_months">6-12 months (Full product)</MenuItem>
                      <MenuItem value="12_plus_months">12+ months (Enterprise platform)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>

            {/* Team Cost Summary */}
            {(() => {
              const totalEngineers = 
                (parseInt(formData.mlEngineers.junior) || 0) +
                (parseInt(formData.mlEngineers.mid) || 0) +
                (parseInt(formData.mlEngineers.senior) || 0) +
                (parseInt(formData.mlEngineers.lead) || 0) +
                (parseInt(formData.devopsEngineers) || 0);
              
              const estimatedMonthlyCost = 
                (parseInt(formData.mlEngineers.junior) || 0) * 8333 +
                (parseInt(formData.mlEngineers.mid) || 0) * 11667 +
                (parseInt(formData.mlEngineers.senior) || 0) * 15833 +
                (parseInt(formData.mlEngineers.lead) || 0) * 20000 +
                (parseInt(formData.devopsEngineers) || 0) * 12500 +
                (formData.externalConsultants ? (parseInt(formData.consultantHours) || 0) * 200 : 0);

              return totalEngineers > 0 && (
                <Card variant="outlined" sx={{ backgroundColor: 'action.hover' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Team Cost Summary
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: '1 1 auto' }}>
                        <Typography variant="caption" color="text.secondary">Total Team Size</Typography>
                        <Typography variant="h5" fontWeight="bold">{totalEngineers}</Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 auto' }}>
                        <Typography variant="caption" color="text.secondary">Monthly Personnel Cost</Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          ${estimatedMonthlyCost.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 auto' }}>
                        <Typography variant="caption" color="text.secondary">Annual Personnel Cost</Typography>
                        <Typography variant="h6" fontWeight="medium">
                          ${(estimatedMonthlyCost * 12).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })()}
          </Box>
        );

      case 8:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChart />
                    <Typography variant="h6">ML Operations & Experiment Tracking</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Experiment Tracking Solution *</InputLabel>
                  <Select
                    value={formData.experimentTracking}
                    onChange={(e) => setFormData(prev => ({ ...prev, experimentTracking: e.target.value }))
                    }
                    label="Experiment Tracking Solution *"
                  >
                    <MenuItem value="none">None (Basic logging only)</MenuItem>
                    <MenuItem value="mlflow">MLflow (Open source)</MenuItem>
                    <MenuItem value="wandb">Weights & Biases (Premium)</MenuItem>
                    <MenuItem value="neptune">Neptune.ai (Premium)</MenuItem>
                    <MenuItem value="comet">Comet.ml (Premium)</MenuItem>
                    <MenuItem value="custom">Custom solution</MenuItem>
                  </Select>
                  <FormHelperText>
                    Experiment tracking costs: Free (MLflow) to $50-200/user/month (Premium tools)
                  </FormHelperText>
                </FormControl>

                <TextField
                  label="Expected Model Versions per Month *"
                  type="number"
                  value={formData.modelVersions}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelVersions: e.target.value }))
                  }
                  placeholder="e.g., 10"
                  fullWidth
                  inputProps={{ min: 1, step: 1 }}
                  helperText="How many model iterations/experiments do you expect to run monthly?"
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Refresh />
                    <Typography variant="h6">Monitoring & Observability</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Monitoring Requirements *</InputLabel>
                  <Select
                    value={formData.monitoringRequirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, monitoringRequirements: e.target.value }))
                    }
                    label="Monitoring Requirements *"
                  >
                    <MenuItem value="basic">Basic (CloudWatch/equivalent only)</MenuItem>
                    <MenuItem value="standard">Standard (Metrics + basic alerts)</MenuItem>
                    <MenuItem value="advanced">Advanced (APM, distributed tracing)</MenuItem>
                    <MenuItem value="enterprise">Enterprise (Full observability stack)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Estimated Logging Volume (GB/month) *"
                  type="number"
                  value={formData.loggingVolume}
                  onChange={(e) => setFormData(prev => ({ ...prev, loggingVolume: e.target.value }))
                  }
                  placeholder="e.g., 100"
                  fullWidth
                  inputProps={{ min: 1, step: 1 }}
                  helperText="Includes application logs, model predictions, and system metrics"
                />

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Monitoring Costs:</strong> Typically $0.50-2.50 per GB for log storage and $5-50 per metric per month. 
                    Advanced APM tools add $50-100 per host/month.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Dns />
                    <Typography variant="h6">CI/CD & Deployment Pipeline</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>CI/CD Requirements *</InputLabel>
                  <Select
                    value={formData.cicdRequirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, cicdRequirements: e.target.value }))
                    }
                    label="CI/CD Requirements *"
                  >
                    <MenuItem value="manual">Manual deployment</MenuItem>
                    <MenuItem value="basic_cicd">Basic CI/CD (GitHub Actions/GitLab CI)</MenuItem>
                    <MenuItem value="automated_testing">Automated testing + deployment</MenuItem>
                    <MenuItem value="full_mlops">Full MLOps pipeline (automated retraining)</MenuItem>
                  </Select>
                  <FormHelperText>
                    CI/CD costs range from free (basic) to $500-2000/month (enterprise MLOps platforms)
                  </FormHelperText>
                </FormControl>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.requiresDataVersioning || false}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          requiresDataVersioning: e.target.checked 
                        }))}
                      />
                    }
                    label="Data versioning (DVC, LakeFS)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.requiresDataValidation || false}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          requiresDataValidation: e.target.checked 
                        }))}
                      />
                    }
                    label="Automated data validation"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 9:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security />
                    <Typography variant="h6">Compliance & Regulatory Requirements</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select all compliance frameworks your project must adhere to. These significantly impact infrastructure costs.
                </Typography>

                <FormGroup>
                  {[
                    { value: 'none', label: 'No specific compliance requirements', cost: '$0' },
                    { value: 'gdpr', label: 'GDPR (EU Data Protection)', cost: '+$500-2000/month' },
                    { value: 'hipaa', label: 'HIPAA (Healthcare)', cost: '+$1000-5000/month' },
                    { value: 'soc2', label: 'SOC 2 Type II', cost: '+$2000-8000/month' },
                    { value: 'pci_dss', label: 'PCI DSS (Payment Card)', cost: '+$1000-4000/month' },
                    { value: 'iso27001', label: 'ISO 27001', cost: '+$1500-6000/month' },
                    { value: 'ccpa', label: 'CCPA (California Privacy)', cost: '+$300-1500/month' },
                    { value: 'fedramp', label: 'FedRAMP (US Government)', cost: '+$5000-20000/month' }
                  ].map((compliance) => (
                    <Box key={compliance.value} sx={{ mb: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.complianceRequirements.includes(compliance.value)}
                            onChange={(e) => {
                              if (compliance.value === 'none') {
                                // If "none" is checked, clear all others
                                setFormData(prev => ({
                                  ...prev,
                                  complianceRequirements: e.target.checked ? ['none'] : []
                                }));
                              } else {
                                // If any other is checked, remove "none" and toggle the selected
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    complianceRequirements: [
                                      ...prev.complianceRequirements.filter(c => c !== 'none'),
                                      compliance.value
                                    ]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    complianceRequirements: prev.complianceRequirements.filter(c => c !== compliance.value)
                                  }));
                                }
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">{compliance.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {compliance.cost}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </FormGroup>

                {formData.complianceRequirements.length > 1 && 
                 !formData.complianceRequirements.includes('none') && (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Multiple Compliance Frameworks:</strong> Each additional compliance requirement 
                      compounds infrastructure complexity and costs. Consider prioritizing the most critical frameworks first.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Policy />
                    <Typography variant="h6">Data Residency & Sovereignty</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Data Residency Requirements *</InputLabel>
                  <Select
                    value={formData.dataResidency}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataResidency: e.target.value }))
                    }
                    label="Data Residency Requirements *"
                  >
                    <MenuItem value="no_restrictions">No specific restrictions</MenuItem>
                    <MenuItem value="single_country">Must stay in single country</MenuItem>
                    <MenuItem value="eu_only">EU only (GDPR requirement)</MenuItem>
                    <MenuItem value="us_only">US only</MenuItem>
                    <MenuItem value="multi_region_specific">Specific multi-region requirements</MenuItem>
                  </Select>
                  <FormHelperText>
                    Data residency can increase costs by 20-50% due to regional infrastructure requirements
                  </FormHelperText>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Security Posture *</InputLabel>
                  <Select
                    value={formData.securityPosture}
                    onChange={(e) => setFormData(prev => ({ ...prev, securityPosture: e.target.value }))
                    }
                    label="Security Posture *"
                  >
                    <MenuItem value="standard">Standard (Industry best practices)</MenuItem>
                    <MenuItem value="enhanced">Enhanced (Additional security controls)</MenuItem>
                    <MenuItem value="maximum">Maximum (Zero-trust architecture)</MenuItem>
                    <MenuItem value="government">Government-grade security</MenuItem>
                  </Select>
                  <FormHelperText>
                    Higher security postures require additional tooling, monitoring, and compliance infrastructure
                  </FormHelperText>
                </FormControl>
              </CardContent>
            </Card>

            {/* Security Cost Impact */}
            {formData.complianceRequirements.length > 0 && 
             !formData.complianceRequirements.includes('none') && (
              <Card variant="outlined" sx={{ backgroundColor: 'action.hover' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning />
                    Compliance Cost Impact
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Your selected compliance requirements will require:
                  </Typography>

                  <Box component="ul" sx={{ m: 0, pl: 3 }}>
                    <li>
                      <Typography variant="body2">
                        Encrypted storage at rest and in transit (minimal cost impact)
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Enhanced logging and audit trails (+50-100GB/month storage)
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Data backup and retention policies (2-3x storage costs)
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Security monitoring and incident response tools ($500-5000/month)
                      </Typography>
                    </li>
                    {formData.complianceRequirements.includes('hipaa') && (
                      <li>
                        <Typography variant="body2" color="warning.main">
                          HIPAA: Requires Business Associate Agreements (BAAs) with all cloud providers
                        </Typography>
                      </li>
                    )}
                    {formData.complianceRequirements.includes('fedramp') && (
                      <li>
                        <Typography variant="body2" color="error.main">
                          FedRAMP: Requires certified cloud regions with significant premium costs
                        </Typography>
                      </li>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 10:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney />
                    <Typography variant="h6">Budget Philosophy & Approach</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Budget Philosophy *</InputLabel>
                  <Select
                    value={formData.budgetPhilosophy}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetPhilosophy: e.target.value }))
                    }
                    label="Budget Philosophy *"
                  >
                    <MenuItem value="cost_minimization">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Cost Minimization</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Every dollar counts, aggressive optimization, accept some risk
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="balanced">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Balanced</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Balance cost efficiency with reliability and scalability
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="performance_first">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Performance First</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Prioritize speed and user experience over cost optimization
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="enterprise_grade">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Enterprise Grade</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Maximum reliability, redundancy, and support regardless of cost
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Risk Buffer / Contingency *</InputLabel>
                  <Select
                    value={formData.riskBuffer}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskBuffer: e.target.value }))
                    }
                    label="Risk Buffer / Contingency *"
                  >
                    <MenuItem value="10">10% - Confident estimates, low risk</MenuItem>
                    <MenuItem value="25">25% - Standard uncertainty buffer</MenuItem>
                    <MenuItem value="40">40% - High uncertainty, new territory</MenuItem>
                    <MenuItem value="60">60% - Very high uncertainty, R&D project</MenuItem>
                  </Select>
                  <FormHelperText>
                    Industry standard is 25-40% contingency for AI/ML projects due to experimentation needs
                  </FormHelperText>
                </FormControl>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Currency *</InputLabel>
                  <Select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    label="Currency *"
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="CAD">CAD ($)</MenuItem>
                    <MenuItem value="AUD">AUD ($)</MenuItem>
                    <MenuItem value="JPY">JPY (¥)</MenuItem>
                    <MenuItem value="INR">INR (₹)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Funding Status *</InputLabel>
                  <Select
                    value={formData.fundingStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, fundingStatus: e.target.value }))}
                    label="Funding Status *"
                  >
                    <MenuItem value="bootstrapped">Bootstrapped</MenuItem>
                    <MenuItem value="seed_funded">Seed Funded</MenuItem>
                    <MenuItem value="series_a_plus">Series A+</MenuItem>
                    <MenuItem value="profitable">Profitable/Self-funded</MenuItem>
                    <MenuItem value="enterprise_budget">Enterprise Budget</MenuItem>
                  </Select>
                </FormControl>
                </Box>
              </CardContent>
            </Card>

            {/* Budget Recommendations */}
            <Card variant="outlined" sx={{ backgroundColor: 'action.hover' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Budget Optimization Recommendations
                </Typography>
                
                {formData.budgetPhilosophy === 'cost_minimization' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Cost Minimization Strategy:</strong> We'll recommend spot instances, 
                      aggressive auto-scaling, minimal redundancy, and open-source tools where possible. 
                      Expect potential service interruptions but 50-70% cost savings.
                    </Typography>
                  </Alert>
                )}

                {formData.budgetPhilosophy === 'balanced' && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Balanced Approach:</strong> We'll mix reserved instances with auto-scaling, 
                      standard redundancy, and proven commercial tools. This provides 99.9% uptime with 
                      moderate cost optimization.
                    </Typography>
                  </Alert>
                )}

                {formData.budgetPhilosophy === 'performance_first' && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Performance Priority:</strong> Premium compute resources, CDN, multi-region 
                      deployment, and real-time monitoring. Expect 30-50% higher costs but sub-second latency 
                      and 99.99% uptime.
                    </Typography>
                  </Alert>
                )}

                {formData.budgetPhilosophy === 'enterprise_grade' && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Enterprise Grade:</strong> Dedicated resources, 24/7 support, multi-region 
                      active-active deployment, comprehensive monitoring. Expect 2-3x baseline costs but 
                      maximum reliability and support.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 11:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning />
                    <Typography variant="h6">Hidden Costs & Often Overlooked Expenses</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Alert severity="warning">
                  <Typography variant="body2" paragraph>
                    <strong>Important:</strong> AI/ML projects often have hidden costs that can represent 
                    30-50% of total project expenses. Review and acknowledge these areas:
                  </Typography>
                </Alert>

                <FormGroup>
                  {[{
                    value: 'data_quality',
                    title: 'Data Quality & Cleaning',
                    description: 'Data preprocessing, cleaning, and quality assurance can take 40-60% of project time',
                    cost: '$5,000-50,000'
                  },
                  {
                    value: 'experimentation',
                    title: 'Experimentation & Failed Attempts',
                    description: 'Average 5-10 failed experiments per successful model. GPU time adds up quickly',
                    cost: '2-5x your initial compute estimate'
                  },
                  {
                    value: 'model_monitoring',
                    title: 'Model Monitoring & Maintenance',
                    description: 'Ongoing monitoring, retraining, and drift detection',
                    cost: '$500-5,000/month ongoing'
                  },
                  {
                    value: 'data_labeling',
                    title: 'Data Labeling & Annotation',
                    description: 'If you need human-labeled data, costs range widely',
                    cost: '$0.01-10 per label depending on complexity'
                  },
                  {
                    value: 'api_rate_limits',
                    title: 'API Rate Limits & Overages',
                    description: 'Exceeding rate limits or quotas can result in expensive overage charges',
                    cost: 'Up to 2-3x standard rates for overages'
                  },
                  {
                    value: 'egress_costs',
                    title: 'Data Egress & Transfer Costs',
                    description: 'Moving data between regions or out of cloud can be surprisingly expensive',
                    cost: '$0.08-0.20 per GB transferred'
                  },
                  {
                    value: 'support_licenses',
                    title: 'Support & Software Licenses',
                    description: 'Enterprise support contracts, ML platform licenses, monitoring tools',
                    cost: '$1,000-10,000/month'
                  },
                  {
                    value: 'training_time',
                    title: 'Team Training & Ramp-up',
                    description: 'Learning new tools, frameworks, and cloud platforms takes time',
                    cost: '20-40 hours per team member'
                  },
                  {
                    value: 'model_interpretability',
                    title: 'Model Interpretability & Explainability',
                    description: 'Building trust through explainable AI, especially for regulated industries',
                    cost: '$10,000-100,000 for enterprise solutions'
                  },
                  {
                    value: 'disaster_recovery',
                    title: 'Disaster Recovery & Backup',
                    description: 'Automated backups, point-in-time recovery, disaster recovery testing',
                    cost: '20-50% of primary infrastructure cost'
                  },
                  {
                    value: 'technical_debt',
                    title: 'Technical Debt & Refactoring',
                    description: 'MVP code needs refactoring; infrastructure needs hardening for production',
                    cost: '30-50% of initial development cost'
                  },
                  {
                    value: 'regulatory_compliance',
                    title: 'Regulatory Compliance Audits',
                    description: 'Third-party audits, penetration testing, compliance certifications',
                    cost: '$15,000-100,000 per audit'
                  }].map((cost) => (
                    <Box 
                      key={cost.value} 
                      sx={{ 
                        mb: 2, 
                        p: 2, 
                        border: '1px solid',
                        borderColor: formData.hiddenCostsAcknowledged.includes(cost.value) 
                          ? 'success.main' 
                          : 'divider',
                        borderRadius: 1,
                        backgroundColor: formData.hiddenCostsAcknowledged.includes(cost.value)
                          ? 'success.lighter'
                          : 'background.paper'
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.hiddenCostsAcknowledged.includes(cost.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  hiddenCostsAcknowledged: [...prev.hiddenCostsAcknowledged, cost.value]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  hiddenCostsAcknowledged: prev.hiddenCostsAcknowledged.filter(c => c !== cost.value)
                                }));
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="medium">{cost.title}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {cost.description}
                            </Typography>
                            <Typography variant="caption" color="warning.main" fontWeight="medium">
                              Typical Cost: {cost.cost}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </FormGroup>

                {formData.hiddenCostsAcknowledged.length < 8 && (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Recommendation:</strong> Review and acknowledge at least 8 of these cost areas 
                      to proceed. This ensures you have a comprehensive understanding of potential expenses.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Final submission note */}
            {formData.hiddenCostsAcknowledged.length >= 8 && (
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Ready to Generate Forecast!</strong> You've completed all sections and 
                  acknowledged the major cost considerations. Click "Generate Budget Forecast" to create 
                  your comprehensive budget analysis.
                </Typography>
              </Alert>
            )}

            {/* Budget Summary */}
            <Card variant="outlined" sx={{ backgroundColor: 'action.hover' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonetizationOn />
                  Acknowledged Cost Areas: {formData.hiddenCostsAcknowledged.length} of 12
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Unacknowledged areas represent blind spots that could impact your project budget.
                </Typography>
              </CardContent>
            </Card>

            {/* Final submission note */}
            {formData.hiddenCostsAcknowledged.length >= 8 && (
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Ready to Generate Forecast!</strong> You've completed all sections and 
                  acknowledged the major cost considerations. Click "Generate Budget Forecast" to create 
                  your comprehensive budget analysis.
                </Typography>
              </Alert>
            )}

            {/* Budget Summary */}
            <Card variant="outlined" sx={{ backgroundColor: 'action.hover' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonetizationOn />
                  Acknowledged Cost Areas: {formData.hiddenCostsAcknowledged.length} of 12
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Your budget forecast will include estimated ranges for all acknowledged cost areas. 
                  Unacknowledged areas represent blind spots that could impact your project budget.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

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
      {/* Upgrade Prompt Overlay */}
      {showUpgradePrompt ? (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" />
              Upgrade Required
            </Box>
          </DialogTitle>

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'auto' }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Free Plan Limit Reached
              </Typography>
              <Typography variant="body2" paragraph>
                You've created your free project. To create more projects and unlock advanced features, 
                please upgrade to a paid plan.
              </Typography>
            </Alert>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              {/* Pro Plan Card */}
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  border: '2px solid',
                  borderColor: 'primary.main',
                  position: 'relative',
                  '&:hover': { boxShadow: 4 }
                }}
              >
                <Box sx={{ position: 'absolute', top: -12, right: 16 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 2,
                      fontWeight: 'bold'
                    }}
                  >
                    Most Popular
                  </Typography>
                </Box>

                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Pro
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h3" component="span" fontWeight="bold">
                    $19
                  </Typography>
                  <Typography variant="body1" component="span" color="text.secondary">
                    /month
                  </Typography>
                </Box>

                <Box component="ul" sx={{ mb: 3, pl: 0, listStyle: 'none' }}>
                  {['Unlimited Projects', 'Advanced Analytics', 'Priority Support', 'Export Data'].map((feature) => (
                    <Box component="li" key={feature} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Check sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={async () => {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      const response = await fetch('/api/create-checkout-session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          priceId: 'price_1SQ3aBIPj9aniqVHab8m4DZ8',
                          planName: 'Pro',
                          userId: user?.id,
                          userEmail: user?.email,
                        }),
                      });
                      const { url } = await response.json();
                      if (url) window.location.href = url;
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }}
                >
                  Upgrade to Pro
                </Button>
              </Card>

              {/* Enterprise Plan Card */}
              <Card variant="outlined" sx={{ p: 3, '&:hover': { boxShadow: 4 } }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Enterprise
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h3" component="span" fontWeight="bold">
                    $49
                  </Typography>
                  <Typography variant="body1" component="span" color="text.secondary">
                    /month
                  </Typography>
                </Box>

                <Box component="ul" sx={{ mb: 3, pl: 0, listStyle: 'none' }}>
                  {['Everything in Pro', 'Team Collaboration', 'Custom Integrations', 'Dedicated Support'].map((feature) => (
                    <Box component="li" key={feature} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Check sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={async () => {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      const response = await fetch('/api/create-checkout-session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          priceId: 'price_1SQ3dBIPj9aniqVHBrhp0ZVf',
                          planName: 'Enterprise',
                          userId: user?.id,
                          userEmail: user?.email,
                        }),
                      });
                      const { url } = await response.json();
                      if (url) window.location.href = url;
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }}
                >
                  Upgrade to Enterprise
                </Button>
              </Card>
            </Box>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>💡 Why upgrade?</strong><br />
                • Create unlimited AI projects<br />
                • Access advanced budget forecasting tools<br />
                • Get detailed cost breakdowns and optimization recommendations<br />
                • Priority support for your questions
              </Typography>
            </Alert>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          {/* Original Form Content */}
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

            {/* Free Project Indicator */}
            {!hasActiveSubscription && projectCount === 0 && (
              <Alert severity="success" icon={<Info />}>
                <Typography variant="body2">
                  <strong>🎉 Creating your FREE project!</strong><br />
                  This is your complimentary project. Upgrade anytime to create unlimited projects.
                </Typography>
              </Alert>
            )}

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
                {STAGES.map((stage) => {
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
        </>
      )}
    </Dialog>
  );
}
