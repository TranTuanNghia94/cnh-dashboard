import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import SideBar from "./SideBar"
import { Separator } from "../ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../ui/breadcrumb";
import { Link, useLocation } from "@tanstack/react-router";
import { getCookie, EMAIL, SUB, USER } from "@/lib/cookie";
import { NotificationHeaderBell } from "@/contexts/notification-center";
import { ROUTE_MAPPER } from "@/lib/list-routes";
import { ModeToggle } from "../mode-toggle";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";

export interface ILayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const getAvatarInitials = (value?: string) => {
  if (!value) return "U";

  const normalizedValue = value.includes("@") ? value.split("@")[0] : value;
  const words = normalizedValue
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);

  if (words.length === 0) return "U";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export const LayoutWrapper = ({ children, onLogout }: ILayoutProps) => {
  const location = useLocation()
  const path = location.pathname.replace('/', '').split('/')
  const fullName = getCookie(USER)
  const email = getCookie(EMAIL)
  const fallbackUser = getCookie(SUB)
  const displayName = fullName || email || fallbackUser || "Người dùng"
  const secondaryLabel = email && email !== displayName ? email : fallbackUser

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

          <div className="ml-auto" />

          <div>
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" color="primary" />
          </div>

          <div>
            <NotificationHeaderBell />
          </div>

          <div>
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" color="primary" />
          </div>

          <div>
            <ModeToggle />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full px-2 py-1 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {getAvatarInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-40 flex-col leading-tight sm:flex">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {displayName}
                  </span>
                  {secondaryLabel && (
                    <span className="truncate text-xs text-muted-foreground">
                      {secondaryLabel}
                    </span>
                  )}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {displayName}
                  </span>
                  {secondaryLabel && (
                    <span className="truncate text-xs text-muted-foreground">
                      {secondaryLabel}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/setting" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Cài đặt</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-danger focus:text-danger"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default LayoutWrapper;