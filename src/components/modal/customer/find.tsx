import { ModalCustomerColumns } from "@/components/table/customer/modal-find-customer"
import { DataTableModal } from "@/components/table/data-table-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useGetCustomers } from "@/hooks/use-customer"
import { IPaginationAndSearch } from "@/types/api"
import { ICustomerResponse, ICustomerWhere } from "@/types/customer"
import React, { useEffect } from "react"



type Props = {
    setCustomerData: (data: ICustomerResponse) => void
}

const FindCustomer = (props: Props) => {
    const { mutateAsync, data } = useGetCustomers()
    const [dataSelected, setDataSelected] = React.useState<ICustomerResponse>()

    useEffect(() => {
        mutateAsync({})
    }, [])

    const queryAllTypes = async (req?: IPaginationAndSearch<ICustomerWhere>) => {
        await mutateAsync({ ...req, });
    }

    const selectData = (data: ICustomerResponse) => {
        setDataSelected(data)
    }

    const handleConfirm = () => {
        props.setCustomerData(dataSelected as ICustomerResponse)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" size="xs">Chọn</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex justify-between">
                        <DialogTitle className="uppercase">Tìm kiếm khách hàng</DialogTitle>
                        <div className="flex gap-x-4">
                            <DialogTrigger onClick={handleConfirm} disabled={!dataSelected} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Xác nhận</DialogTrigger>
                            <DialogClose onClick={() => setDataSelected(undefined)} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <DataTableModal selectedFunct={selectData} fetchData={(req) => queryAllTypes(req as IPaginationAndSearch<ICustomerWhere>)}
                    total={data?.metadata?.total}
                    data={data?.results as ICustomerResponse[] || []} columns={ModalCustomerColumns} />
            </DialogContent>
        </Dialog>
    )
}

export default FindCustomer;