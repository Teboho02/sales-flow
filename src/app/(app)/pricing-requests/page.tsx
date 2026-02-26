"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  PricingRequestProvider,
  usePricingRequestActions,
  usePricingRequestState,
} from "@/provider";
import type { IPricingRequest } from "@/provider/pricing-request/context";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useAuthenticationState } from "@/provider";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;

const statusColor = (status: number) => {
  switch (status) {
    case 1:
      return "default"; // Pending
    case 2:
      return "blue"; // InProgress
    case 3:
      return "green"; // Completed
    default:
      return "default";
  }
};

const priorityLabel: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

const PricingRequestsContent = () => {
  const { styles } = useStyles();
  const { user } = useAuthenticationState();
  const {
    getRequests,
    getPendingRequests,
    getMyRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    assignRequest,
    completeRequest,
  } = usePricingRequestActions();
  const {
    requests,
    isPending,
    isError,
    errorMessage,
    pageNumber,
    pageSize,
    totalCount,
  } = usePricingRequestState();

  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<IPricingRequest | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<number | undefined>(undefined);
  const [opportunities, setOpportunities] = useState<
    Array<{ id: string; title: string | null; clientName: string | null }>
  >([]);
  const [lookupLoading, setLookupLoading] = useState(false);

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("Admin");
  const isManager = roles.includes("SalesManager");
  const canAssign = isAdmin || isManager;
  const canDelete = isAdmin || isManager;

  const fetchRequests = (page = pageNumber ?? 1, size = pageSize ?? 25) =>
    getRequests({
      pageNumber: page,
      pageSize: size,
      status: statusFilter,
      priority: priorityFilter,
    });

  useEffect(() => {
    void fetchRequests(1, 25);
    void fetchOpportunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOpportunities = async () => {
    setLookupLoading(true);
    try {
      const instance = getAxiosInstace();
      const { data } = await instance.get("/api/Opportunities?pageNumber=1&pageSize=200");
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

  const openCreateModal = () => {
    setEditingRequest(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (request: IPricingRequest) => {
    setEditingRequest(request);
    form.setFieldsValue({
      title: request.title ?? "",
      description: request.description ?? "",
      priority: request.priority ?? 2,
      dueDate: request.dueDate ? dayjs(request.dueDate) : undefined,
      opportunityId: request.opportunityId ?? undefined,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        description: values.description || undefined,
        priority: values.priority ?? 2,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        opportunityId: values.opportunityId || undefined,
      };
      let success = false;
      if (editingRequest) {
        success = await updateRequest(editingRequest.id, payload);
      } else {
        success = await createRequest(payload);
      }
      if (success) {
        messageApi.success(`Request ${editingRequest ? "updated" : "created"}`);
        setIsModalOpen(false);
        setEditingRequest(null);
        form.resetFields();
        void fetchRequests(pageNumber ?? 1, pageSize ?? 25);
      }
    } catch {
      // validation handled by antd
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteRequest(id);
    if (success) {
      messageApi.success("Request deleted");
      void fetchRequests(pageNumber ?? 1, pageSize ?? 25);
    }
  };

  const handleAssign = async () => {
    try {
      const values = await assignForm.validateFields();
      if (!editingRequest) return;
      const success = await assignRequest(editingRequest.id, { userId: values.userId });
      if (success) {
        messageApi.success("Assigned");
        setIsAssignModalOpen(false);
        assignForm.resetFields();
        void fetchRequests(pageNumber ?? 1, pageSize ?? 25);
      }
    } catch {
      // handled by antd
    }
  };

  const handleComplete = async (id: string) => {
    const success = await completeRequest(id);
    if (success) {
      messageApi.success("Marked complete");
      void fetchRequests(pageNumber ?? 1, pageSize ?? 25);
    }
  };

  const columns: ColumnsType<IPricingRequest> = [
    { title: "Title", dataIndex: "title", key: "title", render: (t) => t ?? "Untitled" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: number, record) => (
        <Tag color={statusColor(record.status)}>{record.statusName ?? record.status}</Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (val: number) => priorityLabel[val] ?? val,
    },
    {
      title: "Opportunity",
      dataIndex: "opportunityTitle",
      key: "opportunityTitle",
      render: (text: string | null) => text ?? "—",
    },
    {
      title: "Assigned to",
      dataIndex: "assignedToName",
      key: "assignedToName",
      render: (text: string | null) => text ?? "—",
    },
    {
      title: "Due date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string | null) =>
        date
          ? new Intl.DateTimeFormat("en-ZA", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }).format(new Date(date))
          : "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          {canAssign ? (
            <Button
              size="small"
              onClick={() => {
                setEditingRequest(record);
                setIsAssignModalOpen(true);
                assignForm.resetFields();
              }}
            >
              Assign
            </Button>
          ) : null}
          {record.status === 2 && (record.assignedToId === user?.userId || canAssign) ? (
            <Button size="small" type="primary" onClick={() => void handleComplete(record.id)} loading={isPending}>
              Complete
            </Button>
          ) : null}
          {canDelete ? (
            <Popconfirm
              title="Delete request?"
              onConfirm={() => void handleDelete(record.id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      {contextHolder}
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Pricing Requests
            </Title>
            <Text type="secondary">Request, assign, and complete pricing assistance.</Text>
          </div>
          <Space>
            <Button onClick={() => void getMyRequests()} disabled={isPending}>
              My requests
            </Button>
            {canAssign ? (
              <Button onClick={() => void getPendingRequests()} disabled={isPending}>
                Pending queue
              </Button>
            ) : null}
            <Button type="primary" onClick={openCreateModal}>
              New Request
            </Button>
            <Button onClick={() => void fetchRequests(1, pageSize ?? 25)} loading={isPending}>
              Refresh
            </Button>
          </Space>
        </Space>

        <Space wrap className={styles.filterRow}>
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 160 }}
            onChange={(val) => {
              setStatusFilter(val);
              void getRequests({
                pageNumber: 1,
                pageSize: pageSize ?? 25,
                status: val,
                priority: priorityFilter,
              });
            }}
            options={[
              { label: "Pending", value: 1 },
              { label: "In Progress", value: 2 },
              { label: "Completed", value: 3 },
            ]}
          />
          <Select
            allowClear
            placeholder="Priority"
            style={{ width: 160 }}
            onChange={(val) => {
              setPriorityFilter(val);
              void getRequests({
                pageNumber: 1,
                pageSize: pageSize ?? 25,
                status: statusFilter,
                priority: val,
              });
            }}
            options={[
              { label: "Low", value: 1 },
              { label: "Medium", value: 2 },
              { label: "High", value: 3 },
            ]}
          />
        </Space>

        {isError && <Alert type="error" showIcon message={errorMessage || "Failed to load pricing requests."} />}

        <Table
          size="middle"
          rowKey="id"
          columns={columns}
          dataSource={requests ?? []}
          loading={isPending}
          pagination={{
            current: pageNumber ?? 1,
            pageSize: pageSize ?? 25,
            total: totalCount ?? requests?.length ?? 0,
            showSizeChanger: true,
          }}
          onChange={(pagination) =>
            void fetchRequests(pagination.current ?? 1, pagination.pageSize ?? 25)
          }
          onRow={(record) => ({
            onClick: () => openEditModal(record),
          })}
        />
      </Space>

      <Modal
        title={editingRequest ? "Edit Pricing Request" : "New Pricing Request"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingRequest(null);
          form.resetFields();
        }}
        okText={editingRequest ? "Save" : "Create"}
        confirmLoading={isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Enter a title" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="priority" label="Priority" initialValue={2}>
            <Select
              options={[
                { label: "Low", value: 1 },
                { label: "Medium", value: 2 },
                { label: "High", value: 3 },
              ]}
            />
          </Form.Item>
          <Form.Item name="dueDate" label="Due date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="opportunityId" label="Opportunity">
            <Select
              allowClear
              showSearch
              loading={lookupLoading}
              optionFilterProp="label"
              options={opportunities.map((o) => ({
                label: o.title || o.id,
                value: o.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Assign Request"
        open={isAssignModalOpen}
        onOk={handleAssign}
        onCancel={() => {
          setIsAssignModalOpen(false);
          setEditingRequest(null);
          assignForm.resetFields();
        }}
        okText="Assign"
        confirmLoading={isPending}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="userId"
            label="Assignee user ID"
            rules={[
              { required: true, message: "Enter user ID (UUID)" },
              {
                pattern:
                  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
                message: "Enter a valid UUID",
              },
            ]}
          >
            <Input placeholder="User UUID" />
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
