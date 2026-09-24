import { outboundDetailColumns } from '@/components/report/report-columns'
import { OperationalReportScreen } from '@/components/report/operational-report-screen'
import { URL_REPORT_OUTBOUND_DETAIL } from '@/lib/url'
import { OutboundDetailReportRow } from '@/types/operational-report'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/_wrapper/report/outbound-detail')({
  component: OutboundDetailReportPage,
})

function OutboundDetailReportPage() {
  return (
    <OperationalReportScreen<OutboundDetailReportRow>
      title="BÁO CÁO CHI TIẾT XUẤT KHO"
      path={URL_REPORT_OUTBOUND_DETAIL}
      columns={outboundDetailColumns}
    />
  )
}
