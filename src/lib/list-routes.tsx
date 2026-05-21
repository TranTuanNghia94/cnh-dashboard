import { Album, ArrowDownToLine, ArrowUpFromLine, BaggageClaim, Boxes, Handshake, Package, Receipt, Settings, Store, Tag, User } from "lucide-react";

export type AppNavItem = {
	title: string;
	href: string;
	icon: React.ReactNode;
	/** If true, link is shown only when cookies allow user management (ADMIN or user-related permission). */
	gatedByUserAccess?: boolean;
};

export const LIST_ITEM: AppNavItem[] = [
    {
        title: 'Người dùng',
        href: '/user',
        icon: <User />,
        gatedByUserAccess: true,
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
        icon: <Receipt />
    },
    {
        title: 'Nhập kho',
        href: '/warehouse-inbound',
        icon: <ArrowDownToLine />
    },
    {
        title: 'Tồn kho',
        href: '/warehouse-inventory',
        icon: <Boxes />
    },
    {
        title: 'Xuất kho',
        href: '/warehouse-outbound',
        icon: <ArrowUpFromLine />
    },
    {
        title: 'Cài đặt',
        href: '/setting',
        icon: <Settings />
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
    'edit': 'Chỉnh sửa',
    'new': 'Thêm mới',
}