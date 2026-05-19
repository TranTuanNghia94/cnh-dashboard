import ProductTaxHistoryContent from '@/components/product/product-tax-history-content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { History } from 'lucide-react'

type ProductTaxHistorySectionProps = {
  productId: string
  currentTax?: string | null
}

export default function ProductTaxHistorySection({ productId, currentTax }: ProductTaxHistorySectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm uppercase">
          <History className="h-4 w-4 shrink-0" />
          Lịch sử thuế
          {currentTax != null && currentTax !== '' ? (
            <span className="text-xs font-normal normal-case text-muted-foreground">
              (Thuế hiện tại: <span className="font-medium text-foreground">{currentTax}%</span>)
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ProductTaxHistoryContent productId={productId} />
      </CardContent>
    </Card>
  )
}
