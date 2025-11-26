import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from '../ui/sidebar';
import { LIST_ITEM } from '@/lib/list-routes';
import LOGO_IMAGE from '../../assets/image/logo.png'

export interface IAppSidebarProps {
    onLogout: () => void;
}


const SideBar = ({ onLogout }: IAppSidebarProps) => {
    return (
        <Sidebar collapsible='icon' variant='inset'	>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#" className="flex items-center justify-center">
                                <img src={LOGO_IMAGE}  alt="Logo" className='w-full h-full object-contain' />
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {LIST_ITEM.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} tooltipClassName='bg-primary text-white' className='hover:bg-primary hover:text-white' >
                                        <Link to={item.href} activeProps={{ className: 'bg-primary text-white' }}>
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className='text-red-500 font-semibold hover:bg-red-500 hover:text-white' tooltip='Đăng xuất' tooltipClassName='bg-red-500 text-white'>
                            <button onClick={(e) => { e.preventDefault(); onLogout(); }} className="w-full flex items-center gap-2">
                                <LogOut />
                                <span>Đăng xuất</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

export default SideBar