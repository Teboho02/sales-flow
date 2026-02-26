"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Progress,
  Space,
  Typography,
  Table,
  Skeleton,
} from "antd";
import { useRouter } from "next/navigation";
import { getAxiosInstace } from "@/utils/axiosInstance";
import { useAuthenticationActions } from "@/provider";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;

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
  opportunitiesWon: number;
  totalRevenue: number;
  winRate: number;
  activePipelineValue: number;
};

const DashboardView = () => {
  const { styles } = useStyles();
  const router = useRouter();
  const { logout } = useAuthenticationActions();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics | null>(null);
  const [topPerformers, setTopPerformers] = useState<SalesPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const instance = useMemo(() => getAxiosInstace(), []);

  const fetchData = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [overviewRes, pipelineRes, performanceRes] = await Promise.all([
        instance.get("/api/Dashboard/overview"),
        instance.get("/api/Opportunities/pipeline"),
        instance.get("/api/Dashboard/sales-performance?topCount=5"),
      ]);
      setOverview(overviewRes.data);
      setPipelineMetrics(pipelineRes.data);
      setTopPerformers(Array.isArray(performanceRes.data) ? performanceRes.data : []);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        err?.response?.data?.title ??
        err?.message ??
        "Failed to load dashboard data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pipelineStageList: StageMetrics[] = useMemo(() => {
    if (!pipelineMetrics) return [];
    return Object.values(pipelineMetrics.stageMetrics || {});
  }, [pipelineMetrics]);

  const revenueTrend = overview?.revenue?.monthlyTrend ?? [];

  return (
    <div className={styles.page}>
      <section className={styles.headerRow}>
        <div className={styles.headerText}>
          <Text type="secondary">Welcome back</Text>
          <Text className={styles.headerCurrent}>Pipeline and performance overview</Text>
        </div>
        <Space>
          <Button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Logout
          </Button>
          <Button type="primary" onClick={() => void fetchData()} loading={loading}>
            Refresh
          </Button>
        </Space>
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
                <Text type="secondary">
                  Weighted pipeline {pipelineMetrics?.weightedPipelineValue?.toLocaleString("en-ZA") ?? "—"}
                </Text>
              </Space>
            </Card>
            <Card className={styles.metricCard}>
              <Space direction="vertical" size={6}>
                <Text className={styles.metricLabel}>Win rate</Text>
                <Text className={styles.metricValue}>
                  {pipelineMetrics?.winRate != null ? `${pipelineMetrics.winRate}%` : "—"}
                </Text>
                <Text type="secondary">
                  Total pipeline {pipelineMetrics?.totalPipelineValue?.toLocaleString("en-ZA") ?? "—"}
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

            <Card className={styles.panelCard} title="Activities summary">
              <Space direction="vertical" size={6} style={{ width: "100%" }}>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text>Upcoming</Text>
                  <Text strong>{overview?.activities?.upcomingCount ?? "—"}</Text>
                </Space>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text>Overdue</Text>
                  <Text strong>{overview?.activities?.overdueCount ?? "—"}</Text>
                </Space>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text>Completed today</Text>
                  <Text strong>{overview?.activities?.completedTodayCount ?? "—"}</Text>
                </Space>
              </Space>
            </Card>

            <Card className={styles.panelCard} title="Revenue trend (monthly)">
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {revenueTrend.length === 0 ? (
                  <Text type="secondary">No data</Text>
                ) : (
                  revenueTrend.map((item) => (
                    <Space
                      key={item.month}
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text>{item.month}</Text>
                      <Text strong>R{item.value}</Text>
                    </Space>
                  ))
                )}
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
                    dataIndex: "opportunitiesWon",
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
                    render: (val: number) => `${val}%`,
                  },
                ]}
              />
            </Card>
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardView;
