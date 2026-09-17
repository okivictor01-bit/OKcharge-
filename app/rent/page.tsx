"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

function RentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationCode = searchParams.get("location");

  const [duration, setDuration] = useState("1");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("1");
  const [ownerSubaccount, setOwnerSubaccount] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [ticketCode, setTicketCode] = useState("");

  const prices: Record<string, number> = { "1": 100, "3": 250, "5": 400, "24": 900 };
  const currentPrice = prices[duration] || 100;

  useEffect(() => {
    // Check if user is returning from payment
    const returningRef = localStorage.getItem("okcharge_payment_ref");
    const returningTicket = localStorage.getItem("okcharge_ticket");
    if (returningRef && returningTicket) {
      // Clear and redirect
      localStorage.removeItem("okcharge_payment_ref");
      localStorage.removeItem("okcharge_ticket");
      window.location.href = `/rent/success?ref=${returningRef}&ticket=${returningTicket}`;
    }

    let attempts = 0;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      const checkReady = setInterval(() => {
        attempts++;
        if ((window as any).PaystackPop) {
          setPaystackReady(true);
          clearInterval(checkReady);
        } else if (attempts >= 20) clearInterval(checkReady);
      }, 500);
    };
    document.body.appendChild(script);

    if (locationCode) {
      console.log('Looking for location:', locationCode);
      supabase
        .from("locations")
        .select("id, owner_id")
        .eq("location_code", locationCode)
        .single()
        .then(({ data: locData, error: locError }) => {
          console.log('Location query result:', { locData, locError });
          if (!locError && locData) {
            setLocationId(locData.id);
            supabase
              .from("profiles")
              .select("paystack_subaccount_code")
              .eq("user_id", locData.owner_id)
              .single()
              .then(({ data: ownerData }) => {
                console.log('Owner subaccount:', ownerData);
                if (ownerData?.paystack_subaccount_code) {
                  setOwnerSubaccount(ownerData.paystack_subaccount_code);
                }
              });
          }
        });
    }

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [locationCode]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) { alert("Please agree to the Terms & Conditions."); return; }
    if (!formData.name || !formData.phone) { alert("Please fill in all required fields."); return; }
    if (!paystackReady) { alert("Payment system is loading. Please wait."); return; }

    setLoading(true);
    const reference = `OKCHARGE_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const ticket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    
    setPaymentReference(reference);
    setTicketCode(ticket);

    const currentFormData = { ...formData };
    const currentPriceValue = currentPrice;
    const currentDuration = duration;
    const currentLocationId = locationId;

    console.log('Creating rental with:', {
      ticket_code: ticket,
      customer_name: currentFormData.name,
      customer_phone: currentFormData.phone,
      duration_hours: parseInt(currentDuration),
      amount_paid: currentPriceValue,
      paystack_reference: reference,
      status: "pending",
      started_at: new Date().toISOString(),
      location_id: currentLocationId,
      locationCode: locationCode
    });

    const { data: insertData, error: insertError } = await supabase.from("rentals").insert({
      ticket_code: ticket,
      customer_name: currentFormData.name,
      customer_phone: currentFormData.phone,
      duration_hours: parseInt(currentDuration),
      amount_paid: currentPriceValue,
      paystack_reference: reference,
      status: "pending",
      started_at: new Date().toISOString(),
      location_id: currentLocationId
    }).select();

    console.log('Insert result:', { insertData, insertError });

    if (insertError) {
      setLoading(false);
      const errorMessage = `Failed to initialize rental.\n\nError: ${insertError.message}\nCode: ${insertError.code}\n\nLocation: ${locationCode}\nLocation ID: ${currentLocationId}`;
      alert(errorMessage);
      console.error("Database error:", insertError);
      return;
    }

    const customerEmail = (currentFormData.email && currentFormData.email.includes('@')) 
      ? currentFormData.email 
      : `${currentFormData.phone}@okcharge.ng`;

    function onPaymentSuccess(response: any) {
      console.log("Payment successful:", response);
      localStorage.setItem("okcharge_payment_ref", response.reference);
      localStorage.setItem("okcharge_ticket", ticket);
      
      supabase.from("rentals")
        .update({ status: "paid" })
        .eq("paystack_reference", response.reference)
        .then(() => {
          window.location.href = `/rent/success?ref=${response.reference}&ticket=${ticket}`;
        });
    }

    function onPaymentClose() {
      console.log("Payment window closed");
      setLoading(false);
      
      // Save to localStorage for recovery
      localStorage.setItem("okcharge_payment_ref", reference);
      localStorage.setItem("okcharge_ticket", ticket);
      
      // Show confirmation dialog
      setTimeout(() => {
        const confirmed = window.confirm(
          "Payment window closed.\n\nDid you complete your payment successfully?\n\nClick OK if YES, Cancel if NO."
        );
        
        if (confirmed) {
          // User says they paid - redirect to verification page
          window.location.href = `/rent/success?ref=${reference}&ticket=${ticket}`;
        } else {
          // User says they didn't pay - clean up
          localStorage.removeItem("okcharge_payment_ref");
          localStorage.removeItem("okcharge_ticket");
        }
      }, 1000);
    }

    try {
      const paystackPop = (window as any).PaystackPop;
      if (!paystackPop || typeof paystackPop.setup !== "function") throw new Error("Paystack not loaded");
      
      const handler = paystackPop.setup({
        key: "pk_live_9dd06423b57f6a6f6927e3ea2e28a101baa01fba",
        email: customerEmail,
        amount: currentPriceValue * 100,
        currency: "NGN",
        ref: reference,
        callback_url: "https://okcharge.pages.dev/rent/success",
        firstname: currentFormData.name.split(" ")[0],
        lastname: currentFormData.name.split(" ").slice(1).join(" ") || "",
        phone: currentFormData.phone,
        subaccount: ownerSubaccount || undefined, 
        transaction_charge: 0,
        bearer: "account",
        metadata: {
          custom_fields: [
            { display_name: "Customer Name", variable_name: "customer_name", value: currentFormData.name },
            { display_name: "Duration", variable_name: "duration", value: `${currentDuration} hour${currentDuration !== "1" ? "s" : ""}` },
            { display_name: "Ticket Code", variable_name: "ticket_code", value: ticket }
          ]
        },
        callback: onPaymentSuccess,
        onClose: onPaymentClose
      });

      if (handler && typeof handler.openIframe === "function") handler.openIframe();
      else throw new Error("Handler error");
    } catch (error: any) {
      setLoading(false);
      alert("Payment error: " + error.message);
    }
  };

  // Manual recovery button
  const handleManualRecovery = () => {
    const ref = prompt("Please enter your payment reference (starts with OKCHARGE_):");
    if (ref) {
      window.location.href = `/rent/success?ref=${ref}&ticket=RECOVERY`;
    }
  };

  return (
    <main style={{ fontFamily: "sans-serif", backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: "120px" }}>
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "white", padding: "30px 20px", textAlign: "center", borderBottomLeftRadius: "30px", borderBottomRightRadius: "30px" }}>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔋</div>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>Complete Your Rental</h1>
      </div>

      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
        <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "20px", marginBottom: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" }}>1. Choose Duration</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {Object.entries(prices).map(([time, price]) => (
              <button key={time} onClick={() => { setDuration(time); setSelectedDuration(time); }}
                style={{ padding: "20px 15px", borderRadius: "16px", border: selectedDuration === time ? "2px solid #10b981" : "2px solid #e2e8f0", backgroundColor: selectedDuration === time ? "#ecfdf5" : "white", cursor: "pointer" }}>
                <div style={{ fontWeight: "700", color: selectedDuration === time ? "#0f172a" : "#64748b", fontSize: "17px", marginBottom: "5px" }}>{time} Hour{time !== "1" ? "s" : ""}</div>
                <div style={{ color: selectedDuration === time ? "#10b981" : "#94a3b8", fontWeight: "800", fontSize: "18px" }}>₦{price}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCheckout} style={{ backgroundColor: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" }}>2. Your Details</h2>
          
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#475569" }}>Full Name *</label>
          <input type="text" required placeholder="Enter your full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: "16px", marginBottom: "18px", border: "2px solid #e2e8f0", borderRadius: "12px", fontSize: "16px", boxSizing: "border-box" }} />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#475569" }}>Phone Number (WhatsApp) *</label>
          <input type="tel" required placeholder="08012345678" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: "100%", padding: "16px", marginBottom: "18px", border: "2px solid #e2e8f0", borderRadius: "12px", fontSize: "16px", boxSizing: "border-box" }} />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#475569" }}>Email Address (Optional)</label>
          <input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: "100%", padding: "16px", marginBottom: "22px", border: "2px solid #e2e8f0", borderRadius: "12px", fontSize: "16px", boxSizing: "border-box" }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "25px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <input type="checkbox" id="terms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} style={{ marginTop: "3px", transform: "scale(1.3)", accentColor: "#10b981" }} required />
            <label htmlFor="terms" style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5", cursor: "pointer" }}>
              I agree to the Terms & Conditions, including the <strong style={{ color: "#ef4444" }}>₦15,000</strong> replacement fee for unreturned power banks.
            </label>
          </div>

          <button type="submit" disabled={loading || !paystackReady} style={{ width: "100%", padding: "18px", background: loading || !paystackReady ? "#94a3b8" : "linear-gradient(135deg, #10b981, #059669)", color: "white", border: "none", borderRadius: "14px", fontSize: "18px", fontWeight: "700", cursor: loading || !paystackReady ? "not-allowed" : "pointer" }}>
            {loading ? "Processing..." : !paystackReady ? "Loading Payment..." : `Pay ₦${currentPrice} & Rent Now`}
          </button>
        </form>

        {/* Manual Recovery Button */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button 
            onClick={handleManualRecovery}
            style={{ 
              padding: "12px 24px", 
              backgroundColor: "#3b82f6", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            🔧 Having issues? Recover payment manually
          </button>
        </div>
      </div>
    </main>
  );
}

export default function RentPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading rental page...</div>}>
      <RentContent />
    </Suspense>
  );
}
