import { useLogoutMutation } from '@/hooks/use-auth'
import { EMAIL, getCookie, USER } from '@/lib/cookie'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ensureAuthenticated } from '@/lib/auth-guard'
import { LIST_ITEM } from '@/lib/list-routes'
import { isNavItemVisibleForUserScreen } from '@/lib/user-route-access'
import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  LogOut,
  Settings,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export const Route = createFileRoute('/_app/home')({
  beforeLoad: async () => {
    ensureAuthenticated()
  },  
  component: DashboardIndexPage,
})

function DashboardIndexPage() {
  const [now, setNow] = useState(() => new Date())
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation()

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const visibleItems = useMemo(
    () => LIST_ITEM.filter(isNavItemVisibleForUserScreen),
    []
  )

  const currentTime = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const currentDate = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const userName = getCookie(USER) ?? 'Người dùng'
  const userEmail = getCookie(EMAIL) ?? 'Không có email'
  const userInitials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  const quickItems = visibleItems.slice(0, 3)
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <div className="relative -m-4 min-h-screen bg-muted/30 p-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border bg-card p-5 shadow-sm lg:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <div className="mb-2 text-sm font-medium text-primary">
                {greeting}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Trung tâm điều hành CNH
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Chọn nhanh khu vực làm việc hoặc mở các mô-đun theo quyền truy cập của bạn.
                Giao diện được giữ đơn giản để dễ tập trung vào tác vụ chính.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {quickItems.map((item) => (
                  <Button key={item.href} asChild className="group">
                    <Link to={item.href}>
                      {item.title}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                ))}
                <Button asChild variant="outline">
                  <Link to="/setting">
                    <Settings className="h-4 w-4" />
                    Cài đặt
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <Card className="border-border/70 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                        {userInitials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">{userName}</p>
                      <p className="truncate text-sm text-muted-foreground">{userEmail}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div className="rounded-xl border bg-muted/40 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        Hôm nay
                      </div>
                      <p className="mt-2 text-sm font-semibold capitalize text-foreground">{currentDate}</p>
                    </div>
                    <div className="rounded-xl border bg-muted/40 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        Thời gian
                      </div>
                      <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">{currentTime}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="mt-4 w-full justify-between">
                        Tài khoản
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel className="space-y-1">
                        <p className="truncate text-sm font-semibold">{userName}</p>
                        <p className="truncate text-xs font-normal text-muted-foreground">
                          {userEmail}
                        </p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/setting" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Cài đặt
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => logout()} disabled={isLoggingOut} className="cursor-pointer text-danger focus:text-danger">
                        <LogOut className="mr-2 h-4 w-4" />
                        {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Danh sách mô-đun</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Tất cả khu vực làm việc</h2>
            </div>
            <p className="text-sm text-muted-foreground">Mỗi thẻ là một mô-đun theo quyền truy cập của bạn.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="h-full border-border/70 shadow-none transition-colors hover:border-primary/40 hover:bg-muted/30">
                  <CardContent className="flex min-h-[140px] flex-col justify-between gap-4 p-5">
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg border bg-muted/40 p-2 text-primary">
                        <div className="[&>svg]:h-5 [&>svg]:w-5">{item.icon}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Điều hướng nhanh đến khu vực xử lý nghiệp vụ.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
