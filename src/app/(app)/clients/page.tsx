"use client";

import { Card, Typography } from "antd";

const { Title, Text } = Typography;

const ClientsPage = () => {
  return (
    <Card style={{ width: "100%", maxWidth: 720 }}>
      <Title level={2} style={{ marginTop: 0 }}>
        Clients
      </Title>
      <Text>Clients content coming soon.</Text>
    </Card>
  );
};

export default ClientsPage;
