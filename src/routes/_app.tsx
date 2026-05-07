import { ensureAuthenticated } from "@/lib/auth-guard";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    ensureAuthenticated();
  },
  component: () => <Outlet />,
});
