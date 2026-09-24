import { salesDetailColumns } from '@/components/report/report-columns'
import { OperationalReportScreen } from '@/components/report/operational-report-screen'
import { URL_REPORT_SALES_DETAIL } from '@/lib/url'
import { SalesDetailReportRow } from '@/types/operational-report'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/_wrapper/report/sales-detail')({
  component: SalesDetailReportPage,
})

function SalesDetailReportPage() {
  return (
    <OperationalReportScreen<SalesDetailReportRow>
      title="BÁO CÁO CHI TIẾT"
      path={URL_REPORT_SALES_DETAIL}
      columns={salesDetailColumns}
    />
  )
}
