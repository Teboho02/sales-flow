"use client";

import type { FormProps } from "antd";
import { Alert, Button, Col, Form, Input, Radio, Row, Select, Typography } from "antd";
import { useStyles } from "./style/styles";

const { Text } = Typography;

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  accountType: "newTenant" | "joinTenant";
  tenantName?: string;
  tenantId?: string;
  role?: "SalesRep" | "SalesManager" | "BusinessDevelopmentManager";
}

export interface RegisterFormProps {
  onSubmit?: (values: RegisterFormValues) => Promise<void> | void;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  invitedTenantId?: string;
  invitedEmail?: string;
  invitedRole?: RegisterFormValues["role"];
}

const RegisterForm = ({
  onSubmit,
  isLoading = false,
  hasError = false,
  errorMessage,
  invitedTenantId,
  invitedEmail,
  invitedRole,
}: RegisterFormProps) => {
  const { styles } = useStyles();
  const isInvited = Boolean(invitedTenantId);
  const [form] = Form.useForm<RegisterFormValues>();
  const accountType = Form.useWatch("accountType", form);

  const handleFinish: FormProps<RegisterFormValues>["onFinish"] = async (values) => {
    if (!onSubmit) return;
    await onSubmit(values);
  };

  return (
    <Form<RegisterFormValues>
      form={form}
      layout="vertical"
      requiredMark={false}
      className={styles.form}
      onFinish={handleFinish}
      initialValues={{
        accountType: isInvited ? "joinTenant" : "newTenant",
        role: invitedRole ?? "SalesRep",
        email: invitedEmail ?? "",
        tenantId: invitedTenantId ?? "",
      }}
    >
      {isInvited ? (
        <Alert
          type="info"
          showIcon
          message="You've been invited to join an organisation. Your tenant and role have been pre-assigned."
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Form.Item<RegisterFormValues>
          label="Account Type"
          name="accountType"
          rules={[{ required: true, message: "Choose how you want to sign up." }]}
        >
          <Radio.Group buttonStyle="solid" className={styles.segmented}>
            <Radio.Button value="newTenant">Create organisation (Admin)</Radio.Button>
            <Radio.Button value="joinTenant">Join existing organisation</Radio.Button>
          </Radio.Group>
        </Form.Item>
      )}

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item<RegisterFormValues>
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Please enter your first name." }]}
          >
            <Input size="middle" autoComplete="given-name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item<RegisterFormValues>
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please enter your last name." }]}
          >
            <Input size="middle" autoComplete="family-name" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item<RegisterFormValues>
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please enter your email." },
          { type: "email", message: "Enter a valid email address." },
        ]}
      >
        <Input
          size="middle"
          autoComplete="email"
          placeholder="you@company.com"
          disabled={isInvited}
        />
      </Form.Item>

      <Form.Item<RegisterFormValues>
        label="Phone Number"
        name="phoneNumber"
        rules={[{ required: true, message: "Please enter your phone number." }]}
      >
        <Input size="middle" autoComplete="tel" placeholder="+27 82 000 0000" />
      </Form.Item>

      {!isInvited && accountType === "newTenant" ? (
        <Form.Item<RegisterFormValues>
          label="Organisation / Tenant Name"
          name="tenantName"
          rules={[{ required: true, message: "Enter your organisation name." }]}
        >
          <Input size="middle" placeholder="Acme Consulting" />
        </Form.Item>
      ) : null}

      {/* Hidden tenantId field — always submitted when joining via invite or manual join */}
      {isInvited ? (
        <Form.Item name="tenantId" hidden>
          <Input />
        </Form.Item>
      ) : null}

      {!isInvited && accountType === "joinTenant" ? (
        <Form.Item<RegisterFormValues>
          label="Tenant ID"
          name="tenantId"
          rules={[
            { required: true, message: "Enter the tenant ID provided by your Admin." },
            {
              pattern:
                /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
              message: "Enter a valid UUID (tenant ID).",
            },
          ]}
        >
          <Input size="middle" placeholder="63d7bdc1-d2c4-488c-98c7-15c8d0657d58" />
        </Form.Item>
      ) : null}

      {isInvited || accountType === "joinTenant" ? (
        <Form.Item<RegisterFormValues>
          label="Role"
          name="role"
          rules={[{ required: true, message: "Select your role." }]}
        >
          <Select
            size="middle"
            disabled={isInvited}
            options={[
              { value: "SalesRep", label: "Sales Rep" },
              { value: "SalesManager", label: "Sales Manager" },
              { value: "BusinessDevelopmentManager", label: "Business Development Manager" },
            ]}
          />
        </Form.Item>
      ) : null}

      <Form.Item<RegisterFormValues>
        label="Password"
        name="password"
        rules={[
          { required: true, message: "Please enter your password." },
          { min: 8, message: "Password must be at least 8 characters." },
        ]}
      >
        <Input.Password size="middle" autoComplete="new-password" />
      </Form.Item>

      <Form.Item<RegisterFormValues>
        label="Confirm Password"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Please confirm your password." },
          ({ getFieldValue }) => ({
            validator(_, value: string) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match."));
            },
          }),
        ]}
      >
        <Input.Password size="middle" autoComplete="new-password" />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        size="middle"
        block
        loading={isLoading}
        className={styles.submitButton}
      >
        {isInvited ? "Join organisation" : "Create account"}
      </Button>
      {hasError ? (
        <Alert
          type="error"
          showIcon
          message={errorMessage || "Account creation failed. Please try again."}
          style={{ marginTop: 16 }}
        />
      ) : null}

      <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: "block" }}>
        We'll never share your credentials. By creating an account you agree to the terms.
      </Text>
    </Form>
  );
};

export default RegisterForm;
