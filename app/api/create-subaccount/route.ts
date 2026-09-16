import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { bankName, bankAccount, fullName, email } = await request.json();

    console.log('Creating Paystack subaccount for:', { bankName, fullName, email });

    // Use environment variable (secure - stored in Cloudflare)
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecret) {
      throw new Error('Paystack secret key not configured');
    }

    const paystackResponse = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: fullName,
        settlement_bank: bankName,
        account_number: bankAccount,
        percentage: 50,
        email: email
      })
    });

    const data = await paystackResponse.json();
    console.log('Paystack response:', data);

    if (!data.status) {
      throw new Error(data.message || 'Failed to create subaccount');
    }

    return NextResponse.json({ 
      success: true, 
      subaccountCode: data.data.subaccount_code 
    });

  } catch (error: any) {
    console.error('Subaccount creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
