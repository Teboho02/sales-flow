"use client";

import { Alert, Avatar, Button, Drawer, Grid, Input, Layout, Menu, Modal, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  AudioOutlined,
  BarChartOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  LineChartOutlined,
  MenuOutlined,
  RobotOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { withAuth } from "@/hoc";
import { useAuthenticationState } from "@/provider";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useStyles } from "./_components/style/styles";

const { Sider, Header, Content } = Layout;
const { useBreakpoint } = Grid;
const { Text } = Typography;

interface AppGroupLayoutProps {
  children: React.ReactNode;
}

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

const clientTypeLabel: Record<number, string> = {
  1: "Government",
  2: "Private",
  3: "Partner",
};

const routeLabelMap: Record<string, string> = {
  "/home": "Dashboard",
  "/opportunities": "Opportunities",
  "/pricing-requests": "Pricing Requests",
  "/proposals": "Proposals",
  "/contracts": "Contracts",
  "/activities": "Activities",
  "/clients": "Clients",
  "/contacts": "Contacts",
  "/assistant": "AI Assistant",
  "/reports": "Reports",
};

const routeMenuKeyMap: Record<string, string> = {
  "/home": "dashboard",
  "/opportunities": "opportunities",
  "/pricing-requests": "pricing-requests",
  "/proposals": "proposals",
  "/contracts": "contracts",
  "/activities": "activities",
  "/clients": "clients",
  "/contacts": "contacts",
  "/assistant": "assistant",
  "/reports": "reports",
};

const getUserInitials = (firstName?: string, lastName?: string, email?: string) => {
  const firstInitial = firstName?.trim().charAt(0);
  const lastInitial = lastName?.trim().charAt(0);
  const pair = `${firstInitial ?? ""}${lastInitial ?? ""}`.toUpperCase();

  if (pair) {
    return pair;
  }

  const fallback = email?.trim().charAt(0).toUpperCase();
  return fallback ? `${fallback}${fallback}` : "SF";
};

const AppGroupLayout = ({ children }: AppGroupLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthenticationState();
  const { styles } = useStyles();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const currentTab = routeLabelMap[pathname] ?? "Dashboard";
  const selectedKey = routeMenuKeyMap[pathname] ?? "dashboard";
  const initials = getUserInitials(user?.firstName, user?.lastName, user?.email);

  // AI Assistant state
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | undefined>(undefined);
  const [assistantResult, setAssistantResult] = useState<AssistantResult | null>(null);
  const [assistantResultAt, setAssistantResultAt] = useState<string | null>(null);
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);
  const [clientCreateError, setClientCreateError] = useState<string | undefined>(undefined);
  const [clientCreateSuccess, setClientCreateSuccess] = useState<string | undefined>(undefined);
  const [clientDraftPreview, setClientDraftPreview] = useState<ClientDraftFields | null>(null);
  const [clientDraftNotes, setClientDraftNotes] = useState<string[]>([]);
  const [speechSupported, setSpeechSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    const speechWindow = window as SpeechWindow;
    return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition);
  });
  const [speechListening, setSpeechListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | undefined>(undefined);
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const speechPromptBaseRef = useRef("");
  const speechFinalRef = useRef("");

  const instance = useMemo(() => getAxiosInstace(), []);

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

  const openAssistantModal = () => {
    setAssistantModalOpen(true);
    setAssistantError(undefined);
    setClientCreateError(undefined);
    setClientCreateSuccess(undefined);
    setSpeechError(undefined);
    setIsMobileNavOpen(false);
  };

  const isClientCreationPrompt = (prompt: string): boolean => {
    const normalized = prompt.toLowerCase();
    return (
      /(add|create|new|register)\s+(a\s+)?client/.test(normalized) ||
      (normalized.includes("client") &&
        (normalized.includes("add") || normalized.includes("create") || normalized.includes("register")))
    );
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
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
        : err instanceof Error
          ? err.message
          : "Failed to create client with AI.";
      setClientCreateError(message);
    }
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
    setAssistantResult(null);
    setAssistantResultAt(null);
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
      setAssistantResultAt(
        new Intl.DateTimeFormat("en-ZA", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date()),
      );
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

  const promptLength = assistantPrompt.trim().length;
  const clientIntentDetected = isClientCreationPrompt(assistantPrompt);

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
      setIsMobileNavOpen(false);
    },
    [router],
  );

  const menuItems = useMemo<Required<MenuProps>["items"]>(
    () => [
      {
        key: "overview-section",
        type: "group",
        label: <span className={styles.sectionLabel}>Overview</span>,
        children: [
          {
            key: "dashboard",
            icon: <BarChartOutlined />,
            label: "Dashboard",
            onClick: () => handleNavigate("/home"),
          },
        ],
      },
      {
        key: "sales-section",
        type: "group",
        label: <span className={styles.sectionLabel}>Sales</span>,
        children: [
          {
            key: "opportunities",
            icon: <UnorderedListOutlined />,
            label: "Opportunities",
            onClick: () => handleNavigate("/opportunities"),
          },
          {
            key: "proposals",
            icon: <FileTextOutlined />,
            label: "Proposals",
            onClick: () => handleNavigate("/proposals"),
          },
          {
            key: "pricing-requests",
            icon: <DollarCircleOutlined />,
            label: "Pricing Requests",
            onClick: () => handleNavigate("/pricing-requests"),
          },
          {
            key: "contracts",
            icon: <FileDoneOutlined />,
            label: "Contracts",
            onClick: () => handleNavigate("/contracts"),
          },
          {
            key: "activities",
            icon: <CalendarOutlined />,
            label: "Activities",
            onClick: () => handleNavigate("/activities"),
          },
        ],
      },
      {
        key: "orm-section",
        type: "group",
        label: <span className={styles.sectionLabel}>ORM</span>,
        children: [
          {
            key: "clients",
            icon: <TeamOutlined />,
            label: "Clients",
            onClick: () => handleNavigate("/clients"),
          },
          {
            key: "contacts",
            icon: <UserOutlined />,
            label: "Contacts",
            onClick: () => handleNavigate("/contacts"),
          },
        ],
      },
      {
        key: "insights-section",
        type: "group",
        label: <span className={styles.sectionLabel}>Insights</span>,
        children: [
          {
            key: "reports",
            icon: <LineChartOutlined />,
            label: "Reports",
            onClick: () => handleNavigate("/reports"),
          },
        ],
      },
    ],
    [handleNavigate, styles.sectionLabel],
  );

  const askAiButton = (
    <Button
      className={styles.sidebarAskAiButton}
      icon={<RobotOutlined />}
      onClick={openAssistantModal}
      block
    >
      Ask AI
    </Button>
  );

  return (
    <Layout className={styles.appLayout}>
      {!isMobile ? (
        <Sider width={252} className={styles.sidebar}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>SF</div>
            <span className={styles.brandText}>Sales Flow</span>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            className={styles.navMenu}
          />
          <div className={styles.sidebarFooter}>{askAiButton}</div>
        </Sider>
      ) : null}
      <Layout className={styles.mainLayout}>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                className={styles.mobileMenuButton}
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation"
              />
            ) : null}
            <span className={styles.headerCurrentTab}>{currentTab}</span>
          </div>
          <div className={styles.headerRight}>
            <Avatar
              size={36}
              className={styles.profileAvatar}
              onClick={() => router.push("/profile")}
              style={{ cursor: "pointer" }}
            >
              {initials}
            </Avatar>
          </div>
        </Header>
        <Content className={styles.content}>{children}</Content>
      </Layout>
      {isMobile ? (
        <Drawer
          title="Sales Flow"
          placement="left"
          width={252}
          open={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          className={styles.mobileDrawer}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            className={styles.navMenu}
          />
          <div className={styles.sidebarFooter}>{askAiButton}</div>
        </Drawer>
      ) : null}

      <Modal
        title="AI Organisation Assistant"
        open={assistantModalOpen}
        onCancel={closeAssistantModal}
        footer={null}
        destroyOnHidden={false}
        className={styles.assistantModal}
      >
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Text className={styles.assistantHint}>
            Ask about your organisation, users, opportunities, proposals, contracts, and next steps.
          </Text>
          <Input.TextArea
            className={styles.assistantPromptInput}
            value={assistantPrompt}
            onChange={(event) => setAssistantPrompt(event.target.value)}
            autoSize={{ minRows: 4, maxRows: 8 }}
            onPressEnter={(event) => {
              if ((event.ctrlKey || event.metaKey) && !assistantLoading) {
                event.preventDefault();
                void askAssistant();
              }
            }}
            placeholder="Example: Who is in my organisation and what roles do they have?"
          />
          <div className={styles.assistantPromptMeta}>
            <Text className={styles.assistantPromptCount}>{promptLength} chars</Text>
            <span
              className={
                clientIntentDetected
                  ? styles.assistantIntentBadgeClient
                  : styles.assistantIntentBadge
              }
            >
              {clientIntentDetected ? "Client Creation Intent" : "General Assistant Query"}
            </span>
          </div>
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
          <div className={styles.voiceLivePanel}>
            <Text className={styles.speechHint}>
              {speechSupported
                ? speechListening
                  ? "Listening live... speak your prompt now."
                  : "Use voice or text. Say add/create client and click Ask AI."
                : "Speech-to-text is not supported in this browser."}
            </Text>
            {speechListening ? (
              <div className={styles.voiceWave} aria-hidden>
                {Array.from({ length: 8 }).map((_, index) => (
                  <span
                    key={index}
                    className={styles.voiceWaveBar}
                    style={{ animationDelay: `${index * 0.08}s` }}
                  />
                ))}
              </div>
            ) : null}
          </div>
          {assistantLoading ? (
            <div className={styles.assistantThinking}>
              <Text className={styles.assistantThinkingText}>AI is thinking</Text>
              <div className={styles.assistantThinkingDots} aria-hidden>
                <span className={styles.assistantThinkingDot} />
                <span className={styles.assistantThinkingDot} />
                <span className={styles.assistantThinkingDot} />
              </div>
            </div>
          ) : null}
          {assistantError ? <Alert type="error" showIcon message={assistantError} /> : null}
          {speechError ? <Alert type="error" showIcon message={speechError} /> : null}
          {clientCreateError ? <Alert type="error" showIcon message={clientCreateError} /> : null}
          {clientCreateSuccess ? (
            <Alert type="success" showIcon message={clientCreateSuccess} />
          ) : null}
          {assistantResult?.reply ? (
            <div className={styles.assistantAnswer}>
              <div className={styles.assistantAnswerHeader}>
                <Text className={styles.assistantAnswerLabel}>AI Response</Text>
                {assistantResultAt ? (
                  <Text className={styles.assistantAnswerTime}>{assistantResultAt}</Text>
                ) : null}
              </div>
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
    </Layout>
  );
};

export default withAuth(AppGroupLayout);
