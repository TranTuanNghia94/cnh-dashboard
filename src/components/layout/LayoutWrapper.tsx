import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import SideBar from "./SideBar"
import { Separator } from "../ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../ui/breadcrumb";
import { Link, useLocation } from "@tanstack/react-router";
import { BellIcon } from "lucide-react";
import { getCookie, SUB } from "@/lib/cookie";
import { ROUTE_MAPPER } from "@/lib/list-routes";
import { ModeToggle } from "../mode-toggle";

export interface ILayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const LayoutWrapper = ({ children, onLogout }: ILayoutProps) => {
  const location = useLocation()
  const path = location.pathname.replace('/', '').split('/')

  const handleLogout = () => {
    onLogout()
  }


  return (
    <SidebarProvider defaultOpen={true} >
      <SideBar onLogout={handleLogout} />
      <SidebarInset className="w-[50%]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild className="font-semibold">
                    <Link to="/home">Trang chủ</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator />

                {path.map((item, index) => (
                  <BreadcrumbItem key={item}>
                    <BreadcrumbLink asChild>
                      <span className="text-primary font-semibold">{ROUTE_MAPPER[item as keyof typeof ROUTE_MAPPER] ?? item}</span>
                    </BreadcrumbLink>
                    {index < path.length - 1 && <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="ml-auto text-sm text-muted-foreground">
            Xin chào, <span className="font-semibold text-primary">{getCookie(SUB)}</span>
          </div>

          <div>
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" color="primary" />
          </div>

          <div>
            <BellIcon className="h-6 w-6 text-primary" />
          </div>

          <div>
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" color="primary" />
          </div>

          <div>
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default LayoutWrapper;