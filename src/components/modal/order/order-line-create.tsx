import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react'
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IOrderLineCreateRequest } from '@/types/order';
import { IProductResponse } from '@/types/product';
import { SearchIcon } from 'lucide-react';
import { useGetProductByCode } from '@/hooks/use-product';
import FindProduct from '../product/find';
import { useEffect, useRef } from 'react';

type Props = {
    saveDetail: (data: IOrderLineCreateRequest) => void
}

const OrderLineCreate = ({ saveDetail }: Props) => {
    const [goodsSelected, setGoodsSelected] = React.useState<IProductResponse>();
    const [open, setOpen] = React.useState(false);
    // const [openFindProduct, setOpenFindProduct] = React.useState(false);
    const [code, setCode] = React.useState<string>()
    const formRef = useRef<HTMLFormElement>(null)
    const { mutateAsync, data: productData } = useGetProductByCode()

    // const handleSelectGoods = (data: IProductResponse) => {
    //     setGoodsSelected(data)
    // }

    // useEffect(() => {
    //     if (data) {
        
    //     }
    // }, [data])

    useEffect(() => {
        if (productData?.data) {
            setGoodsSelected(productData.data as IProductResponse)
        }
    }, [productData?.data])


    const clearForm = () => {
        formRef.current?.reset()
        setGoodsSelected(undefined)
        setCode("")
        setOpen(false)
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setCode(e.target.value as string)
    }


    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log("log goodsSelected", goodsSelected)

        if (!goodsSelected) return

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        if (data && data?.["unitPrice"] && data?.["quantity"]) {
            data["totalAmount"] = `${Number(data["unitPrice"]) * Number(data["quantity"])}`
        }



        const formatData: IOrderLineCreateRequest = {
            ...data,
            quantity: Number(data["quantity"]),
            unitPrice: Number(data["unitPrice"]),
            totalAmount: Number(data["totalAmount"]),
            isIncludedTax: data["isIncludedTax"] === "0" ? false : true,
            productCodeSuggest: goodsSelected.code,
            productNameSuggest: goodsSelected.name,
            taxRate: 0,
            taxAmount: 0,
            notes: data?.notes as string,
            productId: goodsSelected.id,
            uom: goodsSelected.unit1,
            receiverNote: data["receiverNote"] as string,
            deliveryNote: data["deliveryNote"] as string,
            referenceNote: data["referenceNote"] as string,
            vendorCodeSuggest: data["vendorCodeSuggest"] as string,
            vendorNameSuggest: data["vendorCodeSuggest"] as string,
        }

        console.log("log formatData", formatData)
        saveDetail(formatData)
        setOpen(false)
        clearForm()
    }

    const handleSelectProduct = (data: IProductResponse) => {
        setGoodsSelected(data)
    }

    const handleSearchProduct = () => {
        if (!code) return
        mutateAsync(code.trim() as string)
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="default">Thêm mới</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase text-center">Thêm mới chi tiết đơn hàng</DialogTitle>

                        <div className="flex gap-x-4">
                            <Button size="sm" type="submit" form="createSellDetailForm">Lưu</Button>
                            <DialogClose onClick={clearForm} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <form id="createSellDetailForm" onSubmit={onSubmit} ref={formRef}>
                    <div>

                        <div className="grid grid-cols-3 gap-x-12 gap-y-10 mt-4">
                            <div>
                                <div>
                                    <Label>Mã hàng <span className="text-red-600">*</span></Label>
                                    <div className="flex gap-x-2">
                                        <Input name="code" maxLength={300} onChange={handleChange} value={code} />
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
                                <Input required name="vendorCodeSuggest" />
                            </div>

                            <div>
                                <Label htmlFor="quantity">Số lượng <span className="text-red-600">*</span></Label>
                                <Input required name="quantity" min={0} max={1000000} maxLength={7} type="number" />
                            </div>

                            <div>
                                <Label htmlFor="uom">Đơn vị tính <span className="text-red-600">*</span></Label>
                                <Input required name="uom" maxLength={50} />
                            </div>

                            <div>
                                <Label htmlFor="isIncludedTax">Thuế <span className="text-red-600">*</span></Label>
                                <Select required name="isIncludedTax">
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
                                <Input required maxLength={100} name="unitPrice" />
                            </div>

                        </div>
                    </div>

                    <Separator className="bg-primary my-6" />

                    <div>
                        <div className="grid grid-cols-3 gap-x-12 my-4">
                            <div>
                                <Label htmlFor="receiverNote">Giáo viên</Label>
                                <Input name="receiverNote" maxLength={300} />
                            </div>

                            <div>
                                <Label htmlFor="deliveryNote">Phòng</Label>
                                <Input name="deliveryNote" maxLength={300} />
                            </div>

                            <div>
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Input name="notes" maxLength={500} />
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default OrderLineCreate;