"use client";

import { useEffect, useState, useCallback } from "react";
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
  Typography,
  message,
} from "antd";
import { ClientProvider, useClientActions, useClientState } from "@/provider";
import type { IClient } from "@/provider/client/context";
import ClientTable from "./_components/ClientTable";

const { Title, Text } = Typography;

const ClientsContent = () => {
  const { getClients, createClient, updateClient, deleteClient, getClientStats } = useClientActions();
  const { clients, clientStats, isPending, isError, errorMessage, pageNumber, pageSize, totalCount } =
    useClientState();

  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [clientTypeFilter, setClientTypeFilter] = useState<number | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  const refreshClients = useCallback(
    (page = pageNumber ?? 1, size = pageSize ?? 25, search = searchTerm, type = clientTypeFilter, active = isActiveFilter) =>
      getClients({
        pageNumber: page,
        pageSize: size,
        searchTerm: search || undefined,
        clientType: type,
        isActive: active,
      }),
    [clientTypeFilter, getClients, isActiveFilter, pageNumber, pageSize, searchTerm],
  );

  useEffect(() => {
    void refreshClients(1, 25);
  }, [refreshClients]);

  const openCreateModal = () => {
    setEditingClient(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (client: IClient) => {
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
    try {
      const values = await form.validateFields();
      const basePayload = {
        name: values.name,
        clientType: values.clientType,
        industry: values.industry || undefined,
        companySize: values.companySize || undefined,
        website: values.website || undefined,
        billingAddress: values.billingAddress || undefined,
        taxNumber: values.taxNumber || undefined,
      };

      const success = editingClient
        ? await updateClient(editingClient.id, { ...basePayload, isActive: values.isActive })
        : await createClient(basePayload);

      if (success) {
        messageApi.success(`Client ${editingClient ? "updated" : "created"}`);
        setIsModalOpen(false);
        setEditingClient(null);
        form.resetFields();
        void refreshClients(pageNumber ?? 1, pageSize ?? 25);
      }
    } catch {
      // validation handled by antd
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteClient(id);
    if (success) {
      messageApi.success("Client deleted");
      void refreshClients(pageNumber ?? 1, pageSize ?? 25);
    }
  };

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
              <Button type="primary" onClick={openCreateModal}>
                New Client
              </Button>
            </Space>
          </Space>

          {isError && (
            <Alert type="error" showIcon message={errorMessage || "Failed to load clients."} />
          )}

          <ClientTable
            data={clients}
            loading={isPending}
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalCount={totalCount}
            searchTerm={searchTerm}
            clientTypeFilter={clientTypeFilter}
            isActiveFilter={isActiveFilter}
            onSearch={(value) => {
              setSearchTerm(value);
              void refreshClients(1, pageSize ?? 25, value, clientTypeFilter, isActiveFilter);
            }}
            onClientTypeChange={(val) => {
              setClientTypeFilter(val);
              void refreshClients(1, pageSize ?? 25, searchTerm, val, isActiveFilter);
            }}
            onStatusChange={(val) => {
              setIsActiveFilter(val);
              void refreshClients(1, pageSize ?? 25, searchTerm, clientTypeFilter, val);
            }}
            onRefresh={() => void refreshClients(1, pageSize ?? 25)}
            onPageChange={(pagination) =>
              void refreshClients(pagination.current ?? 1, pagination.pageSize ?? 25, searchTerm, clientTypeFilter, isActiveFilter)
            }
            onRowClick={handleRowClick}
            onEdit={openEditModal}
            onDelete={(client) => handleDelete(client.id)}
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
                <Text strong>{clientStats?.totalContacts ?? "-"}</Text>
              </Space>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text>Opportunities</Text>
                <Text strong>{clientStats?.totalOpportunities ?? "-"}</Text>
              </Space>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text>Contracts</Text>
                <Text strong>{clientStats?.totalContracts ?? "-"}</Text>
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
                    : "-"}
                </Text>
              </Space>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text>Active opportunities</Text>
                <Text strong>{clientStats?.activeOpportunities ?? "-"}</Text>
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

