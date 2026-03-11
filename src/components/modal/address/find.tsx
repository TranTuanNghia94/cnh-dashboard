import { ModalAddressColumns } from "@/components/table/address/modal-find-address"
import { DataTableModal } from "@/components/table/data-table-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useGetAddressByCustomerId } from "@/hooks/use-customer"
import { IAddressResponse } from "@/types/address"
import React, { useCallback, useEffect } from "react"


type Props = {
    customerId: string | null
    setAddressData: (data: IAddressResponse) => void
    disabled?: boolean
}

const FindAddress = ({ setAddressData, customerId, disabled }: Props) => {
    const { mutateAsync: getAddress, data: dataAddress } = useGetAddressByCustomerId()
    const [dataSelected, setDataSelected] = React.useState<IAddressResponse>()
    const [open, setOpen] = React.useState(false)

    const selectData = (data: IAddressResponse) => {
        setDataSelected(data)
    }

    const handleConfirm = () => {
        if (dataSelected) {
            setAddressData(dataSelected)
            setOpen(false)
        }
    }

    const handleDoubleClickConfirm = useCallback((item: IAddressResponse) => {
        setAddressData(item)
        setOpen(false)
    }, [setAddressData])

    useEffect(() => {
        if (customerId) {
            getAddress(customerId)
        }
    }, [customerId])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" size="sm" disabled={disabled}>Chọn</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex justify-between">
                        <DialogTitle className="uppercase">Địa chỉ khách hàng</DialogTitle>
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
                    fetchData={() => { }}
                    total={dataAddress?.data?.length}
                    data={dataAddress?.data as IAddressResponse[] || []}
                    columns={ModalAddressColumns}
                />
            </DialogContent>
        </Dialog>
    )
}

export default FindAddress;
