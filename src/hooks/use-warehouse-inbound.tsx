import { QUERIES } from '@/lib/constants';
import {
  addWarehouseInboundReceiptLine,
  approveWarehouseInboundReceipt,
  cancelWarehouseInboundReceipt,
  confirmWarehouseInbound,
  deleteWarehouseInboundReceiptLine,
  getWarehouseInboundPaymentRequest,
  getWarehouseInboundReceiptById,
  getWarehouseInboundReceiptsForPaymentRequest,
  listWarehouseInbound,
  listWarehouseInboundReceiptFiles,
  patchWarehouseInboundReceiptLine,
  rejectWarehouseInboundReceipt,
  searchWarehouseInbound,
  submitWarehouseInboundReceipt,
  uploadWarehouseInboundReceiptFile,
} from '@/services/warehouse-inbound';
import type {
  IWarehouseInboundAddLineRequest,
  IWarehouseInboundApproveRequest,
  IWarehouseInboundConfirmRequest,
  IWarehouseInboundLinePatchRequest,
  IWarehouseInboundRejectRequest,
  IWarehouseInboundSearchParams,
} from '@/types/warehouse-inbound';
import { useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { IRequestPaginationAndSearch } from '@/types/api';

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

export const useListWarehouseInbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_LIST],
    mutationFn: async ({ body, status }: { body: IRequestPaginationAndSearch; status?: string }) =>
      await listWarehouseInbound(body, status),
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

export const useAddWarehouseInboundReceiptLine = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_ADD_LINE],
    mutationFn: async ({ receiptId, body }: { receiptId: string; body: IWarehouseInboundAddLineRequest }) =>
      await addWarehouseInboundReceiptLine(receiptId, body),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const usePatchWarehouseInboundReceiptLine = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_PATCH_LINE],
    mutationFn: async ({
      receiptId,
      lineId,
      body,
    }: {
      receiptId: string;
      lineId: string;
      body: IWarehouseInboundLinePatchRequest;
    }) => await patchWarehouseInboundReceiptLine(receiptId, lineId, body),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useDeleteWarehouseInboundReceiptLine = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_DELETE_LINE],
    mutationFn: async ({ receiptId, lineId }: { receiptId: string; lineId: string }) =>
      await deleteWarehouseInboundReceiptLine(receiptId, lineId),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useSubmitWarehouseInboundReceipt = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_SUBMIT],
    mutationFn: async (receiptId: string) => await submitWarehouseInboundReceipt(receiptId),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useApproveWarehouseInboundReceipt = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_APPROVE],
    mutationFn: async ({ receiptId, body }: { receiptId: string; body: IWarehouseInboundApproveRequest }) =>
      await approveWarehouseInboundReceipt(receiptId, body),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useRejectWarehouseInboundReceipt = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_REJECT],
    mutationFn: async ({ receiptId, body }: { receiptId: string; body: IWarehouseInboundRejectRequest }) =>
      await rejectWarehouseInboundReceipt(receiptId, body),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useCancelWarehouseInboundReceipt = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_CANCEL],
    mutationFn: async (receiptId: string) => await cancelWarehouseInboundReceipt(receiptId),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useUploadWarehouseInboundReceiptFile = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_UPLOAD_FILE],
    mutationFn: async ({ receiptId, file, category }: { receiptId: string; file: File; category?: string }) =>
      await uploadWarehouseInboundReceiptFile(receiptId, file, category),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useListWarehouseInboundReceiptFiles = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INBOUND_LIST_FILES],
    mutationFn: async (receiptId: string) => await listWarehouseInboundReceiptFiles(receiptId),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};
