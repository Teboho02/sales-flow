"use client";

import { useState } from "react";
import { Alert, Button, Card, Input, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useStyles } from "./style/styles";

const { Text, Title } = Typography;

interface AssistantResult {
  reply: string;
  navigateTo: string | null;
}

const QUICK_PROMPTS = [
  "Who is in my organisation?",
  "Summarize the contracts I have.",
  "Summarize the opportunities and pipeline health.",
  "What activities are overdue and what should I do first?",
  "Give first-time user instructions for this CRM.",
];

const AssistantClient = () => {
  const { styles } = useStyles();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<AssistantResult | null>(null);

  const askAssistant = async (promptOverride?: string) => {
    const effectivePrompt = (promptOverride ?? prompt).trim();
    if (!effectivePrompt) {
      setError("Please enter a prompt.");
      return;
    }

    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("auth_token")
        : null;

    if (!token) {
      setError("You are not authenticated. Please login again.");
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/assistant/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: effectivePrompt }),
      });

      const data = (await response.json()) as Partial<AssistantResult>;
      if (!response.ok) {
        throw new Error(
          typeof data.reply === "string" && data.reply.trim()
            ? data.reply
            : "Failed to get assistant response.",
        );
      }

      setResult({
        reply:
          typeof data.reply === "string" && data.reply.trim()
            ? data.reply
            : "No response received.",
        navigateTo: typeof data.navigateTo === "string" ? data.navigateTo : null,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get assistant response.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <Card className={styles.card}>
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <div className={styles.header}>
            <Title level={3} className={styles.title}>
              AI Organisation Assistant
            </Title>
            <Text className={styles.hint}>
              Ask about users, contracts, opportunities, activities, and next actions. The assistant can also route you to the right page.
            </Text>
          </div>

          <Space wrap size={[8, 8]}>
            {QUICK_PROMPTS.map((item) => (
              <Button
                key={item}
                size="small"
                className={styles.quickPrompt}
                onClick={() => {
                  setPrompt(item);
                  void askAssistant(item);
                }}
              >
                {item}
              </Button>
            ))}
          </Space>

          <Input.TextArea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            autoSize={{ minRows: 4, maxRows: 7 }}
            placeholder="Example: Summarize contracts that are expiring soon and tell me what to do next."
          />

          <Space>
            <Button type="primary" loading={loading} onClick={() => void askAssistant()}>
              Ask AI
            </Button>
            {result?.navigateTo ? (
              <Button
                className={styles.outlineButton}
                onClick={() => {
                  if (result.navigateTo) {
                    router.push(result.navigateTo);
                  }
                }}
              >
                Go to {result.navigateTo}
              </Button>
            ) : null}
          </Space>

          {error ? <Alert type="error" showIcon message={error} /> : null}

          {result?.reply ? (
            <div className={styles.answerCard}>
              <Text className={styles.answerText}>{result.reply}</Text>
            </div>
          ) : null}
        </Space>
      </Card>
    </section>
  );
};

export default AssistantClient;
