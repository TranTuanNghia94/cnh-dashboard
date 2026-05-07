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
import { ArrowRight, CalendarDays, LogOut, Zap } from 'lucide-react'
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
    <div className="relative min-h-screen -m-4 overflow-hidden bg-gradient-to-br from-indigo-500/10 via-background to-cyan-500/10 p-4">
      <div className="pointer-events-none fixed -left-32 top-10 -z-10 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-1/2 -z-10 h-[24rem] w-[24rem] -translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="mx-auto flex max-w-7xl flex-col gap-5 py-8 px-4 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-primary/30 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:bg-slate-900/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {greeting}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Trung tâm điều hành
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-foreground/75 sm:text-base">
                Bắt đầu ngày làm việc với các khu vực đã được tối ưu theo vai trò của bạn. Tập trung vào mục ưu tiên và thao tác nhanh hơn.
              </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="grid gap-1 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-foreground/70">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  {currentDate}
                </div>
                <div className="text-right text-xl font-semibold tabular-nums text-foreground">
                  {currentTime}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto gap-3 rounded-xl border-border/60 bg-background px-3 py-2"
                  >
                    <Avatar className="h-9 w-9 border border-border/60">
                      <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                        {userInitials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left sm:block">
                      <p className="max-w-[120px] truncate text-sm font-semibold text-foreground">
                        {userName}
                      </p>
                      <p className="max-w-[120px] truncate text-xs text-muted-foreground">
                        Tài khoản
                      </p>
                    </div>
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
                  <DropdownMenuItem onClick={() => logout()} disabled={isLoggingOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/20 bg-white/70 shadow-none backdrop-blur dark:bg-slate-900/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Lối tắt khả dụng</p>
              <p className="mt-1 text-2xl font-semibold">{visibleItems.length}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-white/70 shadow-none backdrop-blur dark:bg-slate-900/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Trạng thái hệ thống</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <Zap className="h-4 w-4" />
                Hoạt động ổn định
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-white/70 shadow-none backdrop-blur dark:bg-slate-900/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Mục tiêu hôm nay</p>
              <p className="mt-1 text-sm font-medium text-foreground/80">Hoàn tất xử lý đơn và đối soát thanh toán</p>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-white/70 p-4 shadow-none backdrop-blur dark:bg-slate-900/50">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Lối tắt nhanh</h2>
            <span className="text-xs text-muted-foreground">3 mục truy cập nhanh</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {quickItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/40"
              >
                <span className="truncate font-medium">{item.title}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Tất cả khu vực làm việc</h2>
            <p className="text-xs text-muted-foreground">Mỗi thẻ là một mô-đun</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="h-full cursor-pointer border-primary/20 bg-white/70 shadow-none backdrop-blur transition-colors duration-200 hover:bg-muted/30 dark:bg-slate-900/50">
                  <CardContent className="flex min-h-[150px] flex-col justify-between gap-4 p-5">
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-foreground">
                        <div className="[&>svg]:h-6 [&>svg]:w-6">{item.icon}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">Nhấn để mở mô-đun</p>
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
