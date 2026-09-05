import { NextResponse } from 'next/server';

// Handle OPTIONS request (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle GET request
export async function GET() {
  return NextResponse.json({ 
    message: "API Route is active!", 
    timestamp: new Date().toISOString(),
    method: "GET"
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
}

// Handle POST request
export async function POST(request: Request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Missing Paystack Secret Key' }, { status: 500 });
    }

    const body = await request.json();
    const { business_name, bank_code, account_number, percentage } = body;

    if (!business_name || !bank_code || !account_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const response = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        business_name: business_name,
        settlement_bank: bank_code,
        account_number: account_number,
        percentage_charge: percentage
      })
    });

    const data = await response.json();

    if (data.status) {
      return NextResponse.json({ 
        success: true, 
        subaccount_code: data.data.subaccount_code,
        message: "Subaccount created successfully!"
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    } else {
      return NextResponse.json({ 
        error: data.message || 'Failed to create subaccount', 
        details: data 
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
