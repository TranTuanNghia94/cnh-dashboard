import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUpdateSell } from '@/hooks/use-sell';
import { useToast } from '@/hooks/use-toast';
import { SELL_STATUS } from '@/lib/constants';
import { ISellResponse } from '@/types/sell';
import { Circle, CircleCheck, MoveRight } from 'lucide-react';
import React, { useEffect } from 'react'

type Props = {
    sellData: ISellResponse
}

const UpdateSellStatus = ({ sellData }: Props) => {
    const { toast } = useToast()
    const { mutateAsync, isSuccess, data } = useUpdateSell()

    const [status, setStatus] = React.useState<string>(SELL_STATUS["Nháp"])

    useEffect(() => {
        setStatus(sellData.i_status as string ?? SELL_STATUS["Nháp"])
    }, [])


    useEffect(() => {
        if (isSuccess && data) {
            toast({
                title: 'Thao tác thành công',
                description: 'Cập nhật trạng thái đơn hàng',
                variant: 'success',
            })

            setStatus(SELL_STATUS["Nháp"])
        }
    }, [isSuccess, data])

    const handleSelect = (e: string) => {
        setStatus(e);
    }

    const onSubmit = () => {
        mutateAsync({
            i_status: status,
            id: sellData.id as string
        })
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <div className="relative dark:text-white hover:text-black hover:bg-secondary hover:text-white flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Đổi trạng thái
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[70%]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận đổi trang thái đơn hàng</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="text-sm">
                    <div className="flex gap-x-8 justify-between">
                        <div>
                            <CircleCheck />
                            <div className="text-muted-foreground mt-1">{SELL_STATUS["Nháp"]}</div>
                        </div>

                        <MoveRight />

                        <div>
                            {[SELL_STATUS["Chờ duyệt"], SELL_STATUS["Chờ thanh toán"], SELL_STATUS["Đã thanh toán một phần"], SELL_STATUS["Đã thanh toán 100%"]].includes(status) ? <CircleCheck /> : <Circle />}
                            <div className="text-muted-foreground mt-1">{SELL_STATUS["Chờ duyệt"]}</div>
                        </div>

                        <MoveRight />

                        <div>
                            {[SELL_STATUS["Chờ thanh toán"], SELL_STATUS["Đã thanh toán một phần"], SELL_STATUS["Đã thanh toán 100%"]].includes(status) ? <CircleCheck /> : <Circle />}
                            <div className="text-muted-foreground mt-1">{SELL_STATUS["Chờ thanh toán"]}</div>
                        </div>

                        <MoveRight />

                        <div>
                            {[SELL_STATUS["Đã thanh toán một phần"], SELL_STATUS["Đã thanh toán 100%"]].includes(status) ? <CircleCheck /> : <Circle />}
                            <div className="text-muted-foreground mt-1">{SELL_STATUS["Đã thanh toán một phần"]}</div>
                        </div>

                        <MoveRight />

                        <div>
                            {[SELL_STATUS["Đã thanh toán 100%"]].includes(status) ? <CircleCheck /> : <Circle />}
                            <div className="text-muted-foreground mt-1">{SELL_STATUS["Đã thanh toán 100%"]}</div>
                        </div>
                    </div>

                    <div>
                        <Separator className="my-4" />

                        <Select onValueChange={handleSelect} value={status}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Trang thái</SelectLabel>
                                    <SelectItem value={SELL_STATUS["Chờ duyệt"]}>{SELL_STATUS["Chờ duyệt"]}</SelectItem>
                                    <SelectItem value={SELL_STATUS["Chờ thanh toán"]}>{SELL_STATUS["Chờ thanh toán"]}</SelectItem>
                                    <SelectItem value={SELL_STATUS["Đã thanh toán một phần"]}>{SELL_STATUS["Đã thanh toán một phần"]}</SelectItem>
                                    <SelectItem value={SELL_STATUS["Đã thanh toán 100%"]}>{SELL_STATUS["Đã thanh toán 100%"]}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => { setStatus(SELL_STATUS["Nháp"]) }}>Huỷ</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit}>Cập nhật</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UpdateSellStatus;