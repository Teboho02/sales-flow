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
import { ClientProvider, useAuthenticationState, useClientActions, useClientState } from "@/provider";
import type { IClient } from "@/provider/client/context";

const { Title, Text } = Typography;

const clientTypeLabel: Record<number, string> = {
  1: "Government",
  2: "Private",
  3: "Partner",
};

const ClientsContent = () => {
  const { getClients, createClient, updateClient, deleteClient, getClientStats } =
    useClientActions();
  const {
    clients,
    clientStats,
    isPending,
    isError,
    errorMessage,
    pageNumber,
    pageSize,
    totalCount,
  } = useClientState();

  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [clientTypeFilter, setClientTypeFilter] = useState<number | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  const { user } = useAuthenticationState();
  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("Admin");
  const isSalesManager = roles.includes("SalesManager");
  const canManageClients = isAdmin || isSalesManager;

  useEffect(() => {
    void getClients({ pageNumber: 1, pageSize: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    if (!canManageClients) {
      messageApi.warning("You don't have permission to create clients.");
      return;
    }
    setEditingClient(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (client: IClient) => {
    if (!canManageClients) {
      messageApi.warning("You don't have permission to edit clients.");
      return;
    }
    setEditingClient(client);
    form.setFieldsValue({
      name: client.name ?? "",
      clientType: client.clientType,
      industry: client.industry ?? "",
      companySize: client.companySize ?? "",
      website: client.website ?? "",
      billingAddress: client.billingAddress ?? "",
      taxNumber: client.taxNumber ?? "",
      isActive: client.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!canManageClients) {
      return;
    }
    try {
      const values = await form.validateFields();
      let success = false;
      if (editingClient) {
        success = await updateClient(editingClient.id, {
          name: values.name,
          clientType: values.clientType,
          industry: values.industry || undefined,
          companySize: values.companySize || undefined,
          website: values.website || undefined,
          billingAddress: values.billingAddress || undefined,
          taxNumber: values.taxNumber || undefined,
          isActive: values.isActive,
        });
      } else {
        success = await createClient({
          name: values.name,
          clientType: values.clientType,
          industry: values.industry || undefined,
          companySize: values.companySize || undefined,
          website: values.website || undefined,
          billingAddress: values.billingAddress || undefined,
          taxNumber: values.taxNumber || undefined,
        });
      }
      if (success) {
        messageApi.success(`Client ${editingClient ? "updated" : "created"}`);
        setIsModalOpen(false);
        setEditingClient(null);
        form.resetFields();
        void getClients({
          pageNumber: pageNumber ?? 1,
          pageSize: pageSize ?? 25,
          searchTerm: searchTerm || undefined,
          clientType: clientTypeFilter,
          isActive: isActiveFilter,
        });
      }
    } catch {
      // validation handled by antd
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManageClients) {
      messageApi.warning("You don't have permission to delete clients.");
      return;
    }
    const success = await deleteClient(id);
    if (success) {
      messageApi.success("Client deleted");
      void getClients({
        pageNumber: pageNumber ?? 1,
        pageSize: pageSize ?? 25,
        searchTerm: searchTerm || undefined,
        clientType: clientTypeFilter,
        isActive: isActiveFilter,
      });
    }
  };

  const columns: ColumnsType<IClient> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string | null) => text ?? "—",
    },
    {
      title: "Type",
      dataIndex: "clientType",
      key: "clientType",
      render: (val: number) => clientTypeLabel[val] ?? val,
    },
    {
      title: "Industry",
      dataIndex: "industry",
      key: "industry",
      render: (text: string | null) => text ?? "—",
    },
    {
      title: "Size",
      dataIndex: "companySize",
      key: "companySize",
      render: (text: string | null) => text ?? "—",
    },
    {
      title: "Website",
      dataIndex: "website",
      key: "website",
      render: (text: string | null) =>
        text ? (
          <a href={text} target="_blank" rel="noreferrer">
            {text}
          </a>
        ) : (
          "—"
        ),
    },
    {
      title: "Opportunities",
      dataIndex: "opportunitiesCount",
      key: "opportunitiesCount",
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (val: boolean) =>
        val ? <Tag color="green">Active</Tag> : <Tag color="default">Inactive</Tag>,
    },
  ];
  if (canManageClients) {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete client?"
            description="This will remove the client record."
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

  const handleRowClick = (client: IClient) => {
    setSelectedClient(client);
    void getClientStats(client.id);
  };

  return (
    <>
      {contextHolder}
      <Card>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Clients
              </Title>
              <Text type="secondary">Accounts scoped to your tenant.</Text>
            </div>
            <Space>
              {canManageClients ? (
                <Button type="primary" onClick={openCreateModal}>
                  New Client
                </Button>
              ) : null}
              <Button
                onClick={() =>
                  void getClients({
                    pageNumber: 1,
                    pageSize: pageSize ?? 25,
                    searchTerm: searchTerm || undefined,
                    clientType: clientTypeFilter,
                    isActive: isActiveFilter,
                  })
                }
                loading={isPending}
              >
                Refresh
              </Button>
            </Space>
          </Space>

            <Space wrap>
              <Input.Search
                allowClear
                placeholder="Search clients"
              onSearch={(value) => {
                setSearchTerm(value);
                void getClients({
                  pageNumber: 1,
                  pageSize: pageSize ?? 25,
                  searchTerm: value || undefined,
                  clientType: clientTypeFilter,
                  isActive: isActiveFilter,
                });
              }}
              style={{ width: 240 }}
            />
              <Select
                allowClear
                placeholder="Client type"
                style={{ width: 180 }}
                onChange={(val) => {
                  setClientTypeFilter(val);
                  void getClients({
                    pageNumber: 1,
                    pageSize: pageSize ?? 25,
                    searchTerm: searchTerm || undefined,
                    clientType: val,
                    isActive: isActiveFilter,
                  });
                }}
                options={[
                  { label: "Government", value: 1 },
                  { label: "Private", value: 2 },
                  { label: "Partner", value: 3 },
                ]}
              />
              <Select
                allowClear
                placeholder="Status"
                style={{ width: 140 }}
                onChange={(val) => {
                  const next = val as boolean | undefined;
                  setIsActiveFilter(next);
                  void getClients({
                    pageNumber: 1,
                    pageSize: pageSize ?? 25,
                    searchTerm: searchTerm || undefined,
                    clientType: clientTypeFilter,
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
            <Alert type="error" showIcon message={errorMessage || "Failed to load clients."} />
          )}

          <Table
            size="middle"
            rowKey="id"
            columns={columns}
            dataSource={clients ?? []}
            loading={isPending}
            pagination={{
              current: pageNumber ?? 1,
              pageSize: pageSize ?? 25,
              total: totalCount ?? clients?.length ?? 0,
              showSizeChanger: true,
            }}
            onChange={(pagination) =>
              void getClients({
                pageNumber: pagination.current ?? 1,
                pageSize: pagination.pageSize ?? 25,
                searchTerm: searchTerm || undefined,
                clientType: clientTypeFilter,
                isActive: isActiveFilter,
              })
            }
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
          />
        </Space>

        <Drawer
          title={selectedClient?.name ?? "Client stats"}
          open={Boolean(selectedClient)}
          onClose={() => setSelectedClient(null)}
          width={360}
        >
          {selectedClient ? (
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Text type="secondary">Totals</Text>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text>Contacts</Text>
                <Text strong>{clientStats?.totalContacts ?? "—"}</Text>
              </Space>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text>Opportunities</Text>
                <Text strong>{clientStats?.totalOpportunities ?? "—"}</Text>
              </Space>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text>Contracts</Text>
                <Text strong>{clientStats?.totalContracts ?? "—"}</Text>
              </Space>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text>Total contract value</Text>
                <Text strong>
                  {clientStats?.totalContractValue != null
                    ? new Intl.NumberFormat("en-ZA", {
                        style: "currency",
                        currency: "ZAR",
                        maximumFractionDigits: 0,
                      }).format(clientStats.totalContractValue)
                    : "—"}
                </Text>
              </Space>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text>Active opportunities</Text>
                <Text strong>{clientStats?.activeOpportunities ?? "—"}</Text>
              </Space>
            </Space>
          ) : null}
        </Drawer>

        <Drawer
          title={editingClient ? "Edit Client" : "New Client"}
          open={isModalOpen}
          width={480}
          destroyOnClose
          onClose={() => {
            setIsModalOpen(false);
            setEditingClient(null);
            form.resetFields();
          }}
          extra={
            <Space>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingClient(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" onClick={() => void handleSubmit()} loading={isPending}>
                {editingClient ? "Save" : "Create"}
              </Button>
            </Space>
          }
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Enter client name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="clientType"
              label="Client Type"
              rules={[{ required: true, message: "Select client type" }]}
            >
              <Select
                options={[
                  { label: "Government", value: 1 },
                  { label: "Private", value: 2 },
                  { label: "Partner", value: 3 },
                ]}
              />
            </Form.Item>
            <Form.Item name="industry" label="Industry">
              <Input />
            </Form.Item>
            <Form.Item name="companySize" label="Company Size">
              <Input placeholder="e.g. 100-500" />
            </Form.Item>
            <Form.Item name="website" label="Website">
              <Input placeholder="https://example.com" />
            </Form.Item>
            <Form.Item name="billingAddress" label="Billing Address">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="taxNumber" label="Tax Number">
              <Input />
            </Form.Item>
            {editingClient ? (
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            ) : null}
          </Form>
        </Drawer>
      </Card>
    </>
  );
};

const ClientsPage = () => (
  <ClientProvider>
    <ClientsContent />
  </ClientProvider>
);

export default ClientsPage;
