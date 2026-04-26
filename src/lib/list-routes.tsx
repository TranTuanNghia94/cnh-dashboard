import { Album, ArrowDownToLine, BaggageClaim, Boxes, Handshake, Package, PackageMinus, PackagePlus, Receipt, ShoppingCart, Store, Tag, User, Warehouse } from "lucide-react";

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
        title: 'Nhập kho (DNTT)',
        href: '/warehouse-inbound',
        icon: <ArrowDownToLine />
    },
    {
        title: 'Tồn kho',
        href: '/inventory-stock',
        icon: <Warehouse />
    },
    {
        title: 'Tồn kho sản phẩm',
        href: '/warehouse-inventory',
        icon: <Boxes />
    },
    {
        title: 'Nhập kho',
        href: '/inventory-in',
        icon: <PackagePlus />
    },
    {
        title: 'Xuất kho',
        href: '/inventory-out',
        icon: <PackageMinus />
    },
    {
        title: 'Hồ sơ',
        href: '/contract',
        icon: <ShoppingCart />
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
    'warehouse-inbound': 'Nhập kho (DNTT)',
    'receipt': 'Biên nhận',
    'warehouse-inventory': 'Tồn kho sản phẩm',
    'transactions': 'Giao dịch kho',
    'inventory-stock': 'Tồn kho',
    'inventory-in': 'Nhập kho',
    'inventory-out': 'Xuất kho',
    'contract': 'Hồ sơ',
    'notifications': 'Thông báo',
    'edit': 'Chỉnh sửa',
    'new': 'Thêm mới',
}