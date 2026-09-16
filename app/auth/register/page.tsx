const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.name,
        role: 'owner'
      }
    }
  });

  if (error) {
    setMessage('Error: ' + error.message);
  } else if (data.user) {
    // Update profile with additional info
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        phone: formData.phone,
        bank_name: formData.bankName,
        bank_account_number: formData.bankAccount
      })
      .eq('user_id', data.user.id);

    if (!updateError) {
      // Try to create Paystack subaccount
      try {
        const response = await fetch('/api/create-subaccount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bankName: formData.bankName,
            bankAccount: formData.bankAccount,
            fullName: formData.name,
            email: formData.email,
            profileId: data.user.id
          })
        });

        const subaccountData = await response.json();

        if (subaccountData.success) {
          // Save the subaccount code to database
          await supabase
            .from('profiles')
            .update({ 
              paystack_subaccount_code: subaccountData.subaccountCode 
            })
            .eq('user_id', data.user.id);
        }
      } catch (err) {
        console.error('Subaccount creation failed:', err);
        // Don't fail the registration, just log the error
      }
    }

    setMessage('✅ Registration successful! Your account is ready.');
    setTimeout(() => router.push('/auth/login'), 3000);
  }
  setLoading(false);
};
