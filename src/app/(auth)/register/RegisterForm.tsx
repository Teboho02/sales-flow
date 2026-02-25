"use client";

import type { FormProps } from "antd";
import { Alert, Button, Form, Input, Row, Col } from "antd";
import { useStyles } from "./style/styles";

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormProps {
  onSubmit?: (values: RegisterFormValues) => Promise<void> | void;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

const RegisterForm = ({
  onSubmit,
  isLoading = false,
  hasError = false,
  errorMessage,
}: RegisterFormProps) => {
  const { styles } = useStyles();
  const [form] = Form.useForm<RegisterFormValues>();

  const handleFinish: FormProps<RegisterFormValues>["onFinish"] = async (
    values,
  ) => {
    if (!onSubmit) {
      return;
    }
    await onSubmit(values);
  };

  return (
    <Form<RegisterFormValues>
      form={form}
      layout="vertical"
      requiredMark={false}
      className={styles.form}
      onFinish={handleFinish}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item<RegisterFormValues>
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Please enter your first name." }]}
          >
            <Input size="large" autoComplete="given-name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item<RegisterFormValues>
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please enter your last name." }]}
          >
            <Input size="large" autoComplete="family-name" />
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
        <Input size="large" autoComplete="email" placeholder="you@company.com" />
      </Form.Item>

      <Form.Item<RegisterFormValues>
        label="Phone Number"
        name="phoneNumber"
        rules={[{ required: true, message: "Please enter your phone number." }]}
      >
        <Input size="large" autoComplete="tel" placeholder="+27 82 000 0000" />
      </Form.Item>

      <Form.Item<RegisterFormValues>
        label="Password"
        name="password"
        rules={[
          { required: true, message: "Please enter your password." },
          { min: 8, message: "Password must be at least 8 characters." },
        ]}
      >
        <Input.Password size="large" autoComplete="new-password" />
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
        <Input.Password size="large" autoComplete="new-password" />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={isLoading}
        className={styles.submitButton}
      >
        Create account
      </Button>
      {hasError ? (
        <Alert
          type="error"
          showIcon
          message={errorMessage || "Account creation failed. Please try again."}
          style={{ marginTop: 16 }}
        />
      ) : null}
    </Form>
  );
};

export default RegisterForm;
