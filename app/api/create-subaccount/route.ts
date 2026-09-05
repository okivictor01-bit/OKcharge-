import { NextResponse } from 'next/server';

// 1. Add a GET method to test if the route is alive
export async function GET() {
  return NextResponse.json({ 
    message: "API Route is active and working!", 
    timestamp: new Date().toISOString() 
  });
}

// 2. The POST method for creating subaccounts
export async function POST(request: Request) {
  try {
    // Check if Secret Key exists
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Server configuration error: Missing Paystack Secret Key' }, { status: 500 });
    }

    const body = await request.json();
    const { business_name, bank_code, account_number, percentage } = body;

    if (!business_name || !bank_code || !account_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call Paystack API
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

    // Handle non-JSON responses from Paystack (like HTML error pages)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      if (data.status) {
        return NextResponse.json({ success: true, subaccount_code: data.data.subaccount_code });
      } else {
        return NextResponse.json({ error: data.message || 'Failed to create subaccount', details: data }, { status: 400 });
      }
    } else {
      const text = await response.text();
      return NextResponse.json({ error: 'Paystack returned non-JSON response', details: text }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
