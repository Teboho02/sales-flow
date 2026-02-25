"use client";

import { Typography } from "antd";

import LoginForm from "./LoginForm";
import { useStyles } from "./style/styles";

const { Title, Text } = Typography;

const LoginView = () => {
  const { styles } = useStyles();

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
          <LoginForm />
        </div>
      </section>
    </div>
  );
};

export default LoginView;
