"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [activeRentals, setActiveRentals] = useState<any[]>([]);
  
  const [globalStats, setGlobalStats] = useState({ activeRentals: 0, totalLocations: 0 });
  const [periodStats, setPeriodStats] = useState({ revenue: 0, share: 0 });

  const [scanCode, setScanCode] = useState('');
  const router = useRouter();

  const [filterType, setFilterType] = useState<'today' | 'date' | 'range'>('today');
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Bank editing states
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [tempBankCode, setTempBankCode] = useState('');
  const [tempAccountNumber, setTempAccountNumber] = useState('');
  const [bankSaving, setBankSaving] = useState(false);
  const [bankMessage, setBankMessage] = useState('');

  const [timeLeft, setTimeLeft] = useState<Record<string, { h: number; m: number; s: number; overdue: boolean }>>({});

  // ✅ CORRECTED BANK CODES FOR PAYSTACK SUBACCOUNTS
  const banks = [
    { code: '044', name: 'Access Bank' },
    { code: '058', name: 'GTBank' },
    { code: '011', name: 'First Bank' },
    { code: '033', name: 'UBA' },
    { code: '057', name: 'Zenith Bank' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '032', name: 'Union Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '090267', name: 'Opay' }, 
    { code: '999992', name: 'Opay Digital' }, 
    { code: '090288', name: 'PalmPay' },
    { code: '50211', name: 'Kuda Bank' }, 
    { code: '082', name: 'Keystone Bank' },
    { code: '050', name: 'Ecobank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '214', name: 'FCMB' },
    { code: '030', name: 'Heritage Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '101', name: 'Providus Bank' },
  ];

  useEffect(() => { checkUserAndFetchData(); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimes: any = {};
      activeRentals.forEach((rental: any) => {
        const start = new Date(rental.started_at).getTime();
        const end = start + (rental.duration_hours * 60 * 60 * 1000);
        const diff = end - Date.now();
        if (diff <= 0) {
          newTimes[rental.id] = { h: 0, m: 0, s: 0, overdue: true };
        } else {
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / 1000 / 60) % 60);
          const s = Math.floor((diff / 1000) % 60);
          newTimes[rental.id] = { h, m, s, overdue: false };
        }
      });
      setTimeLeft(newTimes);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeRentals]);

  const checkUserAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { data: ownerData } = await supabase.from('location_owners').select('*').eq('user_id', user.id).single();
    if (!ownerData) { setLoading(false); return; }
    setOwner(ownerData);
    setTempBankCode(ownerData.bank_name || '');
    setTempAccountNumber(ownerData.account_number || '');

    const { data: locData } = await supabase.from('locations').select('*').eq('owner_id', ownerData.id);
    setLocations(locData || []);
    setGlobalStats(prev => ({ ...prev, totalLocations: locData?.length || 0 }));

    if (locData && locData.length > 0) {
      const locationIds = locData.map(loc => loc.id);
      const { data: txData } = await supabase.from('rentals').select('*').in('location_id', locationIds).order('created_at', { ascending: false });
      const { data: activeData } = await supabase.from('rentals').select('*, power_banks(pb_code)').in('location_id', locationIds).eq('status', 'active');

      setAllTransactions(txData || []);
      setActiveRentals(activeData || []);
      setGlobalStats(prev => ({ ...prev, activeRentals: activeData?.length || 0 }));
      applyFilters(txData || [], ownerData.revenue_share_percentage || 30, 'today', singleDate, startDate, endDate);
    }
    setLoading(false);
  };

  const applyFilters = (transactions: any[], sharePercentage: number, type: string, sDate: string, sStart: string, sEnd: string) => {
    let filtered = transactions;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (type === 'today') {
      filtered = transactions.filter(t => { const c = new Date(t.created_at); return t.status === 'completed' && c >= todayStart; });
    } else if (type === 'date' && sDate) {
      const sd = new Date(sDate); sd.setHours(0,0,0,0); const nd = new Date(sd); nd.setDate(nd.getDate()+1);
      filtered = transactions.filter(t => { const c = new Date(t.created_at); return t.status === 'completed' && c >= sd && c < nd; });
    } else if (type === 'range' && sStart && sEnd) {
      const st = new Date(sStart); st.setHours(0,0,0,0); const en = new Date(sEnd); en.setHours(23,59,59,999);
      filtered = transactions.filter(t => { const c = new Date(t.created_at); return t.status === 'completed' && c >= st && c <= en; });
    }

    setFilteredTransactions(filtered);
    let periodRevenue = 0;
    filtered.forEach((tx: any) => { if (['completed','paid','active'].includes(tx.status)) periodRevenue += tx.amount_paid || 0; });
    setPeriodStats({ revenue: periodRevenue, share: periodRevenue * (sharePercentage / 100) });
  };

  useEffect(() => { if (allTransactions.length > 0 && owner) applyFilters(allTransactions, owner.revenue_share_percentage || 30, filterType, singleDate, startDate, endDate); }, [filterType, singleDate, startDate, endDate]);

  const handleGoToPB = () => { if (scanCode) window.location.href = `/staff/pb?code=${scanCode}`; };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/auth/login'); };

  // ✅ UPDATED: Graceful Fallback for Bank Verification
  const handleUpdateBank = async () => {
    if (!tempBankCode || !tempAccountNumber || tempAccountNumber.length !== 10) {
      setBankMessage('❌ Please select a valid bank and enter a 10-digit account number.');
      return;
    }
    setBankSaving(true);
    setBankMessage('⏳ Verifying bank details with Paystack...');

    try {
      const supabaseUrl = 'https://zsjmudkesxrlrhtugdon.supabase.co';
      const res = await fetch(`${supabaseUrl}/functions/v1/create-paystack-subaccount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          business_name: owner.business_name, 
          bank_code: tempBankCode, 
          account_number: tempAccountNumber, 
          percentage: owner.revenue_share_percentage 
        })
      });
      const data = await res.json();

      let subaccountCode = null;
      let isSuccess = false;

      if (data.success && data.subaccount_code) {
        subaccountCode = data.subaccount_code;
        isSuccess = true;
        setBankMessage('✅ Bank verified & linked to Paystack!');
      } else {
        // FALLBACK: Save the bank details anyway, but warn the user
        console.warn("Paystack verification failed:", data);
        setBankMessage('⚠️ Bank details saved locally. Paystack verification pending (manual review may be required).');
        isSuccess = true; // We still consider it a success for saving to DB
      }

      // ALWAYS save to database if validation passed
      const { error } = await supabase.from('location_owners').update({ 
        bank_name: banks.find(b=>b.code===tempBankCode)?.name, 
        account_number: tempAccountNumber, 
        paystack_subaccount_code: subaccountCode 
      }).eq('id', owner.id);
      
      if (!error && isSuccess) {
        setOwner((prev: any) => ({ 
          ...prev, 
          bank_name: banks.find(b=>b.code===tempBankCode)?.name, 
          account_number: tempAccountNumber, 
          paystack_subaccount_code: subaccountCode 
        }));
        setIsEditingBank(false);
      } else if (error) {
        setBankMessage('❌ Database error: ' + error.message);
      }

    } catch (err: any) { 
      setBankMessage(' Network error: ' + err.message); 
    }
    setBankSaving(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  const getFilterLabel = () => filterType==='today'?"Today's Earnings":filterType==='date'?`Earnings for ${singleDate}`:`Earnings (${startDate} to ${endDate})`;
  const inputStyle: React.CSSProperties = { width:'100%', padding:'12px', marginBottom:'15px', border:'1px solid #cbd5e1', borderRadius:'8px', fontSize:'16px', boxSizing:'border-box' };

  if (loading) return <main style={{padding:'20px',textAlign:'center'}}>Loading...</main>;
  if (!owner) return <main style={{padding:'20px',textAlign:'center'}}><h2>Profile not found.</h2><button onClick={handleLogout}>Logout</button></main>;

  return (
    <main style={{padding:'20px',fontFamily:'sans-serif',maxWidth:'600px',margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <h1 style={{fontSize:'22px',margin:0}}>Partner Dashboard</h1>
        <button onClick={handleLogout} style={{padding:'8px 15px',backgroundColor:'#ef4444',color:'white',border:'none',borderRadius:'6px',fontWeight:'bold'}}>Logout</button>
      </div>
      <p style={{color:'#64748b',marginTop:'-15px',marginBottom:'25px'}}>Welcome, {owner.business_name}</p>

      {/* Live Rental Timers */}
      <h3 style={{marginBottom:'10px'}}>️ Active Rentals (Live Timer)</h3>
      {activeRentals.length===0 ? (
        <div style={{padding:'15px',backgroundColor:'#f8fafc',borderRadius:'8px',textAlign:'center',color:'#64748b',marginBottom:'25px',border:'1px dashed #cbd5e1'}}>No power banks currently rented out.</div>
      ) : (
        <div style={{display:'grid',gap:'10px',marginBottom:'25px'}}>
          {activeRentals.map((r:any)=>{const t=timeLeft[r.id]||{h:0,m:0,s:0,overdue:false};return(
            <div key={r.id} style={{padding:'15px',backgroundColor:t.overdue?'#fef2f2':'#eff6ff',border:`1px solid ${t.overdue?'#fca5a5':'#bfdbfe'}`,borderRadius:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><p style={{margin:0,fontWeight:'bold',fontSize:'16px',color:'#1e3a8a'}}>🔋 {r.power_banks?.pb_code||'Unknown'}</p><p style={{margin:'5px 0 0',fontSize:'12px',color:'#64748b'}}>Ticket: {r.ticket_code} • {r.customer_name||'Customer'}</p></div>
              <div style={{textAlign:'right'}}><p style={{margin:0,fontSize:'12px',color:t.overdue?'#b91c1c':'#1d4ed8',fontWeight:'bold'}}>{t.overdue?'⚠️ OVERDUE':'Time Left'}</p><p style={{margin:'5px 0 0',fontSize:'20px',fontWeight:'bold',fontFamily:'monospace',color:t.overdue?'#b91c1c':'#0f172a'}}>{String(t.h).padStart(2,'0')}:{String(t.m).padStart(2,'0')}:{String(t.s).padStart(2,'0')}</p></div>
            </div>
          )})}
        </div>
      )}

      {/* Revenue Card */}
      <div style={{backgroundColor:'#10b981',padding:'25px',borderRadius:'12px',marginBottom:'25px',color:'white',textAlign:'center'}}>
        <p style={{margin:'0 0 10px',fontSize:'14px',opacity:0.9}}>{getFilterLabel()}</p>
        <p style={{margin:'0 0 5px',fontSize:'12px',opacity:0.9}}>({owner.revenue_share_percentage}% Share)</p>
        <h2 style={{margin:'0 0 10px',fontSize:'36px',fontWeight:'bold'}}>₦{periodStats.share.toLocaleString()}</h2>
        <p style={{margin:0,fontSize:'14px',opacity:0.9}}>Total Location Revenue: ₦{periodStats.revenue.toLocaleString()}</p>
      </div>

      {/* Bank Details Section */}
      <div style={{backgroundColor:'#f8fafc',padding:'20px',borderRadius:'12px',border:'1px solid #e2e8f0',marginBottom:'25px'}}>
        <h3 style={{marginTop:0,marginBottom:'10px'}}>💳 Bank Account Details</h3>
        {bankMessage && <div style={{padding:'10px',borderRadius:'6px',marginBottom:'15px',backgroundColor:bankMessage.includes('✅')?'#dcfce7':bankMessage.includes('⚠️')?'#fef3c7':'#fee2e2',color:bankMessage.includes('✅')?'#15803d':bankMessage.includes('⚠️')?'#92400e':'#b91c1c',fontSize:'14px'}}>{bankMessage}</div>}
        
        {!isEditingBank ? (
          <div>
            <p style={{margin:'5px 0',fontSize:'14px',color:'#64748b'}}><strong>Bank:</strong> {owner.bank_name || 'Not set'}</p>
            <p style={{margin:'5px 0',fontSize:'14px',color:'#64748b'}}><strong>Account:</strong> {owner.account_number ? `****${owner.account_number.slice(-4)}` : 'Not set'}</p>
            <p style={{margin:'5px 0',fontSize:'12px',color:'#94a3b8'}}>Subaccount Code: {owner.paystack_subaccount_code ? `${owner.paystack_subaccount_code.slice(0,8)}...` : 'Not created yet'}</p>
            <button onClick={()=>setIsEditingBank(true)} style={{marginTop:'10px',padding:'10px 20px',backgroundColor:'#2563eb',color:'white',border:'none',borderRadius:'6px',fontWeight:'bold',cursor:'pointer'}}>️ Update Bank Details</button>
          </div>
        ) : (
          <div>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'5px',fontSize:'14px'}}>Select Bank *</label>
            <select value={tempBankCode} onChange={e=>setTempBankCode(e.target.value)} style={inputStyle}>
              <option value="">Choose your bank</option>
              {banks.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
            <label style={{fontWeight:'bold',display:'block',marginBottom:'5px',fontSize:'14px'}}>Account Number (10 digits) *</label>
            <input type="text" maxLength={10} placeholder="e.g., 0123456789" value={tempAccountNumber} onChange={e=>setTempAccountNumber(e.target.value.replace(/\D/g,'').slice(0,10))} style={inputStyle}/>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={handleUpdateBank} disabled={bankSaving} style={{flex:1,padding:'12px',backgroundColor:bankSaving?'#999':'#10b981',color:'white',border:'none',borderRadius:'6px',fontWeight:'bold',cursor:'pointer'}}>{bankSaving?'Verifying...':'Save & Verify'}</button>
              <button onClick={()=>{setIsEditingBank(false);setBankMessage('')}} style={{padding:'12px 20px',backgroundColor:'#6b7280',color:'white',border:'none',borderRadius:'6px',fontWeight:'bold',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div style={{backgroundColor:'#f8fafc',padding:'20px',borderRadius:'12px',border:'1px solid #e2e8f0',marginBottom:'25px'}}>
        <h3 style={{marginTop:0,marginBottom:'15px'}}>Filter Transactions</h3>
        <label style={{display:'flex',alignItems:'center',marginBottom:'10px',cursor:'pointer'}}><input type="radio" value="today" checked={filterType==='today'} onChange={e=>setFilterType(e.target.value as any)} style={{marginRight:'8px'}}/> Today</label>
        <label style={{display:'flex',alignItems:'center',marginBottom:'10px',cursor:'pointer'}}><input type="radio" value="date" checked={filterType==='date'} onChange={e=>setFilterType(e.target.value as any)} style={{marginRight:'8px'}}/> Specific Date</label>
        {filterType==='date' && <input type="date" value={singleDate} onChange={e=>setSingleDate(e.target.value)} style={inputStyle}/>}
        <label style={{display:'flex',alignItems:'center',marginBottom:'10px',cursor:'pointer'}}><input type="radio" value="range" checked={filterType==='range'} onChange={e=>setFilterType(e.target.value as any)} style={{marginRight:'8px'}}/> Date Range</label>
        {filterType==='range' && (<div><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{...inputStyle,marginBottom:'10px'}}/><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={inputStyle}/></div>)}
      </div>

      {/* Manual PB Entry */}
      <div style={{backgroundColor:'#f8fafc',padding:'20px',borderRadius:'12px',border:'1px solid #e2e8f0',marginBottom:'25px'}}>
        <h3 style={{marginTop:0}}>Manage Power Banks</h3>
        <p style={{fontSize:'14px',color:'#64748b',marginBottom:'15px'}}>Enter a Power Bank code to manage</p>
        <input type="text" placeholder="e.g., OKJD02" value={scanCode} onChange={e=>setScanCode(e.target.value.toUpperCase())} style={inputStyle}/>
        <button onClick={handleGoToPB} style={{width:'100%',padding:'12px',backgroundColor:'#2563eb',color:'white',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>Go to Power Bank</button>
      </div>

      {/* Transaction History */}
      <h3 style={{marginBottom:'10px',marginTop:'25px'}}>Transaction History {filterType!=='today'&&<span style={{fontSize:'14px',color:'#64748b',fontWeight:'normal'}}>(Filtered)</span>}</h3>
      {filteredTransactions.length===0 ? (
        <div style={{padding:'30px',backgroundColor:'#f8fafc',borderRadius:'8px',textAlign:'center',color:'#64748b'}}>No transactions found for this period.</div>
      ) : (
        filteredTransactions.map(tx=>(
          <div key={tx.id} style={{padding:'15px',backgroundColor:'white',border:'1px solid #e2e8f0',borderRadius:'8px',marginBottom:'10px',display:'flex',justifyContent:'space-between'}}>
            <div><p style={{margin:0,fontWeight:'bold',color:'#2563eb'}}>{tx.ticket_code}</p><p style={{margin:'5px 0 0',fontSize:'12px',color:'#64748b'}}>{formatDate(tx.created_at)}</p></div>
            <div style={{textAlign:'right'}}><p style={{margin:0,fontWeight:'bold',color:'#10b981'}}>₦{tx.amount_paid}</p><span style={{display:'inline-block',padding:'4px 8px',borderRadius:'4px',fontSize:'11px',fontWeight:'bold',backgroundColor:tx.status==='completed'?'#dcfce7':'#dbeafe',color:tx.status==='completed'?'#15803d':'#1d4ed8'}}>{tx.status.toUpperCase()}</span></div>
          </div>
        ))
      )}
    </main>
  );
}
