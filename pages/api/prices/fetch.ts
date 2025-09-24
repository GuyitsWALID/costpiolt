import { NextApiRequest, NextApiResponse } from 'next';

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

// In-memory cache for price data
let priceCache: PriceMap | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Fallback price map if external APIs fail
const FALLBACK_PRICES: Omit<PriceMap, 'timestamp'> = {
  gpu_hours: {
    small: 1.5,
    medium: 3.2,
    large: 7.0
  },
  token_unit_cost: 0.00002,
  label_unit_cost: 0.06
};

async function fetchLiveGpuPrices(): Promise<{ small: number; medium: number; large: number } | null> {
  try {
    // Mock GPU pricing API call - replace with actual provider APIs
    // This would typically call AWS EC2, GCP, Azure APIs for current spot/on-demand pricing
    const priceApiKey = process.env.PRICE_API_KEY;
    
    if (!priceApiKey) {
      console.warn('PRICE_API_KEY not configured, using fallback prices');
      return null;
    }

    // Example: Mock call to a unified pricing API
    // In production, this would be actual API calls to:
    // - AWS EC2 pricing API for p3.2xlarge (V100), p4d.24xlarge (A100), p5.48xlarge (H100)
    // - GCP Compute pricing API
    // - Azure pricing API
    
    // Simulate API response with some variance
    const variance = 0.8 + Math.random() * 0.4; // 0.8 to 1.2x multiplier
    return {
      small: FALLBACK_PRICES.gpu_hours.small * variance,
      medium: FALLBACK_PRICES.gpu_hours.medium * variance,
      large: FALLBACK_PRICES.gpu_hours.large * variance
    };
  } catch (error) {
    console.error('Failed to fetch GPU prices:', error);
    return null;
  }
}

async function fetchLiveTokenPrices(): Promise<number | null> {
  try {
    // Mock OpenAI/provider pricing API call
    const priceApiKey = process.env.PRICE_API_KEY;
    
    if (!priceApiKey) {
      return null;
    }

    // In production, this would call:
    // - OpenAI pricing API
    // - Anthropic pricing API
    // - Other LLM provider APIs based on the selected model
    
    // Simulate API response
    return FALLBACK_PRICES.token_unit_cost * (0.9 + Math.random() * 0.2);
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
    return null;
  }
}

async function fetchLiveLabelingPrices(): Promise<number | null> {
  try {
    // Mock labeling service pricing API call
    const priceApiKey = process.env.PRICE_API_KEY;
    
    if (!priceApiKey) {
      return null;
    }

    // In production, this would call:
    // - Scale AI pricing API
    // - Amazon Mechanical Turk pricing
    // - Appen pricing API
    // - Other labeling service APIs
    
    // Simulate API response
    return FALLBACK_PRICES.label_unit_cost * (0.85 + Math.random() * 0.3);
  } catch (error) {
    console.error('Failed to fetch labeling prices:', error);
    return null;
  }
}

async function fetchFreshPriceMap(): Promise<{ priceMap: PriceMap; warnings: string[] }> {
  const warnings: string[] = [];
  
  // Fetch prices from external APIs in parallel
  const [gpuPrices, tokenPrice, labelingPrice] = await Promise.all([
    fetchLiveGpuPrices(),
    fetchLiveTokenPrices(),
    fetchLiveLabelingPrices()
  ]);

  // Build price map with fallbacks
  const priceMap: PriceMap = {
    gpu_hours: gpuPrices || FALLBACK_PRICES.gpu_hours,
    token_unit_cost: tokenPrice || FALLBACK_PRICES.token_unit_cost,
    label_unit_cost: labelingPrice || FALLBACK_PRICES.label_unit_cost,
    timestamp: Date.now()
  };

  // Add warnings for failed API calls
  if (!gpuPrices) warnings.push('gpu_pricing_api_failed_fallback_used');
  if (!tokenPrice) warnings.push('token_pricing_api_failed_fallback_used');
  if (!labelingPrice) warnings.push('labeling_pricing_api_failed_fallback_used');

  if (warnings.length > 0) {
    warnings.push('price_api_failed_fallback_used');
  }

  return { priceMap, warnings };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const now = Date.now();
    
    // Check if cache is valid
    if (priceCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        price_map: priceCache,
        cached: true
      });
    }

    // Fetch fresh prices
    const { priceMap, warnings } = await fetchFreshPriceMap();
    
    // Update cache
    priceCache = priceMap;
    cacheTimestamp = now;

    return res.status(200).json({
      success: true,
      price_map: priceMap,
      warnings: warnings.length > 0 ? warnings : undefined,
      cached: false
    });

  } catch (error) {
    console.error('Error in prices/fetch:', error);
    
    // Return fallback prices with error warning
    const fallbackPriceMap: PriceMap = {
      ...FALLBACK_PRICES,
      timestamp: Date.now()
    };

    return res.status(200).json({
      success: true,
      price_map: fallbackPriceMap,
      warnings: ['price_api_completely_failed_fallback_used'],
      cached: false
    });
  }
}

// Export types for use in other files
export type { PriceMap };