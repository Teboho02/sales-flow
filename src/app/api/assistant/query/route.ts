import { NextRequest, NextResponse } from "next/server";

const RAW_BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? process.env.BACKEND_API_URL ?? "";
const BACKEND_API_URL = RAW_BACKEND_API_URL.replace(/\/+$/, "");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

const MAX_CONTEXT_ITEMS = 80;
const MAX_PAGE_FETCH = 3;

const ALLOWED_ROUTES = new Set([
  "/home",
  "/opportunities",
  "/proposals",
  "/contracts",
  "/activities",
  "/clients",
  "/contacts",
  "/assistant",
  "/reports",
  "/profile",
]);

interface OpenAIChoice {
  message?: {
    content?: string | null;
  };
}

interface OpenAIError {
  message?: string;
}

interface OpenAIChatResponse {
  choices?: OpenAIChoice[];
  error?: OpenAIError;
}

interface AssistantPayload {
  prompt?: string;
}

interface AssistantResponseBody {
  reply: string;
  navigateTo: string | null;
}

const toItemsArray = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as { items?: unknown[] }).items)
  ) {
    return ((value as { items?: unknown[] }).items ?? []) as Record<string, unknown>[];
  }
  return [];
};

const toNumber = (value: unknown): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const toSafeText = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

const limitItems = <T,>(items: T[]): T[] => items.slice(0, MAX_CONTEXT_ITEMS);

const countBy = (values: string[]): Record<string, number> => {
  return values.reduce<Record<string, number>>((acc, item) => {
    const key = item.trim() || "Unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
};

const extractJsonPayload = (content: string): string => {
  const trimmed = content.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("```")) {
    const noStartFence = trimmed.replace(/^```(?:json)?/i, "").trim();
    return noStartFence.replace(/```$/, "").trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
};

const parseAssistantOutput = (content: string): AssistantResponseBody => {
  try {
    const payload = JSON.parse(extractJsonPayload(content)) as {
      reply?: unknown;
      navigateTo?: unknown;
    };
    const reply =
      typeof payload.reply === "string" && payload.reply.trim().length > 0
        ? payload.reply.trim()
        : "I could not generate a response.";
    const navigateTo =
      typeof payload.navigateTo === "string" && ALLOWED_ROUTES.has(payload.navigateTo)
        ? payload.navigateTo
        : null;
    return { reply, navigateTo };
  } catch {
    return {
      reply: content.trim() || "I could not generate a response.",
      navigateTo: null,
    };
  }
};

const inferRouteFromPrompt = (prompt: string): string | null => {
  const lowerPrompt = prompt.toLowerCase();
  const candidates: Array<{ path: string; terms: string[] }> = [
    { path: "/home", terms: ["dashboard", "home", "summary"] },
    { path: "/opportunities", terms: ["opportunity", "opportunities", "pipeline"] },
    { path: "/proposals", terms: ["proposal", "proposals"] },
    { path: "/contracts", terms: ["contract", "contracts"] },
    { path: "/activities", terms: ["activity", "activities", "task", "meeting", "call"] },
    { path: "/clients", terms: ["client", "clients"] },
    { path: "/contacts", terms: ["contact", "contacts", "people"] },
    { path: "/assistant", terms: ["assistant", "ai", "guide", "help me use"] },
    { path: "/reports", terms: ["report", "reports", "analytics"] },
    { path: "/profile", terms: ["profile", "account", "logout"] },
  ];

  for (const candidate of candidates) {
    if (candidate.terms.some((term) => lowerPrompt.includes(term))) {
      return candidate.path;
    }
  }
  return null;
};

const fetchBackendJson = async (
  endpoint: string,
  authorizationHeader: string,
): Promise<unknown> => {
  if (!BACKEND_API_URL) return null;

  try {
    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: authorizationHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
};

const fetchPagedBackendData = async (
  endpoint: string,
  authorizationHeader: string,
): Promise<Record<string, unknown>[]> => {
  const items: Record<string, unknown>[] = [];

  for (let pageNumber = 1; pageNumber <= MAX_PAGE_FETCH; pageNumber += 1) {
    const separator = endpoint.includes("?") ? "&" : "?";
    const payload = await fetchBackendJson(
      `${endpoint}${separator}pageNumber=${pageNumber}&pageSize=200`,
      authorizationHeader,
    );

    const pageItems = toItemsArray(payload);
    if (pageItems.length === 0) {
      break;
    }

    items.push(...pageItems);

    const hasNextPage = Boolean(
      payload &&
        typeof payload === "object" &&
        (payload as { hasNextPage?: unknown }).hasNextPage === true,
    );
    if (!hasNextPage) {
      break;
    }
  }

  return items;
};

const buildContext = async (authorizationHeader: string) => {
  const [
    meData,
    usersData,
    contractsData,
    clientsData,
    contactsData,
    opportunitiesData,
    proposalsData,
    activitiesData,
    dashboardOverviewData,
    dashboardActivitySummaryData,
    contractsExpiringData,
  ] = await Promise.all([
    fetchBackendJson("/api/Auth/me", authorizationHeader),
    fetchPagedBackendData("/api/users", authorizationHeader),
    fetchPagedBackendData("/api/Contracts", authorizationHeader),
    fetchPagedBackendData("/api/Clients", authorizationHeader),
    fetchPagedBackendData("/api/Contacts", authorizationHeader),
    fetchPagedBackendData("/api/Opportunities", authorizationHeader),
    fetchPagedBackendData("/api/Proposals", authorizationHeader),
    fetchBackendJson("/api/Activities", authorizationHeader),
    fetchBackendJson("/api/Dashboard/overview", authorizationHeader),
    fetchBackendJson("/api/Dashboard/activities-summary", authorizationHeader),
    fetchBackendJson("/api/Dashboard/contracts-expiring?days=90", authorizationHeader),
  ]);

  const users = limitItems(
    toItemsArray(usersData).map((user) => ({
      id: String(user.id ?? ""),
      fullName:
        toSafeText(user.fullName) ||
        `${String(user.firstName ?? "")} ${String(user.lastName ?? "")}`.trim() ||
        "Unnamed user",
      email: String(user.email ?? ""),
      roles: Array.isArray(user.roles) ? user.roles : [],
      isActive: Boolean(user.isActive),
      lastLoginAt: String(user.lastLoginAt ?? ""),
    })),
  );

  const contracts = limitItems(
    toItemsArray(contractsData).map((contract) => ({
      id: String(contract.id ?? ""),
      contractNumber: String(contract.contractNumber ?? ""),
      title: String(contract.title ?? ""),
      clientName: String(contract.clientName ?? ""),
      ownerName: String(contract.ownerName ?? ""),
      status: toNumber(contract.status),
      statusName: String(contract.statusName ?? ""),
      contractValue: toNumber(contract.contractValue),
      currency: String(contract.currency ?? "ZAR"),
      startDate: String(contract.startDate ?? ""),
      endDate: String(contract.endDate ?? ""),
      daysUntilExpiry: toNumber(contract.daysUntilExpiry),
      isExpiringSoon: Boolean(contract.isExpiringSoon),
    })),
  );

  const clients = limitItems(
    toItemsArray(clientsData).map((client) => ({
      id: String(client.id ?? ""),
      name: String(client.name ?? ""),
      industry: String(client.industry ?? ""),
      clientType: toNumber(client.clientType),
      isActive: Boolean(client.isActive),
      opportunitiesCount: toNumber(client.opportunitiesCount),
      contractsCount: toNumber(client.contractsCount),
    })),
  );

  const contacts = limitItems(
    toItemsArray(contactsData).map((contact) => ({
      id: String(contact.id ?? ""),
      fullName:
        `${String(contact.firstName ?? "")} ${String(contact.lastName ?? "")}`.trim() ||
        String(contact.fullName ?? "") ||
        "Unnamed contact",
      email: String(contact.email ?? ""),
      phoneNumber: String(contact.phoneNumber ?? ""),
      clientId: String(contact.clientId ?? ""),
      clientName: String(contact.clientName ?? ""),
      isPrimary: Boolean(contact.isPrimary),
      isActive: Boolean(contact.isActive),
    })),
  );

  const opportunities = limitItems(
    toItemsArray(opportunitiesData).map((opportunity) => ({
      id: String(opportunity.id ?? ""),
      title: String(opportunity.title ?? ""),
      clientName: String(opportunity.clientName ?? ""),
      ownerName: String(opportunity.ownerName ?? ""),
      stage: toNumber(opportunity.stage),
      stageName: String(opportunity.stageName ?? ""),
      estimatedValue: toNumber(opportunity.estimatedValue),
      currency: String(opportunity.currency ?? "ZAR"),
      probability: toNumber(opportunity.probability),
      expectedCloseDate: String(opportunity.expectedCloseDate ?? ""),
      isActive: Boolean(opportunity.isActive),
    })),
  );

  const proposals = limitItems(
    toItemsArray(proposalsData).map((proposal) => ({
      id: String(proposal.id ?? ""),
      proposalNumber: String(proposal.proposalNumber ?? ""),
      title: String(proposal.title ?? ""),
      clientName: String(proposal.clientName ?? ""),
      status: toNumber(proposal.status),
      statusName: String(proposal.statusName ?? ""),
      totalAmount: toNumber(proposal.totalAmount),
      currency: String(proposal.currency ?? "ZAR"),
      validUntil: String(proposal.validUntil ?? ""),
    })),
  );

  const activities = limitItems(
    toItemsArray(activitiesData).map((activity) => ({
      id: String(activity.id ?? ""),
      subject: String(activity.subject ?? ""),
      type: toNumber(activity.type),
      typeName: String(activity.typeName ?? ""),
      status: toNumber(activity.status),
      statusName: String(activity.statusName ?? ""),
      dueDate: String(activity.dueDate ?? ""),
      assignedToName: String(activity.assignedToName ?? ""),
      relatedToTypeName: String(activity.relatedToTypeName ?? ""),
      relatedToId: String(activity.relatedToId ?? ""),
      priority: toNumber(activity.priority),
      priorityName: String(activity.priorityName ?? ""),
    })),
  );

  const expiringContracts = limitItems(
    toItemsArray(contractsExpiringData).map((contract) => ({
      id: String(contract.id ?? ""),
      contractNumber: String(contract.contractNumber ?? ""),
      title: String(contract.title ?? ""),
      clientName: String(contract.clientName ?? ""),
      ownerName: String(contract.ownerName ?? ""),
      daysUntilExpiry: toNumber(contract.daysUntilExpiry),
      statusName: String(contract.statusName ?? ""),
      contractValue: toNumber(contract.contractValue),
      currency: String(contract.currency ?? "ZAR"),
    })),
  );

  const now = Date.now();
  const activitiesDueSoon = activities
    .filter((activity) => {
      const due = Date.parse(activity.dueDate);
      return Number.isFinite(due) && due >= now;
    })
    .sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate))
    .slice(0, 10);

  const overdueActivitiesCount = activities.filter((activity) => {
    const due = Date.parse(activity.dueDate);
    const statusName = activity.statusName.toLowerCase();
    return (
      Number.isFinite(due) &&
      due < now &&
      !statusName.includes("completed") &&
      !statusName.includes("cancel")
    );
  }).length;

  const totalContractValue = contracts.reduce((sum, item) => sum + item.contractValue, 0);
  const openPipelineValue = opportunities
    .filter((item) => item.isActive)
    .reduce((sum, item) => sum + item.estimatedValue, 0);
  const weightedPipelineValue = opportunities
    .filter((item) => item.isActive)
    .reduce((sum, item) => sum + (item.estimatedValue * item.probability) / 100, 0);

  return {
    currentUser:
      meData && typeof meData === "object"
        ? {
            userId: String((meData as { userId?: unknown }).userId ?? ""),
            fullName: `${String((meData as { firstName?: unknown }).firstName ?? "")} ${String((meData as { lastName?: unknown }).lastName ?? "")}`.trim(),
            email: String((meData as { email?: unknown }).email ?? ""),
            roles: Array.isArray((meData as { roles?: unknown[] }).roles)
              ? (meData as { roles?: unknown[] }).roles
              : [],
            tenantId: String((meData as { tenantId?: unknown }).tenantId ?? ""),
          }
        : null,
    users,
    clients,
    contacts,
    opportunities,
    proposals,
    contracts,
    activities,
    dashboardOverview:
      dashboardOverviewData && typeof dashboardOverviewData === "object"
        ? dashboardOverviewData
        : null,
    dashboardActivitiesSummary:
      dashboardActivitySummaryData && typeof dashboardActivitySummaryData === "object"
        ? dashboardActivitySummaryData
        : null,
    summary: {
      usersCount: users.length,
      activeUsersCount: users.filter((item) => item.isActive).length,
      usersByRole: countBy(
        users.flatMap((item) =>
          Array.isArray(item.roles) ? item.roles.map((role) => String(role)) : [],
        ),
      ),
      clientsCount: clients.length,
      activeClientsCount: clients.filter((item) => item.isActive).length,
      contactsCount: contacts.length,
      activeContactsCount: contacts.filter((item) => item.isActive).length,
      opportunitiesCount: opportunities.length,
      activeOpportunitiesCount: opportunities.filter((item) => item.isActive).length,
      opportunitiesByStage: countBy(opportunities.map((item) => item.stageName)),
      openPipelineValue,
      weightedPipelineValue,
      proposalsCount: proposals.length,
      proposalsByStatus: countBy(proposals.map((item) => item.statusName)),
      contractsCount: contracts.length,
      activeContractsCount: contracts.filter((item) => item.statusName === "Active").length,
      contractsByStatus: countBy(contracts.map((item) => item.statusName)),
      totalContractValue,
      activitiesCount: activities.length,
      activitiesByStatus: countBy(activities.map((item) => item.statusName)),
      overdueActivitiesCount,
      activitiesDueSoon,
      expiringSoonContracts: expiringContracts,
      contextLimits: {
        maxItemsPerCollection: MAX_CONTEXT_ITEMS,
        maxPagedFetch: MAX_PAGE_FETCH,
      },
    },
  };
};

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      {
        reply:
          "AI is not configured. Please set OPENAI_API_KEY (or OPEN_AI_API_KEY) in the environment.",
        navigateTo: null,
      } satisfies AssistantResponseBody,
      { status: 500 },
    );
  }

  const authorizationHeader = request.headers.get("authorization");
  if (!authorizationHeader || !authorizationHeader.toLowerCase().startsWith("bearer ")) {
    return NextResponse.json(
      {
        reply: "Authentication is required for assistant queries.",
        navigateTo: null,
      } satisfies AssistantResponseBody,
      { status: 401 },
    );
  }

  let payload: AssistantPayload = {};
  try {
    payload = (await request.json()) as AssistantPayload;
  } catch {
    return NextResponse.json(
      {
        reply: "Invalid request payload.",
        navigateTo: null,
      } satisfies AssistantResponseBody,
      { status: 400 },
    );
  }

  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json(
      {
        reply: "Please provide a prompt.",
        navigateTo: null,
      } satisfies AssistantResponseBody,
      { status: 400 },
    );
  }

  const context = await buildContext(authorizationHeader);
  const contextJson = JSON.stringify(context);

  const systemPrompt = [
    "You are the Sales Flow AI assistant.",
    "Use the provided tenant context JSON to answer accurately.",
    "If context data is missing for a request, state that clearly.",
    "If asked 'who is in my organisation', list users with role(s).",
    "If asked for summaries, provide key metrics and practical next steps.",
    "If the user asks to navigate, choose exactly one allowed route.",
    "Allowed routes: /home, /opportunities, /proposals, /contracts, /activities, /clients, /contacts, /assistant, /reports, /profile",
    "Return strict JSON only with this shape:",
    '{"reply":"string","navigateTo":"/allowed-route-or-null"}',
    "Do not include markdown or code fences.",
  ].join("\n");

  const userPrompt = ["Tenant context JSON:", contextJson, "", "User prompt:", prompt].join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as OpenAIChatResponse;
    if (!response.ok) {
      return NextResponse.json(
        {
          reply:
            data.error?.message ??
            "Assistant request failed while contacting the AI service.",
          navigateTo: inferRouteFromPrompt(prompt),
        } satisfies AssistantResponseBody,
        { status: 502 },
      );
    }

    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseAssistantOutput(content);
    const navigateTo = parsed.navigateTo ?? inferRouteFromPrompt(prompt);

    return NextResponse.json({
      reply: parsed.reply,
      navigateTo,
    } satisfies AssistantResponseBody);
  } catch {
    return NextResponse.json(
      {
        reply:
          "The AI assistant is temporarily unavailable. Please try again shortly.",
        navigateTo: inferRouteFromPrompt(prompt),
      } satisfies AssistantResponseBody,
      { status: 503 },
    );
  }
}
