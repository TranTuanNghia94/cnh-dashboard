import { Button } from "@/components/ui/button"
import { IVendorResponse } from "@/types/vendor"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

export const ModalFindVendorColumns: ColumnDef<IVendorResponse>[] = [
  {
    id: 'Mã NCC',
    accessorKey: 'code',
    header: ({ column }) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Mã NCC
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-xs font-medium">{row.original?.code}</div>,
  },
  {
    id: 'Tên NCC',
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tên NCC
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-xs">{row.original?.name}</div>,
  },
]
