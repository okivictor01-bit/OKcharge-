"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // 1. If not logged in, go to login page
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // 2. Check if user is a registered location owner
      const { data: owner, error } = await supabase
        .from('location_owners')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      // 3. If they are not an owner, kick them out
      if (error || !owner) {
        router.push('/'); 
        return;
      }

      // 4. If they are an owner, let them in
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>🔒 Verifying partner access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
