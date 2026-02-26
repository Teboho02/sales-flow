"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Typography } from "antd";
import { useEffect } from "react";
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
  const { isPending, isError, errorMessage, user } = useAuthenticationState();
  const hasToken =
    typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem("auth_token"));

  useEffect(() => {
    if (user?.userId && hasToken) {
      router.replace("/home");
    }
  }, [hasToken, router, user?.userId]);

  const handleSubmit = async (values: RegisterFormValues) => {
    const { accountType, ...rest } = values;

    const basePayload = {
      firstName: rest.firstName,
      lastName: rest.lastName,
      email: rest.email,
      phoneNumber: rest.phoneNumber,
      password: rest.password,
    };

    let success = false;

    if (accountType === "newTenant") {
      success = await register({
        ...basePayload,
        tenantName: rest.tenantName,
      });
    } else if (accountType === "joinTenant") {
      success = await register({
        ...basePayload,
        tenantId: rest.tenantId,
        role: rest.role,
      });
    } else {
      // defaultTenant flow: no tenantName / tenantId / role sent; backend defaults to shared tenant + SalesRep.
      success = await register(basePayload);
    }

    if (success) {
      router.push("/home");
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
              Choose to create a new org (Admin), join with a Tenant ID, or try the shared demo.
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
