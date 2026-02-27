"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { useAuthenticationState } from "@/provider";
import { ContractProvider, useContractActions, useContractState } from "@/provider";
import type { CreateContractDto, IContract, UpdateContractDto } from "@/provider/contract/context";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const statusColor = (status: number) => {
  switch (status) {
    case 1:
      return "default"; // Draft
    case 2:
      return "blue"; // Active
    case 3:
      return "red"; // Expired
    case 4:
      return "green"; // Renewed
    case 5:
      return "volcano"; // Cancelled
    default:
      return "default";
  }
};

const formatCurrency = (value: number, currency?: string | null) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date?: string | null) =>
  date
    ? new Intl.DateTimeFormat("en-ZA", { year: "numeric", month: "short", day: "numeric" }).format(
        new Date(date),
      )
    : "—";

type TermsAiMode = "draft" | "improve";

interface TermsAiResponse {
  terms: string;
  notes: string[];
}

interface ContractFormValues {
  title: string;
  clientId: string;
  opportunityId?: string;
  proposalId?: string;
  contractValue: number;
  currency?: string;
  startDate?: Dayjs;
  endDate?: Dayjs;
  ownerId: string;
  renewalNoticePeriod: number;
  autoRenew?: boolean;
  terms?: string;
}

const ContractsContent = () => {
  const { styles } = useStyles();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { user } = useAuthenticationState();
  const { getContracts, createContract, updateContract, deleteContract, activateContract, cancelContract } =
    useContractActions();
  const { contracts, isPending, isError, errorMessage, pageNumber, pageSize, totalCount } = useContractState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTermsAiModalOpen, setIsTermsAiModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form] = Form.useForm<ContractFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [clients, setClients] = useState<Array<{ id: string; name: string | null }>>([]);
  const [opportunities, setOpportunities] = useState<
    Array<{ id: string; title: string | null; clientName: string | null }>
  >([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [selectedContract, setSelectedContract] = useState<IContract | null>(null);
  const [termsAiMode, setTermsAiMode] = useState<TermsAiMode>("draft");
  const [termsAiInstruction, setTermsAiInstruction] = useState("");
  const [termsAiLoading, setTermsAiLoading] = useState(false);
  const [termsAiError, setTermsAiError] = useState<string | undefined>(undefined);
  const [termsAiResult, setTermsAiResult] = useState("");
  const [termsAiNotes, setTermsAiNotes] = useState<string[]>([]);

  const canActivate = useMemo(
    () => user?.roles?.some((r) => ["Admin", "SalesManager"].includes(r)),
    [user?.roles],
  );
  const canEdit = useMemo(
    () => user?.roles?.some((r) => ["Admin", "SalesManager", "BusinessDevelopmentManager"].includes(r)),
    [user?.roles],
  );
  const canCreate = useMemo(
    () => user?.roles?.some((r) => ["Admin", "SalesManager", "BusinessDevelopmentManager"].includes(r)),
    [user?.roles],
  );
  const canDelete = useMemo(
    () => user?.roles?.some((r) => ["Admin", "SalesManager"].includes(r)),
    [user?.roles],
  );

  const fetchLookups = async () => {
    setLookupLoading(true);
    try {
      const instance = getAxiosInstace();
      const [clientsRes, oppRes] = await Promise.all([
        instance.get("/api/Clients?pageNumber=1&pageSize=100"),
        instance.get("/api/Opportunities?pageNumber=1&pageSize=100"),
      ]);
      const clientItemsRaw = Array.isArray(clientsRes.data?.items)
        ? clientsRes.data.items
        : Array.isArray(clientsRes.data)
          ? clientsRes.data
          : [];
      setClients(
        (clientItemsRaw as Array<{ id: string; name?: string | null }>).map((c) => ({
          id: c.id,
          name: c.name ?? null,
        })),
      );

      const oppItemsRaw = Array.isArray(oppRes.data?.items)
        ? oppRes.data.items
        : Array.isArray(oppRes.data)
          ? oppRes.data
          : [];
      setOpportunities(
        (oppItemsRaw as Array<{ id: string; title?: string | null; clientName?: string | null }>).map(
          (o) => ({
            id: o.id,
            title: o.title ?? null,
            clientName: o.clientName ?? null,
          }),
        ),
      );
    } catch {
      messageApi.error("Failed to load clients/opportunities.");
    } finally {
      setLookupLoading(false);
    }
  };

  const fetchOpportunitiesByClient = async (clientId?: string) => {
    setLookupLoading(true);
    try {
      const instance = getAxiosInstace();
      const qs = clientId ? `&clientId=${clientId}` : "";
      const { data } = await instance.get(`/api/Opportunities?pageNumber=1&pageSize=100${qs}`);
      const oppItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setOpportunities(
        (oppItems as Array<{ id: string; title?: string | null; clientName?: string | null }>).map(
          (o) => ({
            id: o.id,
            title: o.title ?? null,
            clientName: o.clientName ?? null,
          }),
        ),
      );
    } catch {
      messageApi.error("Failed to load opportunities.");
    } finally {
      setLookupLoading(false);
    }
  };

  const openTermsAiModal = () => {
    const existingTerms = String(form.getFieldValue("terms") ?? "").trim();
    setTermsAiMode(existingTerms ? "improve" : "draft");
    setTermsAiInstruction("");
    setTermsAiError(undefined);
    setTermsAiResult("");
    setTermsAiNotes([]);
    setIsTermsAiModalOpen(true);
  };

  const askTermsAssistant = async () => {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("auth_token")
        : null;
    if (!token) {
      setTermsAiError("You are not authenticated. Please login again.");
      return;
    }

    const values = form.getFieldsValue([
      "title",
      "clientId",
      "proposalId",
      "contractValue",
      "currency",
      "startDate",
      "endDate",
      "autoRenew",
      "renewalNoticePeriod",
      "terms",
    ]) as Partial<ContractFormValues>;

    const currentTerms = String(values.terms ?? "");
    if (termsAiMode === "improve" && !currentTerms.trim()) {
      setTermsAiError("Add existing terms first, then run review and improvement.");
      return;
    }

    const clientName = clients.find((item) => item.id === values.clientId)?.name ?? "";
    const startDate = values.startDate ? dayjs(values.startDate).toISOString() : "";
    const endDate = values.endDate ? dayjs(values.endDate).toISOString() : "";

    setTermsAiLoading(true);
    setTermsAiError(undefined);

    try {
      const response = await fetch("/api/assistant/contract-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode: termsAiMode,
          instruction: termsAiInstruction.trim() || undefined,
          currentTerms: currentTerms || undefined,
          contract: {
            title: values.title ?? "",
            clientName,
            proposalId: values.proposalId ?? "",
            contractValue:
              values.contractValue != null && Number.isFinite(Number(values.contractValue))
                ? Number(values.contractValue)
                : undefined,
            currency: values.currency ?? "ZAR",
            startDate,
            endDate,
            renewalNoticePeriod:
              values.renewalNoticePeriod != null
                ? Number(values.renewalNoticePeriod)
                : undefined,
            autoRenew: Boolean(values.autoRenew),
          },
        }),
      });

      const data = (await response.json()) as Partial<TermsAiResponse> & { message?: string };
      if (!response.ok) {
        throw new Error(
          typeof data.message === "string" && data.message.trim()
            ? data.message
            : "Failed to get AI contract terms.",
        );
      }

      const generatedTerms =
        typeof data.terms === "string" ? data.terms.trim() : "";
      if (!generatedTerms) {
        throw new Error("AI did not return contract terms. Please try again.");
      }

      setTermsAiResult(generatedTerms);
      setTermsAiNotes(Array.isArray(data.notes) ? data.notes.filter((n) => typeof n === "string") : []);
    } catch (err: unknown) {
      setTermsAiError(
        err instanceof Error ? err.message : "Failed to get AI contract terms.",
      );
    } finally {
      setTermsAiLoading(false);
    }
  };

  const applyTermsFromAssistant = () => {
    if (!termsAiResult.trim()) {
      setTermsAiError("Generate or review terms first.");
      return;
    }
    form.setFieldValue("terms", termsAiResult);
    setIsTermsAiModalOpen(false);
  };

  useEffect(() => {
    void getContracts({ pageNumber: 1, pageSize: 25 });
    void fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateOrUpdate = async () => {
    if (isEdit && !canEdit) {
      messageApi.error("You do not have permission to edit contracts.");
      return;
    }
    if (!isEdit && !canCreate) {
      messageApi.error("You do not have permission to create contracts.");
      return;
    }

    try {
      const values = await form.validateFields();
      const payload: CreateContractDto & Partial<UpdateContractDto> = {
        title: values.title,
        clientId: values.clientId,
        opportunityId: values.opportunityId || undefined,
        proposalId: values.proposalId || undefined,
        contractValue: Number(values.contractValue),
        currency: values.currency || "ZAR",
        startDate: values.startDate!.toISOString(),
        endDate: values.endDate!.toISOString(),
        ownerId: values.ownerId,
        renewalNoticePeriod: Number(values.renewalNoticePeriod),
        autoRenew: values.autoRenew ?? false,
        terms: values.terms || undefined,
      };

      let success = false;
      if (isEdit && selectedContract) {
        success = await updateContract(selectedContract.id, payload);
      } else {
        success = await createContract(payload);
      }
      if (success) {
        messageApi.success(isEdit ? "Contract updated" : "Contract created");
        setIsModalOpen(false);
        setIsEdit(false);
        setSelectedContract(null);
        form.resetFields();
        void getContracts({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
      }
    } catch {
      // handled by antd
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteContract(id);
    if (success) {
      messageApi.success("Contract deleted");
      void getContracts({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
    }
  };

  const handleActivate = async (id: string) => {
    const success = await activateContract(id);
    if (success) {
      messageApi.success("Contract activated");
      void getContracts({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
    }
  };

  const handleCancel = async (id: string) => {
    const success = await cancelContract(id);
    if (success) {
      messageApi.success("Contract cancelled");
      void getContracts({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
    }
  };

  const columns: ColumnsType<IContract> = [
    {
      title: "Title",
      dataIndex: "title",
        key: "title",
        width: 220,
        render: (text: string | null) => text ?? "Untitled",
      },
      {
        title: "Client",
        dataIndex: "clientName",
        key: "clientName",
        width: 180,
        render: (text: string | null) => text ?? "—",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (_: number, record) => (
          <Tag color={statusColor(record.status)}>{record.statusName ?? record.status}</Tag>
        ),
      },
      {
        title: "Value",
        dataIndex: "contractValue",
        key: "contractValue",
        width: 150,
        render: (_: number, record) => formatCurrency(record.contractValue, record.currency),
      },
      {
        title: "End date",
        dataIndex: "endDate",
        key: "endDate",
        width: 150,
        render: (date: string | null) => formatDate(date),
      },
      {
        title: "Days to expiry",
        dataIndex: "daysUntilExpiry",
        key: "daysUntilExpiry",
        width: 150,
        render: (val: number) => (val !== undefined && val !== null ? val : "—"),
      },
      {
        title: "Owner",
        dataIndex: "ownerName",
        key: "ownerName",
        width: 180,
        render: (text: string | null) => text ?? "—",
      },
      {
        title: "Actions",
        key: "actions",
        width: 240,
        render: (_, record) => (
          <Space wrap size={[6, 6]}>
            {canEdit ? (
              <Button
                size="small"
                onClick={() => {
                  setIsEdit(true);
                  setSelectedContract(record);
                  setIsModalOpen(true);
                  form.setFieldsValue({
                    title: record.title ?? "",
                    clientId: record.clientId,
                    opportunityId: record.opportunityId || undefined,
                    proposalId: record.proposalId || undefined,
                    contractValue: record.contractValue,
                    currency: record.currency || "ZAR",
                    startDate: record.startDate ? dayjs(record.startDate) : undefined,
                    endDate: record.endDate ? dayjs(record.endDate) : undefined,
                    ownerId: record.ownerId,
                    renewalNoticePeriod: record.renewalNoticePeriod,
                    autoRenew: record.autoRenew,
                    terms: record.terms ?? "",
                  });
                  void fetchOpportunitiesByClient(record.clientId);
                }}
              >
                Edit
              </Button>
            ) : null}
            {record.status === 1 && canActivate ? (
              <Button size="small" type="primary" onClick={() => void handleActivate(record.id)} loading={isPending}>
                Activate
              </Button>
            ) : null}
            {record.status === 2 && canActivate ? (
              <Button size="small" danger onClick={() => void handleCancel(record.id)} loading={isPending}>
                Cancel
              </Button>
            ) : null}
            {canDelete && (
              <Button size="small" danger onClick={() => void handleDelete(record.id)} loading={isPending}>
                Delete
              </Button>
            )}
          </Space>
        ),
      },
  ];

  return (
    <Card className={styles.card}>
      {contextHolder}
      <Space direction="vertical" size={12} className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <Title level={isMobile ? 4 : 3} className={styles.title}>
              Contracts
            </Title>
            <Text type="secondary" className={styles.subtitle}>
              Manage contracts through activation and expiry.
            </Text>
          </div>
          <div className={styles.actions}>
            <Select
              allowClear
              placeholder="Status"
              className={styles.filterSelect}
              onChange={(val) => {
                setStatusFilter(val);
                void getContracts({
                  pageNumber: 1,
                  pageSize: pageSize ?? 25,
                  status: val,
                });
              }}
              options={[
                { label: "Draft", value: 1 },
                { label: "Active", value: 2 },
                { label: "Expired", value: 3 },
                { label: "Renewed", value: 4 },
                { label: "Cancelled", value: 5 },
              ]}
            />
            {canCreate ? (
              <Button type="primary" onClick={() => { setIsModalOpen(true); setIsEdit(false); form.resetFields(); }}>
                New Contract
              </Button>
            ) : null}
          </div>
        </div>

        {isError && <Alert type="error" showIcon message={errorMessage || "Failed to load contracts."} />}

        <Table
          className={styles.table}
          size={isMobile ? "small" : "middle"}
          rowKey="id"
          columns={columns}
          dataSource={contracts ?? []}
          loading={isPending}
          scroll={{ x: 1200 }}
          pagination={{
            current: pageNumber ?? 1,
            pageSize: pageSize ?? 25,
            total: totalCount ?? contracts?.length ?? 0,
            showSizeChanger: !isMobile,
          }}
          onChange={(pagination) =>
            void getContracts({
              pageNumber: pagination.current ?? 1,
              pageSize: pagination.pageSize ?? 25,
              status: statusFilter,
            })
          }
        />
      </Space>

      <Modal
        title={isEdit ? "Edit Contract" : "Create Contract"}
        open={isModalOpen}
        onOk={handleCreateOrUpdate}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEdit(false);
          setSelectedContract(null);
          form.resetFields();
        }}
        okText={isEdit ? "Save" : "Create"}
        confirmLoading={isPending}
        width={isMobile ? "calc(100vw - 24px)" : 700}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Enter a title" }]}
          >
            <Input placeholder="Contract title" />
          </Form.Item>
          <Form.Item
            name="clientId"
            label="Client"
            rules={[{ required: true, message: "Select a client" }]}
          >
            <Select
              showSearch
              loading={lookupLoading}
              optionFilterProp="label"
              placeholder="Select client"
              onChange={(val) => {
                form.setFieldsValue({ opportunityId: undefined });
                void fetchOpportunitiesByClient(val);
              }}
              options={clients.map((c) => ({ label: c.name || c.id, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="opportunityId" label="Opportunity">
            <Select
              showSearch
              loading={lookupLoading}
              optionFilterProp="label"
              placeholder="Select opportunity"
              options={opportunities.map((o) => ({
                label: o.title || o.id,
                value: o.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="proposalId" label="Proposal ID (optional)">
            <Input placeholder="Proposal UUID" />
          </Form.Item>
          <Form.Item
            name="contractValue"
            label="Contract Value"
            rules={[{ required: true, message: "Enter contract value" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} step={1000} />
          </Form.Item>
          <Form.Item name="currency" label="Currency">
            <Select
              allowClear
              placeholder="Currency"
              defaultValue="ZAR"
              options={[
                { label: "ZAR", value: "ZAR" },
                { label: "USD", value: "USD" },
                { label: "EUR", value: "EUR" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Select start date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: "Select end date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="ownerId"
            label="Owner ID"
            rules={[{ required: true, message: "Enter owner user ID" }]}
          >
            <Input placeholder="Owner user UUID" />
          </Form.Item>
          <Form.Item
            name="renewalNoticePeriod"
            label="Renewal notice period (days)"
            rules={[{ required: true, message: "Enter notice period" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item name="autoRenew" label="Auto renew" valuePropName="checked">
            <Select
              options={[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="terms"
            label={
              <div className={styles.termsLabelRow}>
                <span>Terms</span>
                <Button
                  size="small"
                  className={styles.termsAiButton}
                  onClick={openTermsAiModal}
                >
                  AI Assist
                </Button>
              </div>
            }
          >
            <Input.TextArea rows={4} placeholder="Enter terms or use AI Assist to generate/review." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="AI Terms Assistant"
        open={isTermsAiModalOpen}
        onCancel={() => setIsTermsAiModalOpen(false)}
        footer={null}
        width={isMobile ? "calc(100vw - 24px)" : 760}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Space direction="vertical" size={12} className={styles.termsAiModalBody}>
          <Text type="secondary" className={styles.termsAiHint}>
            Draft new contract terms or review grammar and spelling for existing terms. Always do a final legal review before sending.
          </Text>
          <Space wrap>
            <Select<TermsAiMode>
              value={termsAiMode}
              style={{ width: 220 }}
              onChange={(value) => setTermsAiMode(value)}
              options={[
                { label: "Draft Contract Terms", value: "draft" },
                { label: "Review Grammar & Spelling", value: "improve" },
              ]}
            />
            <Button type="primary" loading={termsAiLoading} onClick={() => void askTermsAssistant()}>
              {termsAiMode === "draft" ? "Generate Draft" : "Review Terms"}
            </Button>
          </Space>
          <Input.TextArea
            value={termsAiInstruction}
            onChange={(event) => setTermsAiInstruction(event.target.value)}
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder="Optional instructions, e.g. formal tone, include cancellation clause, monthly billing."
          />
          {termsAiError ? <Alert type="error" showIcon message={termsAiError} /> : null}
          <Input.TextArea
            value={termsAiResult}
            onChange={(event) => setTermsAiResult(event.target.value)}
            autoSize={{ minRows: 8, maxRows: 14 }}
            placeholder="AI-generated terms will appear here."
          />
          {termsAiNotes.length ? (
            <div className={styles.termsAiNotes}>
              {termsAiNotes.map((note) => (
                <Text key={note} className={styles.termsAiNoteItem}>
                  • {note}
                </Text>
              ))}
            </div>
          ) : null}
          <Space>
            <Button type="primary" onClick={applyTermsFromAssistant} disabled={!termsAiResult.trim()}>
              Use in Contract
            </Button>
            <Button onClick={() => setIsTermsAiModalOpen(false)}>Close</Button>
          </Space>
        </Space>
      </Modal>
    </Card>
  );
};

const ContractsPage = () => (
  <ContractProvider>
    <ContractsContent />
  </ContractProvider>
);

export default ContractsPage;
