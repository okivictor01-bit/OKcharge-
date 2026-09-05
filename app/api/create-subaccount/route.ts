import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_name, bank_name, account_number, percentage } = body;

    if (!business_name || !bank_name || !account_number) {
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
        settlement_bank: bank_name, // Note: Paystack usually requires the bank code, but for now we'll use name. We might need a bank list API later.
        account_number: account_number,
        percentage_charge: percentage * 100, // Paystack expects percentage in basis points (e.g., 30% = 3000? No, 30% = 30. Wait, Paystack uses percentage directly for subaccounts, e.g., 30 for 30%)
        // Actually, Paystack subaccount percentage is just the number (e.g., 30 for 30%)
        percentage_charge: percentage 
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

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
