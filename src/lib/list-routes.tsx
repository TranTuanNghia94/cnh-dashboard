import { Album, BaggageClaim, Handshake, Package, PackageMinus, PackagePlus, Receipt, ShoppingCart, Store, Tag, User, Warehouse } from "lucide-react";

export const LIST_ITEM: { title: string, href: string, icon: React.ReactNode }[] = [
    {
        title: 'Người dùng',
        href: '/user',
        icon: <User />
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
        title: 'Tồn kho',
        href: '/inventory-stock',
        icon: <Warehouse />
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
    'inventory-stock': 'Tồn kho',
    'inventory-in': 'Nhập kho',
    'inventory-out': 'Xuất kho',
    'contract': 'Hồ sơ',
    'edit': 'Chỉnh sửa',
    'new': 'Thêm mới',
}