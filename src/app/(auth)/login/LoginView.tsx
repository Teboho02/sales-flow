"use client";

import { Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthenticationActions, useAuthenticationState } from "@/provider";

import LoginForm from "./LoginForm";
import type { LoginFormValues } from "./LoginForm";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;

const LoginView = () => {
  const { styles } = useStyles();
  const router = useRouter();
  const { login } = useAuthenticationActions();
  const { isPending, isError, errorMessage } = useAuthenticationState();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      });
      router.push("/home");
    } catch {
      // Error state is handled by provider and rendered in the form.
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.leftPanel}>
        <Title level={1} className={styles.leftTitle}>
          Sales Flow
        </Title>
      </section>
      <section className={styles.rightPanel}>
        <div className={styles.content}>
          <div className={styles.header}>
            <Text className={styles.appName}>Sales Flow</Text>
            <Title level={3} className={styles.title}>
              Welcome back
            </Title>
            <Text className={styles.subtitle}>
              Sign in to continue managing your pipeline.
            </Text>
          </div>
          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isPending}
            hasError={isError}
            errorMessage={errorMessage}
          />
          <Text className={styles.subtitle} style={{ marginTop: 12, display: "block" }}>
            New here? <Link href="/register">Create an account</Link>
          </Text>
        </div>
      </section>
    </div>
  );
};

export default LoginView;
