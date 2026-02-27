#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_TENANT_ID = "3bd5a6d7-baab-419d-9756-fbc87e840130";
const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  process.env.BACKEND_API_URL ??
  "https://sales-automation-bmdqg9b6a0d3ffem.southafricanorth-01.azurewebsites.net";
const DEFAULT_PASSWORD = process.env.BULK_USERS_PASSWORD ?? "Pass@123";
const DEFAULT_DOMAIN = process.env.BULK_USERS_DOMAIN ?? "example.com";

const usage = `
Bulk add users (SalesRep/SalesManager) to a tenant via /api/Auth/register.

Usage:
  npm run users:bulk-add -- [options]

Options:
  --tenantId <uuid>          Tenant ID (default: ${DEFAULT_TENANT_ID})
  --baseUrl <url>            API base URL (default: env NEXT_PUBLIC_BACKEND_API_URL/BACKEND_API_URL)
  --password <value>         Default password for generated users (default: ${DEFAULT_PASSWORD})
  --domain <value>           Email domain for generated users (default: ${DEFAULT_DOMAIN})
  --salesReps <number>       Number of SalesRep users to generate (default: 3)
  --salesManagers <number>   Number of SalesManager users to generate (default: 2)
  --input <json-file>        Optional JSON file with explicit users
  --dryRun                   Print payload only, do not call API
  --help                     Show this help

Input JSON format (array or object with "users"):
[
  {
    "email": "rep1@yourorg.com",
    "firstName": "Rep",
    "lastName": "One",
    "role": "SalesRep",
    "password": "OptionalOverride"
  }
]
`;

const getArgValue = (args, key, fallback = undefined) => {
  const index = args.findIndex((arg) => arg === `--${key}`);
  if (index < 0 || index === args.length - 1) return fallback;
  return args[index + 1];
};

const hasFlag = (args, key) => args.includes(`--${key}`);

const parseIntArg = (value, fallback) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
};

const normalizeBaseUrl = (url) => String(url || "").replace(/\/+$/, "");

const safeReadJson = async (filePath) => {
  const fullPath = path.resolve(process.cwd(), filePath);
  const content = await fs.readFile(fullPath, "utf8");
  return JSON.parse(content);
};

const isAllowedRole = (role) => role === "SalesRep" || role === "SalesManager";

const buildGeneratedUsers = ({ salesReps, salesManagers, domain, password }) => {
  const users = [];

  for (let index = 1; index <= salesReps; index += 1) {
    users.push({
      email: `salesrep${index}@${domain}`,
      firstName: `SalesRep${index}`,
      lastName: "User",
      role: "SalesRep",
      password,
    });
  }

  for (let index = 1; index <= salesManagers; index += 1) {
    users.push({
      email: `salesmanager${index}@${domain}`,
      firstName: `SalesManager${index}`,
      lastName: "User",
      role: "SalesManager",
      password,
    });
  }

  return users;
};

const normalizeInputUsers = (input, fallbackPassword) => {
  const source = Array.isArray(input) ? input : Array.isArray(input?.users) ? input.users : [];

  return source
    .map((entry) => ({
      email: String(entry?.email ?? "").trim(),
      firstName: String(entry?.firstName ?? "").trim(),
      lastName: String(entry?.lastName ?? "").trim(),
      role: String(entry?.role ?? "").trim(),
      password: String(entry?.password ?? fallbackPassword).trim(),
    }))
    .filter((entry) => entry.email && entry.firstName && entry.lastName && entry.password)
    .filter((entry) => isAllowedRole(entry.role));
};

const readErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload?.detail || payload?.title || payload?.message || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

const registerUser = async ({ baseUrl, tenantId, user }) => {
  const response = await fetch(`${baseUrl}/api/Auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId,
      role: user.role,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      email: user.email,
      role: user.role,
      message: await readErrorMessage(response),
    };
  }

  return {
    ok: true,
    email: user.email,
    role: user.role,
    message: "Created",
  };
};

const main = async () => {
  const args = process.argv.slice(2);
  if (hasFlag(args, "help")) {
    console.log(usage);
    return;
  }

  const tenantId = getArgValue(args, "tenantId", DEFAULT_TENANT_ID);
  const baseUrl = normalizeBaseUrl(getArgValue(args, "baseUrl", DEFAULT_BASE_URL));
  const password = getArgValue(args, "password", DEFAULT_PASSWORD);
  const domain = getArgValue(args, "domain", DEFAULT_DOMAIN);
  const salesReps = parseIntArg(getArgValue(args, "salesReps"), 3);
  const salesManagers = parseIntArg(getArgValue(args, "salesManagers"), 2);
  const inputPath = getArgValue(args, "input");
  const dryRun = hasFlag(args, "dryRun");

  if (!tenantId) {
    throw new Error("tenantId is required.");
  }
  if (!baseUrl) {
    throw new Error("baseUrl is required.");
  }

  const users = inputPath
    ? normalizeInputUsers(await safeReadJson(inputPath), password)
    : buildGeneratedUsers({ salesReps, salesManagers, domain, password });

  if (!users.length) {
    throw new Error("No valid users found to create.");
  }

  console.log(`Base URL: ${baseUrl}`);
  console.log(`Tenant ID: ${tenantId}`);
  console.log(`Users queued: ${users.length}`);

  if (dryRun) {
    console.log("Dry run payload:");
    console.log(JSON.stringify(users, null, 2));
    return;
  }

  const results = [];
  for (const user of users) {
    const result = await registerUser({ baseUrl, tenantId, user });
    results.push(result);
    console.log(`${result.ok ? "OK" : "FAIL"} ${result.email} (${result.role}) - ${result.message}`);
  }

  const successCount = results.filter((item) => item.ok).length;
  const failCount = results.length - successCount;

  console.log("");
  console.log("Summary");
  console.log(`Created: ${successCount}`);
  console.log(`Failed: ${failCount}`);
};

main().catch((error) => {
  console.error("Bulk user creation failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
