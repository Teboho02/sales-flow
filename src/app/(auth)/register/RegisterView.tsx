"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const { register } = useAuthenticationActions();
  const { isPending, isError, errorMessage, user } = useAuthenticationState();
  const hasToken =
    typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem("auth_token"));

  const invitedTenantId = searchParams.get("tenantId") ?? undefined;
  const invitedEmail = searchParams.get("email") ?? undefined;
  const invitedRole = (searchParams.get("role") ?? undefined) as RegisterFormValues["role"];

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
    } else {
      // joinTenant — tenantId comes from the form (pre-filled from invite URL)
      success = await register({
        ...basePayload,
        tenantId: rest.tenantId,
        role: rest.role,
      });
    }

    if (success) {
      router.push("/home");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.leftPanel}>
        <div className={styles.leftPanelContent}>
          <div className={styles.brandRow}>
            <div className={styles.logoSquare}>
              <Text className={styles.logoLetter}>S</Text>
            </div>
            <Title level={1} className={styles.leftTitle}>
              Sales Flow
            </Title>
          </div>
          <Text className={styles.leftSubtitle}>
            Manage government client opportunities, proposals, contracts, and
            renewals all from one unified platform.
          </Text>
        </div>
      </section>
      <section className={styles.rightPanel}>
        <div className={styles.content}>
          <div className={styles.header}>
            <Text className={styles.appName}>Sales Flow</Text>
            <Title level={3} className={styles.title}>
              {invitedTenantId ? "Accept your invitation" : "Create your account"}
            </Title>
            <Text className={styles.subtitle}>
              {invitedTenantId
                ? "You've been invited to join an organisation. Fill in your details to get started."
                : "Choose to create a new org (Admin) or join an existing one via invitation."}
            </Text>
          </div>

          <RegisterForm
            onSubmit={handleSubmit}
            isLoading={isPending}
            hasError={isError}
            errorMessage={errorMessage}
            invitedTenantId={invitedTenantId}
            invitedEmail={invitedEmail}
            invitedRole={invitedRole}
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
