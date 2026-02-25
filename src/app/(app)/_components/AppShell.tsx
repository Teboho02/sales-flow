"use client";

import { Avatar, Input, Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  BarChartOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { withAuth } from '../../../hoc'
import { useAuthenticationState} from '../../../provider'
import { useStyles } from "./style/styles";

const { Sider, Header, Content } = Layout;

interface AppShellProps {
  children: React.ReactNode;
}

const routeLabelMap: Record<string, string> = {
  "/home": "Dashboard",
  "/opportunities": "Opportunities",
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

const AppShell = ({ children }: AppShellProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthenticationState();
  const { styles } = useStyles();

  const currentTab = routeLabelMap[pathname] ?? "Dashboard";
  const selectedKey = pathname === "/opportunities" ? "opportunities" : "dashboard";
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
            onClick: () => router.push("/home"),
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
            <span className={styles.headerLabel}>Current Open Tab</span>
            <span className={styles.headerCurrentTab}>{currentTab}</span>
          </div>
          <div className={styles.headerRight}>
            <Input
              allowClear
              placeholder="Search"
              prefix={<SearchOutlined />}
              className={styles.searchInput}
            />
            <Avatar size={36} className={styles.profileAvatar}>
              {initials}
            </Avatar>
          </div>
        </Header>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AppShell;
