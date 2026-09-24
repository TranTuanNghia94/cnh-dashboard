import { inboundDetailColumns } from '@/components/report/report-columns'
import { OperationalReportScreen } from '@/components/report/operational-report-screen'
import { URL_REPORT_INBOUND_DETAIL } from '@/lib/url'
import { InboundDetailReportRow } from '@/types/operational-report'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/_wrapper/report/inbound-detail')({
  component: InboundDetailReportPage,
})

function InboundDetailReportPage() {
  return (
    <OperationalReportScreen<InboundDetailReportRow>
      title="BÁO CÁO CHI TIẾT NHẬP KHO"
      path={URL_REPORT_INBOUND_DETAIL}
      columns={inboundDetailColumns}
    />
  )
}
