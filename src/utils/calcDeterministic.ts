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
  projectId?: string | null;
  dataset_gb: number;
  model_size: 'small' | 'medium' | 'large';
  epochs_per_gb: number;
  label_count: number;
  monthly_tokens: number;
  team: TeamMember[];
  price_map: PriceMap;
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
  metadata: Record<string, any>;
}

export interface DeterministicResult {
  total_cost: number;
  line_items: BudgetLineItem[];
  summary: {
    compute_cost: number;
    data_cost: number;
    team_cost: number;
    monthly_operational_cost: number;
  };
  metadata: {
    calculation_timestamp: string;
    input_hash: string;
    version: string;
  };
}

/**
 * Pure deterministic budget calculation function
 * Given the same inputs, will always produce the same outputs
 */
export function calcDeterministic(input: DeterministicInput): DeterministicResult {
  const lineItems: BudgetLineItem[] = [];
  
  // 1. GPU Training Costs
  const gpuHoursPerGb = input.epochs_per_gb * 0.5; // Assumption: 0.5 GPU hours per epoch per GB
  const totalGpuHours = input.dataset_gb * gpuHoursPerGb;
  const gpuUnitCost = input.price_map.gpu_hours[input.model_size];
  const totalGpuCost = totalGpuHours * gpuUnitCost;

  if (totalGpuCost > 0) {
    lineItems.push({
      category: 'compute',
      subcategory: 'gpu_training',
      description: `GPU training (${input.model_size} instances) for ${input.dataset_gb}GB dataset over ${input.epochs_per_gb} epochs`,
      quantity: totalGpuHours,
      unit_cost: gpuUnitCost,
      total_cost: totalGpuCost,
      unit_type: 'hours',
      source: 'deterministic',
      confidence_score: 1.0,
      metadata: {
        model_size: input.model_size,
        epochs_per_gb: input.epochs_per_gb,
        dataset_gb: input.dataset_gb
      }
    });
  }

  // 2. Data Labeling Costs
  const totalLabelingCost = input.label_count * input.price_map.label_unit_cost;
  
  if (totalLabelingCost > 0) {
    lineItems.push({
      category: 'data',
      subcategory: 'labeling',
      description: `Data labeling for ${input.label_count.toLocaleString()} labels`,
      quantity: input.label_count,
      unit_cost: input.price_map.label_unit_cost,
      total_cost: totalLabelingCost,
      unit_type: 'labels',
      source: 'deterministic',
      confidence_score: 1.0,
      metadata: {
        label_count: input.label_count
      }
    });
  }

  // 3. API Token Costs (Monthly)
  const monthlyTokenCost = input.monthly_tokens * input.price_map.token_unit_cost;
  
  if (monthlyTokenCost > 0) {
    lineItems.push({
      category: 'compute',
      subcategory: 'api_calls',
      description: `Monthly API token usage (${input.monthly_tokens.toLocaleString()} tokens)`,
      quantity: input.monthly_tokens,
      unit_cost: input.price_map.token_unit_cost,
      total_cost: monthlyTokenCost,
      unit_type: 'tokens',
      source: 'deterministic',
      confidence_score: 1.0,
      metadata: {
        monthly_tokens: input.monthly_tokens,
        recurring: true
      }
    });
  }

  // 4. Team Costs
  let totalTeamCost = 0;
  input.team.forEach((member, index) => {
    const memberTotalCost = member.hours * member.hourly_rate;
    totalTeamCost += memberTotalCost;

    lineItems.push({
      category: 'team',
      subcategory: member.role,
      description: `${member.role} (${member.hours} hours at $${member.hourly_rate}/hour)`,
      quantity: member.hours,
      unit_cost: member.hourly_rate,
      total_cost: memberTotalCost,
      unit_type: 'hours',
      source: 'deterministic',
      confidence_score: 1.0,
      metadata: {
        role: member.role,
        team_member_index: index
      }
    });
  });

  // Calculate totals and summary
  const computeCost = lineItems
    .filter(item => item.category === 'compute')
    .reduce((sum, item) => sum + item.total_cost, 0);

  const dataCost = lineItems
    .filter(item => item.category === 'data')
    .reduce((sum, item) => sum + item.total_cost, 0);

  const teamCost = lineItems
    .filter(item => item.category === 'team')
    .reduce((sum, item) => sum + item.total_cost, 0);

  const totalCost = lineItems.reduce((sum, item) => sum + item.total_cost, 0);

  // Create input hash for deterministic verification
  const inputHash = createInputHash(input);

  return {
    total_cost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
    line_items: lineItems.map(item => ({
      ...item,
      total_cost: Math.round(item.total_cost * 100) / 100
    })),
    summary: {
      compute_cost: Math.round(computeCost * 100) / 100,
      data_cost: Math.round(dataCost * 100) / 100,
      team_cost: Math.round(teamCost * 100) / 100,
      monthly_operational_cost: Math.round(monthlyTokenCost * 100) / 100
    },
    metadata: {
      calculation_timestamp: new Date().toISOString(),
      input_hash: inputHash,
      version: '1.0.0'
    }
  };
}

/**
 * Create a deterministic hash of the input for verification
 */
function createInputHash(input: DeterministicInput): string {
  // Create a canonical string representation of the input
  const canonical = {
    dataset_gb: input.dataset_gb,
    model_size: input.model_size,
    epochs_per_gb: input.epochs_per_gb,
    label_count: input.label_count,
    monthly_tokens: input.monthly_tokens,
    team: input.team.map(member => ({
      role: member.role,
      hours: member.hours,
      hourly_rate: member.hourly_rate
    })).sort((a, b) => a.role.localeCompare(b.role)), // Sort for consistency
    price_map: input.price_map
  };
  
  // Simple hash function (in production, use a proper hash like crypto.createHash)
  const str = JSON.stringify(canonical);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Validate input data
 */
export function validateDeterministicInput(input: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof input.dataset_gb !== 'number' || input.dataset_gb < 0) {
    errors.push('dataset_gb must be a non-negative number');
  }

  if (!['small', 'medium', 'large'].includes(input.model_size)) {
    errors.push('model_size must be one of: small, medium, large');
  }

  if (typeof input.epochs_per_gb !== 'number' || input.epochs_per_gb <= 0) {
    errors.push('epochs_per_gb must be a positive number');
  }

  if (!Number.isInteger(input.label_count) || input.label_count < 0) {
    errors.push('label_count must be a non-negative integer');
  }

  if (!Number.isInteger(input.monthly_tokens) || input.monthly_tokens < 0) {
    errors.push('monthly_tokens must be a non-negative integer');
  }

  if (!Array.isArray(input.team)) {
    errors.push('team must be an array');
  } else {
    input.team.forEach((member: any, index: number) => {
      if (typeof member.role !== 'string' || member.role.trim().length === 0) {
        errors.push(`team[${index}].role must be a non-empty string`);
      }
      if (typeof member.hours !== 'number' || member.hours < 0) {
        errors.push(`team[${index}].hours must be a non-negative number`);
      }
      if (typeof member.hourly_rate !== 'number' || member.hourly_rate < 0) {
        errors.push(`team[${index}].hourly_rate must be a non-negative number`);
      }
    });
  }

  if (!input.price_map || typeof input.price_map !== 'object') {
    errors.push('price_map is required and must be an object');
  } else {
    if (!input.price_map.gpu_hours || typeof input.price_map.gpu_hours !== 'object') {
      errors.push('price_map.gpu_hours is required and must be an object');
    } else {
      ['small', 'medium', 'large'].forEach(size => {
        if (typeof input.price_map.gpu_hours[size] !== 'number' || input.price_map.gpu_hours[size] < 0) {
          errors.push(`price_map.gpu_hours.${size} must be a non-negative number`);
        }
      });
    }

    if (typeof input.price_map.token_unit_cost !== 'number' || input.price_map.token_unit_cost < 0) {
      errors.push('price_map.token_unit_cost must be a non-negative number');
    }

    if (typeof input.price_map.label_unit_cost !== 'number' || input.price_map.label_unit_cost < 0) {
      errors.push('price_map.label_unit_cost must be a non-negative number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}