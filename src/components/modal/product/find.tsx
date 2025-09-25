import { DataTableModal } from '@/components/table/data-table-modal'
import { ModalProductColumns } from '@/components/table/product/modal-find-columns'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useGetProducts } from '@/hooks/use-product'
import { IRequestPaginationAndSearch } from '@/types/api'
import { IProductResponse } from '@/types/product'
import React, { useEffect } from 'react'

type Props = {
    setProductData: (data: IProductResponse) => void
}

const FindProduct = ({ setProductData }: Props) => {
    const { mutateAsync, data } = useGetProducts()
    const [dataSelected, setDataSelected] = React.useState<IProductResponse>()

    useEffect(() => {
        mutateAsync({})
    }, [])

    const queryAllTypes = async (req?: IRequestPaginationAndSearch ) => {
        await mutateAsync({ ...req, });
    }

    const selectData = (data: IProductResponse) => {
        setDataSelected(data)
    }

    const handleConfirm = () => {
        setProductData(dataSelected as IProductResponse)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" size="xs">Chọn</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex justify-between">
                        <DialogTitle className="uppercase">Tìm kiếm hàng hoá</DialogTitle>
                        <div className="flex gap-x-4">
                            <DialogTrigger onClick={handleConfirm} disabled={!dataSelected} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Xác nhận</DialogTrigger>
                            <DialogClose onClick={() => setDataSelected(undefined)} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <DataTableModal selectedFunct={selectData} 
                fetchData={(req) => queryAllTypes(req as IRequestPaginationAndSearch)} 
                total={data?.data?.pagination?.total} 
                data={data?.data?.data as IProductResponse[] || []} 
                columns={ModalProductColumns} />
            </DialogContent>
        </Dialog>
    )

    return null
}

export default FindProduct;