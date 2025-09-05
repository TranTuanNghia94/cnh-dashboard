
import { useLocation } from '@tanstack/react-router'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Fragment } from 'react/jsx-runtime'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { EMAIL, getCookie } from '@/lib/cookie'
import { useLogoutMutation } from '@/hooks/use-auth'


const BreadcrumbLayout = () => {
    const location = useLocation()
    const listPathName = location.pathname.replace('/', '').split('/')
    const email = getCookie(EMAIL)


    const { mutate } = useLogoutMutation()

    const handleLogout = async () => {
        mutate()
        window.location.reload()
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
                    <DropdownMenuLabel>{email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Cài đặt</DropdownMenuItem>
                    <DropdownMenuItem>Hỗ trợ</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-red-600 ' onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default BreadcrumbLayout