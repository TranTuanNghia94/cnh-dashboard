import { stockColumns } from '@/components/report/report-columns'
import { OperationalReportScreen } from '@/components/report/operational-report-screen'
import { URL_REPORT_STOCK } from '@/lib/url'
import { StockLedgerRow } from '@/types/operational-report'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/_wrapper/report/stock')({
  component: StockReportPage,
})

function StockReportPage() {
  return (
    <OperationalReportScreen<StockLedgerRow>
      title="XUẤT NHẬP TỒN"
      path={URL_REPORT_STOCK}
      columns={stockColumns}
    />
  )
}
