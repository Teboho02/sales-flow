"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Typography } from "antd";
import {
  useAuthenticationActions,
  useAuthenticationState,
} from "@/provider";
import RegisterForm from "./RegisterForm";
import type { RegisterFormValues } from "./RegisterForm";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;

const RegisterView = () => {
  const { styles } = useStyles();
  const router = useRouter();
  const { register } = useAuthenticationActions();
  const { isPending, isError, errorMessage } = useAuthenticationState();

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
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
              Create your account
            </Title>
            <Text className={styles.subtitle}>
              Start managing your sales pipeline in one place.
            </Text>
          </div>

          <RegisterForm
            onSubmit={handleSubmit}
            isLoading={isPending}
            hasError={isError}
            errorMessage={errorMessage}
          />

          <Text className={styles.subtitle} style={{ marginTop: 12, display: "block" }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </Text>
        </div>
      </section>
    </div>
  );
};

export default RegisterView;
