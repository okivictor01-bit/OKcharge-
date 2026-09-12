"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Make sure this matches your admin email EXACTLY (case-insensitive check is added below)
const ADMIN_EMAIL = 'tvicglobal@gmail.com'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'staff' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log('No session found, redirecting to login');
        window.location.href = '/auth/admin-login';
        return;
      }

      const userEmail = session.user.email?.toLowerCase() || '';
      console.log('🔍 Detected User Email:', userEmail);
      console.log('🔍 Expected Admin Email:', ADMIN_EMAIL.toLowerCase());

      // Check if user is admin (case-insensitive)
      if (userEmail === ADMIN_EMAIL.toLowerCase()) {
        console.log('✅ User is Admin');
        setIsAuthorized(true);
        setUserRole('admin');
        setLoading(false);
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
        console.log('✅ User is Staff');
        setIsAuthorized(true);
        setUserRole('staff');
        setLoading(false);
        return;
      }

      // Not authorized
      console.log('❌ User not authorized, redirecting to home');
      window.location.href = '/';
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = userRole === 'staff' ? '/auth/staff-login' : '/auth/admin-login';
  };

  if (loading || !isAuthorized) {
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
