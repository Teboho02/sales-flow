"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
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

const { Title, Text } = Typography;

const ContactsView = () => {
  const { user } = useAuthenticationState();
  const { contacts, isPending, isError, errorMessage, pageNumber, pageSize, totalCount } =
    useContactState();
  const { getContacts, createContact, updateContact, deleteContact, setPrimary } =
    useContactActions();

  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<IContact | null>(null);
  const [clients, setClients] = useState<Array<{ id: string; name: string | null }>>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientFilter, setClientFilter] = useState<string | undefined>(undefined);

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("Admin");
  const isSalesManager = roles.includes("SalesManager");
  const isBDM = roles.includes("BusinessDevelopmentManager");
  const canManage = isAdmin || isSalesManager || isBDM;

  const refreshList = (page = pageNumber ?? 1, size = pageSize ?? 25, clientId = clientFilter) =>
    getContacts({ pageNumber: page, pageSize: size, clientId });

  useEffect(() => {
    void refreshList(1, 25, clientFilter);
    if (canManage) {
      void fetchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, clientFilter]);

  const fetchClients = async () => {
    setClientsLoading(true);
    try {
      const instance = getAxiosInstace();
      const { data } = await instance.get("/api/Clients?pageNumber=1&pageSize=100");
      if (Array.isArray(data.items)) {
        setClients(data.items.map((c: { id: string; name: string | null }) => ({ id: c.id, name: c.name })));
      } else if (Array.isArray(data)) {
        setClients(data.map((c: { id: string; name: string | null }) => ({ id: c.id, name: c.name })));
      }
    } catch (err) {
      message.error("Failed to load clients");
    } finally {
      setClientsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingContact(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (contact: IContact) => {
    setEditingContact(contact);
    form.setFieldsValue({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phoneNumber: contact.phoneNumber ?? undefined,
      jobTitle: contact.jobTitle ?? undefined,
      clientId: contact.clientId,
      isPrimary: contact.isPrimary,
      isActive: contact.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const basePayload = {
        clientId: values.clientId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber || undefined,
        jobTitle: values.jobTitle || undefined,
        isPrimary: values.isPrimary,
      } as const;

      const success = editingContact
        ? await updateContact(editingContact.id, { ...basePayload, isActive: values.isActive })
        : await createContact(basePayload);

      if (success) {
        message.success(editingContact ? "Contact updated" : "Contact created");
        setIsModalOpen(false);
        setEditingContact(null);
        form.resetFields();
        void refreshList(pageNumber ?? 1, pageSize ?? 25);
      }
    } catch {
      // validation errors handled by antd
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete contact",
      content: "This will remove the contact. Continue?",
      okType: "danger",
      onOk: async () => {
        const success = await deleteContact(id);
        if (success) {
          message.success("Contact deleted");
          void refreshList(pageNumber ?? 1, pageSize ?? 25);
        }
      },
    });
  };

  const handleSetPrimary = async (id: string) => {
    const success = await setPrimary(id);
    if (success) {
      message.success("Primary contact updated");
      void refreshList(pageNumber ?? 1, pageSize ?? 25);
    }
  };

  const columns: ColumnsType<IContact> = useMemo(() => {
    const base: ColumnsType<IContact> = [
      {
        title: "Name",
        key: "name",
        render: (_, record) => `${record.firstName} ${record.lastName}`,
      },
      {
        title: "Client",
        dataIndex: "clientName",
        key: "clientName",
        render: (text: string | null) => text ?? "-",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Phone",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        render: (text: string | null) => text ?? "-",
      },
      {
        title: "Job Title",
        dataIndex: "jobTitle",
        key: "jobTitle",
        render: (text: string | null) => text ?? "-",
      },
      {
        title: "Primary",
        dataIndex: "isPrimary",
        key: "isPrimary",
        render: (val: boolean) => <Tag color={val ? "blue" : "default"}>{val ? "Yes" : "No"}</Tag>,
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        render: (val: boolean) => <Tag color={val ? "green" : "volcano"}>{val ? "Active" : "Inactive"}</Tag>,
      },
    ];

    if (!canManage) return base;

    return [
      ...base,
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button size="small" onClick={() => openEditModal(record)}>
              Edit
            </Button>
            {!record.isPrimary && (
              <Button size="small" onClick={() => void handleSetPrimary(record.id)}>
                Make Primary
              </Button>
            )}
            <Button size="small" danger onClick={() => handleDelete(record.id)}>
              Delete
            </Button>
          </Space>
        ),
      },
    ];
  }, [canManage, handleDelete, handleSetPrimary, openEditModal]);

  return (
    <Card>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Contacts
            </Title>
            <Text type="secondary">Tenant-scoped contacts for all clients.</Text>
          </div>
          <Space>
            <Select
              allowClear
              placeholder="Filter by client"
              style={{ width: 220 }}
              loading={clientsLoading}
              value={clientFilter}
              onChange={(val) => setClientFilter(val)}
              options={clients.map((c) => ({ label: c.name ?? c.id, value: c.id }))}
            />
            {canManage && (
              <Button type="primary" onClick={openCreateModal}>
                New Contact
              </Button>
            )}
            <Button onClick={() => void refreshList(1, pageSize ?? 25)} loading={isPending}>
              Refresh
            </Button>
          </Space>
        </Space>

        {isError && (
          <Alert type="error" message={errorMessage || "Failed to load contacts."} showIcon />
        )}

        <Table
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
            void refreshList(pagination.current ?? 1, pagination.pageSize ?? 25, clientFilter)
          }
        />
      </Space>

      <Modal
        title={editingContact ? "Edit Contact" : "New Contact"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingContact(null);
          form.resetFields();
        }}
        okText={editingContact ? "Update" : "Create"}
        confirmLoading={isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
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
              options={clients.map((c) => ({ label: c.name ?? c.id, value: c.id }))}
            />
          </Form.Item>
          <Form.Item
            name="firstName"
            label="First name"
            rules={[{ required: true, message: "Enter first name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last name"
            rules={[{ required: true, message: "Enter last name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="jobTitle" label="Job Title">
            <Input />
          </Form.Item>
          <Form.Item name="isPrimary" label="Primary" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

const ContactsPage = () => (
  <ContactProvider>
    <ContactsView />
  </ContactProvider>
);

export default ContactsPage;
