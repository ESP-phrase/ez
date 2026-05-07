"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GoatLogo from "@/components/goat-logo";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const error = params.get("error");
    if (error) { router.replace(`/login?error=${error}`); return; }

    const userRaw = params.get("user");
    if (userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        localStorage.setItem("pg_auth", "true");
        localStorage.setItem("pg_user", JSON.stringify(user));
        router.replace("/dashboard");
      } catch {
        router.replace("/login?error=parse_error");
      }
    } else {
      router.replace("/login");
    }
  }, [params, router]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#040a14" }}>
      <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-400/20 flex items-center justify-center mb-4">
        <GoatLogo size={28} />
      </div>
      <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
