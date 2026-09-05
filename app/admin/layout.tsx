"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Your actual admin email address
const ADMIN_EMAIL = 'tvicglobal@gmail.com'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check for active session
      const { data: { session } } = await supabase.auth.getSession();

      // 2. If NO session, force hard redirect to the dedicated admin login page
      if (!session) {
        window.location.href = '/auth/admin-login';
        return;
      }

      // 3. If session exists, check if it's the Admin
      if (session.user.email !== ADMIN_EMAIL) {
        // Check if they are a location owner
        const { data: owner } = await supabase
          .from('location_owners')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (owner) {
          window.location.href = '/owner/dashboard'; // Redirect owners to their own dashboard
        } else {
          window.location.href = '/'; // Kick out random/unauthorized users
        }
        return;
      }

      // 4. If it is the admin, allow rendering
      setIsAuthorized(true);
    };

    checkAuth();
  }, []);

  // Show loading screen while checking (prevents flashing the dashboard)
  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>🔒 Verifying admin access...</p>
      </div>
    );
  }

  // Only render the dashboard if authorized
  return <>{children}</>;
}
