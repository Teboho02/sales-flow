"use client";

import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input } from "antd";

import { useStyles } from "./style/styles";

export interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => Promise<void> | void;
  isLoading?: boolean;
}

const defaultInitialValues: LoginFormValues = {
  email: "",
  password: "",
  remember: true,
};

const LoginForm = ({
  onSubmit,
  isLoading = false,
}: LoginFormProps) => {
  const { styles } = useStyles();
  const [form] = Form.useForm<LoginFormValues>();

  const handleFinish: FormProps<LoginFormValues>["onFinish"] = async (values) => {
    if (!onSubmit) {
      return;
    }

    await onSubmit(values);
  };

  return (
    <Form<LoginFormValues>
      form={form}
      layout="vertical"
      requiredMark={false}
      className={styles.form}
      initialValues={defaultInitialValues}
      onFinish={handleFinish}
    >
      <Form.Item<LoginFormValues>
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please enter your email." },
          { type: "email", message: "Enter a valid email address." },
        ]}
      >
        <Input
          placeholder="you@company.com"
          size="large"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item<LoginFormValues>
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please enter your password." }]}
      >
        <Input.Password
          placeholder="••••••••"
          size="large"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item<LoginFormValues> name="remember" valuePropName="checked">
        <Checkbox className={styles.checkbox}>Remember me</Checkbox>
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={isLoading}
        className={styles.submitButton}
      >
        Sign in
      </Button>
    </Form>
  );
};

export default LoginForm;
