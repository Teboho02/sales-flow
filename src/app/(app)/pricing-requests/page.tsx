"use client";

import { useEffect, useState } from "react";
import type { Dayjs } from "dayjs";
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
import {
  PricingRequestProvider,
  useAuthenticationState,
  usePricingRequestActions,
  usePricingRequestState,
} from "@/provider";
import type { IPricingRequest } from "@/provider/pricingRequest/context";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const statusColor = (status: number) => {
  switch (status) {
    case 1:
      return "default"; // Draft
    case 2:
      return "processing"; // Pending
    case 3:
      return "blue"; // In Progress
    case 4:
      return "green"; // Completed
    default:
      return "default";
  }
};

const priorityColor = (priority: number) => {
  switch (priority) {
    case 1:
      return "default"; // Low
    case 2:
      return "blue"; // Medium
    case 3:
      return "orange"; // High
    case 4:
      return "red"; // Urgent
    default:
      return "default";
  }
};

const formatDate = (date?: string | null) =>
  date
    ? new Intl.DateTimeFormat("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(date))
    : "--";

const formatUserLabel = (user: {
  id: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}) => {
  const fullName = user.fullName ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const safeFullName = fullName || "Unnamed user";
  const emailPart = user.email ? ` (${user.email})` : "";
  return `${safeFullName}${emailPart}`;
};

interface PricingRequestFormValues {
  title: string;
  opportunityId: string;
  description?: string;
  priority: number;
  requiredByDate?: Dayjs;
  assignedToId?: string;
}

interface AssignFormValues {
  userId: string;
}

const PricingRequestsContent = () => {
  const { styles } = useStyles();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { user } = useAuthenticationState();
  const {
    getPricingRequests,
    getMyPricingRequests,
    createPricingRequest,
    assignPricingRequest,
    completePricingRequest,
    deletePricingRequest,
  } = usePricingRequestActions();
  const {
    pricingRequests,
    isPending,
    isError,
    errorMessage,
    pageNumber,
    pageSize,
    totalCount,
  } = usePricingRequestState();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<IPricingRequest | null>(null);
  const [createForm] = Form.useForm<PricingRequestFormValues>();
  const [assignForm] = Form.useForm<AssignFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<number | undefined>(undefined);

  const [opportunities, setOpportunities] = useState<
    Array<{ id: string; title: string | null; clientName: string | null }>
  >([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [users, setUsers] = useState<
    Array<{
      id: string;
      fullName?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
    }>
  >([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("Admin");
  const isSalesManager = roles.includes("SalesManager");
  const isBDM = roles.includes("BusinessDevelopmentManager");
  const isSalesRep = roles.includes("SalesRep");

  const restrictToMine = isSalesRep && !isAdmin && !isSalesManager && !isBDM;
  const canCreate = isAdmin || isSalesManager || isBDM || isSalesRep;
  const canAssign = isAdmin || isSalesManager;
  const canDelete = canAssign;

  const refreshList = (
    page = pageNumber ?? 1,
    size = pageSize ?? 25,
    status = statusFilter,
    priority = priorityFilter,
  ) => {
    const query = {
      pageNumber: page,
      pageSize: size,
      status,
      priority,
    };

    if (restrictToMine) {
      return getMyPricingRequests(query);
    }
    return getPricingRequests(query);
  };

  const fetchOpportunities = async () => {
    setOpportunitiesLoading(true);
    try {
      const instance = getAxiosInstace();
      const { data } = await instance.get("/api/Opportunities?pageNumber=1&pageSize=100");
      const oppItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setOpportunities(
        (oppItems as Array<{ id: string; title?: string | null; clientName?: string | null }>).map(
          (item) => ({
            id: item.id,
            title: item.title ?? null,
            clientName: item.clientName ?? null,
          }),
        ),
      );
    } catch {
      messageApi.error("Failed to load opportunities.");
    } finally {
      setOpportunitiesLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const instance = getAxiosInstace();
      const { data } = await instance.get("/api/users?pageNumber=1&pageSize=200");
      const userItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setUsers(
        (
          userItems as Array<{
            id: string;
            fullName?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            email?: string | null;
          }>
        ).map((item) => ({
          id: item.id,
          fullName: item.fullName ?? null,
          firstName: item.firstName ?? null,
          lastName: item.lastName ?? null,
          email: item.email ?? null,
        })),
      );
    } catch {
      setUsers([]);
      messageApi.error("Failed to load users for assignment.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void refreshList(1, 25);
    if (canCreate) {
      void fetchOpportunities();
    }
    if (canAssign) {
      void fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, restrictToMine, canCreate, canAssign]);

  const handleCreate = async () => {
    if (!canCreate) {
      messageApi.error("You do not have permission to create pricing requests.");
      return;
    }

    try {
      const values = await createForm.validateFields();
      const success = await createPricingRequest({
        title: values.title,
        opportunityId: values.opportunityId,
        description: values.description?.trim() || undefined,
        priority: Number(values.priority),
        requiredByDate: values.requiredByDate
          ? values.requiredByDate.toISOString()
          : undefined,
        assignedToId: values.assignedToId || undefined,
      });

      if (success) {
        messageApi.success("Pricing request created.");
        setIsCreateModalOpen(false);
        createForm.resetFields();
        createForm.setFieldValue("priority", 2);
        void refreshList(pageNumber ?? 1, pageSize ?? 25);
      }
    } catch {
      // validation handled by antd
    }
  };

  const handleAssign = async () => {
    if (!selectedRequest) return;
    try {
      const values = await assignForm.validateFields();
      const success = await assignPricingRequest(selectedRequest.id, {
        userId: values.userId,
      });
      if (success) {
        messageApi.success("Pricing request assigned.");
        setIsAssignModalOpen(false);
        assignForm.resetFields();
        setSelectedRequest(null);
        void refreshList(pageNumber ?? 1, pageSize ?? 25);
      }
    } catch {
      // validation handled by antd
    }
  };

  const canCompletePricingRequest = (record: IPricingRequest) => {
    if (record.status !== 3) return false;
    if (canAssign) return true;
    return Boolean(user?.userId && record.assignedToId === user.userId);
  };

  const handleComplete = async (id: string) => {
    const success = await completePricingRequest(id);
    if (success) {
      messageApi.success("Pricing request completed.");
      void refreshList(pageNumber ?? 1, pageSize ?? 25);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deletePricingRequest(id);
    if (success) {
      messageApi.success("Pricing request deleted.");
      void refreshList(pageNumber ?? 1, pageSize ?? 25);
    }
  };

  const columns: ColumnsType<IPricingRequest> = [
    {
      title: "Request #",
      dataIndex: "requestNumber",
      key: "requestNumber",
      width: 130,
      render: (value: string | null) => value ?? "--",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 220,
      render: (value: string | null) => value ?? "Untitled",
    },
    {
      title: "Opportunity",
      dataIndex: "opportunityTitle",
      key: "opportunityTitle",
      width: 200,
      render: (value: string | null) => value ?? "--",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (_: number, record) => (
        <Tag color={priorityColor(record.priority)}>
          {record.priorityName ?? record.priority}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (_: number, record) => (
        <Tag color={statusColor(record.status)}>{record.statusName ?? record.status}</Tag>
      ),
    },
    {
      title: "Required By",
      dataIndex: "requiredByDate",
      key: "requiredByDate",
      width: 150,
      render: (value: string | null) => formatDate(value),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedToName",
      key: "assignedToName",
      width: 180,
      render: (value: string | null) => value ?? "Unassigned",
    },
    {
      title: "Requested By",
      dataIndex: "requestedByName",
      key: "requestedByName",
      width: 180,
      render: (value: string | null) => value ?? "--",
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space wrap size={[6, 6]}>
          {record.status === 2 && canAssign ? (
            <Button
              size="small"
              onClick={() => {
                setSelectedRequest(record);
                setIsAssignModalOpen(true);
                assignForm.setFieldValue("userId", record.assignedToId || undefined);
              }}
            >
              Assign
            </Button>
          ) : null}
          {canCompletePricingRequest(record) ? (
            <Button
              size="small"
              type="primary"
              loading={isPending}
              onClick={() => void handleComplete(record.id)}
            >
              Complete
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              size="small"
              danger
              loading={isPending}
              onClick={() => void handleDelete(record.id)}
            >
              Delete
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  const subtitle = restrictToMine
    ? "Showing only requests assigned to you."
    : "Manage pricing requests across your tenant.";

  return (
    <Card className={styles.card}>
      {contextHolder}
      <Space direction="vertical" size={12} className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <Title level={isMobile ? 4 : 3} className={styles.title}>
              Pricing Requests
            </Title>
            <Text type="secondary" className={styles.subtitle}>
              {subtitle}
            </Text>
          </div>
          <div className={styles.actions}>
            <Select
              allowClear
              placeholder="Status"
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(status) => {
                setStatusFilter(status);
                void refreshList(1, pageSize ?? 25, status, priorityFilter);
              }}
              options={[
                { label: "Draft", value: 1 },
                { label: "Pending", value: 2 },
                { label: "In Progress", value: 3 },
                { label: "Completed", value: 4 },
              ]}
            />
            <Select
              allowClear
              placeholder="Priority"
              className={styles.filterSelect}
              value={priorityFilter}
              onChange={(priority) => {
                setPriorityFilter(priority);
                void refreshList(1, pageSize ?? 25, statusFilter, priority);
              }}
              options={[
                { label: "Low", value: 1 },
                { label: "Medium", value: 2 },
                { label: "High", value: 3 },
                { label: "Urgent", value: 4 },
              ]}
            />
            {canCreate ? (
              <Button
                type="primary"
                onClick={() => {
                  setIsCreateModalOpen(true);
                  createForm.setFieldValue("priority", 2);
                }}
              >
                New Request
              </Button>
            ) : null}
          </div>
        </div>

        {isError ? (
          <Alert
            type="error"
            showIcon
            message={errorMessage || "Failed to load pricing requests."}
          />
        ) : null}

        <Table
          className={styles.table}
          size={isMobile ? "small" : "middle"}
          rowKey="id"
          columns={columns}
          dataSource={pricingRequests ?? []}
          loading={isPending}
          scroll={{ x: 1400 }}
          pagination={{
            current: pageNumber ?? 1,
            pageSize: pageSize ?? 25,
            total: totalCount ?? pricingRequests?.length ?? 0,
            showSizeChanger: !isMobile,
          }}
          onChange={(pagination) =>
            void refreshList(
              pagination.current ?? 1,
              pagination.pageSize ?? 25,
              statusFilter,
              priorityFilter,
            )
          }
        />
      </Space>

      <Modal
        title="Create Pricing Request"
        open={isCreateModalOpen}
        onOk={handleCreate}
        onCancel={() => setIsCreateModalOpen(false)}
        okText="Create"
        confirmLoading={isPending}
        width={isMobile ? "calc(100vw - 24px)" : 680}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Form<PricingRequestFormValues>
          form={createForm}
          layout="vertical"
          initialValues={{ priority: 2 }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Enter a title" }]}
          >
            <Input placeholder="Pricing request title" />
          </Form.Item>
          <Form.Item
            name="opportunityId"
            label="Opportunity"
            rules={[{ required: true, message: "Select an opportunity" }]}
          >
            <Select
              showSearch
              loading={opportunitiesLoading}
              optionFilterProp="label"
              placeholder="Select opportunity"
              options={opportunities.map((item) => ({
                value: item.id,
                label: item.clientName
                  ? `${item.title ?? item.id} - ${item.clientName}`
                  : item.title ?? item.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Select a priority" }]}
          >
            <Select
              options={[
                { label: "Low", value: 1 },
                { label: "Medium", value: 2 },
                { label: "High", value: 3 },
                { label: "Urgent", value: 4 },
              ]}
            />
          </Form.Item>
          <Form.Item name="requiredByDate" label="Required By">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          {canAssign ? (
            <Form.Item name="assignedToId" label="Assign To (optional)">
              <Select
                allowClear
                showSearch
                loading={usersLoading}
                optionFilterProp="label"
                placeholder="Select user"
                options={users.map((item) => ({
                  value: item.id,
                  label: formatUserLabel(item),
                }))}
              />
            </Form.Item>
          ) : null}
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Assign Pricing Request"
        open={isAssignModalOpen}
        onOk={handleAssign}
        onCancel={() => {
          setIsAssignModalOpen(false);
          setSelectedRequest(null);
          assignForm.resetFields();
        }}
        okText="Assign"
        confirmLoading={isPending}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Form<AssignFormValues> form={assignForm} layout="vertical">
          <Form.Item
            name="userId"
            label="Assignee"
            rules={[{ required: true, message: "Select an assignee" }]}
          >
            <Select
              showSearch
              loading={usersLoading}
              optionFilterProp="label"
              placeholder="Select assignee"
              options={users.map((item) => ({
                value: item.id,
                label: formatUserLabel(item),
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

const PricingRequestsPage = () => (
  <PricingRequestProvider>
    <PricingRequestsContent />
  </PricingRequestProvider>
);

export default PricingRequestsPage;
