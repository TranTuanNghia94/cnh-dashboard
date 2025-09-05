import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ISellDetailResponse } from '@/types/sell'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { SellPurchaseColumns } from '@/components/table/sell/column-sell-purchase'

type Props = {
    data: ISellDetailResponse[]
}

const Order = ({ data }: Props) => {




    console.log('data', data)
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" size="xs">Mua hàng</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex justify-between">
                        <DialogTitle className="uppercase">Mua hàng</DialogTitle>
                        <div className="flex gap-x-4">
                            {/* <DialogTrigger onClick={handleConfirm} disabled={!dataSelected} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Xác nhận</DialogTrigger> */}
                            <DialogClose className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <DataTableDetail wrapperClassName='h-[calc(85vh-175px)]' data={data} columns={SellPurchaseColumns} />
            </DialogContent>
        </Dialog>
    )
}

export default Order;