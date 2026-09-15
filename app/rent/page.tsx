// ... (keep everything the same until the paymentCallback function)

const paymentCallback = async function(response: any) {
  console.log('Payment successful:', response);
  console.log('Creating rental with ticket:', ticketCode);
  
  try {
    const { data, error } = await supabase
      .from('rentals')
      .insert({
        ticket_code: ticketCode,
        customer_name: currentFormData.name,
        customer_phone: currentFormData.phone,
        duration_hours: parseInt(currentDuration),
        amount_paid: currentPriceValue,
        paystack_reference: response.reference, // FIXED: Changed from payment_reference
        status: 'paid',
        payment_status: 'paid',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error details:', error);
      alert(`Payment successful but rental save failed: ${error.message}\n\nTicket: ${ticketCode}\nReference: ${response.reference}\n\nPlease screenshot this and contact support.`);
      setLoading(false);
      return;
    }

    console.log('Rental created successfully:', data);
    setLoading(false);
    router.push(`/rent/success?ref=${response.reference}&ticket=${ticketCode}`);
  } catch (dbError: any) {
    console.error('Unexpected error:', dbError);
    alert(`Payment successful but there was an issue saving your rental.\n\nTicket: ${ticketCode}\nError: ${dbError.message}\n\nPlease contact support.`);
    setLoading(false);
  }
};

// ... (rest of the code stays the same)
