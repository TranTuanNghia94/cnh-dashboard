import { QUERIES } from '@/lib/constants';
import {
  assignPermissionToRole,
  createRole,
  getAllPermissions,
  getAllRoles,
  unassignPermissionFromRole,
  updateRole,
} from '@/services/role';
import { IRoleRequest } from '@/types/user';
import { useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'error' in error) {
    const message = (error as { error?: unknown }).error;
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error) return error.message;
  return 'Có lỗi xảy ra';
};

export const useGetAllRoles = () => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: [QUERIES.ALL_ROLES],
    mutationFn: getAllRoles,
    onError(error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: getErrorMessage(error),
      });
    },
  });
};

export const useGetAllPermissions = () => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: [QUERIES.ALL_PERMISSIONS],
    mutationFn: getAllPermissions,
    onError(error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: getErrorMessage(error),
      });
    },
  });
};

export const useCreateRole = () => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: [QUERIES.CREATE_ROLE],
    mutationFn: (payload: IRoleRequest) => createRole(payload),
    onError(error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: getErrorMessage(error),
      });
    },
    onSuccess() {
      toast({
        variant: 'default',
        title: 'Thành công',
        description: 'Tạo vai trò thành công',
      });
    },
  });
};

export const useUpdateRole = () => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: [QUERIES.UPDATE_ROLE],
    mutationFn: (payload: IRoleRequest) => updateRole(payload),
    onError(error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: getErrorMessage(error),
      });
    },
    onSuccess() {
      toast({
        variant: 'default',
        title: 'Thành công',
        description: 'Cập nhật vai trò thành công',
      });
    },
  });
};

export const useAssignPermissionToRole = () => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: [QUERIES.ASSIGN_PERMISSION_TO_ROLE],
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => assignPermissionToRole(roleId, permissionId),
    onError(error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: getErrorMessage(error),
      });
    },
  });
};

export const useUnassignPermissionFromRole = () => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: [QUERIES.UNASSIGN_PERMISSION_FROM_ROLE],
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => unassignPermissionFromRole(roleId, permissionId),
    onError(error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: getErrorMessage(error),
      });
    },
  });
};
