"use client";

import { useEffect, useMemo, useState } from "react";
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
import { OpportunityProvider, useOpportunityActions, useOpportunityState } from "@/provider";
import type { IOpportunity } from "@/provider/opportunity/context";

const { Title, Text } = Typography;

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

const OpportunitiesView = () => {
  const { getOpportunities, createOpportunity } = useOpportunityActions();
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

  useEffect(() => {
    void getOpportunities({ pageNumber: 1, pageSize: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        void getOpportunities({ pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 25 });
      }
    } catch {
      // validation errors are handled by antd; API errors already surfaced by provider alert
    }
  };

  const columns: ColumnsType<IOpportunity> = useMemo(
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
    ],
    [],
  );

  return (
    <Card>
      {contextHolder}
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Opportunities
            </Title>
            <Text type="secondary">Pipeline scoped to your tenant.</Text>
          </div>
          <Space>
            <Button onClick={() => setIsModalOpen(true)} type="primary">
              New Opportunity
            </Button>
            <Button
              onClick={() => void getOpportunities({ pageNumber: 1, pageSize: 25 })}
              loading={isPending}
            >
              Refresh
            </Button>
          </Space>
        </Space>
        {isError && (
          <Alert
            type="error"
            showIcon
            message={errorMessage || "Failed to load opportunities."}
          />
        )}
        <Table
          size="middle"
          rowKey="id"
          columns={columns}
          dataSource={opportunities ?? []}
          loading={isPending}
          pagination={{
            current: pageNumber ?? 1,
            pageSize: pageSize ?? 25,
            total: totalCount ?? (opportunities?.length ?? 0),
            showSizeChanger: true,
          }}
          onChange={(pagination) =>
            void getOpportunities({
              pageNumber: pagination.current ?? 1,
              pageSize: pagination.pageSize ?? 25,
            })
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
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Enter a title" }]}>
            <Input placeholder="Opportunity title" />
          </Form.Item>
          <Form.Item
            name="clientId"
            label="Client ID"
            rules={[
              { required: true, message: "Enter client ID (UUID)" },
              {
                pattern:
                  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
                message: "Enter a valid UUID",
              },
            ]}
          >
            <Input placeholder="Client UUID" />
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
    </Card>
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
