"use client";

import { Button, Card, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
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
    <Card style={{ width: "100%", maxWidth: 720 }}>
      <Space direction="vertical" size="middle">
        <Title level={2} style={{ margin: 0 }}>
          Dashboard
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
  );
};

export default HomePage;
