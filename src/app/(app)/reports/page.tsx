"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, DatePicker, Form, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useAuthenticationState } from "@/provider";
import { ReportProvider, useReportActions, useReportState } from "@/provider";
import type { OpportunitiesReportItem, SalesByPeriodItem } from "@/provider/report/context";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);

const defaultRange = [dayjs().subtract(30, "day"), dayjs()];

const ReportsContent = () => {
  const { roles } = useAuthenticationState().user ?? {};
  const { getOpportunitiesReport, getSalesByPeriod } = useReportActions();
  const { opportunitiesReport, salesByPeriod, isPending, isError, errorMessage } = useReportState();
  const { styles } = useStyles();

  const [form] = Form.useForm();

  const canView = useMemo(
    () => roles?.some((r) => ["Admin", "SalesManager"].includes(r)),
    [roles],
  );

  useEffect(() => {
    if (!canView) return;
    const start = defaultRange[0].toISOString();
    const end = defaultRange[1].toISOString();
    void getOpportunitiesReport({ startDate: start, endDate: end });
    void getSalesByPeriod({ startDate: start, endDate: end, groupBy: "month" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  const oppColumns: ColumnsType<OpportunitiesReportItem> = [
    {
      title: "Stage",
      dataIndex: "stageName",
      key: "stageName",
      render: (text, record) => text ?? record.stage,
    },
    {
      title: "Owner",
      dataIndex: "ownerName",
      key: "ownerName",
      render: (text) => text ?? "All",
    },
    { title: "Count", dataIndex: "count", key: "count" },
    {
      title: "Total Value",
      dataIndex: "totalValue",
      key: "totalValue",
      render: (val: number) => formatCurrency(val ?? 0),
    },
  ];

  const salesColumns: ColumnsType<SalesByPeriodItem> = [
    { title: "Period", dataIndex: "period", key: "period" },
    { title: "Value", dataIndex: "value", key: "value", render: (val) => formatCurrency(val ?? 0) },
  ];

  if (!canView) {
    return <Alert type="warning" message="Reports are restricted to Admin and SalesManager roles." showIcon />;
  }

  const handleRun = async () => {
    const values = await form.validateFields();
    const startDate = values.range?.[0]?.toISOString();
    const endDate = values.range?.[1]?.toISOString();
    if (!startDate || !endDate) return;
    void getOpportunitiesReport({
      startDate,
      endDate,
      stage: values.stage,
      ownerId: values.ownerId,
    });
    void getSalesByPeriod({ startDate, endDate, groupBy: values.groupBy });
  };

  return (
    <Card className={styles.card}>
      <Space direction="vertical" size={12} className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <Title level={3} style={{ margin: 0 }}>
              Reports
            </Title>
            <Text type="secondary">Opportunities and sales performance (Admin/SalesManager).</Text>
          </div>
        </div>

        <Form
          form={form}
          layout="inline"
          className={styles.filterBar}
          initialValues={{ range: defaultRange, groupBy: "month" }}
        >
          <Form.Item name="range" rules={[{ required: true, message: "Select date range" }]}>
            <DatePicker.RangePicker allowClear={false} />
          </Form.Item>
          <Form.Item name="stage">
            <Select
              allowClear
              placeholder="Stage"
              style={{ width: 140 }}
              options={[
                { label: "Lead", value: 1 },
                { label: "Qualified", value: 2 },
                { label: "Proposal", value: 3 },
                { label: "Negotiation", value: 4 },
                { label: "Closed Won", value: 5 },
                { label: "Closed Lost", value: 6 },
              ]}
            />
          </Form.Item>
          <Form.Item name="ownerId">
            <Select allowClear placeholder="Owner ID" style={{ width: 200 }} options={[]} />
          </Form.Item>
          <Form.Item name="groupBy" rules={[{ required: true }]}> 
            <Select
              style={{ width: 120 }}
              options={[
                { label: "Month", value: "month" },
                { label: "Week", value: "week" },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={() => void handleRun()} loading={isPending}>
              Run
            </Button>
          </Form.Item>
        </Form>

        {isError && <Alert type="error" showIcon message={errorMessage || "Failed to load reports."} />}

        <Card title="Opportunities Report">
          <Table
            size="small"
            rowKey={(r) => `${r.stage}-${r.ownerId ?? "all"}`}
            columns={oppColumns}
            dataSource={opportunitiesReport ?? []}
            loading={isPending}
            pagination={false}
          />
        </Card>

        <Card title="Sales by Period">
          <Table
            size="small"
            rowKey={(r) => r.period}
            columns={salesColumns}
            dataSource={salesByPeriod ?? []}
            loading={isPending}
            pagination={false}
          />
        </Card>
      </Space>
    </Card>
  );
};

const ReportsPage = () => (
  <ReportProvider>
    <ReportsContent />
  </ReportProvider>
);

export default ReportsPage;
