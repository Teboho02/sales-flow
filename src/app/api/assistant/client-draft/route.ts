import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

interface ClientDraftRequest {
  prompt?: string;
}

interface ClientDraftFields {
  name?: string;
  clientType?: number;
  industry?: string;
  companySize?: string;
  website?: string;
  billingAddress?: string;
  taxNumber?: string;
}

interface ClientDraftResponse {
  fields: ClientDraftFields;
  notes: string[];
}

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

const safeString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const next = value.trim();
  return next.length > 0 ? next : undefined;
};

const normalizeWebsite = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.includes(".")) return `https://${value}`;
  return value;
};

const normalizeClientType = (value: unknown): number | undefined => {
  const next = Number(value);
  return [1, 2, 3].includes(next) ? next : undefined;
};

const parseClientDraft = (content: string): ClientDraftResponse => {
  try {
    const payload = JSON.parse(extractJsonPayload(content)) as {
      fields?: Record<string, unknown>;
      notes?: unknown;
    };

    const source = payload.fields ?? {};
    const notes = Array.isArray(payload.notes)
      ? payload.notes.filter((item): item is string => typeof item === "string")
      : [];

    return {
      fields: {
        name: safeString(source.name),
        clientType: normalizeClientType(source.clientType),
        industry: safeString(source.industry),
        companySize: safeString(source.companySize),
        website: normalizeWebsite(safeString(source.website)),
        billingAddress: safeString(source.billingAddress),
        taxNumber: safeString(source.taxNumber),
      },
      notes,
    };
  } catch {
    return {
      fields: {},
      notes: [],
    };
  }
};

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { message: "AI is not configured. Please set OPENAI_API_KEY (or OPEN_AI_API_KEY)." },
      { status: 500 },
    );
  }

  const authorizationHeader = request.headers.get("authorization");
  if (!authorizationHeader || !authorizationHeader.toLowerCase().startsWith("bearer ")) {
    return NextResponse.json(
      { message: "Authentication is required for AI client drafting." },
      { status: 401 },
    );
  }

  let payload: ClientDraftRequest = {};
  try {
    payload = (await request.json()) as ClientDraftRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ message: "Please provide a prompt." }, { status: 400 });
  }

  const systemPrompt = [
    "You convert natural language into SalesFlow CreateClientDto fields.",
    "Return strict JSON only with this shape:",
    '{"fields":{"name":"string|null","clientType":1|2|3|null,"industry":"string|null","companySize":"string|null","website":"string|null","billingAddress":"string|null","taxNumber":"string|null"},"notes":["string"]}',
    "Client type mapping:",
    "1 = Government, 2 = Private, 3 = Partner.",
    "If unsure about a field, return null.",
    "Do not add any keys outside the schema.",
    "Do not include markdown or code fences.",
  ].join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.1,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as OpenAIChatResponse;
    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.error?.message ?? "Failed to contact AI service for client drafting.",
        },
        { status: 502 },
      );
    }

    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseClientDraft(content);

    return NextResponse.json(parsed satisfies ClientDraftResponse);
  } catch {
    return NextResponse.json(
      { message: "AI client drafting is temporarily unavailable. Please try again shortly." },
      { status: 503 },
    );
  }
}
