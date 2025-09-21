import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IVendorBanksCreateRequest } from "@/types/vendor";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


type Props = {
    saveDetail: (data: IVendorBanksCreateRequest) => void
    data: IVendorBanksCreateRequest
}

const UpdateVendorBanks = ({ saveDetail, data }: Props) => {
    const [open, setOpen] = React.useState(false);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const val: IVendorBanksCreateRequest = {
            id: data?.id as string,
            bankName: formData.get('bankName') as string,
            bankAccountName: formData.get('bankAccountName') as string,
            bankAccountNumber: formData.get('bankAccountNumber') as string,
            bankAccountBranch: formData.get('bankAccountBranch') as string,
            bankAccountSwift: formData.get('bankAccountSwift') as string,
            bankAccountIban: formData.get('bankAccountIban') as string,
        }

        saveDetail(val)
        setOpen(false)
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative flex cursor-default select-none hover:bg-gray-100 items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-blue-600">
                    Sửa
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[50%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase">Thêm ngân hàng</DialogTitle>

                        <div className="flex gap-x-4">
                            <Button size="sm" type="submit" form="createSellDetailForm">Lưu</Button>
                            <DialogClose className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <form className="grid grid-cols-1 gap-4" id="createSellDetailForm" onSubmit={onSubmit}>

                    <div>
                        <Label htmlFor="bankName">Tên ngân hàng <span className="text-red-500">*</span></Label>
                        <Input name="bankName" maxLength={300} defaultValue={data.bankName} />
                    </div>

                    <div>
                        <Label htmlFor="bankAccountName">Tên tài khoản <span className="text-red-500">*</span></Label>
                        <Input name="bankAccountName" type="text" maxLength={20} defaultValue={data.bankAccountName} />
                    </div>

                    <div>
                        <Label htmlFor="bankAccountNumber">Số tài khoản <span className="text-red-500">*</span></Label>
                        <Input name="bankAccountNumber" type="number" maxLength={20} defaultValue={data.bankAccountNumber} />
                    </div>

                    <div>
                        <Label htmlFor="bankAccountBranch">Chi nhánh</Label>
                        <Input name="bankAccountBranch" maxLength={500} defaultValue={data?.bankAccountBranch} />
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateVendorBanks;