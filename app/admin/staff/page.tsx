  const handleAddStaff = async (e: any) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    if (newStaff.temp_password.length < 6) {
      setMessage('❌ Temporary password must be at least 6 characters.');
      setSaving(false);
      return;
    }

    try {
      console.log('🚀 Creating staff account...');
      
      // Method 1: Try Edge Function invocation
      let data: any;
      let error: any;
      
      try {
        const result = await supabase.functions.invoke('create-staff', {
          body: {
            email: newStaff.email,
            password: newStaff.temp_password,
            full_name: newStaff.full_name
          }
        });
        data = result.data;
        error = result.error;
      } catch (invokeError) {
        console.warn('Edge Function invoke failed, trying direct fetch...', invokeError);
        
        // Method 2: Direct fetch as fallback
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        const response = await fetch(`${supabaseUrl}/functions/v1/create-staff`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            email: newStaff.email,
            password: newStaff.temp_password,
            full_name: newStaff.full_name
          }),
        });
        
        data = await response.json();
        if (!response.ok) {
          error = { message: data.error || 'Request failed' };
        }
      }

      if (error) throw error;

      if (data && data.success) {
        setMessage(`✅ Staff created successfully! Temporary password: ${newStaff.temp_password}`);
        setNewStaff({ full_name: '', email: '', temp_password: '' });
        setShowAddForm(false);
        fetchStaff();
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      
      if (error.message?.includes('email')) {
        setMessage('❌ This email is already registered.');
      } else {
        setMessage('❌ Error: ' + (error.message || 'Failed to create staff'));
      }
    }
    setSaving(false);
  };
