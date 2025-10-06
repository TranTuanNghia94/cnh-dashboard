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
    data?: IOrderLineCreateRequest
    saveDetail: (data: IOrderLineCreateRequest) => void
}

const OrderLineCreate = ({ saveDetail, data }: Props) => {
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

        if (data && data?.["donGia"] && data?.["soLuong"]) {
            data["thanhTien"] = `${Number(data["donGia"]) * Number(data["soLuong"])}`
        }

        const formatData: IOrderLineCreateRequest = {
            ...data,
            quantity: Number(data["soLuong"]),
            unitPrice: Number(data["donGia"]),
            totalAmount: Number(data["thanhTien"]),
            isIncludedTax: data["daBaoGomThue"] === "0" ? false : true,
            productCodeSuggest: goodsSelected.code,
            productNameSuggest: goodsSelected.name,
            taxRate: 0,
            taxAmount: 0,
            notes: data?.ghiChu ? data?.ghiChu as string : '',
            productId: goodsSelected.id,
            uom: goodsSelected.unit1,
            vendorId: goodsSelected.id,
            vendorCodeSuggest: goodsSelected.code,
            vendorNameSuggest: goodsSelected.name,
        }

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
                                <Label htmlFor="cust_vendorCode">Nhà cung cấp <span className="text-red-600">*</span></Label>
                                <Input required name="cust_vendorCode" />
                            </div>

                            <div>
                                <Label htmlFor="soLuong">Số lượng <span className="text-red-600">*</span></Label>
                                <Input required name="soLuong" min={0} max={1000000} maxLength={7} type="number" />
                            </div>

                            <div>
                                <Label htmlFor="donViTinh">Đơn vị tính <span className="text-red-600">*</span></Label>
                                <Input required name="donViTinh" maxLength={50} />
                            </div>

                            <div>
                                <Label htmlFor="daBaoGomThue">Thuế <span className="text-red-600">*</span></Label>
                                <Select required name="daBaoGomThue">
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
                                <Label htmlFor="donGia">Đơn giá <span className="text-red-600">*</span></Label>
                                <Input required maxLength={100} name="donGia" />
                            </div>

                        </div>
                    </div>

                    <Separator className="bg-primary my-6" />

                    <div>
                        <div className="grid grid-cols-3 gap-x-12 my-4">
                            <div>
                                <Label htmlFor="giaoVien">Giáo viên</Label>
                                <Input name="giaoVien" maxLength={300} />
                            </div>

                            <div>
                                <Label htmlFor="dept_room">Phòng</Label>
                                <Input name="dept_room" maxLength={300} />
                            </div>

                            <div>
                                <Label htmlFor="ghiChu">Ghi chú</Label>
                                <Input name="ghiChu" maxLength={500} />
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default OrderLineCreate;