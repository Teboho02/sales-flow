"use client";

import { Card, Typography } from "antd";

const { Title, Text } = Typography;

const ProposalsPage = () => {
  return (
    <Card style={{ width: "100%", maxWidth: 720 }}>
      <Title level={2} style={{ marginTop: 0 }}>
        Proposals
      </Title>
      <Text>Proposals content coming soon.</Text>
    </Card>
  );
};

export default ProposalsPage;
