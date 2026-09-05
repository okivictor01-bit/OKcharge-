"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // 1. If NO session, force hard redirect to login
      if (!session) {
        window.location.href = '/auth/login';
        return;
      }

      // 2. Check if user is a registered location owner
      const { data: owner, error } = await supabase
        .from('location_owners')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      // 3. If they are not an owner, kick them out to home
      if (error || !owner) {
        window.location.href = '/'; 
        return;
      }

      // 4. If they are an owner, allow rendering
      setIsAuthorized(true);
    };

    checkAuth();
  }, []);

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>🔒 Verifying partner access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
