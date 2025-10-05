import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.POLAR_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Polar access token not configured'
      }, { status: 500 });
    }

    // Try to import Polar dynamically
    let polar;
    try {
      const { polar: polarClient } = await import('@/lib/polar');
      polar = polarClient;
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Polar SDK not available',
        details: 'This might be expected in build environments'
      }, { status: 503 });
    }

    // Test Polar connection
    try {
      const organization = await polar.organizations.get({
        id: '8546384c-1bb8-4d82-95c3-dce405a59057'
      });

      return NextResponse.json({
        success: true,
        message: 'Polar connection successful',
        organization: organization ? { id: organization.id, name: organization.name } : null
      });
    } catch (polarError) {
      return NextResponse.json({
        success: false,
        error: polarError instanceof Error ? polarError.message : 'Polar API error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Polar test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}