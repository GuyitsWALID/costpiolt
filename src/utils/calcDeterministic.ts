/**
 * Module 2: Deterministic Budget Calculator
 * Pure calculation function for transparent line-item budget computation
 */

export interface TeamMember {
  role: string;
  hours: number;
  hourly_rate: number;
}

export interface PriceMap {
  gpu_hours: {
    small: number;
    medium: number;
    large: number;
  };
  token_unit_cost: number;
  label_unit_cost: number;
}

export interface DeterministicInput {
  dataset_gb: number;
  model_size: 'small' | 'medium' | 'large';
  epochs_per_gb: number;
  label_count: number;
  monthly_tokens: number;
  team: Array<{
    role: string;
    hours: number;
    hourly_rate: number;
  }>;
  price_map: {
    gpu_hours: {
      small: number;
      medium: number;
      large: number;
    };
    token_unit_cost: number;
    label_unit_cost: number;
  };
}

export interface BudgetLineItem {
  category: string;
  subcategory: string;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  unit_type: string;
  source: string;
  confidence_score: number;
  metadata: Record<string, unknown>;
}

export interface DeterministicResult {
  total_cost: number;
  summary: {
    compute_cost: number;
    data_cost: number;
    team_cost: number;
    monthly_operational_cost: number;
  };
  line_items: Array<{
    description: string;
    quantity: number;
    unit_type: string;
    unit_cost: number;
    total_cost: number;
  }>;
}

/**
 * Pure deterministic budget calculation function
 * Given the same inputs, will always produce the same outputs
 */
export function calcDeterministic(input: DeterministicInput): DeterministicResult {
  const lineItems: DeterministicResult['line_items'] = [];

  // Calculate GPU hours needed for training
  const totalEpochs = input.dataset_gb * input.epochs_per_gb;
  const gpuHourlyRate = input.price_map.gpu_hours[input.model_size];
  const trainingGpuHours = totalEpochs * getModelTrainingMultiplier(input.model_size);
  const trainingCost = trainingGpuHours * gpuHourlyRate;

  lineItems.push({
    description: `GPU Training (${input.model_size} model)`,
    quantity: trainingGpuHours,
    unit_type: 'hours',
    unit_cost: gpuHourlyRate,
    total_cost: trainingCost
  });

  // Calculate data labeling cost
  const labelingCost = input.label_count * input.price_map.label_unit_cost;
  
  if (input.label_count > 0) {
    lineItems.push({
      description: 'Data Labeling',
      quantity: input.label_count,
      unit_type: 'labels',
      unit_cost: input.price_map.label_unit_cost,
      total_cost: labelingCost
    });
  }

  // Calculate monthly token cost
  const monthlyTokenCost = input.monthly_tokens * input.price_map.token_unit_cost;
  
  if (input.monthly_tokens > 0) {
    lineItems.push({
      description: 'Monthly Token Usage',
      quantity: input.monthly_tokens,
      unit_type: 'tokens',
      unit_cost: input.price_map.token_unit_cost,
      total_cost: monthlyTokenCost
    });
  }

  // Calculate team costs
  let totalTeamCost = 0;
  input.team.forEach((member) => {
    const memberCost = member.hours * member.hourly_rate;
    totalTeamCost += memberCost;
    
    lineItems.push({
      description: `${member.role} (${member.hours}h)`,
      quantity: member.hours,
      unit_type: 'hours',
      unit_cost: member.hourly_rate,
      total_cost: memberCost
    });
  });

  // Calculate totals
  const computeCost = trainingCost;
  const dataCost = labelingCost;
  const teamCost = totalTeamCost;
  const monthlyOperationalCost = monthlyTokenCost;

  const totalCost = computeCost + dataCost + teamCost + monthlyOperationalCost;

  return {
    total_cost: totalCost,
    summary: {
      compute_cost: computeCost,
      data_cost: dataCost,
      team_cost: teamCost,
      monthly_operational_cost: monthlyOperationalCost
    },
    line_items: lineItems
  };
}

function getModelTrainingMultiplier(modelSize: 'small' | 'medium' | 'large'): number {
  switch (modelSize) {
    case 'small': return 1;
    case 'medium': return 2.5;
    case 'large': return 5;
    default: return 1;
  }
}

/**
 * Validate input data
 */
export function validateDeterministicInput(input: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    errors.push('Input must be an object');
    return { isValid: false, errors };
  }

  const data = input as Record<string, unknown>;

  if (typeof data.dataset_gb !== 'number' || data.dataset_gb < 0) {
    errors.push('dataset_gb must be a non-negative number');
  }

  if (!['small', 'medium', 'large'].includes(data.model_size as string)) {
    errors.push('model_size must be one of: small, medium, large');
  }

  if (typeof data.epochs_per_gb !== 'number' || data.epochs_per_gb <= 0) {
    errors.push('epochs_per_gb must be a positive number');
  }

  if (!Number.isInteger(data.label_count) || (data.label_count as number) < 0) {
    errors.push('label_count must be a non-negative integer');
  }

  if (!Number.isInteger(data.monthly_tokens) || (data.monthly_tokens as number) < 0) {
    errors.push('monthly_tokens must be a non-negative integer');
  }

  if (!Array.isArray(data.team)) {
    errors.push('team must be an array');
  } else {
    (data.team as unknown[]).forEach((member: unknown, index: number) => {
      if (!member || typeof member !== 'object') {
        errors.push(`team[${index}] must be an object`);
        return;
      }
      
      const teamMember = member as Record<string, unknown>;
      
      if (typeof teamMember.role !== 'string' || (teamMember.role as string).trim().length === 0) {
        errors.push(`team[${index}].role must be a non-empty string`);
      }
      if (typeof teamMember.hours !== 'number' || teamMember.hours < 0) {
        errors.push(`team[${index}].hours must be a non-negative number`);
      }
      if (typeof teamMember.hourly_rate !== 'number' || teamMember.hourly_rate < 0) {
        errors.push(`team[${index}].hourly_rate must be a non-negative number`);
      }
    });
  }

  if (!data.price_map || typeof data.price_map !== 'object') {
    errors.push('price_map is required and must be an object');
  } else {
    const priceMap = data.price_map as Record<string, unknown>;
    
    if (!priceMap.gpu_hours || typeof priceMap.gpu_hours !== 'object') {
      errors.push('price_map.gpu_hours is required and must be an object');
    } else {
      const gpuHours = priceMap.gpu_hours as Record<string, unknown>;
      ['small', 'medium', 'large'].forEach(size => {
        if (typeof gpuHours[size] !== 'number' || gpuHours[size] < 0) {
          errors.push(`price_map.gpu_hours.${size} must be a non-negative number`);
        }
      });
    }

    if (typeof priceMap.token_unit_cost !== 'number' || priceMap.token_unit_cost < 0) {
      errors.push('price_map.token_unit_cost must be a non-negative number');
    }

    if (typeof priceMap.label_unit_cost !== 'number' || priceMap.label_unit_cost < 0) {
      errors.push('price_map.label_unit_cost must be a non-negative number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}