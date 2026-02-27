"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
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
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ActivityProvider,
  useActivityActions,
  useActivityState,
  useAuthenticationState,
} from "@/provider";
import type { IActivity } from "@/provider/activity/context";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const activityTypeOptions = [
  { value: 1, label: "Meeting" },
  { value: 2, label: "Call" },
  { value: 3, label: "Email" },
  { value: 4, label: "Task" },
  { value: 5, label: "Demo" },
];

const activityStatusOptions = [
  { value: 1, label: "Planned" },
  { value: 2, label: "Completed" },
  { value: 3, label: "Cancelled" },
];

const relatedToTypeOptions = [
  { value: 1, label: "Opportunity" },
  { value: 2, label: "Client" },
  { value: 3, label: "Contact" },
  { value: 4, label: "Contract" },
  { value: 5, label: "Proposal" },
];

const priorityOptions = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" },
];

const statusColor = (status: number) => {
  switch (status) {
    case 1:
      return "blue";
    case 2:
      return "green";
    case 3:
      return "default";
    default:
      return "default";
  }
};

const priorityColor = (priority: number) => {
  switch (priority) {
    case 1:
      return "default";
    case 2:
      return "processing";
    case 3:
      return "warning";
    case 4:
      return "error";
    default:
      return "default";
  }
};

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "-";

const formatRelatedEntityLabel = (
  relatedToType: number,
  item: Record<string, unknown>,
): string => {
  const id = String(item.id ?? "");
  const fallbackId = id ? ` (${id.slice(0, 8)}...)` : "";

  switch (relatedToType) {
    case 1: {
      const title = String(item.title ?? "Untitled opportunity");
      const clientName = item.clientName ? ` - ${String(item.clientName)}` : "";
      return `${title}${clientName}${fallbackId}`;
    }
    case 2: {
      const name = String(item.name ?? "Unnamed client");
      return `${name}${fallbackId}`;
    }
    case 3: {
      const fullName = String(
        item.fullName ??
          `${String(item.firstName ?? "")} ${String(item.lastName ?? "")}`.trim() ??
          "",
      ).trim();
      const email = item.email ? ` - ${String(item.email)}` : "";
      return `${fullName || "Unnamed contact"}${email}${fallbackId}`;
    }
    case 4: {
      const contract = String(item.contractNumber ?? item.title ?? "Contract");
      const clientName = item.clientName ? ` - ${String(item.clientName)}` : "";
      return `${contract}${clientName}${fallbackId}`;
    }
    case 5: {
      const proposal = String(item.proposalNumber ?? item.title ?? "Proposal");
      const clientName = item.clientName ? ` - ${String(item.clientName)}` : "";
      return `${proposal}${clientName}${fallbackId}`;
    }
    default:
      return id;
  }
};

const formatUserLabel = (item: Record<string, unknown>): string => {
  const fullName = String(
    item.fullName ??
      `${String(item.firstName ?? "")} ${String(item.lastName ?? "")}`.trim() ??
      "",
  ).trim();
  const email = item.email ? ` (${String(item.email)})` : "";
  return `${fullName || "Unnamed user"}${email}`;
};

const ActivitiesContent = () => {
  const { styles } = useStyles();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { user } = useAuthenticationState();
  const { getActivities, createActivity, updateActivity, deleteActivity, completeActivity, cancelActivity } =
    useActivityActions();
  const { activities, isPending, isError, errorMessage } = useActivityState();

  const [form] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<IActivity | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [relatedEntityOptions, setRelatedEntityOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [relatedEntityLoading, setRelatedEntityLoading] = useState(false);
  const [userOptions, setUserOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [relatedTypeFilter, setRelatedTypeFilter] = useState<number | undefined>(undefined);
  const [assignedToFilter, setAssignedToFilter] = useState<string | undefined>(undefined);
  const selectedRelatedToType = Form.useWatch("relatedToType", form);
  const instance = useMemo(() => getAxiosInstace(), []);

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("Admin");
  const isSalesManager = roles.includes("SalesManager");
  const canDelete = isAdmin || isSalesManager;

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await instance.get("/api/users?pageNumber=1&pageSize=200");
      const rawItems = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      const options = (rawItems as Array<Record<string, unknown>>)
        .filter((item) => typeof item.id === "string")
        .map((item) => ({
          value: String(item.id),
          label: formatUserLabel(item),
        }));
      setUserOptions(options);
    } catch {
      setUserOptions([]);
      messageApi.error("Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchRelatedEntities = async (relatedToType?: number) => {
    if (!relatedToType) {
      setRelatedEntityOptions([]);
      return;
    }

    setRelatedEntityLoading(true);
    try {
      let path = "";
      switch (relatedToType) {
        case 1:
          path = "/api/Opportunities?pageNumber=1&pageSize=200";
          break;
        case 2:
          path = "/api/Clients?pageNumber=1&pageSize=200";
          break;
        case 3:
          path = "/api/Contacts?pageNumber=1&pageSize=200";
          break;
        case 4:
          path = "/api/Contracts?pageNumber=1&pageSize=200";
          break;
        case 5:
          path = "/api/Proposals?pageNumber=1&pageSize=200";
          break;
        default:
          setRelatedEntityOptions([]);
          return;
      }

      const { data } = await instance.get(path);
      const rawItems = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      const options = (rawItems as Array<Record<string, unknown>>)
        .filter((item) => typeof item.id === "string")
        .map((item) => ({
          value: String(item.id),
          label: formatRelatedEntityLabel(relatedToType, item),
        }));

      setRelatedEntityOptions(options);
      if (options.length === 1) {
        form.setFieldValue("relatedToId", options[0].value);
      }
    } catch {
      setRelatedEntityOptions([]);
      messageApi.error("Failed to load related entities.");
    } finally {
      setRelatedEntityLoading(false);
    }
  };

  const refreshList = () =>
    getActivities({
      type: typeFilter,
      status: statusFilter,
      relatedToType: relatedTypeFilter,
      assignedToId: assignedToFilter || undefined,
    });

  useEffect(() => {
    void refreshList();
    void fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingActivity(null);
    setRelatedEntityOptions([]);
    form.resetFields();
    form.setFieldsValue({
      type: 4,
      priority: 2,
      assignedToId: user?.userId,
      relatedToType: 1,
    });
    void fetchRelatedEntities(1);
    setIsModalOpen(true);
  };

  const openEditModal = (activity: IActivity) => {
    const canEdit = activity.assignedToId === user?.userId || isAdmin || isSalesManager;
    if (!canEdit) {
      messageApi.warning("You can only edit activities assigned to you.");
      return;
    }
    if (activity.status !== 1) {
      messageApi.warning("Only planned activities can be edited.");
      return;
    }

    setEditingActivity(activity);
    form.setFieldsValue({
      subject: activity.subject ?? "",
      description: activity.description ?? "",
      assignedToId: activity.assignedToId,
      priority: activity.priority,
      dueDate: activity.dueDate ? dayjs(activity.dueDate) : undefined,
      duration: activity.duration ?? undefined,
      location: activity.location ?? "",
      outcome: activity.outcome ?? "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingActivity) {
        const success = await updateActivity(editingActivity.id, {
          subject: values.subject,
          description: values.description || undefined,
          assignedToId: values.assignedToId,
          priority: values.priority,
          dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
          duration: values.duration != null ? Number(values.duration) : undefined,
          location: values.location || undefined,
          outcome: values.outcome || undefined,
        });

        if (success) {
          messageApi.success("Activity updated");
          setIsModalOpen(false);
          setEditingActivity(null);
          form.resetFields();
          void refreshList();
        }
        return;
      }

      const success = await createActivity({
        type: values.type,
        subject: values.subject,
        description: values.description || undefined,
        relatedToType: values.relatedToType,
        relatedToId: values.relatedToId,
        assignedToId: values.assignedToId,
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        duration: values.duration != null ? Number(values.duration) : undefined,
        location: values.location || undefined,
      });

      if (success) {
        messageApi.success("Activity created");
        setIsModalOpen(false);
        setRelatedEntityOptions([]);
        form.resetFields();
        void refreshList();
      }
    } catch {
      // validation errors are handled by antd
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteActivity(id);
    if (success) {
      messageApi.success("Activity deleted");
      void refreshList();
    }
  };

  const handleCancel = async (activity: IActivity) => {
    const canAct = activity.assignedToId === user?.userId || isAdmin || isSalesManager;
    if (!canAct) {
      messageApi.warning("You can only cancel activities assigned to you.");
      return;
    }

    const success = await cancelActivity(activity.id);
    if (success) {
      messageApi.success("Activity cancelled");
      void refreshList();
    }
  };

  const openCompleteModal = (activity: IActivity) => {
    const canAct = activity.assignedToId === user?.userId || isAdmin || isSalesManager;
    if (!canAct) {
      messageApi.warning("You can only complete activities assigned to you.");
      return;
    }

    setSelectedActivity(activity);
    completeForm.setFieldsValue({ outcome: activity.outcome ?? "" });
    setCompleteModalOpen(true);
  };

  const handleComplete = async () => {
    if (!selectedActivity) return;
    const values = await completeForm.validateFields();
    const success = await completeActivity(selectedActivity.id, {
      outcome: values.outcome || undefined,
    });
    if (success) {
      messageApi.success("Activity completed");
      setCompleteModalOpen(false);
      setSelectedActivity(null);
      completeForm.resetFields();
      void refreshList();
    }
  };

  const columns: ColumnsType<IActivity> = [
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      width: 220,
      render: (text: string | null) => text ?? "-",
    },
    {
      title: "Type",
      dataIndex: "typeName",
      key: "type",
      width: 140,
      render: (_: string | null, record) => (
        <Tag>{record.typeName ?? activityTypeOptions.find((o) => o.value === record.type)?.label ?? record.type}</Tag>
      ),
    },
    {
      title: "Related To",
      dataIndex: "relatedToTitle",
      key: "relatedTo",
      width: 220,
      render: (_: string | null, record) =>
        `${record.relatedToTypeName ?? relatedToTypeOptions.find((o) => o.value === record.relatedToType)?.label ?? "Entity"}: ${record.relatedToTitle ?? record.relatedToId}`,
    },
    {
      title: "Assigned",
      dataIndex: "assignedToName",
      key: "assignedToName",
      width: 180,
      render: (_: string | null, record) => record.assignedToName ?? record.assignedToId,
    },
    {
      title: "Priority",
      dataIndex: "priorityName",
      key: "priority",
      width: 120,
      render: (_: string | null, record) => (
        <Tag color={priorityColor(record.priority)}>
          {record.priorityName ?? priorityOptions.find((o) => o.value === record.priority)?.label ?? record.priority}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "statusName",
      key: "status",
      width: 120,
      render: (_: string | null, record) => (
        <Tag color={statusColor(record.status)}>
          {record.statusName ?? activityStatusOptions.find((o) => o.value === record.status)?.label ?? record.status}
        </Tag>
      ),
    },
    {
      title: "Due",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 190,
      render: (value: string | null) => formatDate(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      render: (_, record) => (
        <Space wrap size={[6, 6]}>
          <Button size="small" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          {record.status === 1 ? (
            <Button size="small" type="primary" onClick={() => openCompleteModal(record)}>
              Complete
            </Button>
          ) : null}
          {record.status === 1 ? (
            <Popconfirm
              title="Cancel activity?"
              description="This marks the activity as cancelled."
              onConfirm={() => void handleCancel(record)}
            >
              <Button size="small" danger>
                Cancel
              </Button>
            </Popconfirm>
          ) : null}
          {canDelete ? (
            <Popconfirm
              title="Delete activity?"
              description="This action cannot be undone."
              onConfirm={() => void handleDelete(record.id)}
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
    <div className={styles.page}>
      <Card className={styles.card}>
        {contextHolder}
        <Space direction="vertical" size={12} className={styles.container}>
          <div className={styles.headerRow}>
            <div className={styles.headerText}>
              <Title level={isMobile ? 4 : 3} className={styles.title}>
                Activities
              </Title>
              <Text type="secondary" className={styles.subtitle}>
                Manage meetings, calls, tasks, and follow-ups.
              </Text>
            </div>
            <div className={styles.actions}>
              <Button type="primary" onClick={openCreateModal}>
                New Activity
              </Button>
              <Button onClick={() => void refreshList()} loading={isPending}>
                Refresh
              </Button>
            </div>
          </div>

          <Space wrap className={styles.filterRow}>
            <Select
              allowClear
              placeholder="Type"
              className={styles.filterSelect}
              options={activityTypeOptions}
              onChange={(val) => {
                setTypeFilter(val);
                void getActivities({
                  type: val,
                  status: statusFilter,
                  relatedToType: relatedTypeFilter,
                  assignedToId: assignedToFilter || undefined,
                });
              }}
            />
            <Select
              allowClear
              placeholder="Status"
              className={styles.filterSelect}
              options={activityStatusOptions}
              onChange={(val) => {
                setStatusFilter(val);
                void getActivities({
                  type: typeFilter,
                  status: val,
                  relatedToType: relatedTypeFilter,
                  assignedToId: assignedToFilter || undefined,
                });
              }}
            />
            <Select
              allowClear
              placeholder="Related Type"
              className={styles.filterSelect}
              options={relatedToTypeOptions}
              onChange={(val) => {
                setRelatedTypeFilter(val);
                void getActivities({
                  type: typeFilter,
                  status: statusFilter,
                  relatedToType: val,
                  assignedToId: assignedToFilter || undefined,
                });
              }}
            />
            <Select
              allowClear
              showSearch
              loading={usersLoading}
              optionFilterProp="label"
              placeholder="Assigned user"
              className={styles.filterInput}
              options={userOptions}
              onChange={(value) => {
                const next = value as string | undefined;
                setAssignedToFilter(next);
                void getActivities({
                  type: typeFilter,
                  status: statusFilter,
                  relatedToType: relatedTypeFilter,
                  assignedToId: next || undefined,
                });
              }}
            />
          </Space>

          {isError ? (
            <Alert type="error" showIcon message={errorMessage || "Failed to load activities."} />
          ) : null}

          <Table
            className={styles.table}
            size={isMobile ? "small" : "middle"}
            rowKey="id"
            columns={columns}
            dataSource={activities ?? []}
            loading={isPending}
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: isMobile ? 8 : 10,
              showSizeChanger: !isMobile,
            }}
          />
        </Space>
      </Card>

      <Modal
        title={editingActivity ? "Edit Activity" : "Create Activity"}
        open={isModalOpen}
        onOk={() => void handleSave()}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
          setRelatedEntityOptions([]);
          form.resetFields();
        }}
        okText={editingActivity ? "Save" : "Create"}
        confirmLoading={isPending}
        width={isMobile ? "calc(100vw - 24px)" : 620}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Form form={form} layout="vertical">
          {!editingActivity ? (
            <>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: "Select activity type" }]}
              >
                <Select options={activityTypeOptions} />
              </Form.Item>
              <Form.Item
                name="relatedToType"
                label="Related To Type"
                rules={[{ required: true, message: "Select related entity type" }]}
              >
                <Select
                  options={relatedToTypeOptions}
                  onChange={(value) => {
                    form.setFieldValue("relatedToId", undefined);
                    void fetchRelatedEntities(value);
                  }}
                />
              </Form.Item>
              <Form.Item
                name="relatedToId"
                label="Related Entity ID"
                rules={[{ required: true, message: "Select a related entity" }]}
              >
                <Select
                  showSearch
                  loading={relatedEntityLoading}
                  placeholder={
                    selectedRelatedToType
                      ? "Select related entity"
                      : "Select related type first"
                  }
                  optionFilterProp="label"
                  disabled={!selectedRelatedToType}
                  options={relatedEntityOptions}
                />
              </Form.Item>
            </>
          ) : null}

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Enter subject" }]}
          >
            <Input placeholder="Activity subject" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="assignedToId"
            label="Assigned User ID"
            rules={[{ required: true, message: "Select an assigned user" }]}
          >
            <Select
              showSearch
              loading={usersLoading}
              optionFilterProp="label"
              placeholder="Select assigned user"
              options={userOptions}
            />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Select priority" }]}
          >
            <Select options={priorityOptions} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="duration" label="Duration (minutes)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input placeholder="Office, Teams, phone, etc." />
          </Form.Item>
          {editingActivity ? (
            <Form.Item name="outcome" label="Outcome (optional)">
              <Input.TextArea rows={2} />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>

      <Modal
        title="Complete Activity"
        open={completeModalOpen}
        onOk={() => void handleComplete()}
        onCancel={() => {
          setCompleteModalOpen(false);
          setSelectedActivity(null);
          completeForm.resetFields();
        }}
        okText="Complete"
        confirmLoading={isPending}
        width={isMobile ? "calc(100vw - 24px)" : 540}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Form form={completeForm} layout="vertical">
          <Form.Item name="outcome" label="Outcome">
            <Input.TextArea rows={4} placeholder="Describe the result of this activity" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const ActivitiesPage = () => (
  <ActivityProvider>
    <ActivitiesContent />
  </ActivityProvider>
);

export default ActivitiesPage;
