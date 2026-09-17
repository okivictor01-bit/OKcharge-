export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('ref');

  if (!reference) {
    return NextResponse.json({ error: 'No reference provided' }, { status: 400 });
  }

  try {
    // 1. Verify with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const amountPaid = paystackData.data.amount / 100; // Convert kobo to Naira
    const platformShare = amountPaid * 0.5; // 50% for platform/owner

    // 2. Find the rental associated with this reference
    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .select('id, location_id, status')
      .eq('payment_reference', reference)
      .single();

    if (rentalError || !rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    // 3. If already verified, just return success
    if (rental.status === 'active' || rental.status === 'paid') {
      return NextResponse.json({ success: true, message: 'Already verified' });
    }

    // 4. Get the location to find the owner
    const { data: location } = await supabase
      .from('locations')
      .select('owner_id')
      .eq('id', rental.location_id)
      .single();

    // 5. Update rental status to active/paid
    await supabase
      .from('rentals')
      .update({ status: 'active', amount_paid: amountPaid })
      .eq('id', rental.id);

    // 6. Update the owner's wallet balance (if owner exists)
    if (location?.owner_id) {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('wallet_balance, total_earnings')
        .eq('user_id', location.owner_id)
        .single();

      const currentBalance = ownerProfile?.wallet_balance || 0;
      const currentEarnings = ownerProfile?.total_earnings || 0;

      await supabase
        .from('profiles')
        .update({ 
          wallet_balance: currentBalance + platformShare,
          total_earnings: currentEarnings + platformShare
        })
        .eq('user_id', location.owner_id);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment verified and owner balance updated',
      amount: amountPaid,
      ownerShare: platformShare
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
