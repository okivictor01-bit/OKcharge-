"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const ADMIN_EMAIL = 'tvicglobal@gmail.com'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = '/auth/admin-login';
        return;
      }

      if (session.user.email !== ADMIN_EMAIL) {
        const { data: owner } = await supabase
          .from('location_owners')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (owner) {
          window.location.href = '/owner/dashboard';
        } else {
          window.location.href = '/';
        }
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, []);

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>🔒 Verifying admin access...</p>
      </div>
    );
  }

  return (
    <>
      {/* Admin Header Bar */}
      <header style={{ 
        backgroundColor: '#0f172a', 
        color: 'white', 
        padding: '15px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Link href="/admin/dashboard" style={{ 
          color: 'white', 
          textDecoration: 'none', 
          fontSize: '18px', 
          fontWeight: 'bold' 
        }}>
           OKcharge Admin
        </Link>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link href="/admin/dashboard" style={{ 
            color: '#94a3b8', 
            textDecoration: 'none', 
            fontSize: '14px' 
          }}>
            Dashboard
          </Link>
          <Link href="/admin/locations" style={{ 
            color: '#94a3b8', 
            textDecoration: 'none', 
            fontSize: '14px' 
          }}>
            Locations
          </Link>
          <Link href="/admin/owners" style={{ 
            color: '#94a3b8', 
            textDecoration: 'none', 
            fontSize: '14px' 
          }}>
            Owners
          </Link>
          <Link href="/admin/logout" style={{ 
            backgroundColor: '#ef4444', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            textDecoration: 'none', 
            fontSize: '14px', 
            fontWeight: 'bold' 
          }}>
            Logout
          </Link>
        </div>
      </header>

      {children}
    </>
  );
}
