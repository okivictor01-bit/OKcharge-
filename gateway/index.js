// OKcharge device gateway
//
// Runs as an always-on service (Railway, Fly.io, a VPS — NOT Cloudflare
// Workers, which can't hold the persistent MQTT connection the real
// hardware needs later).
//
// SIMULATE_HARDWARE=true lets you prove out the whole payment -> unlock ->
// rental -> return -> earnings flow with no physical kiosk. When real
// Volinks units arrive, set SIMULATE_HARDWARE=false and fill in the
// unlockViaMQTT/handleReturn functions using the mqtt npm package against
// the protocol at docs.volinks.com (topics, hex packets, hole numbers —
// see the field mapping table from our schema discussion).

import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const GATEWAY_SHARED_SECRET = process.env.GATEWAY_SHARED_SECRET;
const SIMULATE_HARDWARE = process.env.SIMULATE_HARDWARE === "true";
const PLATFORM_COMMISSION_PCT = Number(process.env.PLATFORM_COMMISSION_PCT ?? 20);

function requireGatewayAuth(req, res, next) {
  const auth = req.headers.authorization ?? "";
  if (auth !== `Bearer ${GATEWAY_SHARED_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ---------------------------------------------------------------
// Called by paystack-webhook after a successful payment.
// Responds immediately, does the actual unlock work asynchronously —
// mirrors how this will behave with real hardware (MQTT round-trip
// takes a few seconds, shouldn't block the webhook's response).
// ---------------------------------------------------------------
app.post("/internal/unlock", requireGatewayAuth, async (req, res) => {
  const { payment_id, customer_id, kiosk_id, slot_id, powerbank_id, hole } = req.body;

  if (!payment_id || !customer_id || !kiosk_id || !slot_id || !powerbank_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  res.status(202).json({ status: "accepted" });

  try {
    if (SIMULATE_HARDWARE) {
      await simulateUnlock({ payment_id, customer_id, kiosk_id, slot_id, powerbank_id });
    } else {
      await unlockViaMQTT({ payment_id, customer_id, kiosk_id, slot_id, powerbank_id, hole });
    }
  } catch (err) {
    console.error("Unlock failed:", err);
    // TODO: trigger a Paystack refund here if the unlock never succeeds.
  }
});

async function simulateUnlock({ payment_id, customer_id, kiosk_id, slot_id, powerbank_id }) {
  // Pretend the kiosk popped the slot successfully after a short delay.
  await new Promise((r) => setTimeout(r, 1500));

  const { data: rental, error: rentalError } = await supabase
    .from("rentals")
    .insert({
      customer_id,
      powerbank_id,
      start_kiosk_id: kiosk_id,
      start_slot_id: slot_id,
      status: "active",
    })
    .select()
    .single();
  if (rentalError) throw rentalError;

  await supabase.from("payments").update({ rental_id: rental.id }).eq("id", payment_id);
  await supabase.from("powerbanks").update({ status: "rented" }).eq("id", powerbank_id);
  await supabase.from("slots").update({ status: "empty", powerbank_id: null }).eq("id", slot_id);

  console.log(`[SIMULATED] Unlocked slot ${slot_id}, rental ${rental.id} active`);
}

async function unlockViaMQTT(_args) {
  // TODO once hardware is registered:
  // 1. Publish {"cmd":"popup","data":"<hole>","io":"0"} to
  //    /powerbank/{kiosk.device_serial}/user/get
  // 2. Wait for the 0x21 reply on .../user/update
  // 3. If state === 0x01 (success), create the rentals row exactly like
  //    simulateUnlock() above, using the real powerbankSN from the reply.
  // 4. If it times out or fails, do NOT create a rental — trigger a refund.
  throw new Error("unlockViaMQTT not implemented yet — set SIMULATE_HARDWARE=true for now");
}

// ---------------------------------------------------------------
// Test-only endpoint: simulate a customer returning the powerbank.
// In production this logic runs when the kiosk's real MQTT "returned"
// event arrives, or when it calls POST /api/rentbox/client/return.
// ---------------------------------------------------------------
app.post("/simulate/return", requireGatewayAuth, async (req, res) => {
  const { rental_id, end_kiosk_id, end_slot_id } = req.body;
  if (!rental_id || !end_kiosk_id || !end_slot_id) {
    return res.status(400).json({ error: "rental_id, end_kiosk_id, end_slot_id required" });
  }

  const { data: rental, error: rentalError } = await supabase
    .from("rentals")
    .select("*, powerbanks(id)")
    .eq("id", rental_id)
    .single();
  if (rentalError || !rental) return res.status(404).json({ error: "Rental not found" });

  const startTime = new Date(rental.start_time);
  const endTime = new Date();
  const hoursElapsed = Math.max(1, Math.ceil((endTime - startTime) / 3_600_000));

  const { data: kiosk } = await supabase
    .from("kiosks")
    .select("station_id")
    .eq("id", end_kiosk_id)
    .single();

  const { data: plan } = await supabase
    .from("pricing_plans")
    .select("price_first_hour, price_per_hour, max_daily_charge")
    .or(`station_id.eq.${kiosk?.station_id},station_id.is.null`)
    .order("station_id", { ascending: false, nullsFirst: false })
    .limit(1)
    .single();

  let amount = plan?.price_first_hour ?? 500;
  if (hoursElapsed > 1) {
    amount += (hoursElapsed - 1) * (plan?.price_per_hour ?? 200);
  }
  if (plan?.max_daily_charge) {
    amount = Math.min(amount, plan.max_daily_charge);
  }

  await supabase
    .from("rentals")
    .update({
      end_kiosk_id,
      end_slot_id,
      end_time: endTime.toISOString(),
      status: "completed",
      amount_charged: amount,
    })
    .eq("id", rental_id);

  await supabase
    .from("powerbanks")
    .update({ status: "charging", current_kiosk_id: end_kiosk_id, current_slot_id: end_slot_id })
    .eq("id", rental.powerbank_id);

  await supabase
    .from("slots")
    .update({ status: "occupied", powerbank_id: rental.powerbank_id })
    .eq("id", end_slot_id);

  const { data: station } = await supabase
    .from("stations")
    .select("business_owner_id")
    .eq("id", kiosk?.station_id)
    .single();

  const platformCommission = Math.round(amount * (PLATFORM_COMMISSION_PCT / 100) * 100) / 100;
  const ownerAmount = amount - platformCommission;

  await supabase.from("earnings").insert({
    business_owner_id: station?.business_owner_id,
    rental_id,
    gross_amount: amount,
    platform_commission: platformCommission,
    owner_amount: ownerAmount,
  });

  res.json({ status: "completed", amount_charged: amount, hours_elapsed: hoursElapsed });
});

app.get("/health", (_req, res) => res.json({ status: "ok", simulate: SIMULATE_HARDWARE }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`OKcharge gateway listening on ${port}, SIMULATE_HARDWARE=${SIMULATE_HARDWARE}`));
