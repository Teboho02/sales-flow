"use client";

import { Button, Card, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { withAuth } from "@/hoc";
import { useAuthenticationActions, useAuthenticationState } from "@/provider";

const { Title, Text } = Typography;

const HomePage = () => {
  const router = useRouter();
  const { user } = useAuthenticationState();
  const { logout } = useAuthenticationActions();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <Card style={{ width: "100%", maxWidth: 640 }}>
        <Space direction="vertical" size="middle">
          <Title level={2} style={{ margin: 0 }}>
            Home
          </Title>
          <Text>Login successful. Welcome to Sales Flow.</Text>
          <Text>
            Signed in as: {user?.firstName} {user?.lastName} ({user?.email})
          </Text>
          <Button type="primary" onClick={handleLogout}>
            Logout
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default withAuth(HomePage);
