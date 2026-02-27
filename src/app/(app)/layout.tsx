"use client";

import { Avatar, Button, Drawer, Grid, Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  LineChartOutlined,
  MenuOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { withAuth } from "@/hoc";
import { useAuthenticationState } from "@/provider";
import { useStyles } from "./_components/style/styles";

const { Sider, Header, Content } = Layout;
const { useBreakpoint } = Grid;

interface AppGroupLayoutProps {
  children: React.ReactNode;
}

const routeLabelMap: Record<string, string> = {
  "/home": "Dashboard",
  "/opportunities": "Opportunities",
  "/proposals": "Proposals",
  "/contracts": "Contracts",
  "/activities": "Activities",
  "/clients": "Clients",
  "/contacts": "Contacts",
  "/reports": "Reports",
};

const routeMenuKeyMap: Record<string, string> = {
  "/home": "dashboard",
  "/opportunities": "opportunities",
  "/proposals": "proposals",
  "/contracts": "contracts",
  "/activities": "activities",
  "/clients": "clients",
  "/contacts": "contacts",
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
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const currentTab = routeLabelMap[pathname] ?? "Dashboard";
  const selectedKey = routeMenuKeyMap[pathname] ?? "dashboard";
  const initials = getUserInitials(user?.firstName, user?.lastName, user?.email);

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
      setIsMobileNavOpen(false);
    },
    [router],
  );

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
            onClick: () => handleNavigate("/home"),
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
            onClick: () => handleNavigate("/opportunities"),
          },
          {
            key: "proposals",
            icon: <FileTextOutlined />,
            label: "Proposals",
            onClick: () => handleNavigate("/proposals"),
          },
          {
            key: "contracts",
            icon: <FileDoneOutlined />,
            label: "Contracts",
            onClick: () => handleNavigate("/contracts"),
          },
          {
            key: "activities",
            icon: <CalendarOutlined />,
            label: "Activities",
            onClick: () => handleNavigate("/activities"),
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
            onClick: () => handleNavigate("/clients"),
          },
          {
            key: "contacts",
            icon: <UserOutlined />,
            label: "Contacts",
            onClick: () => handleNavigate("/contacts"),
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
            onClick: () => handleNavigate("/reports"),
          },
        ],
      },
    ],
    [handleNavigate, styles.sectionLabel],
  );

  return (
    <Layout className={styles.appLayout}>
      {!isMobile ? (
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
      ) : null}
      <Layout className={styles.mainLayout}>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                className={styles.mobileMenuButton}
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation"
              />
            ) : null}
            <span className={styles.headerCurrentTab}>{currentTab}</span>
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
      {isMobile ? (
        <Drawer
          title="Sales Flow"
          placement="left"
          width={252}
          open={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          className={styles.mobileDrawer}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            className={styles.navMenu}
          />
        </Drawer>
      ) : null}
    </Layout>
  );
};

export default withAuth(AppGroupLayout);
