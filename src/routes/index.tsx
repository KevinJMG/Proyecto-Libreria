import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("lib.user");
      throw redirect({ to: raw ? "/dashboard" : "/auth" });
    }
    throw redirect({ to: "/auth" });
  },
});
