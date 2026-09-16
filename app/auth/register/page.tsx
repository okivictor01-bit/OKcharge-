"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OwnerRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    bankName: "",
    bankAccount: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          role: "owner",
        },
      },
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else if (data.user) {
      // Update profile with additional info
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          phone: formData.phone,
          bank_name: formData.bankName,
          bank_account_number: formData.bankAccount,
        })
        .eq("user_id", data.user.id);

      if (!updateError) {
        // Try to create Paystack subaccount
        try {
          const response = await fetch("/api/create-subaccount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bankName: formData.bankName,
              bankAccount: formData.bankAccount,
              fullName: formData.name,
              email: formData.email,
              profileId: data.user.id,
            }),
          });

          const subaccountData = await response.json();

          if (subaccountData.success) {
            // Save the subaccount code to database
            await supabase
              .from("profiles")
              .update({
                paystack_subaccount_code: subaccountData.subaccountCode,
              })
              .eq("user_id", data.user.id);
          }
        } catch (err) {
          console.error("Subaccount creation failed:", err);
        }
      }

      setMessage("✅ Registration successful! Your account is ready.");
      setTimeout(() => router.push("/auth/login"), 3000);
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "500px", margin: "50px auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>Become an OKcharge Partner</h1>
        <p style={{ color: "#64748b" }}>Register your location to start earning</p>
      </div>

      <form onSubmit={handleRegister} style={{ display: "grid", gap: "15px" }}>
        <input
          placeholder="Full Name / Business Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email Address"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={inputStyle}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          style={inputStyle}
        />

        <div style={{ marginTop: "10px", padding: "15px", backgroundColor: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd" }}>
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold", fontSize: "14px", color: "#0369a1" }}>💰 Payment Details (for 50% earnings)</p>
          <input
            placeholder="Bank Name (e.g., GTBank)"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Account Number"
            value={formData.bankAccount}
            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
            style={inputStyle}
          />
        </div>

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Creating Account..." : "Register as Partner"}
        </button>
      </form>

      {message && (
        <p style={{ textAlign: "center", marginTop: "20px", color: message.includes("✅") ? "#10b981" : "#ef4444" }}>
          {message}
        </p>
      )}

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          Already have an account? <a href="/auth/login" style={{ color: "#2563eb" }}>Login here</a>
        </p>
      </div>
    </main>
  );
}

const inputStyle = { padding: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", width: "100%", boxSizing: "border-box" as const };
const btnStyle = { padding: "12px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" };
