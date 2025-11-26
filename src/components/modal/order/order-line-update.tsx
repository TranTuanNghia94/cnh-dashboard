import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { IOrderLineCreateRequest } from '@/types/order';
import { IProductResponse } from '@/types/product';
import React, { useEffect, useRef } from 'react';
import FindProduct from '../product/find';
import { SearchIcon } from 'lucide-react';
import { useGetProductByCode } from '@/hooks/use-product';

type Props = {
    saveDetail: (data: IOrderLineCreateRequest) => void
    data: IOrderLineCreateRequest;
}

const OrderLineUpdate = ({ saveDetail, data }: Props) => {
    const [goodsSelected, setGoodsSelected] = React.useState<IProductResponse | undefined>(undefined);
    const [open, setOpen] = React.useState(false);
    const [code, setCode] = React.useState<string>()
    const [formValues, setFormValues] = React.useState<IOrderLineCreateRequest>({
        quantity: data?.quantity,
        unitPrice: data?.unitPrice,
        uom: data?.uom,
        isIncludedTax: data?.isIncludedTax,
        taxRate: data?.taxRate,
        taxAmount: data?.taxAmount,
        totalAmount: data?.totalAmount,
        notes: data?.notes,
        productCodeSuggest: data?.productCodeSuggest,
        productNameSuggest: data?.productNameSuggest,
        vendorCodeSuggest: data?.vendorCodeSuggest,
        vendorNameSuggest: data?.vendorNameSuggest,
    });

    const { mutateAsync, data: productData } = useGetProductByCode()

    useEffect(() => {
        if (productData?.data) {
            setGoodsSelected(productData.data as IProductResponse)
        }
    }, [productData?.data])

    useEffect(() => {
        if (data) {
            setFormValues(data)
            setGoodsSelected(data.product as IProductResponse)
        }
    }, [data])

    const formRef = useRef<HTMLFormElement>(null)



    const handleSelectProduct = (data: IProductResponse) => {
        setGoodsSelected(data)
    }

    const handleSearchProduct = () => {
        if (!code) return
        mutateAsync(code.trim() as string)
    }


    const clearForm = () => {
        setGoodsSelected(undefined)
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // event.preventDefault()

        // setFormValues((prevValues) => ({
        //     ...prevValues,
        //     [event.target.name]: event.target.value,
        // }));
        e.preventDefault()
        setCode(e.target.value as string)
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!goodsSelected) return

        const formatData: IOrderLineCreateRequest = {
            ...formValues,
            unitPrice: Number(formValues.unitPrice),
            quantity: Number(formValues.quantity),
            totalAmount: Number(formValues.unitPrice) * Number(formValues.quantity),
            productId: goodsSelected.id,
            productCodeSuggest: goodsSelected.code,
            productNameSuggest: goodsSelected.name,
        }

        saveDetail(formatData)
        setOpen(false)
        clearForm()
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
                        <DialogTitle className="uppercase text-center">Cập nhật chi tiết đơn hàng</DialogTitle>

                        <div className="flex gap-x-4">
                            <Button size="sm" type="submit" form="updateOrderLineForm">Lưu</Button>
                            <DialogClose onClick={clearForm} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <form id="updateOrderLineForm" onSubmit={onSubmit} ref={formRef}>
                    <div>

                        <div className="grid grid-cols-3 gap-x-12 gap-y-10 mt-4">
                            <div>
                                <div>
                                    <Label>Mã hàng <span className="text-red-600">*</span></Label>
                                    <div className="flex gap-x-2">
                                        <Input name="productCodeSuggest" maxLength={300} onChange={handleChange} value={formValues.productCodeSuggest} />
                                        <Button type="button" disabled={!code} size="sm" onClick={handleSearchProduct}>
                                            <SearchIcon />
                                        </Button>
                                    </div>
                                    <FindProduct setProductData={handleSelectProduct} />
                                </div>

                            </div>

                            <div>
                                <Label>Tên hàng</Label>
                                <div className="text-sm text-gray-500 mt-2">{goodsSelected?.name}</div>
                            </div>

                            <div>
                                <Label>Nhóm hàng</Label>
                                <div className="text-sm text-gray-500 mt-2">{goodsSelected?.categoryName}</div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-primary my-6" />

                    <div>
                        <div className="grid grid-cols-3 gap-x-12 gap-y-10 mt-4">
                            <div>
                                <Label htmlFor="vendorCodeSuggest">Nhà cung cấp <span className="text-red-600">*</span></Label>
                                <Input required name="vendorCodeSuggest" defaultValue={formValues.vendorCodeSuggest} />
                            </div>

                            <div>
                                <Label htmlFor="quantity">Số lượng <span className="text-red-600">*</span></Label>
                                <Input required name="quantity" min={0} max={1000000} maxLength={7} type="number" defaultValue={formValues.quantity} />
                            </div>

                            <div>
                                <Label htmlFor="uom">Đơn vị tính <span className="text-red-600">*</span></Label>
                                <Input required name="uom" maxLength={50} defaultValue={formValues.uom} />
                            </div>

                            <div>
                                <Label htmlFor="isIncludedTax">Thuế <span className="text-red-600">*</span></Label>
                                <Select required name="isIncludedTax" defaultValue={formValues.isIncludedTax ? "1" : "0"}>
                                    <SelectTrigger id="framework">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectItem value="1">Đã bao gồm thuế</SelectItem>
                                        <SelectItem value="0">Chưa bao gồm thuế</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="unitPrice">Đơn giá <span className="text-red-600">*</span></Label>
                                <Input required maxLength={100} name="unitPrice" defaultValue={formValues.unitPrice} />
                            </div>

                        </div>
                    </div>

                    <Separator className="bg-primary my-6" />

                    <div>
                        <div className="grid grid-cols-3 gap-x-12 my-4">
                            <div>
                                <Label htmlFor="receiverNote">Giáo viên</Label>
                                <Input name="receiverNote" maxLength={300} defaultValue={formValues.receiverNote} />
                            </div>

                            <div>
                                <Label htmlFor="deliveryNote">Phòng</Label>
                                <Input name="deliveryNote" maxLength={300} defaultValue={formValues.deliveryNote} />
                            </div>

                            <div>
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Input name="notes" maxLength={500} defaultValue={formValues.notes} />
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )

    return null
}

export default OrderLineUpdate;