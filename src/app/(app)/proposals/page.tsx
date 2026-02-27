"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Grid,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAuthenticationState } from "@/provider";
import { ProposalProvider, useProposalActions, useProposalState } from "@/provider";
import type { IProposal } from "@/provider/proposal/context";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const statusColor = (status: number) => {
  switch (status) {
    case 1:
      return "default"; // Draft
    case 2:
      return "processing"; // Submitted
    case 3:
      return "red"; // Rejected
    case 4:
      return "green"; // Approved
    case 5:
      return "volcano"; // Expired
    case 6:
      return "blue"; // Review
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

const ProposalsContent = () => {
  const { styles } = useStyles();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { user } = useAuthenticationState();
  const { getProposals, createProposal, submitProposal, approveProposal, rejectProposal, deleteProposal } =
    useProposalActions();
  const { proposals, isPending, isError, errorMessage, pageNumber, pageSize, totalCount } =
    useProposalState();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [clients, setClients] = useState<Array<{ id: string; name: string | null }>>([]);
  const [opportunities, setOpportunities] = useState<
    Array<{ id: string; title: string | null; clientName: string | null }>
  >([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("Admin");
  const isSalesManager = roles.includes("SalesManager");
  const isBDM = roles.includes("BusinessDevelopmentManager");

  const canCreate = isAdmin || isSalesManager || isBDM;
  const canSubmit = useMemo(
    () => canCreate,
    [canCreate],
  );
  const canApprove = useMemo(
    () => isAdmin || isSalesManager,
    [isAdmin, isSalesManager],
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
      messageApi.error("Failed to load opportunities for client.");
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    void getProposals({ pageNumber: 1, pageSize: 25 });
    void fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!canCreate) {
      messageApi.warning("You do not have permission to create proposals.");
      return;
    }

    try {
      const values = await form.validateFields();
      const success = await createProposal({
        title: values.title,
        clientId: values.clientId,
        opportunityId: values.opportunityId,
        description: values.description || undefined,
        currency: values.currency || "ZAR",
        validUntil: values.validUntil ? values.validUntil.toISOString() : undefined,
      });
      if (success) {
        messageApi.success("Proposal created");
        setIsCreateModalOpen(false);
        form.resetFields();
        void getProposals({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
      }
    } catch {
      // handled by antd
    }
  };

  const handleSubmit = async (id: string) => {
    const success = await submitProposal(id);
    if (success) {
      messageApi.success("Proposal submitted");
      void getProposals({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
    }
  };

  const handleApprove = async (id: string) => {
    const success = await approveProposal(id);
    if (success) {
      messageApi.success("Proposal approved");
      void getProposals({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
    }
  };

  const handleReject = async (id: string) => {
    const success = await rejectProposal(id);
    if (success) {
      messageApi.success("Proposal rejected");
      void getProposals({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteProposal(id);
    if (success) {
      messageApi.success("Proposal deleted");
      void getProposals({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
    }
  };

  const columns: ColumnsType<IProposal> = [
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
        title: "Opportunity",
        dataIndex: "opportunityTitle",
        key: "opportunityTitle",
        width: 220,
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
        title: "Total",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 140,
        render: (_: number, record) => formatCurrency(record.totalAmount, record.currency),
      },
      {
        title: "Valid until",
        dataIndex: "validUntil",
        key: "validUntil",
        width: 160,
        render: (date: string | null) => formatDate(date),
      },
      {
        title: "Actions",
        key: "actions",
        width: 220,
        render: (_, record) => {
          const status = record.status;
          return (
            <Space wrap size={[6, 6]}>
              {status === 1 && canSubmit ? (
                <Button size="small" onClick={() => void handleSubmit(record.id)} loading={isPending}>
                  Submit
                </Button>
              ) : null}
              {status === 2 && canApprove ? (
                <>
                  <Button size="small" type="primary" onClick={() => void handleApprove(record.id)} loading={isPending}>
                    Approve
                  </Button>
                  <Button size="small" danger onClick={() => void handleReject(record.id)} loading={isPending}>
                    Reject
                  </Button>
                </>
              ) : null}
              {status === 1 && canApprove ? (
                <Button size="small" danger onClick={() => void handleDelete(record.id)} loading={isPending}>
                  Delete
                </Button>
              ) : null}
            </Space>
          );
        },
      },
  ];

  return (
    <Card className={styles.card}>
      {contextHolder}
      <Space direction="vertical" size={12} className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <Title level={isMobile ? 4 : 3} className={styles.title}>
              Proposals
            </Title>
            <Text type="secondary" className={styles.subtitle}>
              Manage proposals and approvals.
            </Text>
          </div>
          <div className={styles.actions}>
            <Select
              allowClear
              placeholder="Status"
              className={styles.filterSelect}
              onChange={(val) => {
                setStatusFilter(val);
                void getProposals({
                  pageNumber: 1,
                  pageSize: pageSize ?? 25,
                  status: val,
                });
              }}
              options={[
                { label: "Draft", value: 1 },
                { label: "Submitted", value: 2 },
                { label: "Rejected", value: 3 },
                { label: "Approved", value: 4 },
                { label: "Expired", value: 5 },
                { label: "Review", value: 6 },
              ]}
            />
            {canCreate ? (
              <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
                New Proposal
              </Button>
            ) : null}
          </div>
        </div>

        {isError && <Alert type="error" showIcon message={errorMessage || "Failed to load proposals."} />}

        <Table
          className={styles.table}
          size="middle"
          rowKey="id"
          columns={columns}
          dataSource={proposals ?? []}
          loading={isPending}
          scroll={{ x: 1100 }}
          pagination={{
            current: pageNumber ?? 1,
            pageSize: pageSize ?? 25,
            total: totalCount ?? proposals?.length ?? 0,
            showSizeChanger: !isMobile,
          }}
          onChange={(pagination) =>
            void getProposals({
              pageNumber: pagination.current ?? 1,
              pageSize: pagination.pageSize ?? 25,
              status: statusFilter,
            })
          }
        />
      </Space>

      <Modal
        title="Create Proposal"
        open={isCreateModalOpen}
        onOk={handleCreate}
        onCancel={() => setIsCreateModalOpen(false)}
        okText="Create"
        confirmLoading={isPending}
        width={isMobile ? "calc(100vw - 24px)" : 640}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Enter a title" }]}
          >
            <Input placeholder="Proposal title" />
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
          <Form.Item
            name="opportunityId"
            label="Opportunity"
            rules={[{ required: true, message: "Select an opportunity" }]}
          >
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
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
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
          <Form.Item name="validUntil" label="Valid Until">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

const ProposalsPage = () => (
  <ProposalProvider>
    <ProposalsContent />
  </ProposalProvider>
);

export default ProposalsPage;
