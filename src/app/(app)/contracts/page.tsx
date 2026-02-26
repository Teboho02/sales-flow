"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
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
import { useAuthenticationState } from "@/provider";
import { ContractProvider, useContractActions, useContractState } from "@/provider";
import type { IContract } from "@/provider/contract/context";
import { getAxiosInstace } from "@/utils/axiosInstance";

const { Title, Text } = Typography;

const statusColor = (status: number) => {
  switch (status) {
    case 1:
      return "default"; // Draft
    case 2:
      return "blue"; // Active
    case 3:
      return "red"; // Expired
    case 4:
      return "green"; // Renewed
    case 5:
      return "volcano"; // Cancelled
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

const ContractsContent = () => {
  const { user } = useAuthenticationState();
  const { getContracts, createContract, updateContract, deleteContract, activateContract, cancelContract } =
    useContractActions();
  const { contracts, isPending, isError, errorMessage, pageNumber, pageSize, totalCount } = useContractState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [clients, setClients] = useState<Array<{ id: string; name: string | null }>>([]);
  const [opportunities, setOpportunities] = useState<
    Array<{ id: string; title: string | null; clientName: string | null }>
  >([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [selectedContract, setSelectedContract] = useState<IContract | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);

  const canActivate = useMemo(
    () => user?.roles?.some((r) => ["Admin", "SalesManager"].includes(r)),
    [user?.roles],
  );
  const canDelete = useMemo(() => user?.roles?.some((r) => ["Admin"].includes(r)), [user?.roles]);

  const fetchLookups = async () => {
    setLookupLoading(true);
    try {
      const instance = getAxiosInstace();
      const [clientsRes, oppRes] = await Promise.all([
        instance.get("/api/Clients?pageNumber=1&pageSize=100"),
        instance.get("/api/Opportunities?pageNumber=1&pageSize=100"),
      ]);
      const clientItems = Array.isArray(clientsRes.data?.items)
        ? clientsRes.data.items
        : Array.isArray(clientsRes.data)
          ? clientsRes.data
          : [];
      setClients(clientItems.map((c: any) => ({ id: c.id, name: c.name })));

      const oppItems = Array.isArray(oppRes.data?.items)
        ? oppRes.data.items
        : Array.isArray(oppRes.data)
          ? oppRes.data
          : [];
      setOpportunities(
        oppItems.map((o: any) => ({
          id: o.id,
          title: o.title,
          clientName: o.clientName,
        })),
      );
    } catch (err) {
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
        oppItems.map((o: any) => ({
          id: o.id,
          title: o.title,
          clientName: o.clientName,
        })),
      );
    } catch (err) {
      messageApi.error("Failed to load opportunities.");
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    void getContracts({ pageNumber: 1, pageSize: 25 });
    void fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateOrUpdate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        clientId: values.clientId,
        opportunityId: values.opportunityId || undefined,
        proposalId: values.proposalId || undefined,
        contractValue: Number(values.contractValue),
        currency: values.currency || "ZAR",
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
        ownerId: values.ownerId,
        renewalNoticePeriod: Number(values.renewalNoticePeriod),
        autoRenew: values.autoRenew ?? false,
        terms: values.terms || undefined,
      } as any;

      let success = false;
      if (isEdit && selectedContract) {
        success = await updateContract(selectedContract.id, payload);
      } else {
        success = await createContract(payload);
      }
      if (success) {
        messageApi.success(isEdit ? "Contract updated" : "Contract created");
        setIsModalOpen(false);
        setIsEdit(false);
        setSelectedContract(null);
        form.resetFields();
        void getContracts({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
      }
    } catch {
      // handled by antd
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteContract(id);
    if (success) {
      messageApi.success("Contract deleted");
      void getContracts({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
    }
  };

  const handleActivate = async (id: string) => {
    const success = await activateContract(id);
    if (success) {
      messageApi.success("Contract activated");
      void getContracts({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
    }
  };

  const handleCancel = async (id: string) => {
    const success = await cancelContract(id);
    if (success) {
      messageApi.success("Contract cancelled");
      void getContracts({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25, status: statusFilter });
    }
  };

  const columns: ColumnsType<IContract> = useMemo(
    () => [
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
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (_: number, record) => (
          <Tag color={statusColor(record.status)}>{record.statusName ?? record.status}</Tag>
        ),
      },
      {
        title: "Value",
        dataIndex: "contractValue",
        key: "contractValue",
        render: (_: number, record) => formatCurrency(record.contractValue, record.currency),
      },
      {
        title: "End date",
        dataIndex: "endDate",
        key: "endDate",
        render: (date: string | null) => formatDate(date),
      },
      {
        title: "Days to expiry",
        dataIndex: "daysUntilExpiry",
        key: "daysUntilExpiry",
        render: (val: number) => (val !== undefined && val !== null ? val : "—"),
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
          <Space>
            <Button
              size="small"
              onClick={() => {
                setIsEdit(true);
                setSelectedContract(record);
                setIsModalOpen(true);
                form.setFieldsValue({
                  title: record.title ?? "",
                  clientId: record.clientId,
                  opportunityId: record.opportunityId || undefined,
                  proposalId: record.proposalId || undefined,
                  contractValue: record.contractValue,
                  currency: record.currency || "ZAR",
                  startDate: record.startDate ? dayjs(record.startDate) : undefined,
                  endDate: record.endDate ? dayjs(record.endDate) : undefined,
                  ownerId: record.ownerId,
                  renewalNoticePeriod: record.renewalNoticePeriod,
                  autoRenew: record.autoRenew,
                  terms: record.terms ?? "",
                });
                setSelectedClientId(record.clientId);
                void fetchOpportunitiesByClient(record.clientId);
              }}
            >
              Edit
            </Button>
            {record.status === 1 && canActivate ? (
              <Button size="small" type="primary" onClick={() => void handleActivate(record.id)} loading={isPending}>
                Activate
              </Button>
            ) : null}
            {record.status === 2 && canActivate ? (
              <Button size="small" danger onClick={() => void handleCancel(record.id)} loading={isPending}>
                Cancel
              </Button>
            ) : null}
            {canDelete && (
              <Button size="small" danger onClick={() => void handleDelete(record.id)} loading={isPending}>
                Delete
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [canActivate, canDelete, form, isPending],
  );

  return (
    <Card>
      {contextHolder}
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Contracts
            </Title>
            <Text type="secondary">Manage contracts through activation and expiry.</Text>
          </div>
          <Space>
            <Select
              allowClear
              placeholder="Status"
              style={{ width: 160 }}
              onChange={(val) => {
                setStatusFilter(val);
                void getContracts({
                  pageNumber: 1,
                  pageSize: pageSize ?? 25,
                  status: val,
                });
              }}
              options={[
                { label: "Draft", value: 1 },
                { label: "Active", value: 2 },
                { label: "Expired", value: 3 },
                { label: "Renewed", value: 4 },
                { label: "Cancelled", value: 5 },
              ]}
            />
            <Button type="primary" onClick={() => { setIsModalOpen(true); setIsEdit(false); form.resetFields(); }}>
              New Contract
            </Button>
            <Button onClick={() => void getContracts({ pageNumber: 1, pageSize: 25 })} loading={isPending}>
              Refresh
            </Button>
          </Space>
        </Space>

        {isError && <Alert type="error" showIcon message={errorMessage || "Failed to load contracts."} />}

        <Table
          size="middle"
          rowKey="id"
          columns={columns}
          dataSource={contracts ?? []}
          loading={isPending}
          pagination={{
            current: pageNumber ?? 1,
            pageSize: pageSize ?? 25,
            total: totalCount ?? contracts?.length ?? 0,
            showSizeChanger: true,
          }}
          onChange={(pagination) =>
            void getContracts({
              pageNumber: pagination.current ?? 1,
              pageSize: pagination.pageSize ?? 25,
              status: statusFilter,
            })
          }
        />
      </Space>

      <Modal
        title={isEdit ? "Edit Contract" : "Create Contract"}
        open={isModalOpen}
        onOk={handleCreateOrUpdate}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEdit(false);
          setSelectedContract(null);
          form.resetFields();
        }}
        okText={isEdit ? "Save" : "Create"}
        confirmLoading={isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Enter a title" }]}
          >
            <Input placeholder="Contract title" />
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
                setSelectedClientId(val);
                form.setFieldsValue({ opportunityId: undefined });
                void fetchOpportunitiesByClient(val);
              }}
              options={clients.map((c) => ({ label: c.name || c.id, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="opportunityId" label="Opportunity">
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
          <Form.Item name="proposalId" label="Proposal ID (optional)">
            <Input placeholder="Proposal UUID" />
          </Form.Item>
          <Form.Item
            name="contractValue"
            label="Contract Value"
            rules={[{ required: true, message: "Enter contract value" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} step={1000} />
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
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Select start date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: "Select end date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="ownerId"
            label="Owner ID"
            rules={[{ required: true, message: "Enter owner user ID" }]}
          >
            <Input placeholder="Owner user UUID" />
          </Form.Item>
          <Form.Item
            name="renewalNoticePeriod"
            label="Renewal notice period (days)"
            rules={[{ required: true, message: "Enter notice period" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item name="autoRenew" label="Auto renew" valuePropName="checked">
            <Select
              options={[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ]}
            />
          </Form.Item>
          <Form.Item name="terms" label="Terms">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

const ContractsPage = () => (
  <ContractProvider>
    <ContractsContent />
  </ContractProvider>
);

export default ContractsPage;
