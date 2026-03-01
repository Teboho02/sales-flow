#!/usr/bin/env node

/**
 * Randomly advance opportunity stages and reassign them to different users.
 *
 * Usage:
 *   node scripts/advance-opportunities.mjs --token <bearer_token>
 *   node scripts/advance-opportunities.mjs --token <bearer_token> --dryRun
 */

import process from "node:process";

const BASE_URL = "https://sales-automation-bmdqg9b6a0d3ffem.southafricanorth-01.azurewebsites.net";
const ADMIN_USER_ID = "12eb0ccf-8778-43a2-93e5-9941c0cbcd67";

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (key) => {
  const i = args.findIndex((a) => a === `--${key}`);
  return i >= 0 && i < args.length - 1 ? args[i + 1] : undefined;
};
const hasFlag = (key) => args.includes(`--${key}`);

const TOKEN = getArg("token");
const DRY_RUN = hasFlag("dryRun");

if (!TOKEN) {
  console.error("Error: --token <bearer_token> is required.");
  process.exit(1);
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

const get = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
  return res.json();
};

const put = async (path, body) => {
  if (DRY_RUN) { console.log(`  [dry] PUT ${path}`, body); return; }
  const res = await fetch(`${BASE_URL}${path}`, { method: "PUT", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const p = await res.json(); msg = p?.detail ?? p?.title ?? msg; } catch { /* noop */ }
    throw new Error(msg);
  }
};

const post = async (path, body) => {
  if (DRY_RUN) { console.log(`  [dry] POST ${path}`, body); return; }
  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const p = await res.json(); msg = p?.detail ?? p?.title ?? msg; } catch { /* noop */ }
    throw new Error(msg);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const roll = (chance) => Math.random() < chance;

const STAGE_NAMES = {
  1: "Lead",
  2: "Qualified",
  3: "Proposal",
  4: "Negotiation",
  5: "Closed Won",
  6: "Closed Lost",
};

/**
 * Decide the next stage for an opportunity.
 * Returns null if it should stay as-is.
 */
const nextStage = (current) => {
  switch (current) {
    case 1: return roll(0.75) ? 2 : null;                           // Lead → Qualified
    case 2: return roll(0.70) ? 3 : null;                           // Qualified → Proposal
    case 3: return roll(0.65) ? 4 : null;                           // Proposal → Negotiation
    case 4: return roll(0.55) ? 5 : roll(0.4) ? 6 : null;          // Negotiation → Won / Lost
    default: return null;                                            // Won / Lost — terminal
  }
};

const lossReasons = [
  "Budget constraints for this financial year.",
  "Competitor offered a lower price.",
  "Project scope reduced by client.",
  "Client decided to build in-house.",
  "Procurement delayed indefinitely.",
];

// ─── Fetch all pages ──────────────────────────────────────────────────────────

const fetchAll = async (path) => {
  const items = [];
  let page = 1;
  while (true) {
    const data = await get(`${path}${path.includes("?") ? "&" : "?"}pageNumber=${page}&pageSize=100`);
    const batch = Array.isArray(data) ? data : (data.items ?? []);
    items.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return items;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
  console.log("=================================================");
  console.log(" SalesFlow — Advance Opportunities");
  console.log(`  Mode  : ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  console.log("=================================================\n");

  // 1. Fetch users
  console.log("Fetching users...");
  const allUsers = await fetchAll("/api/users");
  const nonAdminUsers = allUsers.filter((u) => u.id !== ADMIN_USER_ID && u.userId !== ADMIN_USER_ID);
  const assignableUsers = nonAdminUsers.length > 0 ? nonAdminUsers : allUsers;
  console.log(`  Found ${allUsers.length} user(s), ${assignableUsers.length} assignable.\n`);

  // 2. Fetch opportunities
  console.log("Fetching opportunities...");
  const opportunities = await fetchAll("/api/Opportunities");
  console.log(`  Found ${opportunities.length} opportunity/ies.\n`);

  if (opportunities.length === 0) {
    console.log("No opportunities found. Run seed-mock-data.mjs first.");
    return;
  }

  let advanced = 0;
  let stayed = 0;
  let assigned = 0;
  let failed = 0;

  for (const opp of opportunities) {
    const id = opp.id;
    const title = opp.title ?? id;
    const currentStage = opp.stage ?? 1;

    // ── Advance stage ──────────────────────────────────────────────────────────
    const newStage = nextStage(currentStage);

    if (newStage !== null) {
      const stagePayload = { stage: newStage };
      if (newStage === 6) stagePayload.lossReason = pick(lossReasons);
      if (newStage === 5) stagePayload.notes = "Deal closed successfully after final negotiations.";

      try {
        await put(`/api/Opportunities/${id}/stage`, stagePayload);
        console.log(`  ✓ Stage  "${title}": ${STAGE_NAMES[currentStage]} → ${STAGE_NAMES[newStage]}`);
        advanced++;
      } catch (err) {
        console.log(`  ✗ Stage  "${title}": ${err.message}`);
        failed++;
      }
    } else {
      console.log(`  – Kept   "${title}": ${STAGE_NAMES[currentStage]} (no change)`);
      stayed++;
    }

    // ── Reassign to a random user ──────────────────────────────────────────────
    const user = pick(assignableUsers);
    const userId = user.id ?? user.userId;

    if (userId) {
      try {
        await post(`/api/Opportunities/${id}/assign`, { userId });
        console.log(`  ✓ Assign "${title}" → ${user.firstName ?? ""} ${user.lastName ?? ""} (${user.email ?? userId})`);
        assigned++;
      } catch (err) {
        console.log(`  ✗ Assign "${title}": ${err.message}`);
        failed++;
      }
    }
  }

  console.log("\n=================================================");
  console.log(` Advanced : ${advanced}`);
  console.log(` Stayed   : ${stayed}`);
  console.log(` Assigned : ${assigned}`);
  console.log(` Failed   : ${failed}`);
  console.log("=================================================");
};

main().catch((err) => {
  console.error("\nFailed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
