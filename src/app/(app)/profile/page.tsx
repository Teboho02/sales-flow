"use client";

import { Card, Descriptions, Space, Typography, Button } from "antd";
import { useAuthenticationActions, useAuthenticationState } from "@/provider";

const { Title, Text } = Typography;

const ProfilePage = () => {
  const { user } = useAuthenticationState();
  const { logout } = useAuthenticationActions();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} style={{ margin: 0 }}>
        Profile
      </Title>
      <Text type="secondary">Your account details and session info.</Text>
      <Card>
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Name">
            {user?.firstName || user?.lastName
              ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Roles">
            {user?.roles && user.roles.length > 0 ? user.roles.join(", ") : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Tenant ID">{user?.tenantId ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="User ID">{user?.userId ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Token expires">
            {user?.expiresAt ?? "—"}
          </Descriptions.Item>
        </Descriptions>
        <Button danger style={{ marginTop: 16 }} onClick={logout}>
          Logout
        </Button>
      </Card>
    </Space>
  );
};

export default ProfilePage;
