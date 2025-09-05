import ConfirmDeleteType from "@/components/modal/type/delete"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IGroupOfGoodsResponse } from "@/types/type"
import { Link } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react"


export type ITypeExtends = IGroupOfGoodsResponse & { refetch: () => void }

export const TypeColumns: ColumnDef<ITypeExtends>[] = [
    {
        id: 'No.',
        header: 'No.',
        accessorKey: 'stt',
        cell: (a) => {
            const numb = (a.row.index + 1) + (a.table.getState().pagination.pageIndex * (a.table.getState().pagination.pageSize))
            return <div className="text-xs">{numb}</div>
        }

    },
    {
        id: 'Tên nhóm hàng',
        accessorKey: 'ten',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tên nhóm hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.ten}</div>

    },
    {
        id: 'Đơn vị',
        accessorKey: "donViTinh",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Đơn vị
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original.donViTinh}</div>,
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const item = row.original
            console.log(item)
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="bg-transparent">
                        <Button
                            aria-haspopup="true"
                            size="sm"
                            variant="ghost"
                        >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <Link to="/type/$typeId" params={{ typeId: item.id }}>
                            <DropdownMenuItem className="text-blue-600">Cập nhật</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem asChild className="text-red-600">
                            <ConfirmDeleteType type={item} refetch={item?.refetch} />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]