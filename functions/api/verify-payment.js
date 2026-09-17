export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const reference = url.searchParams.get('ref');

  console.log('[VERIFY] Starting verification for:', reference);

  if (!reference) {
    console.error('[VERIFY] No reference provided');
    return new Response(JSON.stringify({ error: 'No reference provided' }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }

  try {
    // 1. Verify with Paystack
    console.log('[VERIFY] Verifying with Paystack...');
    console.log('[VERIFY] Using key:', env.PAYSTACK_SECRET_KEY ? 'Key exists' : 'MISSING!');
    
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[VERIFY] Paystack response status:', paystackResponse.status);
    
    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text();
      console.error('[VERIFY] Paystack HTTP error:', errorText);
      throw new Error(`Paystack HTTP ${paystackResponse.status}: ${errorText}`);
    }
    
    const paystackData = await paystackResponse.json();
    console.log('[VERIFY] Paystack data:', JSON.stringify(paystackData, null, 2));

    if (!paystackData.status) {
      console.error('[VERIFY] Paystack returned false status:', paystackData);
      throw new Error('Paystack verification failed');
    }

    if (paystackData.data.status !== 'success') {
      console.error('[VERIFY] Payment not successful:', paystackData.data.status);
      return new Response(JSON.stringify({ 
        error: 'Payment not successful', 
        status: paystackData.data.status,
        message: paystackData.data.gateway_response || 'Payment failed'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    const amountPaid = paystackData.data.amount / 100;
    const platformShare = amountPaid * 0.5;
    console.log('[VERIFY] Amount:', amountPaid, 'Platform share:', platformShare);

    // 2. Setup Supabase
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

    console.log('[VERIFY] Supabase URL:', supabaseUrl ? 'Exists' : 'MISSING!');
    console.log('[VERIFY] Supabase Key:', supabaseKey ? 'Exists' : 'MISSING!');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[VERIFY] Missing Supabase credentials');
      throw new Error('Database configuration error');
    }

    // 3. Find the rental
    console.log('[VERIFY] Searching for rental with reference:', reference);
    const rentalRes = await fetch(`${supabaseUrl}/rest/v1/rentals?payment_reference=eq.${reference}&select=id,location_id,status,amount_paid`, {
      headers: { 
        apikey: supabaseKey, 
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=representation',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('[VERIFY] Rental search status:', rentalRes.status);
    
    if (!rentalRes.ok) {
      const errorText = await rentalRes.text();
      console.error('[VERIFY] Supabase HTTP error:', errorText);
      throw new Error(`Supabase HTTP ${rentalRes.status}: ${errorText}`);
    }
    
    const rentals = await rentalRes.json();
    console.log('[VERIFY] Rental search result:', JSON.stringify(rentals, null, 2));
    
    if (!rentals || rentals.length === 0) {
      console.error('[VERIFY] Rental not found for reference:', reference);
      return new Response(JSON.stringify({ error: 'Rental not found' }), { 
        status: 404, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    }

    const rental = rentals[0];
    console.log('[VERIFY] Found rental:', rental.id, 'Status:', rental.status);

    if (rental.status === 'active' || rental.status === 'paid') {
      console.log('[VERIFY] Already verified, returning success');
      return new Response(JSON.stringify({ success: true, message: 'Already verified' }), { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    }

    // 4. Get location to find owner
    console.log('[VERIFY] Getting location info for:', rental.location_id);
    const locationRes = await fetch(`${supabaseUrl}/rest/v1/locations?id=eq.${rental.location_id}&select=owner_id`, {
      headers: { 
        apikey: supabaseKey, 
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=representation',
        'Content-Type': 'application/json'
      }
    });
    
    if (!locationRes.ok) {
      console.error('[VERIFY] Location fetch failed:', locationRes.status);
    }
    
    const locations = await locationRes.json();
    const location = locations ? locations[0] : null;
    console.log('[VERIFY] Location:', location);

    // 5. Update rental status
    console.log('[VERIFY] Updating rental status to active...');
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/rentals?id=eq.${rental.id}`, {
      method: 'PATCH',
      headers: { 
        apikey: supabaseKey, 
        Authorization: `Bearer ${supabaseKey}`, 
        'Content-Type': 'application/json', 
        Prefer: 'return=minimal' 
      },
      body: JSON.stringify({ 
        status: 'active', 
        amount_paid: amountPaid 
      })
    });
    
    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error('[VERIFY] Update failed:', errorText);
    } else {
      console.log('[VERIFY] Rental updated successfully');
    }

    // 6. Update owner's wallet balance
    if (location && location.owner_id) {
      console.log('[VERIFY] Updating owner wallet for:', location.owner_id);
      const ownerRes = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${location.owner_id}&select=wallet_balance,total_earnings`, {
        headers: { 
          apikey: supabaseKey, 
          Authorization: `Bearer ${supabaseKey}`, 
          Prefer: 'return=representation',
          'Content-Type': 'application/json'
        }
      });
      
      if (!ownerRes.ok) {
        console.error('[VERIFY] Owner fetch failed:', ownerRes.status);
      } else {
        const owners = await ownerRes.json();
        const owner = owners ? owners[0] : null;
        console.log('[VERIFY] Owner data:', owner);

        const currentBalance = owner?.wallet_balance || 0;
        const currentEarnings = owner?.total_earnings || 0;

        console.log('[VERIFY] Current balance:', currentBalance, 'Adding:', platformShare);

        const updateWalletRes = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${location.owner_id}`, {
          method: 'PATCH',
          headers: { 
            apikey: supabaseKey, 
            Authorization: `Bearer ${supabaseKey}`, 
            'Content-Type': 'application/json', 
            Prefer: 'return=minimal' 
          },
          body: JSON.stringify({ 
            wallet_balance: currentBalance + platformShare,
            total_earnings: currentEarnings + platformShare
          })
        });
        
        if (!updateWalletRes.ok) {
          console.error('[VERIFY] Wallet update failed:', updateWalletRes.status);
        } else {
          console.log('[VERIFY] Owner wallet updated successfully!');
        }
      }
    } else {
      console.log('[VERIFY] No location or owner found, skipping wallet update');
    }

    console.log('[VERIFY] Verification complete, success!');
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment verified and owner balance updated',
      amount: amountPaid,
      ownerShare: platformShare
    }), { 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    });

  } catch (error) {
    console.error('[VERIFY] Fatal error:', error);
    console.error('[VERIFY] Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message,
      reference: reference
    }), { 
      status: 500, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    });
  }
}
