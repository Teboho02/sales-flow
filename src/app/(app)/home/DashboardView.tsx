"use client";

import {
  Avatar,
  Button,
  Card,
  Divider,
  Progress,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuthenticationActions, useAuthenticationState } from "@/provider";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;

type RecentActivity = {
  id: string;
  title: string;
  meta: string;
  status: "completed" | "pending";
};

type DashboardOverview = {
  totalRevenue: number;
  activeOpportunities: number;
  totalClients: number;
  pendingTasks: number;
  monthlyGrowth: number;
  recentActivities: RecentActivity[];
};

const overviewMock: DashboardOverview = {
  totalRevenue: 468200,
  activeOpportunities: 18,
  totalClients: 42,
  pendingTasks: 7,
  monthlyGrowth: 14.2,
  recentActivities: [
    {
      id: "activity-1",
      title: "Submitted proposal for City Infrastructure Upgrade",
      meta: "Due diligence completed · 2 hours ago",
      status: "completed",
    },
    {
      id: "activity-2",
      title: "Scheduled renewal review with Cape Metro",
      meta: "Meeting on Thursday · 5 hours ago",
      status: "pending",
    },
    {
      id: "activity-3",
      title: "New opportunity: Gauteng Digital Services",
      meta: "Qualification in progress · Yesterday",
      status: "pending",
    },
    {
      id: "activity-4",
      title: "Contract signed with Northern Utilities",
      meta: "Annual value R1.2m · 2 days ago",
      status: "completed",
    },
  ],
};

const DashboardView = () => {
  const { styles } = useStyles();
  const router = useRouter();
  const { user } = useAuthenticationState();
  const { logout } = useAuthenticationActions();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className={styles.page}>
      <section className={styles.headerRow}>
        <div className={styles.headerText}>
          <Text type="secondary">Welcome back</Text>
  
      
        </div>
  
      </section>

      <section className={styles.metricsGrid}>
        <Card className={styles.metricCard}>
          <Space direction="vertical" size={6}>
            <Text className={styles.metricLabel}>Total revenue</Text>
            <Text className={styles.metricValue}>
              R{overviewMock.totalRevenue.toLocaleString("en-ZA")}
            </Text>
            <Tag
              color="blue"
              icon={<ArrowUpOutlined />}
              className={styles.changeTag}
            >
              {overviewMock.monthlyGrowth}% this month
            </Tag>
          </Space>
        </Card>
        <Card className={styles.metricCard}>
          <Space direction="vertical" size={6}>
            <Text className={styles.metricLabel}>Active opportunities</Text>
            <Text className={styles.metricValue}>
              {overviewMock.activeOpportunities}
            </Text>
            <Text type="secondary">Across public sector accounts</Text>
          </Space>
        </Card>
        <Card className={styles.metricCard}>
          <Space direction="vertical" size={6}>
            <Text className={styles.metricLabel}>Total clients</Text>
            <Text className={styles.metricValue}>
              {overviewMock.totalClients}
            </Text>
            <Text type="secondary">Government and municipal</Text>
          </Space>
        </Card>
        <Card className={styles.metricCard}>
          <Space direction="vertical" size={6}>
            <Text className={styles.metricLabel}>Pending tasks</Text>
            <Text className={styles.metricValue}>
              {overviewMock.pendingTasks}
            </Text>
            <Text type="secondary">Due this week</Text>
          </Space>
        </Card>
      </section>

      <section className={styles.lowerGrid}>


   
      </section>
    </div>
  );
};

export default DashboardView;
