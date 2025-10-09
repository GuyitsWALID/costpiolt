import { Project, ProjectEstimation } from '@/lib/supabaseClient';

interface EstimationParams {
  project: Project;
  cloudProvider?: string;
  gpuType?: string;
  teamSizeOverride?: number;
  durationOverride?: number;
}

interface CostBreakdown {
  training: {
    gpuHours: number;
    costPerHour: number;
    totalCost: number;
    description: string;
  };
  fineTuning: {
    iterations: number;
    costPerIteration: number;
    totalCost: number;
    description: string;
  };
  inference: {
    monthlyRequests: number;
    costPerRequest: number;
    monthlyCost: number;
    description: string;
  };
  team: {
    teamSize: number;
    avgSalary: number;
    duration: number;
    totalCost: number;
    description: string;
  };
  infrastructure: {
    storage: number;
    bandwidth: number;
    monitoring: number;
    description: string;
  };
}

// Define proper types for GPU pricing
type CloudProvider = 'aws' | 'gcp' | 'azure';
type GPUInstance = {
  pricePerHour: number;
  memory: string;
  compute: string;
};

// GPU pricing data (simplified - in production, fetch from APIs)
const GPU_PRICING: Record<CloudProvider, Record<string, GPUInstance>> = {
  'aws': {
    'p4.xlarge': { pricePerHour: 3.06, memory: '16GB', compute: 'A100' },
    'p3.2xlarge': { pricePerHour: 3.06, memory: '16GB', compute: 'V100' },
    'g4dn.xlarge': { pricePerHour: 0.526, memory: '16GB', compute: 'T4' }
  },
  'gcp': {
    'n1-standard-4-k80': { pricePerHour: 0.45, memory: '15GB', compute: 'K80' },
    'n1-standard-4-t4': { pricePerHour: 0.35, memory: '15GB', compute: 'T4' },
    'n1-standard-4-v100': { pricePerHour: 2.48, memory: '16GB', compute: 'V100' }
  },
  'azure': {
    'Standard_NC6s_v3': { pricePerHour: 3.06, memory: '112GB', compute: 'V100' },
    'Standard_NC4as_T4_v3': { pricePerHour: 0.526, memory: '28GB', compute: 'T4' }
  }
};

// Define proper types for model approaches
type ModelApproach = 'fine_tune' | 'api_only' | 'from_scratch';
type ModelComplexityKey = 'gpt_style' | 'bert_style' | 'custom_transformer' | 'fine_tuned_existing' | 'other';

// Model complexity multipliers - map model_approach to complexity keys
const MODEL_APPROACH_MAPPING: Record<ModelApproach, ModelComplexityKey> = {
  'fine_tune': 'fine_tuned_existing',
  'api_only': 'other',
  'from_scratch': 'custom_transformer'
};

const MODEL_COMPLEXITY: Record<ModelComplexityKey, { trainingMultiplier: number; inferenceMultiplier: number }> = {
  'gpt_style': { trainingMultiplier: 1.5, inferenceMultiplier: 1.2 },
  'bert_style': { trainingMultiplier: 1.0, inferenceMultiplier: 0.8 },
  'custom_transformer': { trainingMultiplier: 1.3, inferenceMultiplier: 1.0 },
  'fine_tuned_existing': { trainingMultiplier: 0.3, inferenceMultiplier: 0.9 },
  'other': { trainingMultiplier: 1.0, inferenceMultiplier: 1.0 }
};

// Define proper types for project types
type ProjectType = 'classification' | 'generation' | 'analysis' | 'other';

export class AIEstimationService {
  static async generateEstimation(params: EstimationParams): Promise<Omit<ProjectEstimation, 'id' | 'created_at' | 'updated_at'>> {
    const { project, cloudProvider = 'aws', gpuType = 'p4.xlarge' } = params;
    
    // Calculate training costs
    const trainingCosts = this.calculateTrainingCosts(project, cloudProvider, gpuType);
    
    // Calculate fine-tuning costs
    const fineTuningCosts = this.calculateFineTuningCosts(project, cloudProvider, gpuType);
    
    // Calculate inference costs
    const inferenceCosts = this.calculateInferenceCosts(project);
    
    // Calculate team costs
    const teamCosts = this.calculateTeamCosts(project, params.teamSizeOverride, params.durationOverride);
    
    // Calculate infrastructure costs
    const infrastructureCosts = this.calculateInfrastructureCosts(project);
    
    // Generate AI recommendations
    const aiRecommendations = this.generateAIRecommendations(project, {
      training: trainingCosts,
      fineTuning: fineTuningCosts,
      inference: inferenceCosts,
      team: teamCosts,
      infrastructure: infrastructureCosts
    });
    
    // Calculate totals
    const totalDevelopmentCost = trainingCosts.totalCost + fineTuningCosts.totalCost + teamCosts.totalCost;
    const totalMonthlyCost = inferenceCosts.monthlyCost + infrastructureCosts.storage + infrastructureCosts.bandwidth + infrastructureCosts.monitoring;
    const totalYearlyCost = totalDevelopmentCost + (totalMonthlyCost * 12);
    
    return {
      project_id: project.id,
      user_id: project.user_id,
      estimation_name: 'AI Generated Estimation',
      is_active: true,
      
      // Training
      training_cost: trainingCosts.totalCost,
      training_duration_hours: trainingCosts.gpuHours,
      training_gpu_type: gpuType,
      training_gpu_count: 1,
      training_cloud_provider: cloudProvider,
      
      // Fine-tuning
      fine_tuning_cost: fineTuningCosts.totalCost,
      fine_tuning_duration_hours: Math.ceil(fineTuningCosts.iterations * 0.5),
      fine_tuning_iterations: fineTuningCosts.iterations,
      
      // Inference
      inference_cost_monthly: inferenceCosts.monthlyCost,
      inference_requests_monthly: inferenceCosts.monthlyRequests,
      inference_cost_per_request: inferenceCosts.costPerRequest,
      
      // Team
      team_size: teamCosts.teamSize,
      team_monthly_cost: teamCosts.totalCost / (params.durationOverride || 6),
      project_duration_months: params.durationOverride || 6,
      
      // Infrastructure
      storage_cost_monthly: infrastructureCosts.storage,
      bandwidth_cost_monthly: infrastructureCosts.bandwidth,
      monitoring_cost_monthly: infrastructureCosts.monitoring,
      
      // Totals
      total_development_cost: totalDevelopmentCost,
      total_monthly_operational_cost: totalMonthlyCost,
      total_yearly_cost: totalYearlyCost,
      
      // AI Analysis
      ai_recommendations: aiRecommendations.recommendations,
      cost_breakdown: aiRecommendations.breakdown,
      risk_factors: aiRecommendations.risks,
      optimization_suggestions: aiRecommendations.optimizations
    };
  }
  
  private static calculateTrainingCosts(project: Project, cloudProvider: string, gpuType: string) {
    // Safe access to GPU pricing with fallback
    const providerPricing = GPU_PRICING[cloudProvider as CloudProvider];
    const gpuPricing = providerPricing?.[gpuType] || GPU_PRICING['aws']['p4.xlarge'];
    
    // Safe access to complexity with mapping
    const complexityKey = MODEL_APPROACH_MAPPING[project.model_approach as ModelApproach] || 'other';
    const complexity = MODEL_COMPLEXITY[complexityKey];
    
    // Estimate GPU hours based on dataset size and model complexity
    const baseHours = Math.max(project.dataset_gb * 2, 10); // Minimum 10 hours
    const gpuHours = Math.ceil(baseHours * complexity.trainingMultiplier);
    const totalCost = gpuHours * gpuPricing.pricePerHour;
    
    return {
      gpuHours,
      costPerHour: gpuPricing.pricePerHour,
      totalCost,
      description: `Training a ${project.model_approach} model on ${project.dataset_gb}GB dataset using ${gpuType} for approximately ${gpuHours} hours.`
    };
  }
  
  private static calculateFineTuningCosts(project: Project, cloudProvider: string, gpuType: string) {
    // Safe access to GPU pricing with fallback
    const providerPricing = GPU_PRICING[cloudProvider as CloudProvider];
    const gpuPricing = providerPricing?.[gpuType] || GPU_PRICING['aws']['p4.xlarge'];
    
    // Safe access to complexity with mapping
    const complexityKey = MODEL_APPROACH_MAPPING[project.model_approach as ModelApproach] || 'other';
    const complexity = MODEL_COMPLEXITY[complexityKey];
    
    // Fine-tuning typically requires fewer iterations
    const iterations = Math.max(Math.ceil(project.dataset_gb * 0.5), 5);
    const costPerIteration = gpuPricing.pricePerHour * 0.5 * complexity.trainingMultiplier;
    const totalCost = iterations * costPerIteration;
    
    return {
      iterations,
      costPerIteration,
      totalCost,
      description: `Fine-tuning with ${iterations} iterations, each costing approximately $${costPerIteration.toFixed(2)}.`
    };
  }
  
  private static calculateInferenceCosts(project: Project) {
    // Safe access to complexity with mapping
    const complexityKey = MODEL_APPROACH_MAPPING[project.model_approach as ModelApproach] || 'other';
    const complexity = MODEL_COMPLEXITY[complexityKey];
    
    // Base cost per request (simplified)
    const baseCostPerRequest = 0.002; // $0.002 per request
    const costPerRequest = baseCostPerRequest * complexity.inferenceMultiplier;
    const monthlyRequests = project.monthly_tokens;
    const monthlyCost = monthlyRequests * costPerRequest;
    
    return {
      monthlyRequests,
      costPerRequest,
      monthlyCost,
      description: `${monthlyRequests.toLocaleString()} monthly requests at $${costPerRequest.toFixed(4)} each.`
    };
  }
  
  private static calculateTeamCosts(project: Project, teamSizeOverride?: number, durationOverride?: number) {
    // Estimate team size based on project complexity
    const estimatedTeamSize = teamSizeOverride || this.estimateTeamSize(project);
    const duration = durationOverride || 6; // Default 6 months
    
    // Average monthly cost per team member (including salary, benefits, overhead)
    const avgMonthlyCostPerPerson = 12000; // $12k/month average
    const totalCost = estimatedTeamSize * avgMonthlyCostPerPerson * duration;
    
    return {
      teamSize: estimatedTeamSize,
      avgSalary: avgMonthlyCostPerPerson,
      duration,
      totalCost,
      description: `${estimatedTeamSize} team members for ${duration} months at $${avgMonthlyCostPerPerson.toLocaleString()}/month average.`
    };
  }
  
  private static calculateInfrastructureCosts(project: Project) {
    // Storage cost (data + model storage)
    const storageCost = (project.dataset_gb * 0.023) + 50; // $0.023/GB + $50 base
    
    // Bandwidth cost (estimated based on usage)
    const bandwidthCost = Math.max(project.monthly_tokens * 0.0001, 20); // Minimum $20
    
    // Monitoring and logging
    const monitoringCost = 50; // Base monitoring cost
    
    return {
      storage: storageCost,
      bandwidth: bandwidthCost,
      monitoring: monitoringCost,
      description: `Storage: $${storageCost.toFixed(2)}, Bandwidth: $${bandwidthCost.toFixed(2)}, Monitoring: $${monitoringCost.toFixed(2)}`
    };
  }
  
  private static estimateTeamSize(project: Project): number {
    // Safe access to project type with proper typing
    const projectType = project.project_type as ProjectType;
    
    // Estimate team size based on project type and complexity
    const baseSize: Record<ProjectType, number> = {
      'classification': 2,
      'generation': 3,
      'analysis': 2,
      'other': 2
    };
    
    const base = baseSize[projectType] || 2;
    
    // Adjust based on dataset size
    if (project.dataset_gb > 100) return base + 1;
    if (project.dataset_gb > 1000) return base + 2;
    
    return base;
  }
  
  private static generateAIRecommendations(project: Project, costs: CostBreakdown) {
    const recommendations = [];
    const risks = [];
    const optimizations = [];
    
    // Cost-based recommendations
    if (costs.training.totalCost > 10000) {
      recommendations.push("Consider using spot instances to reduce training costs by up to 70%");
      optimizations.push({
        type: "cost_reduction",
        suggestion: "Use spot instances for training",
        potential_savings: costs.training.totalCost * 0.7,
        description: "Spot instances can significantly reduce training costs with minimal impact on timeline"
      });
    }
    
    if (costs.inference.monthlyCost > 5000) {
      recommendations.push("High inference costs detected. Consider model optimization or caching strategies");
      risks.push({
        type: "cost_overrun",
        description: "Monthly inference costs may exceed budget",
        impact: "high",
        mitigation: "Implement request caching and model optimization"
      });
    }
    
    // Timeline recommendations
    if (costs.training.gpuHours > 500) {
      recommendations.push("Long training time expected. Consider distributed training or model parallelism");
      optimizations.push({
        type: "performance",
        suggestion: "Implement distributed training",
        time_savings: "40-60%",
        description: "Distributed training can significantly reduce training time"
      });
    }
    
    // Resource recommendations
    recommendations.push(`For ${project.project_type} projects, consider using ${this.getRecommendedGPU(project)} for optimal price-performance`);
    
    return {
      recommendations: recommendations.join(". "),
      breakdown: costs,
      risks,
      optimizations
    };
  }
  
  private static getRecommendedGPU(project: Project): string {
    if (project.dataset_gb > 1000) return "A100 or H100";
    if (project.dataset_gb > 100) return "V100 or A100";
    return "T4 or V100";
  }
}
