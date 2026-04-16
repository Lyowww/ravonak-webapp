"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeScreen } from "@/app/components/ravonak/HomeScreen";
import { useRavonak } from "@/context/RavonakContext";

export default function HomePage() {
  const router = useRouter();
  const { authStage, ready } = useRavonak();

  useEffect(() => {
    if (!ready) return;
    if (authStage !== "verified") {
      router.replace("/register");
    }
  }, [authStage, ready, router]);

  if (!ready || authStage !== "verified") {
    return null;
  }

  return <HomeScreen />;
}
