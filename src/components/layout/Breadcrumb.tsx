
import { useLocation } from '@tanstack/react-router'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Fragment } from 'react/jsx-runtime'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { getCookie, SUB } from '@/lib/cookie'
import { useLogoutMutation } from '@/hooks/use-auth'


const BreadcrumbLayout = () => {
    const location = useLocation()
    const listPathName = location.pathname.replace('/', '').split('/')
    const user = getCookie(SUB)


    const { mutate } = useLogoutMutation()

    const handleLogout = async () => {
        mutate()
    }



    return (
        <div className="mx-4 flex justify-between">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>DASHBOARD</BreadcrumbPage>
                    </BreadcrumbItem>
                    {
                        listPathName.map((item) => {
                            return (
                                <Fragment key={item}>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{item.toUpperCase()}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </Fragment>
                            )
                        })
                    }
                </BreadcrumbList>
            </Breadcrumb>


            <div className='flex items-center gap-x-4'>
                <div className='text-sm text-muted-foreground'>Xin chào, {user}</div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        className="overflow-hidden rounded-full"
                    >
                        A
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Cài đặt</DropdownMenuItem>
                    <DropdownMenuItem>Hỗ trợ</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-red-600 ' onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
        </div>
    )
}

export default BreadcrumbLayout