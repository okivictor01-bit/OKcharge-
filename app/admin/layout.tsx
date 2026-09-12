"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'tvicglobal@gmail.com'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'staff' | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = '/auth/admin-login';
        return;
      }

      // Check if user is admin
      if (session.user.email === ADMIN_EMAIL) {
        setIsAuthorized(true);
        setUserRole('admin');
        return;
      }

      // Check if user is staff
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();

      if (staffData) {
        setIsAuthorized(true);
        setUserRole('staff');
        return;
      }

      // Not authorized
      window.location.href = '/';
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = userRole === 'staff' ? '/auth/staff-login' : '/auth/admin-login';
  };

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>🔒 Verifying access...</p>
      </div>
    );
  }

  // Determine where the "Dashboard" link should go based on role
  const dashboardLink = userRole === 'staff' ? '/staff/dashboard' : '/admin/dashboard';

  return (
    <>
      <header style={{ 
        backgroundColor: '#0f172a', 
        color: 'white', 
        padding: '15px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Link href={dashboardLink} style={{ 
          textDecoration: 'none', 
          display: 'flex',
          alignItems: 'center'
        }}>
          <img src="/logo.png" alt="OKcharge" style={{ height: '40px', width: 'auto' }} />
        </Link>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link href={dashboardLink} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Dashboard</Link>
          <Link href="/admin/locations" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Locations</Link>
          <Link href="/admin/owners" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Owners</Link>
          <button 
            onClick={handleLogout}
            style={{ 
              backgroundColor: '#ef4444', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none',
              fontSize: '14px', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {children}
    </>
  );
}
