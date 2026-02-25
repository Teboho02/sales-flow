"use client";

import { Card, Typography } from "antd";

const { Title, Text } = Typography;

const ContractsPage = () => {
  return (
    <Card style={{ width: "100%", maxWidth: 720 }}>
      <Title level={2} style={{ marginTop: 0 }}>
        Contracts
      </Title>
      <Text>Contracts content coming soon.</Text>
    </Card>
  );
};

export default ContractsPage;
