import { QUERIES } from '@/lib/constants';
import {
  getDeliverySlipByOutboundNumber,
  getDeliverySlipByWarehouseOutboundId,
} from '@/services/delivery-slip';
import { useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';

export const useGetDeliverySlipByWarehouseOutboundId = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.DELIVERY_SLIP_BY_OUTBOUND_ID],
    mutationFn: async (outboundId: string) => await getDeliverySlipByWarehouseOutboundId(outboundId),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không lấy được phiếu giao hàng', description: error.message });
    },
  });
};

export const useGetDeliverySlipByOutboundNumber = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.DELIVERY_SLIP_BY_OUTBOUND_NUMBER],
    mutationFn: async (outboundNumber: string) => await getDeliverySlipByOutboundNumber(outboundNumber),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không lấy được phiếu giao hàng', description: error.message });
    },
  });
};

