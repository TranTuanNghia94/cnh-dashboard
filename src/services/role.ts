import { fetcherWithAuth, METHODS } from '@/lib/api';
import {
  URL_ASSIGN_PERMISSION_TO_ROLE,
  URL_CREATE_ROLE,
  URL_LIST_PERMISSIONS,
  URL_LIST_ROLES,
  URL_UNASSIGN_PERMISSION_FROM_ROLE,
  URL_UPDATE_ROLE,
} from '@/lib/url';
import {
  IPermissionsResponse,
  IRoleRequest,
  IRolesResponse,
} from '@/types/user';
import { IResponsePaginationAndSearch } from '@/types/api';

export const getAllRoles = async () => {
  const response = await fetcherWithAuth<
    IResponsePaginationAndSearch<IRolesResponse>
  >(URL_LIST_ROLES, {
    method: METHODS.GET,
  });

  return response;
};

export const getAllPermissions = async () => {
  const response = await fetcherWithAuth<
    IResponsePaginationAndSearch<IPermissionsResponse>
  >(URL_LIST_PERMISSIONS, {
    method: METHODS.GET,
  });

  return response;
};

export const createRole = async (data: IRoleRequest) => {
  const response = await fetcherWithAuth<IRolesResponse>(URL_CREATE_ROLE, {
    method: METHODS.POST,
    data,
  });

  return response;
};

export const updateRole = async (data: IRoleRequest) => {
  const response = await fetcherWithAuth<IRolesResponse>(URL_UPDATE_ROLE, {
    method: METHODS.POST,
    data,
  });

  return response;
};

export const assignPermissionToRole = async (
  roleId: string,
  permissionId: string,
) => {
  const url = URL_ASSIGN_PERMISSION_TO_ROLE.replace('{roleId}', roleId).replace(
    '{permissionId}',
    permissionId,
  );

  const response = await fetcherWithAuth<string>(url, {
    method: METHODS.POST,
  });

  return response;
};

export const unassignPermissionFromRole = async (
  roleId: string,
  permissionId: string,
) => {
  const url = URL_UNASSIGN_PERMISSION_FROM_ROLE.replace(
    '{roleId}',
    roleId,
  ).replace('{permissionId}', permissionId);

  const response = await fetcherWithAuth<string>(url, {
    method: METHODS.POST,
  });

  return response;
};
