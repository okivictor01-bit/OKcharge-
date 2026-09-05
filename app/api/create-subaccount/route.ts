import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_name, bank_code, account_number, percentage } = body;

    console.log('Received request:', { business_name, bank_code, account_number, percentage });

    if (!business_name || !bank_code || !account_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if Secret Key exists
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY is missing!');
      return NextResponse.json({ error: 'Server configuration error: Missing Paystack Secret Key' }, { status: 500 });
    }

    console.log('Calling Paystack API...');

    // Call Paystack API to create a subaccount
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

    console.log('Paystack Response Status:', response.status);

    // Try to parse the response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON from Paystack:', jsonError);
      const textResponse = await response.text();
      console.error('Raw response:', textResponse);
      return NextResponse.json({ error: 'Invalid response from Paystack', details: textResponse }, { status: 500 });
    }

    console.log('Paystack Data:', data);

    if (data.status) {
      return NextResponse.json({ 
        success: true, 
        subaccount_code: data.data.subaccount_code 
      });
    } else {
      return NextResponse.json({ error: data.message || 'Failed to create subaccount', details: data }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
t
