import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_name, bank_code, account_number, percentage } = body;

    if (!business_name || !bank_code || !account_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call Paystack API to create a subaccount
    const response = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        business_name: business_name,
        settlement_bank: bank_code, // Paystack requires the bank code (e.g., "044" for Access Bank)
        account_number: account_number,
        percentage_charge: percentage // Paystack expects a number between 0 and 100 (e.g., 30 for 30%)
      })
    });

    const data = await response.json();

    if (data.status) {
      return NextResponse.json({ 
        success: true, 
        subaccount_code: data.data.subaccount_code 
      });
    } else {
      return NextResponse.json({ error: data.message || 'Failed to create subaccount' }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
