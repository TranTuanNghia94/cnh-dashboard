import { ModalCustomerColumns } from "@/components/table/customer/modal-find-customer"
import { DataTableModal } from "@/components/table/data-table-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useGetCustomers } from "@/hooks/use-customer"
import { IRequestPaginationAndSearch } from "@/types/api"
import { ICustomerResponse } from "@/types/customer"
import React, { useCallback, useEffect } from "react"


type Props = {
    handleSelect: (data: ICustomerResponse) => void
}

const FindCustomer = (props: Props) => {
    const { mutateAsync, data } = useGetCustomers()
    const [dataSelected, setDataSelected] = React.useState<ICustomerResponse>()
    const [open, setOpen] = React.useState(false)

    useEffect(() => {
        queryAllTypes({
            limit: 10,
            page: 0,
        })
    }, [])

    const queryAllTypes = async (req?: IRequestPaginationAndSearch) => {
        await mutateAsync(req);
    }

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
                <DataTableModal
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
