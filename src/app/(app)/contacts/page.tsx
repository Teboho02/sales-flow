"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ContactProvider,
  useAuthenticationState,
  useContactActions,
  useContactState,
} from "@/provider";
import type { IContact } from "@/provider/contact/context";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;

const ContactContent = () => {
  const { styles } = useStyles();
  const { user } = useAuthenticationState();
  const { getContacts, createContact, updateContact, deleteContact, setPrimaryContact } =
    useContactActions();
  const {
    contacts,
    isPending,
    isError,
    errorMessage,
    pageNumber,
    pageSize,
    totalCount,
  } = useContactState();

  const [form] = Form.useForm();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<IContact | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<string | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [clients, setClients] = useState<Array<{ id: string; name: string | null }>>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const roles = user?.roles ?? [];
  const canManageContacts = roles.includes("Admin") || roles.includes("SalesManager");

  const fetchContacts = (page = pageNumber ?? 1, size = pageSize ?? 25) =>
    getContacts({
      pageNumber: page,
      pageSize: size,
      searchTerm: searchTerm || undefined,
      clientId: clientFilter,
      isActive: isActiveFilter,
    });

  useEffect(() => {
    void fetchContacts(1, 25);
    void fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClients = async () => {
    setClientsLoading(true);
    try {
      const instance = getAxiosInstace();
      const { data } = await instance.get("/api/Clients?pageNumber=1&pageSize=200");
      const rawItems = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];
      const mapped = (rawItems as Array<{ id: string; name?: string | null }>).map((c) => ({
        id: c.id,
        name: c.name ?? null,
      }));
      setClients(mapped);
    } catch {
      messageApi.error("Failed to load clients.");
    } finally {
      setClientsLoading(false);
    }
  };

  const openCreateDrawer = () => {
    if (!canManageContacts) {
      messageApi.warning("You do not have permission to create contacts.");
      return;
    }
    setEditingContact(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, isPrimary: false });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (contact: IContact) => {
    if (!canManageContacts) {
      messageApi.warning("You do not have permission to edit contacts.");
      return;
    }
    setEditingContact(contact);
    form.setFieldsValue({
      firstName: contact.firstName ?? "",
      lastName: contact.lastName ?? "",
      email: contact.email ?? "",
      phoneNumber: contact.phoneNumber ?? "",
      jobTitle: contact.jobTitle ?? "",
      clientId: contact.clientId,
      isActive: contact.isActive,
      isPrimary: contact.isPrimary,
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = async () => {
    if (!canManageContacts) {
      messageApi.warning("You do not have permission to save contacts.");
      return;
    }

    try {
      const values = await form.validateFields();
      let success = false;
      if (editingContact) {
        success = await updateContact(editingContact.id, {
          firstName: values.firstName,
          lastName: values.lastName || undefined,
          email: values.email,
          phoneNumber: values.phoneNumber || undefined,
          jobTitle: values.jobTitle || undefined,
          clientId: values.clientId,
          isActive: values.isActive,
          isPrimary: values.isPrimary,
        });
      } else {
        success = await createContact({
          firstName: values.firstName,
          lastName: values.lastName || undefined,
          email: values.email,
          phoneNumber: values.phoneNumber || undefined,
          jobTitle: values.jobTitle || undefined,
          clientId: values.clientId,
          isPrimary: values.isPrimary,
          isActive: values.isActive ?? true,
        });
      }

      if (success) {
        messageApi.success(`Contact ${editingContact ? "updated" : "created"}`);
        setIsDrawerOpen(false);
        setEditingContact(null);
        form.resetFields();
        void fetchContacts(pageNumber ?? 1, pageSize ?? 25);
      }
    } catch {
      // validation handled by antd
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManageContacts) {
      messageApi.warning("You do not have permission to delete contacts.");
      return;
    }
    const success = await deleteContact(id);
    if (success) {
      messageApi.success("Contact deleted");
      void fetchContacts(pageNumber ?? 1, pageSize ?? 25);
    }
  };

  const handleSetPrimary = async (id: string) => {
    if (!canManageContacts) {
      messageApi.warning("You do not have permission to update primary contacts.");
      return;
    }
    const success = await setPrimaryContact(id);
    if (success) {
      messageApi.success("Primary contact updated");
      void fetchContacts(pageNumber ?? 1, pageSize ?? 25);
    }
  };

  const columns: ColumnsType<IContact> = [
    {
      title: "Name",
      dataIndex: "firstName",
        key: "name",
        render: (_: string, record) =>
          [record.firstName, record.lastName].filter(Boolean).join(" ") || "—",
      },
      {
        title: "Title",
        dataIndex: "jobTitle",
        key: "jobTitle",
        render: (text: string | null) => text ?? "—",
      },
      {
        title: "Client",
        dataIndex: "clientName",
        key: "clientName",
        render: (text: string | null) => text ?? "—",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (text: string | null) =>
          text ? (
            <a href={`mailto:${text}`} onClick={(e) => e.stopPropagation()}>
              {text}
            </a>
          ) : (
            "—"
          ),
      },
      {
        title: "Phone",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        render: (text: string | null) => text ?? "—",
      },
      {
        title: "Primary",
        dataIndex: "isPrimary",
        key: "isPrimary",
        render: (val: boolean) =>
          val ? <Tag color="gold">Primary</Tag> : <Tag color="default">No</Tag>,
      },
      {
        title: "Active",
        dataIndex: "isActive",
        key: "isActive",
        render: (val: boolean) =>
          val ? <Tag color="green">Active</Tag> : <Tag color="default">Inactive</Tag>,
      },
  ];
  if (canManageContacts) {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEditDrawer(record)}>
            Edit
          </Button>
          {!record.isPrimary ? (
            <Button
              size="small"
              type="primary"
              onClick={() => void handleSetPrimary(record.id)}
              loading={isPending}
            >
              Set primary
            </Button>
          ) : null}
          <Popconfirm
            title="Delete contact?"
            description="This will remove the contact record."
            onConfirm={() => void handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <Card>
      {contextHolder}
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Contacts
            </Title>
            <Text type="secondary">People linked to clients within your tenant.</Text>
          </div>
          <Space>
            {canManageContacts ? (
              <Button type="primary" onClick={openCreateDrawer}>
                New Contact
              </Button>
            ) : null}
            <Button onClick={() => void fetchContacts(1, pageSize ?? 25)} loading={isPending}>
              Refresh
            </Button>
          </Space>
        </Space>

        <Space wrap className={styles.filterRow}>
          <Input.Search
            allowClear
            placeholder="Search contacts"
            style={{ width: 240 }}
            onSearch={(value) => {
              setSearchTerm(value);
              void getContacts({
                pageNumber: 1,
                pageSize: pageSize ?? 25,
                searchTerm: value || undefined,
                clientId: clientFilter,
                isActive: isActiveFilter,
              });
            }}
          />
          <Select
            allowClear
            placeholder="Client"
            style={{ width: 220 }}
            loading={clientsLoading}
            onChange={(val) => {
              setClientFilter(val);
              void getContacts({
                pageNumber: 1,
                pageSize: pageSize ?? 25,
                searchTerm: searchTerm || undefined,
                clientId: val,
                isActive: isActiveFilter,
              });
            }}
            options={clients.map((c) => ({
              label: c.name || c.id,
              value: c.id,
            }))}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 140 }}
            onChange={(val) => {
              const next = val as boolean | undefined;
              setIsActiveFilter(next);
              void getContacts({
                pageNumber: 1,
                pageSize: pageSize ?? 25,
                searchTerm: searchTerm || undefined,
                clientId: clientFilter,
                isActive: next,
              });
            }}
            options={[
              { label: "Active", value: true },
              { label: "Inactive", value: false },
            ]}
          />
        </Space>

        {isError && (
          <Alert type="error" showIcon message={errorMessage || "Failed to load contacts."} />
        )}

        <Table
          size="middle"
          rowKey="id"
          columns={columns}
          dataSource={contacts ?? []}
          loading={isPending}
          pagination={{
            current: pageNumber ?? 1,
            pageSize: pageSize ?? 25,
            total: totalCount ?? contacts?.length ?? 0,
            showSizeChanger: true,
          }}
          onChange={(pagination) =>
            void fetchContacts(pagination.current ?? 1, pagination.pageSize ?? 25)
          }
          onRow={(record) =>
            canManageContacts
              ? {
                  onClick: () => openEditDrawer(record),
                }
              : {}
          }
        />
      </Space>

      <Drawer
        title={editingContact ? "Edit Contact" : "New Contact"}
        open={isDrawerOpen}
        width={500}
        destroyOnClose
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingContact(null);
          form.resetFields();
        }}
        extra={
          <Space>
            <Button
              onClick={() => {
                setIsDrawerOpen(false);
                setEditingContact(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" onClick={() => void handleSubmit()} loading={isPending}>
              {editingContact ? "Save" : "Create"}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="firstName"
            label="First name"
            rules={[{ required: true, message: "Enter first name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last name">
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Enter email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone">
            <Input placeholder="+27 ..." />
          </Form.Item>
          <Form.Item name="jobTitle" label="Job title">
            <Input />
          </Form.Item>
          <Form.Item
            name="clientId"
            label="Client"
            rules={[{ required: true, message: "Select a client" }]}
          >
            <Select
              showSearch
              loading={clientsLoading}
              optionFilterProp="label"
              options={clients.map((c) => ({ label: c.name || c.id, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="isPrimary" label="Set as primary" valuePropName="checked">
            <Switch />
          </Form.Item>
          {editingContact ? (
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          ) : null}
        </Form>
      </Drawer>
    </Card>
  );
};

const ContactsPage = () => (
  <ContactProvider>
    <ContactContent />
  </ContactProvider>
);

export default ContactsPage;
