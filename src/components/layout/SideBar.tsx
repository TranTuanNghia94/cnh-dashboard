import { Link } from '@tanstack/react-router'
import { Settings, ShoppingCart, User, LogOut, Package, Receipt, Tag, Album, Handshake, Store, BaggageClaim, Warehouse, PackagePlus, PackageMinus } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ModeToggle } from '../mode-toggle'
import { useLogoutMutation } from '@/hooks/use-auth'

const LIST_ITEM = [
    {
        name: 'Người dùng',
        href: '/user',
        icon: User
    },
    {
        name: 'Khách hảng',
        href: '/customer',
        icon: Handshake
    },
    {
        name: 'Nhà cung cấp',
        href: '/vendor',
        icon: Album
    },
    {
        name: 'Nhóm hàng',
        href: '/type',
        icon: Tag
    },
    {
        name: 'Hàng hóa',
        href: '/goods',
        icon: Package
    },
    {
        name: 'Đơn bán hàng',
        href: '/sell',
        icon: Store
    },
    {
        name: 'Đơn mua hàng',
        href: '/purchase',
        icon: BaggageClaim
    },
    {
        name: 'Thanh toán',
        href: '/payment',
        icon: Receipt
    },
    {
        name: 'Tồn kho',
        href: '/inventory-stock',
        icon: Warehouse
    },
    {
        name: 'Nhập kho',
        href: '/inventory-in',
        icon: PackagePlus
    },
    {
        name: 'Xuất kho',
        href: '/inventory-out',
        icon: PackageMinus
    },
    {
        name: 'Hồ sơ',
        href: '/contract',
        icon: ShoppingCart
    }
]


const SideBar = () => {
    const { mutate } = useLogoutMutation()

    const handleLogout = async () => {
        mutate()
        window.location.reload()
    }

    return (
        <div>
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 py-4">
                    {LIST_ITEM.map((item) => (
                        <Tooltip key={item.name}>
                            <TooltipTrigger asChild>
                                <Link to={item.href}
                                    activeProps={{ className: "rounded-full bg-primary text-primary-foreground" }}
                                    className={"flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors md:h-8 md:w-8 hover:border-2"}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="sr-only">{item.name}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.name}</TooltipContent>
                        </Tooltip>
                    ))}
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
                    <ModeToggle />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link to='/setting'
                                activeProps={{ className: "bg-primary text-primary-foreground" }}
                                className="flex hover:border-2 hover:border-foreground h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors md:h-8 md:w-8"
                            >
                                <Settings className="h-5 w-5" />
                                <span className="sr-only">Cài đặt</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">Cài đặt</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                onClick={handleLogout}
                                className="flex hover:border-2 hover:border-red-500 h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                            >
                                <LogOut color='red' className="h-5 w-5" />
                                <span className="sr-only">Đăng xuất</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">Đăng xuất</TooltipContent>
                    </Tooltip>
                </nav>
            </aside>
        </div>
    )
}

export default SideBar