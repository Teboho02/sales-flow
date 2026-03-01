#!/usr/bin/env node

/**
 * Seed pricing request data for SalesFlow CRM.
 *
 * Usage:
 *   node scripts/seed-pricing-requests.mjs --token <bearer_token>
 *   node scripts/seed-pricing-requests.mjs --token <bearer_token> --dryRun
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

const post = async (path, body) => {
  if (DRY_RUN) { console.log(`  [dry] POST ${path}`, body); return { id: `dry-${Math.random().toString(36).slice(2, 8)}` }; }
  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const p = await res.json(); msg = p?.detail ?? p?.title ?? p?.message ?? msg; } catch { /* noop */ }
    throw new Error(msg);
  }
  return res.json();
};

const put = async (path, body = {}) => {
  if (DRY_RUN) { console.log(`  [dry] PUT ${path}`, body); return; }
  const res = await fetch(`${BASE_URL}${path}`, { method: "PUT", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const p = await res.json(); msg = p?.detail ?? p?.title ?? p?.message ?? msg; } catch { /* noop */ }
    throw new Error(msg);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const roll = (chance) => Math.random() < chance;

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

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

// ─── Pricing request templates ────────────────────────────────────────────────

// priority: 1=Low 2=Medium 3=High 4=Urgent
const TEMPLATES = [
  {
    title: "Custom licensing fee breakdown",
    description: "Client requires a detailed breakdown of per-seat licensing fees for their procurement committee.",
    priority: 2,
    requiredByDelta: 14,
  },
  {
    title: "Volume discount pricing",
    description: "Prospect is requesting a tiered volume discount structure for a multi-year agreement.",
    priority: 3,
    requiredByDelta: 7,
  },
  {
    title: "Professional services rate card",
    description: "Need to provide a formal rate card covering implementation, training, and ongoing support.",
    priority: 2,
    requiredByDelta: 21,
  },
  {
    title: "Competitive pricing response",
    description: "Client has received a competing offer — urgent pricing review needed to remain competitive.",
    priority: 4,
    requiredByDelta: 3,
  },
  {
    title: "Annual maintenance cost estimate",
    description: "Client wants a 3-year total cost of ownership estimate including annual maintenance fees.",
    priority: 1,
    requiredByDelta: 30,
  },
  {
    title: "Add-on module pricing",
    description: "Prospect is interested in adding analytics and reporting modules to the base package.",
    priority: 2,
    requiredByDelta: 10,
  },
  {
    title: "Government tender pricing",
    description: "Formal pricing required in the prescribed government tender format with BEE compliance costs.",
    priority: 3,
    requiredByDelta: 5,
  },
  {
    title: "Proof of concept pricing",
    description: "Client requires pricing for a limited 30-day POC before committing to a full rollout.",
    priority: 2,
    requiredByDelta: 7,
  },
  {
    title: "SLA tier comparison",
    description: "Prepare a side-by-side SLA tier comparison (Standard, Premium, Enterprise) with pricing.",
    priority: 1,
    requiredByDelta: 21,
  },
  {
    title: "Hardware bundling cost",
    description: "Client requested pricing for a solution bundle including hardware, software, and installation.",
    priority: 3,
    requiredByDelta: 10,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
  console.log("=================================================");
  console.log(" SalesFlow — Seed Pricing Requests");
  console.log(`  Mode  : ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  console.log("=================================================\n");

  // 1. Fetch opportunities
  console.log("Fetching opportunities...");
  const opportunities = await fetchAll("/api/Opportunities");
  console.log(`  Found ${opportunities.length} opportunity/ies.\n`);

  if (opportunities.length === 0) {
    console.log("No opportunities found. Run seed-mock-data.mjs first.");
    return;
  }

  // 2. Fetch users (for assignment)
  console.log("Fetching users...");
  const allUsers = await fetchAll("/api/users");
  const assignableUsers = allUsers.filter((u) => (u.id ?? u.userId) !== ADMIN_USER_ID);
  const usersPool = assignableUsers.length > 0 ? assignableUsers : allUsers;
  console.log(`  Found ${allUsers.length} user(s), ${usersPool.length} assignable.\n`);

  let created = 0;
  let assigned = 0;
  let completed = 0;
  let failed = 0;

  console.log("Creating pricing requests...\n");

  for (let i = 0; i < opportunities.length; i++) {
    const opp = opportunities[i];
    const oppId = opp.id;
    const oppTitle = opp.title ?? oppId;

    // Give each opportunity 2 pricing requests cycling through templates
    const templateA = TEMPLATES[(i * 2) % TEMPLATES.length];
    const templateB = TEMPLATES[(i * 2 + 1) % TEMPLATES.length];

    for (const template of [templateA, templateB]) {
      let pricingRequestId = null;

      // ── Create ────────────────────────────────────────────────────────────
      try {
        const res = await post("/api/PricingRequests", {
          opportunityId: oppId,
          title: template.title,
          description: template.description,
          priority: template.priority,
          requiredByDate: daysFromNow(template.requiredByDelta),
        });
        pricingRequestId = res?.id;
        console.log(`  ✓ Created  "${template.title}" → ${pricingRequestId ?? "dry-id"}`);
        console.log(`             Opportunity: "${oppTitle}", Priority: ${template.priority}`);
        created++;
      } catch (err) {
        console.log(`  ✗ Create   "${template.title}": ${err.message}`);
        failed++;
        continue;
      }

      if (!pricingRequestId) continue;

      // ── Assign (60% chance) ───────────────────────────────────────────────
      if (roll(0.6) && usersPool.length > 0) {
        const user = pick(usersPool);
        const userId = user.id ?? user.userId;
        try {
          await post(`/api/PricingRequests/${pricingRequestId}/assign`, { userId });
          console.log(`  ✓ Assigned to ${user.firstName ?? ""} ${user.lastName ?? ""} (${user.email ?? userId})`);
          assigned++;

          // ── Complete (40% chance of assigned ones) ────────────────────────
          if (roll(0.4)) {
            try {
              await put(`/api/PricingRequests/${pricingRequestId}/complete`);
              console.log(`  ✓ Completed`);
              completed++;
            } catch (err) {
              console.log(`  – Complete skipped: ${err.message}`);
            }
          }
        } catch (err) {
          console.log(`  – Assign skipped: ${err.message}`);
        }
      }

      console.log();
    }
  }

  console.log("=================================================");
  console.log(` Created  : ${created}`);
  console.log(` Assigned : ${assigned}`);
  console.log(` Completed: ${completed}`);
  console.log(` Failed   : ${failed}`);
  console.log("=================================================");
};

main().catch((err) => {
  console.error("\nFailed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
