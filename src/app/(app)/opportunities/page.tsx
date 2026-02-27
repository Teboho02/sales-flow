"use client";

import { useEffect, useState } from "react";
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
import {
  OpportunityProvider,
  useAuthenticationState,
  useOpportunityActions,
  useOpportunityState,
} from "@/provider";
import type { IOpportunity } from "@/provider/opportunity/context";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const stageColor = (stage: number) => {
  switch (stage) {
    case 1:
      return "default"; // Lead
    case 2:
      return "processing"; // Qualified
    case 3:
      return "cyan"; // Proposal
    case 4:
      return "blue"; // Negotiation
    case 5:
      return "green"; // Closed Won
    case 6:
      return "red"; // Closed Lost
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
  date ? new Intl.DateTimeFormat("en-ZA", { year: "numeric", month: "short", day: "numeric" }).format(new Date(date)) : "—";

const formatUserLabel = (user: {
  id: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}) => {
  const fullName =
    user.fullName ??
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ??
    "";
  const safeFullName = fullName || "Unnamed user";
  const emailPart = user.email ? ` (${user.email})` : "";
  return `${safeFullName}${emailPart}`;
};

const OpportunitiesView = () => {
  const { styles } = useStyles();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { user } = useAuthenticationState();
  const { getOpportunities, createOpportunity, updateStage, assignOpportunity, deleteOpportunity } =
    useOpportunityActions();
  const {
    opportunities,
    isPending,
    isError,
    errorMessage,
    pageNumber,
    pageSize,
    totalCount,
  } = useOpportunityState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [clients, setClients] = useState<Array<{ id: string; name: string | null }>>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [users, setUsers] = useState<Array<{
    id: string;
    fullName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  }>>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<IOpportunity | null>(null);
  const [stageForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("Admin");
  const isSalesManager = roles.includes("SalesManager");
  const isBDM = roles.includes("BusinessDevelopmentManager");
  const isSalesRep = roles.includes("SalesRep");

  const restrictToOwner = isSalesRep && !isAdmin && !isSalesManager && !isBDM;
  const ownerFilter = restrictToOwner ? user?.userId : undefined;
  const canCreate = isAdmin || isSalesManager || isBDM;
  const canChangeStage = isAdmin || isSalesManager;
  const canAssign = isAdmin || isSalesManager;
  const canDelete = isAdmin || isSalesManager;

  const refreshList = (page = pageNumber ?? 1, size = pageSize ?? 25) =>
    getOpportunities({ pageNumber: page, pageSize: size, ownerId: ownerFilter });

  useEffect(() => {
    if (!user) return;
    if (restrictToOwner && !ownerFilter) return;
    void refreshList(1, 25);
    if (canCreate) {
      void fetchClients();
    }
    if (canAssign) {
      void fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, ownerFilter, canCreate, canAssign, restrictToOwner]);

  const fetchClients = async () => {
    setClientsLoading(true);
    try {
      const instance = getAxiosInstace();
      const { data } = await instance.get("/api/Clients?pageNumber=1&pageSize=100");
      if (Array.isArray(data.items)) {
        const mapped = (data.items as Array<{ id: string; name?: string | null }>).map((c) => ({
          id: c.id,
          name: c.name ?? null,
        }));
        setClients(mapped);
      } else if (Array.isArray(data)) {
        const mapped = (data as Array<{ id: string; name?: string | null }>).map((c) => ({
          id: c.id,
          name: c.name ?? null,
        }));
        setClients(mapped);
      }
    } catch {
      messageApi.error("Failed to load clients for selection.");
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const instance = getAxiosInstace();
      const { data } = await instance.get("/api/users?pageNumber=1&pageSize=200");
      const rawItems = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      const mapped = (
        rawItems as Array<{
          id: string;
          fullName?: string | null;
          firstName?: string | null;
          lastName?: string | null;
          email?: string | null;
        }>
      ).map((u) => ({
        id: u.id,
        fullName: u.fullName ?? null,
        firstName: u.firstName ?? null,
        lastName: u.lastName ?? null,
        email: u.email ?? null,
      }));
      setUsers(mapped);
    } catch {
      setUsers([]);
      messageApi.error("Failed to load users for assignment.");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const success = await createOpportunity({
        title: values.title,
        clientId: values.clientId,
        contactId: values.contactId || undefined,
        estimatedValue: Number(values.estimatedValue),
        currency: values.currency || "ZAR",
        probability: Number(values.probability),
        source: Number(values.source),
        expectedCloseDate: values.expectedCloseDate
          ? values.expectedCloseDate.toISOString()
          : undefined,
        description: values.description || undefined,
      });
      if (success) {
        messageApi.success("Opportunity created");
        setIsModalOpen(false);
        form.resetFields();
        void refreshList(pageNumber ?? 1, pageSize ?? 25);
      }
    } catch {
      // validation errors are handled by antd; API errors already surfaced by provider alert
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteOpportunity(id);
    if (success) {
      messageApi.success("Opportunity deleted");
      void refreshList(pageNumber ?? 1, pageSize ?? 25);
    }
  };

  const handleStageUpdate = async () => {
    if (!canChangeStage) {
      messageApi.error("You do not have permission to change opportunity stage.");
      return;
    }

    try {
      const values = await stageForm.validateFields();
      if (!selectedOpportunity) return;
      const success = await updateStage(selectedOpportunity.id, {
        stage: values.newStage,
        notes: values.notes || undefined,
        lossReason: values.lossReason || undefined,
      });
      if (success) {
        messageApi.success("Stage updated");
        setStageModalOpen(false);
        stageForm.resetFields();
        void refreshList(pageNumber ?? 1, pageSize ?? 25);
      }
    } catch {
      // handled by antd
    }
  };

  const handleAssign = async () => {
    try {
      const values = await assignForm.validateFields();
      if (!selectedOpportunity) return;
      const success = await assignOpportunity(selectedOpportunity.id, {
        userId: values.userId,
      });
      if (success) {
        messageApi.success("Assigned");
        setAssignModalOpen(false);
        assignForm.resetFields();
        void refreshList(pageNumber ?? 1, pageSize ?? 25);
      }
    } catch {
      // handled by antd
    }
  };

  const columns: ColumnsType<IOpportunity> = [
    {
      title: "Title",
      dataIndex: "title",
        key: "title",
        render: (text: string | null) => text ?? "Untitled",
      },
      {
        title: "Client",
        dataIndex: "clientName",
        key: "clientName",
        render: (text: string | null) => text ?? "—",
      },
      {
        title: "Stage",
        dataIndex: "stageName",
        key: "stage",
        render: (_: string | null, record) => (
          <Tag color={stageColor(record.stage)}>{record.stageName ?? `Stage ${record.stage}`}</Tag>
        ),
      },
      {
        title: "Est. Value",
        dataIndex: "estimatedValue",
        key: "estimatedValue",
        render: (_: number, record) => formatCurrency(record.estimatedValue, record.currency),
      },
      {
        title: "Probability",
        dataIndex: "probability",
        key: "probability",
        render: (val: number) => `${val}%`,
      },
      {
        title: "Expected Close",
        dataIndex: "expectedCloseDate",
        key: "expectedCloseDate",
        render: (date: string | null) => formatDate(date),
      },
      {
        title: "Owner",
        dataIndex: "ownerName",
        key: "ownerName",
        render: (text: string | null) => text ?? "—",
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space wrap size={[6, 6]}>
            {canChangeStage && (
              <Button
                size="small"
                onClick={() => {
                  setSelectedOpportunity(record);
                  setStageModalOpen(true);
                  stageForm.setFieldsValue({ newStage: record.stage, notes: undefined, lossReason: undefined });
                }}
              >
                Stage
              </Button>
            )}
            {canAssign && (
              <Button
                size="small"
                onClick={() => {
                  setSelectedOpportunity(record);
                  setAssignModalOpen(true);
                  assignForm.setFieldsValue({ userId: record.ownerId || undefined });
                }}
              >
                Assign
              </Button>
            )}
            {canDelete && (
              <Button
                size="small"
                danger
                onClick={() => handleDelete(record.id)}
              >
                Delete
              </Button>
            )}
          </Space>
        ),
      },
  ];

  const subtitle = restrictToOwner
    ? "Showing only opportunities assigned to you."
    : "Pipeline scoped to your tenant.";

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        {contextHolder}
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div className={styles.headerRow}>
            <div className={styles.headerText}>
              <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                Opportunities
              </Title>
              <Text className={styles.subtitle}>{subtitle}</Text>
            </div>
            <div className={styles.actions}>
              {canCreate && (
                <Button onClick={() => setIsModalOpen(true)} type="primary">
                  New Opportunity
                </Button>
              )}
            </div>
          </div>

          {isError && (
            <Alert
              type="error"
              showIcon
              message={errorMessage || "Failed to load opportunities."}
            />
          )}
          <Table
            className={styles.table}
            size={isMobile ? "small" : "middle"}
            rowKey="id"
            columns={columns}
            dataSource={opportunities ?? []}
            loading={isPending}
            scroll={{ x: 1200 }}
            pagination={{
              current: pageNumber ?? 1,
              pageSize: pageSize ?? 25,
              total: totalCount ?? (opportunities?.length ?? 0),
              showSizeChanger: !isMobile,
            }}
            onChange={(pagination) =>
              void refreshList(pagination.current ?? 1, pagination.pageSize ?? 25)
            }
          />
        </Space>

      <Modal
        title="Create Opportunity"
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={() => setIsModalOpen(false)}
        okText="Create"
        confirmLoading={isPending}
        width={isMobile ? "calc(100vw - 24px)" : 680}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Enter a title" }]}>
            <Input placeholder="Opportunity title" />
          </Form.Item>
          <Form.Item
            name="clientId"
            label="Client"
            rules={[{ required: true, message: "Select a client" }]}
          >
            <Select
              showSearch
              placeholder="Select client"
              loading={clientsLoading}
              optionFilterProp="label"
              options={clients.map((c) => ({
                label: c.name || c.id,
                value: c.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="contactId"
            label="Contact ID (optional)"
            rules={[
              {
                pattern:
                  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
                message: "Enter a valid UUID",
              },
            ]}
          >
            <Input placeholder="Contact UUID (optional)" />
          </Form.Item>
          <Form.Item
            name="estimatedValue"
            label="Estimated Value"
            rules={[{ required: true, message: "Enter estimated value" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} step={1000} />
          </Form.Item>
          <Form.Item
            name="probability"
            label="Probability (%)"
            rules={[{ required: true, message: "Enter probability" }]}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="source"
            label="Source"
            rules={[{ required: true, message: "Select source" }]}
          >
            <Select
              options={[
                { label: "Inbound", value: 1 },
                { label: "Outbound", value: 2 },
                { label: "Referral", value: 3 },
                { label: "Partner", value: 4 },
                { label: "RFP", value: 5 },
              ]}
            />
          </Form.Item>
          <Form.Item name="expectedCloseDate" label="Expected Close Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Notes" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Update Stage"
        open={stageModalOpen}
        onOk={handleStageUpdate}
        onCancel={() => setStageModalOpen(false)}
        okText="Update"
        confirmLoading={isPending}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Form form={stageForm} layout="vertical">
          <Form.Item name="newStage" label="Stage" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 1, label: "Lead" },
                { value: 2, label: "Qualified" },
                { value: 3, label: "Proposal" },
                { value: 4, label: "Negotiation" },
                { value: 5, label: "Closed Won" },
                { value: 6, label: "Closed Lost" },
              ]}
            />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.newStage !== cur.newStage}
          >
            {({ getFieldValue }) =>
              getFieldValue("newStage") === 6 ? (
                <Form.Item
                  name="lossReason"
                  label="Loss reason"
                  rules={[{ required: true, message: "Enter loss reason when closing lost" }]}
                >
                  <Input />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Assign Opportunity"
        open={assignModalOpen}
        onOk={handleAssign}
        onCancel={() => setAssignModalOpen(false)}
        okText="Assign"
        confirmLoading={isPending}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="userId"
            label="User ID"
            rules={[{ required: true, message: "Select assignee" }]}
          >
            <Select
              showSearch
              loading={usersLoading}
              optionFilterProp="label"
              placeholder="Select assignee"
              options={users.map((u) => ({
                label: formatUserLabel(u),
                value: u.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
      </Card>
    </div>
  );
};

const OpportunitiesPage = () => {
  return (
    <OpportunityProvider>
      <OpportunitiesView />
    </OpportunityProvider>
  );
};

export default OpportunitiesPage;
