export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const reference = url.searchParams.get('ref');

  if (!reference) {
    return new Response(JSON.stringify({ error: 'No reference provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1. Verify with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const amountPaid = paystackData.data.amount / 100;
    const platformShare = amountPaid * 0.5;

    // 2. Setup Supabase REST API credentials
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

    // 3. Find the rental
    const rentalRes = await fetch(`${supabaseUrl}/rest/v1/rentals?payment_reference=eq.${reference}&select=id,location_id,status`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Prefer: 'return=representation' }
    });
    const rentals = await rentalRes.json();
    
    if (!rentals || rentals.length === 0) {
      return new Response(JSON.stringify({ error: 'Rental not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const rental = rentals[0];

    if (rental.status === 'active' || rental.status === 'paid') {
      return new Response(JSON.stringify({ success: true, message: 'Already verified' }), { headers: { 'Content-Type': 'application/json' } });
    }

    // 4. Get location to find owner
    const locationRes = await fetch(`${supabaseUrl}/rest/v1/locations?id=eq.${rental.location_id}&select=owner_id`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Prefer: 'return=representation' }
    });
    const locations = await locationRes.json();
    const location = locations ? locations[0] : null;

    // 5. Update rental status
    await fetch(`${supabaseUrl}/rest/v1/rentals?id=eq.${rental.id}`, {
      method: 'PATCH',
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'active', amount_paid: amountPaid })
    });

    // 6. Update owner's wallet balance
    if (location && location.owner_id) {
      const ownerRes = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${location.owner_id}&select=wallet_balance,total_earnings`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Prefer: 'return=representation' }
      });
      const owners = await ownerRes.json();
      const owner = owners ? owners[0] : null;

      const currentBalance = owner?.wallet_balance || 0;
      const currentEarnings = owner?.total_earnings || 0;

      await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${location.owner_id}`, {
        method: 'PATCH',
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ 
          wallet_balance: currentBalance + platformShare,
          total_earnings: currentEarnings + platformShare
        })
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment verified and owner balance updated',
      amount: amountPaid,
      ownerShare: platformShare
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
