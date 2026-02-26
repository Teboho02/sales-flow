"use client";

import { Avatar, Input, Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  BarChartOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  LineChartOutlined,
  SearchOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { withAuth } from "@/hoc";
import { useAuthenticationState } from "@/provider";
import { useStyles } from "./_components/style/styles";

const { Sider, Header, Content } = Layout;

interface AppGroupLayoutProps {
  children: React.ReactNode;
}

const routeLabelMap: Record<string, string> = {
  "/home": "Dashboard",
  "/opportunities": "Opportunities",
  "/proposals": "Proposals",
  "/contracts": "Contracts",
  "/clients": "Clients",
  "/reports": "Reports",
};

const routeMenuKeyMap: Record<string, string> = {
  "/home": "dashboard",
  "/opportunities": "opportunities",
  "/proposals": "proposals",
  "/contracts": "contracts",
  "/clients": "clients",
  "/reports": "reports",
};

const getUserInitials = (firstName?: string, lastName?: string, email?: string) => {
  const firstInitial = firstName?.trim().charAt(0);
  const lastInitial = lastName?.trim().charAt(0);
  const pair = `${firstInitial ?? ""}${lastInitial ?? ""}`.toUpperCase();

  if (pair) {
    return pair;
  }

  const fallback = email?.trim().charAt(0).toUpperCase();
  return fallback ? `${fallback}${fallback}` : "SF";
};

const AppGroupLayout = ({ children }: AppGroupLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthenticationState();
  const { styles } = useStyles();

  const currentTab = routeLabelMap[pathname] ?? "Dashboard";
  const selectedKey = routeMenuKeyMap[pathname] ?? "dashboard";
  const initials = getUserInitials(user?.firstName, user?.lastName, user?.email);

  const menuItems = useMemo<Required<MenuProps>["items"]>(
    () => [
      {
        key: "overview-section",
        type: "group",
        label: <span className={styles.sectionLabel}>Overview</span>,
        children: [
          {
            key: "dashboard",
            icon: <BarChartOutlined />,
            label: "Dashboard",
            onClick: () => router.push("/home"),
          },
        ],
      },
      {
        key: "sales-section",
        type: "group",
        label: <span className={styles.sectionLabel}>Sales</span>,
        children: [
          {
            key: "opportunities",
            icon: <UnorderedListOutlined />,
            label: "Opportunities",
            onClick: () => router.push("/opportunities"),
          },
          {
            key: "proposals",
            icon: <FileTextOutlined />,
            label: "Proposals",
            onClick: () => router.push("/proposals"),
          },
          {
            key: "contracts",
            icon: <FileDoneOutlined />,
            label: "Contracts",
            onClick: () => router.push("/contracts"),
          },
        ],
      },
      {
        key: "orm-section",
        type: "group",
        label: <span className={styles.sectionLabel}>ORM</span>,
        children: [
          {
            key: "clients",
            icon: <TeamOutlined />,
            label: "Clients",
            onClick: () => router.push("/clients"),
          },
        ],
      },
      {
        key: "insights-section",
        type: "group",
        label: <span className={styles.sectionLabel}>Insights</span>,
        children: [
          {
            key: "reports",
            icon: <LineChartOutlined />,
            label: "Reports",
            onClick: () => router.push("/reports"),
          },
        ],
      },
    ],
    [router, styles.sectionLabel],
  );

  return (
    <Layout className={styles.appLayout}>
      <Sider width={252} className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>SF</div>
          <span className={styles.brandText}>Sales Flow</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className={styles.navMenu}
        />
      </Sider>
      <Layout className={styles.mainLayout}>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerCurrentTab}>{currentTab}</span>
          </div>
          <div className={styles.headerCenter}>
            <Input
              allowClear
              placeholder="Search"
              prefix={<SearchOutlined />}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.headerRight}>
            <Avatar
              size={36}
              className={styles.profileAvatar}
              onClick={() => router.push("/profile")}
              style={{ cursor: "pointer" }}
            >
              {initials}
            </Avatar>
          </div>
        </Header>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default withAuth(AppGroupLayout);
