import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

type TermsAiMode = "draft" | "improve";

interface ContractDetails {
  title?: string;
  clientName?: string;
  proposalId?: string;
  contractValue?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  renewalNoticePeriod?: number;
  autoRenew?: boolean;
}

interface TermsAssistantPayload {
  mode?: TermsAiMode;
  instruction?: string;
  currentTerms?: string;
  contract?: ContractDetails;
}

interface TermsAssistantResponse {
  terms: string;
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

const parseTermsAssistantOutput = (content: string): TermsAssistantResponse => {
  try {
    const payload = JSON.parse(extractJsonPayload(content)) as {
      terms?: unknown;
      notes?: unknown;
    };

    const terms =
      typeof payload.terms === "string" && payload.terms.trim().length > 0
        ? payload.terms.trim()
        : content.trim();

    const notes = Array.isArray(payload.notes)
      ? payload.notes.filter((note): note is string => typeof note === "string")
      : [];

    return {
      terms: terms || "I could not generate contract terms.",
      notes,
    };
  } catch {
    return {
      terms: content.trim() || "I could not generate contract terms.",
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
      { message: "Authentication is required for AI terms assistance." },
      { status: 401 },
    );
  }

  let payload: TermsAssistantPayload = {};
  try {
    payload = (await request.json()) as TermsAssistantPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const mode: TermsAiMode = payload.mode === "improve" ? "improve" : "draft";
  const instruction = typeof payload.instruction === "string" ? payload.instruction.trim() : "";
  const currentTerms = typeof payload.currentTerms === "string" ? payload.currentTerms.trim() : "";
  const contract = payload.contract ?? {};

  if (mode === "improve" && !currentTerms) {
    return NextResponse.json(
      { message: "Existing terms are required for grammar and spelling review." },
      { status: 400 },
    );
  }

  const systemPrompt = [
    "You are an assistant helping sales teams draft and improve contract terms text for CRM usage.",
    "Do not provide legal advice or legal claims. Keep language practical and professional.",
    "For draft mode: create clear, structured contract terms suitable for a first draft.",
    "For improve mode: fix grammar, spelling, punctuation, and readability while preserving the original meaning.",
    "Always return strict JSON only with this shape:",
    '{"terms":"string","notes":["string"]}',
    "The notes array should contain short edit notes.",
    "Never include markdown or code fences.",
  ].join("\n");

  const userPrompt = [
    `Mode: ${mode}`,
    "",
    "Contract details:",
    JSON.stringify(
      {
        title: contract.title ?? "",
        clientName: contract.clientName ?? "",
        proposalId: contract.proposalId ?? "",
        contractValue: contract.contractValue ?? null,
        currency: contract.currency ?? "ZAR",
        startDate: contract.startDate ?? "",
        endDate: contract.endDate ?? "",
        renewalNoticePeriod: contract.renewalNoticePeriod ?? null,
        autoRenew: contract.autoRenew ?? false,
      },
      null,
      2,
    ),
    "",
    `User instruction: ${instruction || "None"}`,
    "",
    "Current terms (for improve mode):",
    currentTerms || "None",
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
          message:
            data.error?.message ?? "Failed to contact AI service for contract terms.",
        },
        { status: 502 },
      );
    }

    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseTermsAssistantOutput(content);
    return NextResponse.json(parsed satisfies TermsAssistantResponse);
  } catch {
    return NextResponse.json(
      { message: "AI terms assistant is temporarily unavailable. Please try again shortly." },
      { status: 503 },
    );
  }
}
