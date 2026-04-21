import { IOrderResponse } from '@/types/order'

/** Mã gọi API GET đơn theo code: prefix.number hoặc fallback id. */
export function buildOrderCode(order: Pick<IOrderResponse, 'id' | 'orderPrefix' | 'orderNumber'>): string | null {
    const prefix = order.orderPrefix?.trim()
    const num = order.orderNumber
    if (prefix && num !== undefined && num !== null) {
        return `${prefix}.${num.toString().padStart(3, '0')}`
    }
    return order.id
}
