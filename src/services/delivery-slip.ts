import { fetcherWithAuth, METHODS } from '@/lib/api';
import {
  URL_DELIVERY_SLIP_BY_OUTBOUND_NUMBER,
  URL_DELIVERY_SLIP_BY_WAREHOUSE_OUTBOUND,
} from '@/lib/url';
import type { IDeliverySlipInfo } from '@/types/delivery-slip';

export const getDeliverySlipByWarehouseOutboundId = async (outboundId: string) => {
  return await fetcherWithAuth<IDeliverySlipInfo>(
    URL_DELIVERY_SLIP_BY_WAREHOUSE_OUTBOUND.replace('{outboundId}', outboundId),
    { method: METHODS.GET },
  );
};

export const getDeliverySlipByOutboundNumber = async (outboundNumber: string) => {
  const sp = new URLSearchParams();
  if (outboundNumber.trim()) sp.set('outboundNumber', outboundNumber.trim());
  const query = sp.toString();
  const url = query ? `${URL_DELIVERY_SLIP_BY_OUTBOUND_NUMBER}?${query}` : URL_DELIVERY_SLIP_BY_OUTBOUND_NUMBER;
  return await fetcherWithAuth<IDeliverySlipInfo>(url, { method: METHODS.GET });
};

