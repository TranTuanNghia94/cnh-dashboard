import BreadcrumbLayout from "@/components/layout/Breadcrumb";
import SideBar from "@/components/layout/SideBar";
import { Separator } from "@/components/ui/separator";
import { getCookie, USER } from "@/lib/cookie";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const user = getCookie(USER);

    if (!user) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
  component: AppLayout,
});


function AppLayout() {
  return (
    <div className='flex min-h-screen w-full flex-col bg-muted/40'>
      <SideBar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <BreadcrumbLayout />
        <Separator />

        <div className="mx-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}