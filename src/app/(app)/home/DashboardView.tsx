"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Modal,
  Progress,
  Space,
  Tag,
  Typography,
  Table,
  Skeleton,
  message,
} from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useStyles } from "./style/styles";

const { Text } = Typography;

const formatPercent = (value: number) => `${Math.round(value)}%`;

type StageMetrics = {
  stage: number;
  stageName: string | null;
  count: number;
  totalValue: number;
  weightedValue: number;
};

type PipelineMetrics = {
  stageMetrics: Record<string, StageMetrics>;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  totalOpportunities: number;
  activeOpportunities: number;
  averageDealSize: number;
  winRate: number;
};

type Overview = {
  opportunities: {
    totalCount: number;
    wonCount: number;
    winRate: number;
    pipelineValue: number;
  };
  pipeline: {
    stages: StageMetrics[];
    weightedPipelineValue: number;
  };
  activities: {
    upcomingCount: number;
    overdueCount: number;
    completedTodayCount: number;
  };
  contracts: {
    totalActiveCount: number;
    expiringThisMonthCount: number;
    totalContractValue: number;
  };
  revenue: {
    thisMonth: number;
    thisQuarter: number;
    thisYear: number;
    monthlyTrend: { month: string; value: number }[];
  };
};

type SalesPerformance = {
  userId: string;
  userName: string;
  wonCount: number;
  totalRevenue: number;
  winRate: number;
};

type ExpiringContract = {
  id: string;
  title: string | null;
  clientName: string | null;
  contractValue: number;
  currency: string | null;
  endDate: string;
  daysUntilExpiry: number;
};

const DashboardView = () => {
  const { styles } = useStyles();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics | null>(null);
  const [topPerformers, setTopPerformers] = useState<SalesPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [expiringContracts, setExpiringContracts] = useState<ExpiringContract[]>([]);
  const [renewTarget, setRenewTarget] = useState<ExpiringContract | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewForm] = Form.useForm<{ newEndDate: Dayjs }>();
  const [messageApi, contextHolder] = message.useMessage();

  const instance = useMemo(() => getAxiosInstace(), []);

  const fetchData = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [overviewRes, pipelineRes, performanceRes, expiringRes] = await Promise.all([
        instance.get("/api/Dashboard/overview"),
        instance.get("/api/Opportunities/pipeline"),
        instance.get("/api/Dashboard/sales-performance?topCount=5"),
        instance.get("/api/Contracts/expiring?daysUntilExpiry=30"),
      ]);
      setOverview(overviewRes.data);
      setPipelineMetrics(pipelineRes.data);
      setTopPerformers(performanceRes.data?.topPerformers ?? []);
      const expiring = Array.isArray(expiringRes.data?.items)
        ? expiringRes.data.items
        : Array.isArray(expiringRes.data)
          ? expiringRes.data
          : [];
      setExpiringContracts(expiring as ExpiringContract[]);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
        : err instanceof Error
          ? err.message
          : "Failed to load dashboard data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRenew = async () => {
    if (!renewTarget) return;
    try {
      const values = await renewForm.validateFields();
      setRenewLoading(true);
      await instance.put(`/api/Contracts/${renewTarget.id}/renew`, {
        newEndDate: values.newEndDate.toISOString(),
      });
      messageApi.success(`Contract "${renewTarget.title ?? renewTarget.id}" renewed.`);
      setRenewTarget(null);
      renewForm.resetFields();
      // Refresh expiring list
      const res = await instance.get("/api/Contracts/expiring?daysUntilExpiry=30");
      const updated = Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
          ? res.data
          : [];
      setExpiringContracts(updated as ExpiringContract[]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        messageApi.error(err.response?.data?.detail ?? err.response?.data?.title ?? "Renewal failed.");
      }
    } finally {
      setRenewLoading(false);
    }
  };

  const pipelineStageList: StageMetrics[] = useMemo(() => {
    if (!pipelineMetrics) return [];
    return Object.values(pipelineMetrics.stageMetrics || {});
  }, [pipelineMetrics]);

  return (
    <div className={styles.page}>
      {contextHolder}
      <section className={styles.headerRow}>
        <div className={styles.headerText}>
          <Text type="secondary">Welcome back</Text>
          <Text className={styles.headerCurrent}>Pipeline and performance overview</Text>
        </div>
      </section>

      {error ? (
        <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} />
      ) : null}

      {loading && !overview ? (
        <Skeleton active />
      ) : (
        <>
          <section className={styles.metricsGrid}>
            <Card className={styles.metricCard}>
              <Space direction="vertical" size={6}>
                <Text className={styles.metricLabel}>Active opportunities</Text>
                <Text className={styles.metricValue}>
                  {pipelineMetrics?.activeOpportunities ?? "—"}
                </Text>

              </Space>
            </Card>
            <Card className={styles.metricCard}>
              <Space direction="vertical" size={6}>
                <Text className={styles.metricLabel}>Win rate</Text>
                <Text className={styles.metricValue}>
                  {pipelineMetrics?.winRate != null ? formatPercent(pipelineMetrics.winRate) : "—"}
                </Text>

              </Space>
            </Card>
            <Card className={styles.metricCard}>
              <Space direction="vertical" size={6}>
                <Text className={styles.metricLabel}>Revenue this month</Text>
                <Text className={styles.metricValue}>
                  {overview?.revenue?.thisMonth != null
                    ? `R${overview.revenue.thisMonth.toLocaleString("en-ZA")}`
                    : "—"}
                </Text>
                <Text type="secondary">
                  Quarter: {overview?.revenue?.thisQuarter != null
                    ? `R${overview.revenue.thisQuarter.toLocaleString("en-ZA")}`
                    : "—"}
                </Text>
              </Space>
            </Card>
            <Card className={styles.metricCard}>
              <Space direction="vertical" size={6}>
                <Text className={styles.metricLabel}>Contracts</Text>
                <Text className={styles.metricValue}>
                  {overview?.contracts?.totalActiveCount ?? "—"}
                </Text>
                <Text type="secondary">
                  Expiring this month: {overview?.contracts?.expiringThisMonthCount ?? "—"}
                </Text>
              </Space>
            </Card>
          </section>

          <section className={styles.lowerGrid}>
            <Card className={styles.panelCard} title="Pipeline by stage">
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                {pipelineStageList.map((stage) => (
                  <div key={stage.stage} style={{ width: "100%" }}>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Text strong>{stage.stageName ?? `Stage ${stage.stage}`}</Text>
                      <Text type="secondary">
                        {stage.count} · R{stage.totalValue.toLocaleString("en-ZA")}
                      </Text>
                    </Space>
                    <Progress
                      percent={Math.min(
                        100,
                        stage.count && pipelineMetrics?.totalOpportunities
                          ? (stage.count / pipelineMetrics.totalOpportunities) * 100
                          : 0,
                      )}
                      showInfo={false}
                    />
                  </div>
                ))}
              </Space>
            </Card>

            <Card className={styles.panelCard} title="Top performers">
              <Table
                size="small"
                rowKey="userId"
                pagination={false}
                dataSource={topPerformers}
                columns={[
                  { title: "User", dataIndex: "userName", key: "userName" },
                  {
                    title: "Won",
                    dataIndex: "wonCount",
                    key: "won",
                  },
                  {
                    title: "Revenue",
                    dataIndex: "totalRevenue",
                    key: "revenue",
                    render: (val: number) => `R${val.toLocaleString("en-ZA")}`,
                  },
                  {
                    title: "Win rate",
                    dataIndex: "winRate",
                    key: "winRate",
                    render: (val: number) => formatPercent(val),
                  },
                ]}
              />
            </Card>
          </section>

          {expiringContracts.length > 0 && (
            <Card
              className={styles.panelCard}
              title={
                <Space>
                  <WarningOutlined style={{ color: "#fa8c16" }} />
                  <span>Contracts expiring within 30 days ({expiringContracts.length})</span>
                </Space>
              }
            >
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={expiringContracts}
                columns={[
                  {
                    title: "Contract",
                    dataIndex: "title",
                    key: "title",
                    render: (v: string | null) => v ?? "Untitled",
                  },
                  {
                    title: "Client",
                    dataIndex: "clientName",
                    key: "clientName",
                    render: (v: string | null) => v ?? "—",
                  },
                  {
                    title: "Expires",
                    dataIndex: "endDate",
                    key: "endDate",
                    render: (v: string) =>
                      new Intl.DateTimeFormat("en-ZA", { year: "numeric", month: "short", day: "numeric" }).format(new Date(v)),
                  },
                  {
                    title: "Days left",
                    dataIndex: "daysUntilExpiry",
                    key: "daysUntilExpiry",
                    render: (v: number) => (
                      <Tag color={v <= 7 ? "red" : v <= 14 ? "orange" : "gold"}>{v}d</Tag>
                    ),
                  },
                  {
                    title: "",
                    key: "action",
                    render: (_, record) => (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          setRenewTarget(record);
                          renewForm.setFieldValue("newEndDate", dayjs(record.endDate).add(1, "year"));
                        }}
                      >
                        Renew
                      </Button>
                    ),
                  },
                ]}
              />
            </Card>
          )}
        </>
      )}

      <Modal
        title={`Renew — ${renewTarget?.title ?? ""}`}
        open={Boolean(renewTarget)}
        onOk={() => void handleRenew()}
        onCancel={() => { setRenewTarget(null); renewForm.resetFields(); }}
        okText="Confirm Renewal"
        confirmLoading={renewLoading}
        width={420}
      >
        <Form form={renewForm} layout="vertical">
          <Form.Item
            name="newEndDate"
            label="New end date"
            rules={[{ required: true, message: "Select a new end date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(d) => d.isBefore(dayjs(), "day")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardView;
