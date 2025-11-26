import { Card, CardContent } from '@/components/ui/card'
import { getCookie, SUB } from '@/lib/cookie'
import { LIST_ITEM } from '@/lib/list-routes'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/home')({
  beforeLoad: async () => {
    const user = getCookie(SUB)
    
    if (user === undefined || user === null || user.length === 0) {
      throw redirect({ to: '/login', replace: true })
    }
  },  
  component: DashboardIndexPage,
})

function DashboardIndexPage() {
  return (
    <div className="relative min-h-screen -m-4 p-4">

      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/20 via-background to-primary/10 animate-gradient" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.2),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col gap-4 relative z-10">
        {/* Glassmorphism Header */}
        <div className="mb-8  rounded-2xl p-6 ">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Trang chủ
          </h1>
          <p className="text-lg text-foreground/80 dark:text-foreground/70">
            Chào mừng bạn đến với hệ thống quản lý. Chọn một mục để bắt đầu.
          </p>
        </div>

        {/* Glassmorphism Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {LIST_ITEM.map((item) => (
            <Link 
              key={item.href} 
              to={item.href}
              className="group"
            >
              <Card className="h-full transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden border-0 shadow-xl">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-4 min-h-[160px] relative  border-white/30 dark:border-white/20 group-hover:bg-white/60 dark:group-hover:bg-black/60 group-hover:border-white/50 dark:group-hover:border-white/30 transition-all duration-500">

                  {/* Icon with glassmorphism */}
                  <div className="relative z-10 p-4 rounded-2xl backdrop-blur-md bg-white/30 dark:bg-black/30 border border-white/40 dark:border-white/20 group-hover:bg-white/50 dark:group-hover:bg-black/50 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-500">
                    <div className="text-primary group-hover:scale-110 transition-transform duration-500 [&>svg]:w-8 [&>svg]:h-8">
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="relative z-10 font-semibold text-center text-base text-foreground/90 dark:text-foreground/80 group-hover:text-primary transition-colors duration-500">
                    {item.title}
                  </h3>
                  
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
