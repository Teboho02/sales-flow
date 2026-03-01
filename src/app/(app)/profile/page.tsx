"use client";

import { useState } from "react";
import { Alert, Button, Card, Descriptions, Form, Input, Select, Space, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import emailjs from "@emailjs/browser";
import { useAuthenticationActions, useAuthenticationState } from "@/provider";

const { Title, Text } = Typography;

const InviteForm = ({ tenantId }: { tenantId: string }) => {
  const [form] = Form.useForm();
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const handleSend = async () => {
    const values = await form.validateFields();
    setSending(true);
    setSuccess(undefined);
    setError(undefined);

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setError("Email service is not configured. Set NEXT_PUBLIC_EMAILJS_SERVICE_ID and NEXT_PUBLIC_EMAILJS_TEMPLATE_ID in your .env file.");
      setSending(false);
      return;
    }

    const inviteLink = `${window.location.origin}/register?tenantId=${tenantId}&email=${encodeURIComponent(values.email)}&role=${values.role}`;

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: values.email,
          invite_link: inviteLink,
          role: values.role,
        },
        publicKey,
      );
      setSuccess(`Invitation sent to ${values.email}.`);
      form.resetFields();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send invitation.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card title="Invite Team Member">
      <Form form={form} layout="vertical" requiredMark={false} style={{ maxWidth: 480 }}>
        <Form.Item
          label="Email address"
          name="email"
          rules={[
            { required: true, message: "Enter the recipient's email." },
            { type: "email", message: "Enter a valid email address." },
          ]}
        >
          <Input size="large" placeholder="colleague@company.com" prefix={<MailOutlined />} />
        </Form.Item>
        <Form.Item
          label="Role"
          name="role"
          initialValue="SalesRep"
          rules={[{ required: true, message: "Select a role." }]}
        >
          <Select
            size="large"
            options={[
              { value: "SalesRep", label: "Sales Rep" },
              { value: "SalesManager", label: "Sales Manager" },
              { value: "BusinessDevelopmentManager", label: "Business Development Manager" },
            ]}
          />
        </Form.Item>
        <Button type="primary" loading={sending} onClick={() => void handleSend()}>
          Send Invitation
        </Button>
        {success ? <Alert type="success" showIcon message={success} style={{ marginTop: 12 }} /> : null}
        {error ? <Alert type="error" showIcon message={error} style={{ marginTop: 12 }} /> : null}
      </Form>
    </Card>
  );
};

const ProfilePage = () => {
  const { user } = useAuthenticationState();
  const { logout } = useAuthenticationActions();
  const isAdmin = user?.roles?.includes("Admin");

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
        </Descriptions>
        <Button danger style={{ marginTop: 16 }} onClick={logout}>
          Logout
        </Button>
      </Card>

      {isAdmin ? <InviteForm tenantId={user?.tenantId ?? ""} /> : null}
    </Space>
  );
};

export default ProfilePage;
