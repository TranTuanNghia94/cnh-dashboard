import { ModalAddressColumns } from "@/components/table/address/modal-find-address"
import { DataTableModal } from "@/components/table/data-table-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ICustomerAddressResponse } from "@/types/customer"
import React from "react"




type Props = {
    setAddressData: (data: ICustomerAddressResponse) => void
    dataAddress: ICustomerAddressResponse[]
}

const FindAddress = ({ setAddressData, dataAddress }: Props) => {
    const [dataSelected, setDataSelected] = React.useState<ICustomerAddressResponse>()

    const selectData = (data: ICustomerAddressResponse) => {
        setDataSelected(data)
    }

    const handleConfirm = () => {
        setAddressData(dataSelected as ICustomerAddressResponse)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" size="xs">Chọn</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex justify-between">
                        <DialogTitle className="uppercase">Tìm kiếm địa chỉ khách hàng</DialogTitle>
                        <div className="flex gap-x-4">
                            <DialogTrigger onClick={handleConfirm} disabled={!dataSelected} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Xác nhận</DialogTrigger>
                            <DialogClose onClick={() => setDataSelected(undefined)} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <DataTableModal selectedFunct={selectData} fetchData={() => { }}
                    total={dataAddress.length}
                    data={dataAddress as ICustomerAddressResponse[] || []} columns={ModalAddressColumns} />
            </DialogContent>
        </Dialog>
    )
}

export default FindAddress;