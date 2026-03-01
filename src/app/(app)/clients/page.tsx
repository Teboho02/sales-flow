"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Drawer,
  Form,
  Grid,
  Input,
  Popconfirm,
  Select,
  Skeleton,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ClientProvider, useAuthenticationState, useClientActions, useClientState } from "@/provider";
import type { IClient } from "@/provider/client/context";
import type { IOpportunity } from "@/provider/opportunity/context";
import type { IContract } from "@/provider/contract/context";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const clientTypeLabel: Record<number, string> = {
  1: "Government",
  2: "Private",
  3: "Partner",
};

const stageLabel: Record<number, string> = {
  1: "Lead", 2: "Qualified", 3: "Proposal", 4: "Negotiation", 5: "Closed Won", 6: "Closed Lost",
};

const stageColor: Record<number, string> = {
  1: "default", 2: "blue", 3: "gold", 4: "orange", 5: "green", 6: "red",
};

const contractStatusColor: Record<number, string> = {
  1: "default", 2: "green", 3: "orange", 4: "red",
};

const formatCurrency = (val: number, currency = "ZAR") =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency, maximumFractionDigits: 0 }).format(val ?? 0);

const ClientsContent = () => {
  const { styles } = useStyles();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
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

  const [clientOpportunities, setClientOpportunities] = useState<IOpportunity[]>([]);
  const [clientContracts, setClientContracts] = useState<IContract[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

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
      width: 220,
      render: (text: string | null) => text ?? "-",
    },
    {
      title: "Type",
      dataIndex: "clientType",
      key: "clientType",
      width: 140,
      render: (val: number) => clientTypeLabel[val] ?? val,
    },
    {
      title: "Industry",
      dataIndex: "industry",
      key: "industry",
      width: 160,
      render: (text: string | null) => text ?? "-",
    },
    {
      title: "Size",
      dataIndex: "companySize",
      key: "companySize",
      width: 140,
      render: (text: string | null) => text ?? "-",
    },
    {
      title: "Website",
      dataIndex: "website",
      key: "website",
      width: 220,
      render: (text: string | null) =>
        text ? (
          <a href={text} target="_blank" rel="noreferrer">
            {text}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Opportunities",
      dataIndex: "opportunitiesCount",
      key: "opportunitiesCount",
      width: 130,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (val: boolean) =>
        val ? <Tag color="green">Active</Tag> : <Tag color="default">Inactive</Tag>,
    },
  ];
  if (canManageClients) {
    columns.push({
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space wrap size={[6, 6]}>
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

  const handleRowClick = async (client: IClient) => {
    setSelectedClient(client);
    setClientOpportunities([]);
    setClientContracts([]);
    setDetailLoading(true);
    void getClientStats(client.id);
    try {
      const instance = getAxiosInstace();
      const [oppRes, contractRes] = await Promise.all([
        instance.get(`/api/Opportunities?clientId=${client.id}&pageSize=100`),
        instance.get(`/api/Contracts?clientId=${client.id}&pageSize=100`),
      ]);
      const opps = Array.isArray(oppRes.data) ? oppRes.data : (oppRes.data?.items ?? []);
      const contracts = Array.isArray(contractRes.data) ? contractRes.data : (contractRes.data?.items ?? []);
      setClientOpportunities(opps as IOpportunity[]);
      setClientContracts(contracts as IContract[]);
    } catch {
      // non-critical — stats drawer still shows
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Card className={styles.card}>
        <Space direction="vertical" size={12} className={styles.container}>
          <div className={styles.headerRow}>
            <div className={styles.headerText}>
              <Title level={isMobile ? 4 : 3} className={styles.title}>
                Clients
              </Title>
              <Text type="secondary" className={styles.subtitle}>
                Accounts scoped to your tenant.
              </Text>
            </div>
            <div className={styles.actions}>
              {canManageClients ? (
                <Button type="primary" onClick={openCreateModal}>
                  New Client
                </Button>
              ) : null}
            </div>
          </div>

            <Space wrap className={styles.filterRow}>
              <Input.Search
                allowClear
                placeholder="Search clients"
              className={styles.searchInput}
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
            />
              <Select
                allowClear
                placeholder="Client type"
                className={styles.filterSelect}
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
                className={styles.filterSelect}
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
            className={styles.table}
            size={isMobile ? "small" : "middle"}
            rowKey="id"
            columns={columns}
            dataSource={clients ?? []}
            loading={isPending}
            scroll={{ x: 1200 }}
            pagination={{
              current: pageNumber ?? 1,
              pageSize: pageSize ?? 25,
              total: totalCount ?? clients?.length ?? 0,
              showSizeChanger: !isMobile,
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
              onClick: () => void handleRowClick(record),
            })}
          />
        </Space>

        <Drawer
          title={selectedClient?.name ?? "Client details"}
          open={Boolean(selectedClient)}
          onClose={() => setSelectedClient(null)}
          width={isMobile ? "100%" : 720}
        >
          {selectedClient ? (
            <Tabs
              defaultActiveKey="summary"
              items={[
                {
                  key: "summary",
                  label: "Summary",
                  children: (
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
                        <Text>Active opportunities</Text>
                        <Text strong>{clientStats?.activeOpportunities ?? "-"}</Text>
                      </Space>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Text>Contracts</Text>
                        <Text strong>{clientStats?.totalContracts ?? "-"}</Text>
                      </Space>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Text>Total contract value</Text>
                        <Text strong>
                          {clientStats?.totalContractValue != null
                            ? formatCurrency(clientStats.totalContractValue)
                            : "-"}
                        </Text>
                      </Space>
                    </Space>
                  ),
                },
                {
                  key: "opportunities",
                  label: `Opportunities (${clientOpportunities.length})`,
                  children: detailLoading ? (
                    <Skeleton active />
                  ) : (
                    <Table<IOpportunity>
                      size="small"
                      rowKey="id"
                      pagination={false}
                      dataSource={clientOpportunities}
                      locale={{ emptyText: "No opportunities" }}
                      columns={[
                        {
                          title: "Title",
                          dataIndex: "title",
                          key: "title",
                          render: (v: string | null) => v ?? "-",
                        },
                        {
                          title: "Stage",
                          dataIndex: "stage",
                          key: "stage",
                          render: (v: number, r) => (
                            <Tag color={stageColor[v] ?? "default"}>
                              {r.stageName ?? stageLabel[v] ?? v}
                            </Tag>
                          ),
                        },
                        {
                          title: "Value",
                          dataIndex: "estimatedValue",
                          key: "estimatedValue",
                          align: "right" as const,
                          render: (v: number, r) => formatCurrency(v, r.currency ?? "ZAR"),
                        },
                        {
                          title: "Owner",
                          dataIndex: "ownerName",
                          key: "ownerName",
                          render: (v: string | null) => v ?? "-",
                        },
                      ] as ColumnsType<IOpportunity>}
                    />
                  ),
                },
                {
                  key: "contracts",
                  label: `Contracts (${clientContracts.length})`,
                  children: detailLoading ? (
                    <Skeleton active />
                  ) : (
                    <Table<IContract>
                      size="small"
                      rowKey="id"
                      pagination={false}
                      dataSource={clientContracts}
                      locale={{ emptyText: "No contracts" }}
                      columns={[
                        {
                          title: "Title",
                          dataIndex: "title",
                          key: "title",
                          render: (v: string | null) => v ?? "-",
                        },
                        {
                          title: "Status",
                          dataIndex: "statusName",
                          key: "statusName",
                          render: (v: string | null, r) => (
                            <Tag color={contractStatusColor[r.status] ?? "default"}>
                              {v ?? r.status}
                            </Tag>
                          ),
                        },
                        {
                          title: "Value",
                          dataIndex: "contractValue",
                          key: "contractValue",
                          align: "right" as const,
                          render: (v: number, r) => formatCurrency(v, r.currency ?? "ZAR"),
                        },
                        {
                          title: "Ends",
                          dataIndex: "endDate",
                          key: "endDate",
                          render: (v: string) =>
                            v
                              ? new Intl.DateTimeFormat("en-ZA", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }).format(new Date(v))
                              : "-",
                        },
                      ] as ColumnsType<IContract>}
                    />
                  ),
                },
              ]}
            />
          ) : null}
        </Drawer>

        <Drawer
          title={editingClient ? "Edit Client" : "New Client"}
          open={isModalOpen}
          width={isMobile ? "100%" : 480}
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


