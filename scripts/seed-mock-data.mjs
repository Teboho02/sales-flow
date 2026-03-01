#!/usr/bin/env node

/**
 * Seed mock data for SalesFlow CRM.
 *
 * Usage:
 *   node scripts/seed-mock-data.mjs --token <bearer_token>
 *   node scripts/seed-mock-data.mjs --token <bearer_token> --dryRun
 */

import process from "node:process";

const BASE_URL = "https://sales-automation-bmdqg9b6a0d3ffem.southafricanorth-01.azurewebsites.net";
const ADMIN_USER_ID = "12eb0ccf-8778-43a2-93e5-9941c0cbcd67";

// ─── CLI args ────────────────────────────────────────────────────────────────

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

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

const post = async (path, body) => {
  if (DRY_RUN) {
    console.log(`  [dry] POST ${path}`, JSON.stringify(body));
    return { id: `dry-run-id-${Math.random().toString(36).slice(2, 8)}` };
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const payload = await res.json();
      msg = payload?.detail ?? payload?.title ?? payload?.message ?? msg;
    } catch { /* ignore */ }
    throw new Error(`POST ${path} failed: ${msg}`);
  }
  return res.json();
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

const daysAgo = (n) => daysFromNow(-n);

// ─── Mock data ────────────────────────────────────────────────────────────────

const CLIENTS = [
  {
    name: "Department of Public Works",
    clientType: 1,
    industry: "Government",
    companySize: "1000+",
    website: "https://www.dpw.gov.za",
    billingAddress: "Central Government Offices, Pretoria, 0001",
    taxNumber: "GOV001234567",
  },
  {
    name: "City of Johannesburg Metropolitan Municipality",
    clientType: 1,
    industry: "Local Government",
    companySize: "1000+",
    website: "https://www.joburg.org.za",
    billingAddress: "55 President Street, Johannesburg, 2000",
    taxNumber: "GOV002345678",
  },
  {
    name: "Pinnacle Financial Services",
    clientType: 2,
    industry: "Financial Services",
    companySize: "201-500",
    website: "https://www.pinnaclefs.co.za",
    billingAddress: "14 Sandton Drive, Sandton, 2196",
    taxNumber: "PRI003456789",
  },
  {
    name: "Nexus Healthcare Group",
    clientType: 2,
    industry: "Healthcare",
    companySize: "51-200",
    website: "https://www.nexushealthcare.co.za",
    billingAddress: "32 Medical Crescent, Cape Town, 8001",
    taxNumber: "PRI004567890",
  },
  {
    name: "BuildRight Construction Partners",
    clientType: 3,
    industry: "Construction",
    companySize: "201-500",
    website: "https://www.buildright.co.za",
    billingAddress: "7 Midrand Business Park, Midrand, 1685",
    taxNumber: "PAR005678901",
  },
  {
    name: "TechBridge Solutions",
    clientType: 3,
    industry: "Information Technology",
    companySize: "51-200",
    website: "https://www.techbridge.co.za",
    billingAddress: "101 Innovation Hub, Centurion, 0157",
    taxNumber: "PAR006789012",
  },
];

const CONTACTS_PER_CLIENT = [
  [
    { firstName: "Nomvula", lastName: "Dlamini", email: "n.dlamini@dpw.gov.za", phoneNumber: "+27 12 345 6789", jobTitle: "Chief Procurement Officer", isPrimary: true },
    { firstName: "Sipho", lastName: "Nkosi", email: "s.nkosi@dpw.gov.za", phoneNumber: "+27 12 345 6790", jobTitle: "Senior Contracts Manager", isPrimary: false },
  ],
  [
    { firstName: "Kagiso", lastName: "Sithole", email: "k.sithole@joburg.org.za", phoneNumber: "+27 11 407 6000", jobTitle: "Head of Infrastructure", isPrimary: true },
    { firstName: "Lerato", lastName: "Molefe", email: "l.molefe@joburg.org.za", phoneNumber: "+27 11 407 6001", jobTitle: "Procurement Specialist", isPrimary: false },
  ],
  [
    { firstName: "Brendan", lastName: "van Wyk", email: "b.vanwyk@pinnaclefs.co.za", phoneNumber: "+27 11 883 4400", jobTitle: "Chief Financial Officer", isPrimary: true },
    { firstName: "Thandi", lastName: "Mokoena", email: "t.mokoena@pinnaclefs.co.za", phoneNumber: "+27 11 883 4401", jobTitle: "Operations Director", isPrimary: false },
  ],
  [
    { firstName: "Dr. Sarah", lastName: "Peters", email: "s.peters@nexushealthcare.co.za", phoneNumber: "+27 21 555 7890", jobTitle: "CEO", isPrimary: true },
    { firstName: "Rajan", lastName: "Naidoo", email: "r.naidoo@nexushealthcare.co.za", phoneNumber: "+27 21 555 7891", jobTitle: "IT Director", isPrimary: false },
  ],
  [
    { firstName: "Hennie", lastName: "Botha", email: "h.botha@buildright.co.za", phoneNumber: "+27 11 312 5000", jobTitle: "Managing Director", isPrimary: true },
    { firstName: "Zanele", lastName: "Khumalo", email: "z.khumalo@buildright.co.za", phoneNumber: "+27 11 312 5001", jobTitle: "Business Development Manager", isPrimary: false },
  ],
  [
    { firstName: "Priya", lastName: "Govender", email: "p.govender@techbridge.co.za", phoneNumber: "+27 12 663 8800", jobTitle: "CTO", isPrimary: true },
    { firstName: "Marcus", lastName: "Du Plessis", email: "m.duplessis@techbridge.co.za", phoneNumber: "+27 12 663 8801", jobTitle: "Sales Director", isPrimary: false },
  ],
];

// stage: 1=Lead 2=Qualified 3=Proposal 4=Negotiation 5=ClosedWon 6=ClosedLost
// source: 1=Website 2=Referral 3=ColdCall 4=Exhibition 5=Partner
const opportunitiesTemplate = [
  { title: "IT Infrastructure Upgrade", stage: 5, estimatedValue: 2800000, probability: 100, source: 2, expectedCloseDate: daysAgo(30), actualCloseDate: daysAgo(25), description: "Full IT infrastructure overhaul including servers, networking and security." },
  { title: "Facilities Management System", stage: 3, estimatedValue: 950000, probability: 60, source: 1, expectedCloseDate: daysFromNow(45), description: "Integrated facilities management software and implementation." },
  { title: "Cybersecurity Assessment & Implementation", stage: 4, estimatedValue: 1500000, probability: 75, source: 2, expectedCloseDate: daysFromNow(20), description: "Comprehensive cybersecurity audit followed by remediation implementation." },
  { title: "ERP System Rollout", stage: 2, estimatedValue: 3200000, probability: 40, source: 3, expectedCloseDate: daysFromNow(90), description: "Enterprise resource planning system rollout across all departments." },
  { title: "Cloud Migration Project", stage: 1, estimatedValue: 750000, probability: 20, source: 4, expectedCloseDate: daysFromNow(120), description: "Migration of on-premise workloads to cloud infrastructure." },
  { title: "Data Analytics Platform", stage: 6, estimatedValue: 1100000, probability: 0, source: 2, expectedCloseDate: daysAgo(15), description: "Business intelligence and data analytics platform implementation.", lossReason: "Budget constraints — project postponed to next financial year." },
];

// ─── Main seed logic ──────────────────────────────────────────────────────────

const log = (msg) => console.log(msg);
const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => console.log(`  ✗ ${msg}`);

const main = async () => {
  log("=================================================");
  log(" SalesFlow CRM — Mock Data Seeder");
  log(`  Mode  : ${DRY_RUN ? "DRY RUN (no API calls)" : "LIVE"}`);
  log(`  Target: ${BASE_URL}`);
  log("=================================================\n");

  const clientIds = [];
  const contactIds = []; // flat list, indexed same as CLIENTS
  const opportunityRecords = []; // { opportunityId, clientId, contactId, stage, estimatedValue, title }

  // ── 1. Clients ──────────────────────────────────────────────────────────────
  log("Step 1/6 — Creating clients...");
  for (const client of CLIENTS) {
    try {
      const res = await post("/api/Clients", client);
      clientIds.push(res.id);
      ok(`Client: ${client.name} → ${res.id}`);
    } catch (err) {
      fail(`Client: ${client.name} — ${err.message}`);
      clientIds.push(null);
    }
  }

  // ── 2. Contacts ─────────────────────────────────────────────────────────────
  log("\nStep 2/6 — Creating contacts...");
  for (let i = 0; i < CLIENTS.length; i++) {
    const clientId = clientIds[i];
    if (!clientId) { contactIds.push(null); continue; }
    let primaryContactId = null;
    for (const contact of CONTACTS_PER_CLIENT[i]) {
      try {
        const res = await post("/api/Contacts", { ...contact, clientId });
        if (contact.isPrimary) primaryContactId = res.id;
        ok(`Contact: ${contact.firstName} ${contact.lastName} → ${res.id}`);
      } catch (err) {
        fail(`Contact: ${contact.firstName} ${contact.lastName} — ${err.message}`);
      }
    }
    contactIds.push(primaryContactId);
  }

  // ── 3. Opportunities ────────────────────────────────────────────────────────
  log("\nStep 3/6 — Creating opportunities...");
  for (let i = 0; i < CLIENTS.length; i++) {
    const clientId = clientIds[i];
    const contactId = contactIds[i];
    if (!clientId) continue;

    // Give each client a different slice of the template (cycle through)
    const opps = opportunitiesTemplate.slice(0, 3).map((o, j) => ({
      ...opportunitiesTemplate[(i + j) % opportunitiesTemplate.length],
      title: `${opportunitiesTemplate[(i + j) % opportunitiesTemplate.length].title} — ${CLIENTS[i].name.split(" ")[0]}`,
    }));

    for (const opp of opps) {
      try {
        const payload = {
          title: opp.title,
          clientId,
          contactId,
          ownerId: ADMIN_USER_ID,
          estimatedValue: opp.estimatedValue,
          currency: "ZAR",
          probability: opp.probability,
          stage: opp.stage,
          source: opp.source,
          expectedCloseDate: opp.expectedCloseDate,
          description: opp.description,
        };
        if (opp.lossReason) payload.lossReason = opp.lossReason;

        const res = await post("/api/Opportunities", payload);
        opportunityRecords.push({ opportunityId: res.id, clientId, contactId, stage: opp.stage, estimatedValue: opp.estimatedValue, title: opp.title });
        ok(`Opportunity: ${opp.title} (stage ${opp.stage}) → ${res.id}`);
      } catch (err) {
        fail(`Opportunity: ${opp.title} — ${err.message}`);
      }
    }
  }

  // ── 4. Proposals (for stage 3 and 4 opportunities) ──────────────────────────
  log("\nStep 4/6 — Creating proposals...");
  const proposalOpps = opportunityRecords.filter((o) => o.stage === 3 || o.stage === 4);
  const proposalIds = {};

  for (const opp of proposalOpps) {
    try {
      const res = await post("/api/Proposals", {
        opportunityId: opp.opportunityId,
        clientId: opp.clientId,
        title: `Proposal — ${opp.title}`,
        description: `Detailed proposal covering scope, deliverables, and pricing for: ${opp.title}`,
        totalAmount: opp.estimatedValue,
        currency: "ZAR",
        validUntil: daysFromNow(30),
      });
      proposalIds[opp.opportunityId] = res.id;
      ok(`Proposal: ${opp.title} → ${res.id}`);
    } catch (err) {
      fail(`Proposal: ${opp.title} — ${err.message}`);
    }
  }

  // ── 5. Contracts (for stage 5 — Closed Won opportunities) ──────────────────
  log("\nStep 5/6 — Creating contracts...");
  const wonOpps = opportunityRecords.filter((o) => o.stage === 5);

  for (const opp of wonOpps) {
    try {
      await post("/api/Contracts", {
        clientId: opp.clientId,
        opportunityId: opp.opportunityId,
        proposalId: proposalIds[opp.opportunityId] ?? undefined,
        title: `Contract — ${opp.title}`,
        contractValue: opp.estimatedValue,
        currency: "ZAR",
        startDate: daysAgo(25),
        endDate: daysFromNow(340),
        renewalNoticePeriod: 30,
        autoRenew: false,
        terms: "Standard SLA with 30-day renewal notice. Payment terms: 30 days from invoice. Governed by South African contract law.",
        ownerId: ADMIN_USER_ID,
      });
      ok(`Contract: ${opp.title}`);
    } catch (err) {
      fail(`Contract: ${opp.title} — ${err.message}`);
    }
  }

  // ── 6. Activities ────────────────────────────────────────────────────────────
  log("\nStep 6/6 — Creating activities...");
  // type: 1=Call 2=Email 3=Meeting 4=Task 5=Note
  // relatedToType: 1=Opportunity 2=Client 3=Contact 4=Contract
  // status: 1=NotStarted 2=InProgress 3=Completed 4=Cancelled
  // priority: 1=Low 2=Medium 3=High
  const activityTemplates = [
    { type: 3, subject: "Kick-off discovery meeting", priority: 2, dueDelta: -10, relatedToType: 1 },
    { type: 1, subject: "Follow-up call on proposal feedback", priority: 3, dueDelta: 5, relatedToType: 1 },
    { type: 2, subject: "Send updated pricing breakdown", priority: 2, dueDelta: 2, relatedToType: 1 },
    { type: 4, subject: "Prepare contract draft for review", priority: 3, dueDelta: 7, relatedToType: 1 },
    { type: 3, subject: "Executive sign-off meeting", priority: 3, dueDelta: 14, relatedToType: 1 },
  ];

  for (let i = 0; i < opportunityRecords.length; i++) {
    const opp = opportunityRecords[i];
    const template = activityTemplates[i % activityTemplates.length];
    try {
      await post("/api/Activities", {
        type: template.type,
        subject: `${template.subject} — ${opp.title}`,
        description: `Scheduled activity related to opportunity: ${opp.title}`,
        relatedToType: template.relatedToType,
        relatedToId: opp.opportunityId,
        assignedToId: ADMIN_USER_ID,
        priority: template.priority,
        dueDate: daysFromNow(template.dueDelta),
      });
      ok(`Activity: ${template.subject} → opportunity ${opp.opportunityId}`);
    } catch (err) {
      fail(`Activity: ${template.subject} — ${err.message}`);
    }
  }

  log("\n=================================================");
  log(" Seeding complete.");
  log("=================================================");
};

main().catch((err) => {
  console.error("\nSeeder failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
