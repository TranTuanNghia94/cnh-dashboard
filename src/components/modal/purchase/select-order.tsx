import { ModalSelectOrderColumns } from '@/components/table/order/modal-select-order-columns'
import { DataTableModal } from '@/components/table/data-table-modal'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGetOrders } from '@/hooks/use-order'
import { IRequestPaginationAndSearch } from '@/types/api'
import { IOrderResponse } from '@/types/order'
import { Loader2 } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

type Props = {
    onSelectOrder: (order: IOrderResponse) => void | Promise<void>
    disabled?: boolean
}

const emptyFilters = {
    orderNumber: '',
    contractNumber: '',
    customerName: '',
}

const SelectOrder = ({ onSelectOrder, disabled }: Props) => {
    const [open, setOpen] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const [dataSelected, setDataSelected] = useState<IOrderResponse>()
    const [filterVersion, setFilterVersion] = useState(0)
    const [filters, setFilters] = useState(emptyFilters)
    const filtersRef = useRef(filters)
    filtersRef.current = filters

    const { mutateAsync, data, isPending } = useGetOrders()

    const buildPayload = useCallback((req?: IRequestPaginationAndSearch) => {
        const activeFilters = Object.fromEntries(
            Object.entries(filtersRef.current).filter(([, value]) => value.trim() !== ''),
        )
        return {
            page: req?.page ?? 0,
            limit: req?.limit ?? 10,
            ...activeFilters,
        } as IRequestPaginationAndSearch
    }, [])

    const queryOrders = useCallback(
        async (req?: IRequestPaginationAndSearch) => {
            await mutateAsync(buildPayload(req))
        },
        [buildPayload, mutateAsync],
    )

    const applyFilters = useCallback(() => {
        setDataSelected(undefined)
        setFilterVersion((value) => value + 1)
    }, [])

    const resetFilters = useCallback(() => {
        setFilters(emptyFilters)
        filtersRef.current = emptyFilters
        setDataSelected(undefined)
        setFilterVersion((value) => value + 1)
    }, [])

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            setFilters(emptyFilters)
            filtersRef.current = emptyFilters
            setDataSelected(undefined)
        }
    }

    const handleConfirm = async () => {
        if (!dataSelected) return
        setIsConfirming(true)
        try {
            await Promise.resolve(onSelectOrder(dataSelected))
            setOpen(false)
            setDataSelected(undefined)
            setFilters(emptyFilters)
            filtersRef.current = emptyFilters
        } finally {
            setIsConfirming(false)
        }
    }

    const handleDoubleClickConfirm = useCallback(
        async (order: IOrderResponse) => {
            setIsConfirming(true)
            try {
                await Promise.resolve(onSelectOrder(order))
                setOpen(false)
                setDataSelected(undefined)
                setFilters(emptyFilters)
                filtersRef.current = emptyFilters
            } finally {
                setIsConfirming(false)
            }
        },
        [onSelectOrder],
    )

    const activeFilterCount = Object.values(filters).filter((value) => value.trim() !== '').length
    const isBusy = disabled || isConfirming

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button type="button" size="sm" disabled={isBusy}>
                    Chọn đơn hàng
                </Button>
            </DialogTrigger>
            <DialogContent
                className="flex max-h-[92vh] w-[min(92vw,1280px)] max-w-none flex-col gap-3 overflow-hidden p-5 sm:top-[4vh] sm:translate-y-0"
                onInteractOutside={(e) => { e.preventDefault() }}
            >
                <DialogHeader className="shrink-0 space-y-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="uppercase">Chọn đơn hàng</DialogTitle>
                            <p className="text-xs text-muted-foreground">
                                Nhấp đúp vào một dòng để chọn nhanh.
                            </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button
                                size="sm"
                                onClick={() => void handleConfirm()}
                                disabled={!dataSelected || isBusy}
                            >
                                {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận'}
                            </Button>
                            <DialogClose asChild>
                                <Button size="sm" variant="outline">
                                    Đóng
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogHeader>

                <form
                    className="grid shrink-0 grid-cols-1 items-end gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-4"
                    onSubmit={(event) => {
                        event.preventDefault()
                        applyFilters()
                    }}
                >
                    <div>
                        <Label className="mb-2 block text-xs">Số đơn hàng</Label>
                        <Input
                            className="h-9"
                            placeholder="SO.12"
                            value={filters.orderNumber}
                            onChange={(event) =>
                                setFilters((prev) => ({ ...prev, orderNumber: event.target.value }))
                            }
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block text-xs">Số hợp đồng</Label>
                        <Input
                            className="h-9"
                            placeholder="HD-2026-01"
                            value={filters.contractNumber}
                            onChange={(event) =>
                                setFilters((prev) => ({ ...prev, contractNumber: event.target.value }))
                            }
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block text-xs">Khách hàng</Label>
                        <Input
                            className="h-9"
                            placeholder="Nam Viet"
                            value={filters.customerName}
                            onChange={(event) =>
                                setFilters((prev) => ({ ...prev, customerName: event.target.value }))
                            }
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Áp dụng'}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={resetFilters}
                            disabled={activeFilterCount === 0}
                        >
                            Xóa lọc
                        </Button>
                    </div>
                </form>

                <DataTableModal
                    key={filterVersion}
                    className="min-h-0 flex-1"
                    selectedFunct={setDataSelected}
                    onDoubleClickConfirm={(order) => void handleDoubleClickConfirm(order)}
                    fetchData={(req) => void queryOrders(req as IRequestPaginationAndSearch)}
                    total={data?.data?.pagination?.total ?? 0}
                    data={data?.data?.data ?? []}
                    columns={ModalSelectOrderColumns}
                    emptyText="Không tìm thấy đơn hàng nào."
                />
            </DialogContent>
        </Dialog>
    )
}

export default SelectOrder
