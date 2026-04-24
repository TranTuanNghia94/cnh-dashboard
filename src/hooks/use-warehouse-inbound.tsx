import { QUERIES } from '@/lib/constants';
import {
  confirmWarehouseInbound,
  getWarehouseInboundPaymentRequest,
  getWarehouseInboundReceiptById,
  getWarehouseInboundReceiptsForPaymentRequest,
  searchWarehouseInbound,
} from '@/services/warehouse-inbound';
import type {
  IWarehouseInboundConfirmRequest,
  IWarehouseInboundSearchParams,
} from '@/types/warehouse-inbound';
import { useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';

export const useSearchWarehouseInbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_SEARCH],
    mutationFn: async (params: IWarehouseInboundSearchParams) => await searchWarehouseInbound(params),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useGetWarehouseInboundPaymentRequest = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_PAYMENT_REQUEST],
    mutationFn: async (id: string) => await getWarehouseInboundPaymentRequest(id),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useGetWarehouseInboundReceipts = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_RECEIPTS],
    mutationFn: async (paymentRequestId: string) =>
      await getWarehouseInboundReceiptsForPaymentRequest(paymentRequestId),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useGetWarehouseInboundReceiptById = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_RECEIPT],
    mutationFn: async (receiptId: string) => await getWarehouseInboundReceiptById(receiptId),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useConfirmWarehouseInbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_CONFIRM],
    mutationFn: async (body: IWarehouseInboundConfirmRequest) => await confirmWarehouseInbound(body),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};
