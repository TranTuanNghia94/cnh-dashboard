import { REPORT_GROUPS } from '@/components/report/report-catalog'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

export const Route = createLazyFileRoute('/_app/_wrapper/report/')({
  component: ReportHubPage,
})

function ReportHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Báo cáo</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Nhập kho và xuất kho lọc theo khoảng ngày. Xuất nhập tồn và thanh toán lọc theo tháng. Tổng hợp và chi tiết gồm toàn bộ dữ liệu.
        </p>
      </div>
      {REPORT_GROUPS.map((group) => (
        <section key={group.label} className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">{group.label}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {group.items.map((report) => {
              const Icon = report.icon
              return (
                <Link
                  key={report.to}
                  to={report.to}
                  className="group flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 font-medium">
                      {report.title}
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{report.description}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
