import { vendorDebtColumns } from '@/components/report/report-columns'
import { OperationalReportScreen } from '@/components/report/operational-report-screen'
import { URL_REPORT_VENDOR_DEBT } from '@/lib/url'
import { VendorDebtRow } from '@/types/operational-report'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/_wrapper/report/vendor-debt')({
  component: VendorDebtReportPage,
})

function VendorDebtReportPage() {
  return (
    <OperationalReportScreen<VendorDebtRow>
      title="BÁO CÁO TỔNG HỢP"
      path={URL_REPORT_VENDOR_DEBT}
      columns={vendorDebtColumns}
    />
  )
}
