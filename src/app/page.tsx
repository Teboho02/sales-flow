"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { withAuth } from '../hoc'

const RootPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return null;
};

export default RootPage;
