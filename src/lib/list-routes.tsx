import { Album, ArrowDownToLine, ArrowUpFromLine, BaggageClaim, Boxes, Handshake, Package, Receipt, Settings, Store, Tag, User } from "lucide-react";
import {
    PERMISSION_CODES,
    USER_MANAGEMENT_PERMISSIONS,
    USER_SELF_PERMISSIONS,
} from "@/lib/permissions";

export type AppNavItem = {
	title: string;
	href: string;
	icon: React.ReactNode;
	/** Deprecated: prefer permissions. Kept for old nav items during migration. */
	gatedByUserAccess?: boolean;
    permissions?: string[];
};

export const LIST_ITEM: AppNavItem[] = [
    {
        title: 'Người dùng',
        href: '/user',
        icon: <User />,
        permissions: USER_MANAGEMENT_PERMISSIONS,
    },
    {
        title: 'Khách hàng',
        href: '/customer',
        icon: <Handshake />
    },
    {
        title: 'Nhà cung cấp',
        href: '/vendor',
        icon: <Album />
    },
    {
        title: 'Nhóm hàng',
        href: '/type',
        icon: <Tag />
    },
    {
        title: 'Hàng hóa',
        href: '/goods',
        icon: <Package />
    },
    {
        title: 'Đơn bán hàng',
        href: '/order',
        icon: <Store />
    },
    {
        title: 'Đơn mua hàng',
        href: '/purchase',
        icon: <BaggageClaim />
    },
    {
        title: 'Thanh toán',
        href: '/payment',
        icon: <Receipt />,
        permissions: [PERMISSION_CODES.PAYMENT_READ, PERMISSION_CODES.PAYMENT_CREATE],
    },
    {
        title: 'Nhập kho',
        href: '/warehouse-inbound',
        icon: <ArrowDownToLine />,
        permissions: [PERMISSION_CODES.WAREHOUSE_INBOUND_READ, PERMISSION_CODES.WAREHOUSE_INBOUND_CREATE],
    },
    {
        title: 'Tồn kho',
        href: '/warehouse-inventory',
        icon: <Boxes />,
        permissions: [PERMISSION_CODES.WAREHOUSE_INVENTORY_READ],
    },
    {
        title: 'Xuất kho',
        href: '/warehouse-outbound',
        icon: <ArrowUpFromLine />,
        permissions: [PERMISSION_CODES.WAREHOUSE_OUTBOUND_READ, PERMISSION_CODES.WAREHOUSE_OUTBOUND_CREATE],
    },
    {
        title: 'Cài đặt',
        href: '/setting',
        icon: <Settings />,
        permissions: USER_SELF_PERMISSIONS,
    }
]

export const ROUTE_MAPPER = {
    'user': 'Người dùng',
    'customer': 'Khách hàng',
    'vendor': 'Nhà cung cấp',
    'type': 'Nhóm hàng',
    'goods': 'Hàng hóa',
    'order': 'Đơn bán hàng',
    'purchase': 'Đơn mua hàng',
    'payment': 'Thanh toán',
    'warehouse-inbound': 'Nhập kho',
    'receipt': 'Biên nhận',
    'warehouse-inventory': 'Tồn kho sản phẩm',
    'warehouse-outbound': 'Xuất kho',
    'transactions': 'Giao dịch kho',
    'inventory-stock': 'Tồn kho',
    'inventory-in': 'Nhập kho',
    'inventory-out': 'Xuất kho',
    'contract': 'Hồ sơ',
    'notifications': 'Thông báo',
    'setting': 'Cài đặt',
    'roles': 'Quản lý vai trò',
    'edit': 'Chỉnh sửa',
    'new': 'Thêm mới',
}