"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Card,
  Input,
  Modal,
  Progress,
  Space,
  Typography,
  Table,
  Skeleton,
} from "antd";
import { AudioOutlined, RobotOutlined } from "@ant-design/icons";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useStyles } from "./style/styles";

const { Text } = Typography;

const formatPercent = (value: number) => `${Math.round(value)}%`;
const clientTypeLabel: Record<number, string> = {
  1: "Government",
  2: "Private",
  3: "Partner",
};

type StageMetrics = {
  stage: number;
  stageName: string | null;
  count: number;
  totalValue: number;
  weightedValue: number;
};

type PipelineMetrics = {
  stageMetrics: Record<string, StageMetrics>;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  totalOpportunities: number;
  activeOpportunities: number;
  averageDealSize: number;
  winRate: number;
};

type Overview = {
  opportunities: {
    totalCount: number;
    wonCount: number;
    winRate: number;
    pipelineValue: number;
  };
  pipeline: {
    stages: StageMetrics[];
    weightedPipelineValue: number;
  };
  activities: {
    upcomingCount: number;
    overdueCount: number;
    completedTodayCount: number;
  };
  contracts: {
    totalActiveCount: number;
    expiringThisMonthCount: number;
    totalContractValue: number;
  };
  revenue: {
    thisMonth: number;
    thisQuarter: number;
    thisYear: number;
    monthlyTrend: { month: string; value: number }[];
  };
};

type SalesPerformance = {
  userId: string;
  userName: string;
  opportunitiesWon: number;
  totalRevenue: number;
  winRate: number;
  activePipelineValue: number;
};

interface AssistantResult {
  reply: string;
  navigateTo: string | null;
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
  fields?: ClientDraftFields;
  notes?: string[];
  message?: string;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item: (index: number) => SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item: (index: number) => SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionCtor {
  new (): SpeechRecognitionInstance;
}

interface SpeechWindow extends Window {
  webkitSpeechRecognition?: SpeechRecognitionCtor;
  SpeechRecognition?: SpeechRecognitionCtor;
}

const DashboardView = () => {
  const { styles } = useStyles();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics | null>(null);
  const [topPerformers, setTopPerformers] = useState<SalesPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | undefined>(undefined);
  const [assistantResult, setAssistantResult] = useState<AssistantResult | null>(null);
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);
  const [clientCreateError, setClientCreateError] = useState<string | undefined>(undefined);
  const [clientCreateSuccess, setClientCreateSuccess] = useState<string | undefined>(undefined);
  const [clientDraftPreview, setClientDraftPreview] = useState<ClientDraftFields | null>(null);
  const [clientDraftNotes, setClientDraftNotes] = useState<string[]>([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechListening, setSpeechListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | undefined>(undefined);
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const speechPromptBaseRef = useRef("");
  const speechFinalRef = useRef("");

  const instance = useMemo(() => getAxiosInstace(), []);

  const fetchData = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [overviewRes, pipelineRes, performanceRes] = await Promise.all([
        instance.get("/api/Dashboard/overview"),
        instance.get("/api/Opportunities/pipeline"),
        instance.get("/api/Dashboard/sales-performance?topCount=5"),
      ]);
      setOverview(overviewRes.data);
      setPipelineMetrics(pipelineRes.data);
      setTopPerformers(Array.isArray(performanceRes.data) ? performanceRes.data : []);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
        : err instanceof Error
          ? err.message
          : "Failed to load dashboard data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pipelineStageList: StageMetrics[] = useMemo(() => {
    if (!pipelineMetrics) return [];
    return Object.values(pipelineMetrics.stageMetrics || {});
  }, [pipelineMetrics]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setSpeechSupported(false);
      return;
    }
    const speechWindow = window as SpeechWindow;
    setSpeechSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
        speechRecognitionRef.current = null;
      }
    };
  }, []);

  const joinPromptSegments = (...parts: string[]): string => {
    return parts
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const stopSpeechToText = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setSpeechListening(false);
  };

  const startSpeechToText = () => {
    if (!speechSupported || typeof window === "undefined") {
      setSpeechError("Speech-to-text is not supported in this browser.");
      return;
    }

    const speechWindow = window as SpeechWindow;
    const SpeechRecognitionCtor =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setSpeechError("Speech-to-text is not supported in this browser.");
      return;
    }

    if (!speechRecognitionRef.current) {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-ZA";

      recognition.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (!result || result.length === 0) continue;
          const transcript = result[0]?.transcript ?? result.item(0)?.transcript ?? "";
          if (!transcript) continue;

          if (result.isFinal) {
            speechFinalRef.current = `${speechFinalRef.current} ${transcript}`.trim();
          } else {
            interimTranscript += ` ${transcript}`;
          }
        }

        setAssistantPrompt(
          joinPromptSegments(speechPromptBaseRef.current, speechFinalRef.current, interimTranscript),
        );
      };

      recognition.onerror = (event) => {
        const errorCode = event.error ?? "unknown";
        const readable =
          errorCode === "not-allowed"
            ? "Microphone permission denied. Please allow microphone access."
            : errorCode === "no-speech"
              ? "No speech detected. Try speaking again."
              : errorCode === "audio-capture"
                ? "No microphone was detected on this device."
                : `Speech recognition error: ${errorCode}`;
        setSpeechError(readable);
        setSpeechListening(false);
      };

      recognition.onend = () => {
        setSpeechListening(false);
      };

      speechRecognitionRef.current = recognition;
    }

    speechPromptBaseRef.current = assistantPrompt.trim();
    speechFinalRef.current = "";
    setSpeechError(undefined);
    setSpeechListening(true);
    speechRecognitionRef.current.start();
  };

  const toggleSpeechToText = () => {
    if (speechListening) {
      stopSpeechToText();
      return;
    }
    startSpeechToText();
  };

  const closeAssistantModal = () => {
    stopSpeechToText();
    setAssistantModalOpen(false);
  };

  const isClientCreationPrompt = (prompt: string): boolean => {
    const normalized = prompt.toLowerCase();
    return (
      /(add|create|new|register)\s+(a\s+)?client/.test(normalized) ||
      (normalized.includes("client") &&
        (normalized.includes("add") || normalized.includes("create") || normalized.includes("register")))
    );
  };

  const askAssistant = async () => {
    if (speechListening) {
      stopSpeechToText();
    }
    const prompt = assistantPrompt.trim();
    if (!prompt) {
      setAssistantError("Please enter a question for the assistant.");
      return;
    }

    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("auth_token")
        : null;

    if (!token) {
      setAssistantError("You are not authenticated. Please login again.");
      return;
    }

    setAssistantLoading(true);
    setAssistantError(undefined);
    setClientCreateError(undefined);
    setClientCreateSuccess(undefined);
    try {
      if (isClientCreationPrompt(prompt)) {
        await createClientFromPrompt(prompt);
        return;
      }

      const response = await fetch("/api/assistant/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as Partial<AssistantResult>;
      if (!response.ok) {
        throw new Error(
          typeof data.reply === "string" && data.reply.trim()
            ? data.reply
            : "Failed to get assistant response.",
        );
      }

      setAssistantResult({
        reply:
          typeof data.reply === "string" && data.reply.trim()
            ? data.reply
            : "No response received.",
        navigateTo: typeof data.navigateTo === "string" ? data.navigateTo : null,
      });
    } catch (err: unknown) {
      setAssistantError(
        err instanceof Error
          ? err.message
          : "Failed to get assistant response.",
      );
    } finally {
      setAssistantLoading(false);
    }
  };

  const createClientFromPrompt = async (promptOverride?: string) => {
    const prompt = (promptOverride ?? assistantPrompt).trim();
    if (!prompt) {
      setClientCreateError("Please describe the client you want to create.");
      return;
    }

    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("auth_token")
        : null;

    if (!token) {
      setClientCreateError("You are not authenticated. Please login again.");
      return;
    }

    try {
      const draftResponse = await fetch("/api/assistant/client-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const draftData = (await draftResponse.json()) as ClientDraftResponse;
      if (!draftResponse.ok) {
        throw new Error(
          typeof draftData.message === "string" && draftData.message.trim()
            ? draftData.message
            : "Failed to generate client details from prompt.",
        );
      }

      const fields = draftData.fields ?? {};
      const name = typeof fields.name === "string" ? fields.name.trim() : "";
      const clientType = Number(fields.clientType);

      if (!name || ![1, 2, 3].includes(clientType)) {
        throw new Error(
          "Prompt must include at least a client name and type (Government, Private, or Partner).",
        );
      }

      const website =
        typeof fields.website === "string" && fields.website.trim()
          ? fields.website.trim().startsWith("http://") ||
            fields.website.trim().startsWith("https://")
            ? fields.website.trim()
            : `https://${fields.website.trim()}`
          : undefined;

      await instance.post("/api/Clients", {
        name,
        clientType,
        industry:
          typeof fields.industry === "string" && fields.industry.trim()
            ? fields.industry.trim()
            : undefined,
        companySize:
          typeof fields.companySize === "string" && fields.companySize.trim()
            ? fields.companySize.trim()
            : undefined,
        website,
        billingAddress:
          typeof fields.billingAddress === "string" && fields.billingAddress.trim()
            ? fields.billingAddress.trim()
            : undefined,
        taxNumber:
          typeof fields.taxNumber === "string" && fields.taxNumber.trim()
            ? fields.taxNumber.trim()
            : undefined,
      });

      setClientDraftPreview({
        ...fields,
        name,
        clientType,
        website,
      });
      setClientDraftNotes(
        Array.isArray(draftData.notes)
          ? draftData.notes.filter((note) => typeof note === "string")
          : [],
      );
      setClientCreateSuccess(`Client "${name}" was created successfully.`);
      void fetchData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
        : err instanceof Error
          ? err.message
          : "Failed to create client with AI.";
      setClientCreateError(message);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.headerRow}>
        <div className={styles.headerText}>
          <Text type="secondary">Welcome back</Text>
          <Text className={styles.headerCurrent}>Pipeline and performance overview</Text>
        </div>
        <Space>
          <Button
            className={styles.assistantLaunchButton}
            icon={<RobotOutlined />}
            onClick={() => {
              setAssistantModalOpen(true);
              setAssistantError(undefined);
              setClientCreateError(undefined);
              setClientCreateSuccess(undefined);
              setSpeechError(undefined);
            }}
          >
            Ask AI
          </Button>
          <Button type="primary" onClick={() => void fetchData()} loading={loading}>
            Refresh
          </Button>
        </Space>
      </section>

      {error ? (
        <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} />
      ) : null}

      {loading && !overview ? (
        <Skeleton active />
      ) : (
        <>
          <section className={styles.metricsGrid}>
            <Card className={styles.metricCard}>
              <Space direction="vertical" size={6}>
                <Text className={styles.metricLabel}>Active opportunities</Text>
                <Text className={styles.metricValue}>
                  {pipelineMetrics?.activeOpportunities ?? "—"}
                </Text>
             
              </Space>
            </Card>
            <Card className={styles.metricCard}>
              <Space direction="vertical" size={6}>
                <Text className={styles.metricLabel}>Win rate</Text>
                <Text className={styles.metricValue}>
                  {pipelineMetrics?.winRate != null ? formatPercent(pipelineMetrics.winRate) : "—"}
                </Text>
             
              </Space>
            </Card>
            <Card className={styles.metricCard}>
              <Space direction="vertical" size={6}>
                <Text className={styles.metricLabel}>Revenue this month</Text>
                <Text className={styles.metricValue}>
                  {overview?.revenue?.thisMonth != null
                    ? `R${overview.revenue.thisMonth.toLocaleString("en-ZA")}`
                    : "—"}
                </Text>
                <Text type="secondary">
                  Quarter: {overview?.revenue?.thisQuarter != null
                    ? `R${overview.revenue.thisQuarter.toLocaleString("en-ZA")}`
                    : "—"}
                </Text>
              </Space>
            </Card>
            <Card className={styles.metricCard}>
              <Space direction="vertical" size={6}>
                <Text className={styles.metricLabel}>Contracts</Text>
                <Text className={styles.metricValue}>
                  {overview?.contracts?.totalActiveCount ?? "—"}
                </Text>
                <Text type="secondary">
                  Expiring this month: {overview?.contracts?.expiringThisMonthCount ?? "—"}
                </Text>
              </Space>
            </Card>
          </section>

          <section className={styles.lowerGrid}>
            <Card className={styles.panelCard} title="Pipeline by stage">
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                {pipelineStageList.map((stage) => (
                  <div key={stage.stage} style={{ width: "100%" }}>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Text strong>{stage.stageName ?? `Stage ${stage.stage}`}</Text>
                      <Text type="secondary">
                        {stage.count} · R{stage.totalValue.toLocaleString("en-ZA")}
                      </Text>
                    </Space>
                    <Progress
                      percent={Math.min(
                        100,
                        stage.count && pipelineMetrics?.totalOpportunities
                          ? (stage.count / pipelineMetrics.totalOpportunities) * 100
                          : 0,
                      )}
                      showInfo={false}
                    />
                  </div>
                ))}
              </Space>
            </Card>

            <Card className={styles.panelCard} title="Top performers">
              <Table
                size="small"
                rowKey="userId"
                pagination={false}
                dataSource={topPerformers}
                columns={[
                  { title: "User", dataIndex: "userName", key: "userName" },
                  {
                    title: "Won",
                    dataIndex: "opportunitiesWon",
                    key: "won",
                  },
                  {
                    title: "Revenue",
                    dataIndex: "totalRevenue",
                    key: "revenue",
                    render: (val: number) => `R${val.toLocaleString("en-ZA")}`,
                  },
                  {
                    title: "Win rate",
                    dataIndex: "winRate",
                    key: "winRate",
                    render: (val: number) => formatPercent(val),
                  },
                ]}
              />
            </Card>
          </section>

          <Modal
            title="AI Organisation Assistant"
            open={assistantModalOpen}
            onCancel={closeAssistantModal}
            footer={null}
            destroyOnHidden={false}
            className={styles.assistantModal}
          >
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <div className={styles.assistantHero}>
                <Text className={styles.assistantBadge}>Neural Assistant</Text>
                <Text className={styles.assistantHeroText}>
                  Use one prompt to analyze your pipeline, create clients, and navigate instantly.
                </Text>
              </div>
              <Text className={styles.assistantHint}>
                Ask about your organisation, users, opportunities, proposals, contracts, and next steps.
              </Text>
              <Input.TextArea
                className={styles.assistantPromptInput}
                value={assistantPrompt}
                onChange={(event) => setAssistantPrompt(event.target.value)}
                autoSize={{ minRows: 4, maxRows: 8 }}
                placeholder="Example: Who is in my organisation and what roles do they have?"
              />
              <Space className={styles.assistantActions} wrap>
                <Button
                  type="primary"
                  className={styles.assistantPrimaryButton}
                  icon={<RobotOutlined />}
                  loading={assistantLoading}
                  onClick={() => void askAssistant()}
                >
                  Ask AI
                </Button>
                <Button
                  icon={<AudioOutlined />}
                  className={speechListening ? styles.speechButtonActive : styles.speechButton}
                  onClick={toggleSpeechToText}
                  disabled={!speechSupported}
                >
                  {speechListening ? "Stop Voice Input" : "Start Voice Input"}
                </Button>
              </Space>
              <Text className={styles.speechHint}>
                {speechSupported
                  ? speechListening
                    ? "Listening... speak now."
                    : "Use voice or text. Say add/create client and click Ask AI."
                  : "Speech-to-text is not supported in this browser."}
              </Text>
              {assistantError ? <Alert type="error" showIcon message={assistantError} /> : null}
              {speechError ? <Alert type="error" showIcon message={speechError} /> : null}
              {clientCreateError ? <Alert type="error" showIcon message={clientCreateError} /> : null}
              {clientCreateSuccess ? (
                <Alert type="success" showIcon message={clientCreateSuccess} />
              ) : null}
              {assistantResult?.reply ? (
                <div className={styles.assistantAnswer}>
                  <Text className={styles.assistantAnswerText}>{assistantResult.reply}</Text>
                </div>
              ) : null}
              {clientDraftPreview ? (
                <div className={styles.assistantClientPreview}>
                  <Text className={styles.assistantClientPreviewTitle}>Client Created From Prompt</Text>
                  <Text className={styles.assistantClientPreviewText}>
                    Name: {clientDraftPreview.name || "—"}
                  </Text>
                  <Text className={styles.assistantClientPreviewText}>
                    Type: {clientTypeLabel[Number(clientDraftPreview.clientType)] || "—"}
                  </Text>
                  {clientDraftPreview.industry ? (
                    <Text className={styles.assistantClientPreviewText}>
                      Industry: {clientDraftPreview.industry}
                    </Text>
                  ) : null}
                  {clientDraftPreview.website ? (
                    <Text className={styles.assistantClientPreviewText}>
                      Website: {clientDraftPreview.website}
                    </Text>
                  ) : null}
                  {clientDraftNotes.length > 0 ? (
                    <Text className={styles.assistantClientPreviewText}>
                      Notes: {clientDraftNotes.join(" | ")}
                    </Text>
                  ) : null}
                </div>
              ) : null}
            </Space>
          </Modal>
        </>
      )}
    </div>
  );
};

export default DashboardView;
