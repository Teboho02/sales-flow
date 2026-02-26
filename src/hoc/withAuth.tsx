"use client";

import { type ComponentType, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthenticationState } from "@/provider";

export const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const router = useRouter();
    const { user, isPending } = useAuthenticationState();

    const hasToken =
      typeof window !== "undefined" &&
      Boolean(window.localStorage.getItem("auth_token"));
    const hasUser = Boolean(user?.userId);
    const isAuthenticated = hasUser && hasToken;

    useEffect(() => {
      if (!isPending && !isAuthenticated && !hasToken) {
        router.replace("/login");
      }
    }, [hasToken, isAuthenticated, isPending, router]);

    // Avoid flashing protected content while we check the session
    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"})`;

  return WithAuthComponent;
};
