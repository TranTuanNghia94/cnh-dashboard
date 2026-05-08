import { ModalCustomerColumns } from "@/components/table/customer/modal-find-customer"
import { DataTableModal } from "@/components/table/data-table-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGetCustomers } from "@/hooks/use-customer"
import { IRequestPaginationAndSearch } from "@/types/api"
import { ICustomerResponse } from "@/types/customer"
import React, { useCallback } from "react"


type Props = {
    handleSelect: (data: ICustomerResponse) => void
}

const FindCustomer = (props: Props) => {
    const { mutateAsync, data } = useGetCustomers()
    const [dataSelected, setDataSelected] = React.useState<ICustomerResponse>()
    const [open, setOpen] = React.useState(false)
    const [filterVersion, setFilterVersion] = React.useState(0)
    const [filters, setFilters] = React.useState({
        customerCode: '',
        misaCode: '',
        customerName: '',
    })
    const filtersRef = React.useRef(filters)
    filtersRef.current = filters

    const buildPayload = useCallback((req?: IRequestPaginationAndSearch) => {
        const activeFilters = Object.fromEntries(
            Object.entries(filtersRef.current).filter(([, value]) => value.trim() !== '')
        )

        return {
            page: req?.page ?? 0,
            limit: req?.limit ?? 10,
            ...activeFilters,
        } as IRequestPaginationAndSearch
    }, [])

    const queryAllTypes = useCallback(async (req?: IRequestPaginationAndSearch) => {
        await mutateAsync(buildPayload(req))
    }, [buildPayload, mutateAsync])

    const applyFilters = useCallback(() => {
        setDataSelected(undefined)
        setFilterVersion((value) => value + 1)
    }, [])

    const resetFilters = useCallback(() => {
        const nextFilters = { customerCode: '', misaCode: '', customerName: '' }
        setFilters(nextFilters)
        filtersRef.current = nextFilters
        setDataSelected(undefined)
        setFilterVersion((value) => value + 1)
    }, [])

    const selectData = (data: ICustomerResponse) => {
        setDataSelected(data)
    }

    const handleConfirm = () => {
        if (dataSelected) {
            props.handleSelect(dataSelected)
            setOpen(false)
        }
    }

    const handleDoubleClickConfirm = useCallback((item: ICustomerResponse) => {
        props.handleSelect(item)
        setOpen(false)
    }, [props])

    const activeFilterCount = Object.values(filters).filter((value) => value.trim() !== '').length

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" size="sm">Chọn</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex justify-between">
                        <DialogTitle className="uppercase">Tìm kiếm khách hàng</DialogTitle>
                        <div className="flex gap-x-2">
                            <Button size="sm" onClick={handleConfirm} disabled={!dataSelected}>
                                Xác nhận
                            </Button>
                            <DialogClose asChild>
                                <Button size="sm" variant="outline" onClick={() => setDataSelected(undefined)}>
                                    Đóng
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Nhấp đúp vào một dòng để chọn nhanh.</p>
                </DialogHeader>
                <form
                    className="grid grid-cols-1 items-end gap-3 rounded-lg border bg-muted/20 p-3 md:grid-cols-4"
                    onSubmit={(event) => {
                        event.preventDefault()
                        applyFilters()
                    }}
                >
                    <div>
                        <Label className="mb-2 block text-xs">Mã khách hàng</Label>
                        <Input
                            className="h-9"
                            placeholder="CUS..."
                            value={filters.customerCode}
                            onChange={(event) => setFilters((prev) => ({ ...prev, customerCode: event.target.value }))}
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block text-xs">Mã MISA</Label>
                        <Input
                            className="h-9"
                            placeholder="MISA-01"
                            value={filters.misaCode}
                            onChange={(event) => setFilters((prev) => ({ ...prev, misaCode: event.target.value }))}
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block text-xs">Tên khách hàng</Label>
                        <Input
                            className="h-9"
                            placeholder="An Phát"
                            value={filters.customerName}
                            onChange={(event) => setFilters((prev) => ({ ...prev, customerName: event.target.value }))}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm">Áp dụng</Button>
                        <Button type="button" size="sm" variant="outline" onClick={resetFilters} disabled={activeFilterCount === 0}>
                            Xóa lọc
                        </Button>
                    </div>
                </form>
                <DataTableModal
                    key={filterVersion}
                    selectedFunct={selectData}
                    onDoubleClickConfirm={handleDoubleClickConfirm}
                    fetchData={(req) => queryAllTypes(req as IRequestPaginationAndSearch)}
                    total={data?.data?.pagination?.total}
                    data={data?.data?.data as ICustomerResponse[] || []}
                    columns={ModalCustomerColumns}
                />
            </DialogContent>
        </Dialog>
    )
}

export default FindCustomer;
