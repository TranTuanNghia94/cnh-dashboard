import { ModalAddressColumns } from "@/components/table/address/modal-find-address"
import { DataTableModal } from "@/components/table/data-table-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useGetAddressByCustomerId } from "@/hooks/use-customer"
import { IAddressResponse } from "@/types/address"
import React, { useEffect } from "react"


type Props = {
    customerId: string | null
    setAddressData: (data: IAddressResponse) => void
}

const FindAddress = ({ setAddressData, customerId }: Props) => {

    const { mutateAsync: getAddress, data: dataAddress } = useGetAddressByCustomerId()
    const [dataSelected, setDataSelected] = React.useState<IAddressResponse>()

    const selectData = (data: IAddressResponse) => {
        setDataSelected(data)
    }

    const handleConfirm = () => {
        setAddressData(dataSelected as IAddressResponse)
    }

    useEffect(() => {
        if (customerId) {
            getAddress(customerId)
        }
    }, [customerId])

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" size="sm">Chọn</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex justify-between">
                        <DialogTitle className="uppercase">Địa chỉ khách hàng</DialogTitle>
                        <div className="flex gap-x-4">
                            <DialogTrigger onClick={handleConfirm} disabled={!dataSelected} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Xác nhận</DialogTrigger>
                            <DialogClose onClick={() => setDataSelected(undefined)} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <DataTableModal selectedFunct={selectData} fetchData={() => { }}
                    total={dataAddress?.data?.length}
                    data={dataAddress?.data as IAddressResponse[] || []} columns={ModalAddressColumns} />
            </DialogContent>
        </Dialog>
    )
}

export default FindAddress;