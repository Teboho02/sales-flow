"use client";

import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { type ComponentType, useEffect, useRef, useState } from "react";
import { useAuthenticationActions, useAuthenticationState } from "@/provider";

export const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const router = useRouter();
    const hasCheckedAuthRef = useRef(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const { user } = useAuthenticationState();
    const { getProfile } = useAuthenticationActions();

    useEffect(() => {
      if (hasCheckedAuthRef.current) {
        return;
      }
      hasCheckedAuthRef.current = true;

      const checkAuth = async () => {
        const token =
          typeof window !== "undefined"
            ? window.localStorage.getItem("auth_token")
            : null;

        if (!token) {
          router.replace("/login");
          setIsCheckingAuth(false);
          return;
        }

        if (user) {
          setIsCheckingAuth(false);
          return;
        }

        try {
          await getProfile();
        } catch {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("auth_token");
          }
          router.replace("/login");
        } finally {
          setIsCheckingAuth(false);
        }
      };

      void checkAuth();
    }, [getProfile, router, user]);

    if (isCheckingAuth) {
      return (
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"})`;

  return WithAuthComponent;
};
