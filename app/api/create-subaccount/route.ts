import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { bankName, bankAccount, fullName, email, profileId } = await request.json();

    // Paystack API to create subaccount
    const paystackResponse = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: fullName,
        settlement_bank: bankName,
        account_number: bankAccount,
        percentage: 50, // 50% split
        email: email
      })
    });

    const data = await paystackResponse.json();

    if (!data.status) {
      throw new Error(data.message || 'Failed to create subaccount');
    }

    // Return the subaccount code
    return NextResponse.json({ 
      success: true, 
      subaccountCode: data.data.subaccount_code 
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
