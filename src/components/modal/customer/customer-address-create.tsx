import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ICustomerAddressInput } from "@/types/customer";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";



type Props = {
    saveDetail: (data: ICustomerAddressInput) => void
}

const CreateCustomerAddress = ({ saveDetail }: Props) => {
    const [open, setOpen] = React.useState(false);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const data: ICustomerAddressInput = {
            id: '',
            tenNguoiLienHe: formData.get('tenNguoiLienHe') as string,
            soDienThoai: formData.get('soDienThoai') as string,
            email: formData.get('email') as string,
            soNhaTenDuong_1: formData.get('soNhaTenDuong_1') as string,
        }

        saveDetail(data)
        setOpen(false)
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Thêm địa chỉ khách hàng</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase">Thêm địa chỉ khách hàng</DialogTitle>

                        <div className="flex gap-x-4">
                            <Button size="sm" type="submit" form="createSellDetailForm">Lưu</Button>
                            <DialogClose className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <form className="grid grid-cols-2 gap-4" id="createSellDetailForm" onSubmit={onSubmit}>

                    <div>
                        <Label htmlFor="tenNguoiLienHe">Người liên hệ <span className="text-red-500">*</span></Label>
                        <Input name="tenNguoiLienHe" maxLength={300} />
                    </div>

                    <div>
                        <Label htmlFor="soDienThoai">SĐT</Label>
                        <Input name="soDienThoai" type="tel" maxLength={20} />
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input name="email" type="email" maxLength={200} />
                    </div>

                    <div>
                        <Label htmlFor="soNhaTenDuong_1">Địa chỉ</Label>
                        <Input name="soNhaTenDuong_1" maxLength={400} />
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateCustomerAddress;