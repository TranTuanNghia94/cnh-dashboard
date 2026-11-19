import { QUERIES } from '@/lib/constants';
import { getApiErrorMessage } from '@/lib/api-error'
import {
  approveWarehouseOutbound,
  cancelWarehouseOutbound,
  createWarehouseOutbound,
  getWarehouseOutboundActions,
  getWarehouseOutboundById,
  getWarehouseOutboundOrderLines,
  listWarehouseOutbound,
  listWarehouseOutboundFiles,
  rejectWarehouseOutbound,
  resubmitWarehouseOutbound,
  submitWarehouseOutbound,
  updateWarehouseOutbound,
  uploadWarehouseOutboundFile,
} from '@/services/warehouse-outbound';
import type {
  IWarehouseOutboundApproveRequest,
  IWarehouseOutboundCreateRequest,
  IWarehouseOutboundRejectRequest,
} from '@/types/warehouse-outbound';
import { useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';
import type { IRequestPaginationAndSearch } from '@/types/api';

export const useGetWarehouseOutboundOrderLines = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_ORDER_LINES],
    mutationFn: async (contractNumber: string) => await getWarehouseOutboundOrderLines(contractNumber),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useCreateWarehouseOutbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_CREATE],
    mutationFn: async (body: IWarehouseOutboundCreateRequest) => await createWarehouseOutbound(body),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useUpdateWarehouseOutbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_UPDATE],
    mutationFn: async ({
      outboundId,
      body,
    }: {
      outboundId: string;
      body: IWarehouseOutboundCreateRequest;
    }) => await updateWarehouseOutbound(outboundId, body),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
    onSuccess: () => {
      toast({ title: 'Đã cập nhật phiếu xuất kho' });
    },
  });
};

export const useListWarehouseOutbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_LIST],
    mutationFn: async (body: IRequestPaginationAndSearch) => await listWarehouseOutbound(body),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useGetWarehouseOutboundById = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_DETAIL],
    mutationFn: async (outboundId: string) => await getWarehouseOutboundById(outboundId),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useGetWarehouseOutboundActions = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_ACTIONS],
    mutationFn: async (outboundId: string) => await getWarehouseOutboundActions(outboundId),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useSubmitWarehouseOutbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_SUBMIT],
    mutationFn: async (outboundId: string) => await submitWarehouseOutbound(outboundId),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useApproveWarehouseOutbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_APPROVE],
    mutationFn: async ({ outboundId, body }: { outboundId: string; body: IWarehouseOutboundApproveRequest }) =>
      await approveWarehouseOutbound(outboundId, body),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useRejectWarehouseOutbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_REJECT],
    mutationFn: async ({ outboundId, body }: { outboundId: string; body: IWarehouseOutboundRejectRequest }) =>
      await rejectWarehouseOutbound(outboundId, body),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useCancelWarehouseOutbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_CANCEL],
    mutationFn: async (outboundId: string) => await cancelWarehouseOutbound(outboundId),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useResubmitWarehouseOutbound = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_RESUBMIT],
    mutationFn: async (outboundId: string) => await resubmitWarehouseOutbound(outboundId),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useUploadWarehouseOutboundFile = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_UPLOAD_FILE],
    mutationFn: async ({ outboundId, file, category }: { outboundId: string; file: File; category?: string }) =>
      await uploadWarehouseOutboundFile(outboundId, file, category),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};

export const useListWarehouseOutboundFiles = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_OUTBOUND_FILES],
    mutationFn: async (outboundId: string) => await listWarehouseOutboundFiles(outboundId),
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Không thành công', description: getApiErrorMessage(error) });
    },
  });
};
