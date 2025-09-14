import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IAddressRequestCreate } from "@/types/address";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";



type Props = {
    saveDetail: (data: IAddressRequestCreate) => void
    data: IAddressRequestCreate;
}

const UpdateCustomerAddress = ({ saveDetail, data }: Props) => {
    const [open, setOpen] = React.useState(false);

    const [formValues, setFormValues] = React.useState<IAddressRequestCreate>({
        contactPerson: data?.contactPerson,
        phone: data?.phone,
        email: data?.email,
        address: data?.address,
    });


    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        event.preventDefault()

        setFormValues((prevValues: IAddressRequestCreate) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData: IAddressRequestCreate = {
            ...formValues,
            id: data?.id,
            contactPerson: formValues?.contactPerson,
            phone: formValues?.phone,
            email: formValues?.email,
            address: formValues?.address,
        }

        saveDetail(formData)
        setOpen(false)
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative flex cursor-default select-none hover:bg-gray-100 items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-blue-600">
                    Sửa
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase">Sửa địa chỉ khách hàng</DialogTitle>

                        <div className="flex gap-x-4">
                            <Button size="sm" type="submit" form="createSellDetailForm">Lưu</Button>
                            <DialogClose className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <form className="grid grid-cols-2 gap-12" id="createSellDetailForm" onSubmit={onSubmit}>

                    <div>
                        <Label htmlFor="contactPerson">Người liên hệ <span className="text-red-500">*</span></Label>
                        <Input onChange={handleChange} value={formValues.contactPerson} name="contactPerson" maxLength={300} />
                    </div>

                    <div>
                        <Label htmlFor="phone">SĐT</Label>
                        <Input onChange={handleChange} value={formValues.phone} name="phone" type="tel" maxLength={20} />
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input onChange={handleChange} value={formValues.email ?? ""} name="email" type="email" maxLength={200} />
                    </div>

                    <div>
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Textarea onChange={handleChange} value={formValues.address ?? ""} name="address" maxLength={400} />
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateCustomerAddress;