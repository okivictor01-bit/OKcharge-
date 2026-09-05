"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Your actual admin email address
const ADMIN_EMAIL = 'tvicglobal@gmail.com'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

      // 2. If logged in, check if they are the Admin
      if (session.user.email !== ADMIN_EMAIL) {
        // If they are an owner, send them to their dashboard instead
        const { data: owner } = await supabase
          .from('location_owners')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (owner) {
          router.push('/owner/dashboard');
        } else {
          router.push('/'); // Kick out regular users
        }
        return;
      }

      // 3. If they are the admin, let them in
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>🔒 Verifying admin access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
