import { DataTableModal } from '@/components/table/data-table-modal'
import { ModalGoodsColumns } from '@/components/table/goods/modal-find-columns'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useGetGoods } from '@/hooks/use-goods'
import { IPaginationAndSearch } from '@/types/api'
import { IGoodsResponse, IGoodsWhere } from '@/types/goods'
import React, { useEffect } from 'react'

type Props = {
    setGoodsData: (data: IGoodsResponse) => void
}

const FindGoods = (props: Props) => {
    const { mutateAsync, data } = useGetGoods()
    const [dataSelected, setDataSelected] = React.useState<IGoodsResponse>()

    useEffect(() => {
        mutateAsync({})
    }, [])

    const queryAllTypes = async (req?: IPaginationAndSearch<IGoodsWhere>) => {
        await mutateAsync({ ...req, });
    }

    const selectData = (data: IGoodsResponse) => {
        setDataSelected(data)
    }

    const handleConfirm = () => {
        props.setGoodsData(dataSelected as IGoodsResponse)
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
                <DataTableModal selectedFunct={selectData} fetchData={(req) => queryAllTypes(req as IPaginationAndSearch<IGoodsWhere>)} total={data?.metadata?.total} data={data?.results as IGoodsResponse[] || []} columns={ModalGoodsColumns} />
            </DialogContent>
        </Dialog>
    )
}

export default FindGoods;