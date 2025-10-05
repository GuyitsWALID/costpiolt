import { NextResponse } from 'next/server';
import { polar } from '@/lib/polar';

export async function GET() {
  try {
    if (!process.env.POLAR_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Polar access token not configured'
      }, { status: 500 });
    }

    // Test if Polar connection works - get your specific organization
    const organization = await polar.organizations.get({
      id: '8546384c-1bb8-4d82-95c3-dce405a59057'
    });
    console.log('Organization response:', organization);

    // Try to get products for your organization
    let products;
    try {
      products = await polar.products.list({
        organizationId: '8546384c-1bb8-4d82-95c3-dce405a59057',
        limit: 10
      });
      console.log('Products response:', products);
    } catch (productError) {
      console.error('Products error:', productError);
      products = null;
    }

    // Try to get the specific product
    let specificProduct;
    try {
      specificProduct = await polar.products.get({
        id: '3bdd0f57-bac5-4190-8847-f48681c18e43'
      });
      console.log('Specific product:', specificProduct);
    } catch (productError) {
      console.error('Specific product error:', productError);
      specificProduct = null;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Polar connection successful',
      organization: organization ? { id: organization.id, name: organization.name } : null,
      productsAvailable: !!products,
      specificProduct: specificProduct ? { 
        id: specificProduct.id, 
        name: specificProduct.name,
        pricesCount: specificProduct.prices?.length || 0
      } : null,
      apiStructure: {
        organizationType: typeof organization,
        productsType: typeof products,
        specificProductType: typeof specificProduct
      }
    });

  } catch (error) {
    console.error('Polar API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check console for full error details'
    }, { status: 500 });
  }
}
