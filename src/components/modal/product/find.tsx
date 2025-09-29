import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useGetCategories } from '@/hooks/use-category'
import { useCreateProduct } from '@/hooks/use-product'
import { ICategoryResponse } from '@/types/category'
import { ICreateProductRequest, IProductResponse } from '@/types/product'
import React, { useEffect } from 'react'

type Props = {
    setProductData: (data: IProductResponse) => void
}

const FindProduct = ({ setProductData }: Props) => {
    const [dataSelected, setDataSelected] = React.useState<IProductResponse>()
    const [categoryId, setCategoryId] = React.useState<string>("")
    const { mutateAsync, data: categories } = useGetCategories()
    const { mutateAsync: createProduct, data: products } = useCreateProduct()

    useEffect(() => {
        mutateAsync()
    }, [])

    useEffect(() => {
        if (products?.data) {
            setProductData(products.data as IProductResponse)
            setDataSelected(products.data as IProductResponse)
        }
    }, [products?.data])

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    
        const formData = new FormData(e.currentTarget)
        
        const productData: ICreateProductRequest = {
            categoryId: formData.get('categoryId')?.toString().trim() as string,
            code: formData.get('code')?.toString().trim().toUpperCase() as string,
            name: formData.get('name')?.toString().trim() as string,
            unit1: formData.get('unit1')?.toString().trim().toUpperCase() as string,
            unit2: formData.get('unit2')?.toString().trim().toUpperCase() as string,
            tax: Number(formData.get('tax')?.toString().trim() as string),
            misaCode: formData.get('misaCode')?.toString().trim() as string,
            description: formData.get('description')?.toString().trim() as string,
            isActive: true,
        }

        await createProduct(productData)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" size="sm">Chọn</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex justify-between">
                        <DialogTitle className="uppercase">Yêu cầu tạo hàng hoá</DialogTitle>
                        <div className="flex gap-x-4">
                                <Button type="submit" form="createGoodsForm">
                                    Lưu
                                </Button>
                            <DialogClose onClick={() => setDataSelected(undefined)} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>

                <form id="createGoodsForm" onSubmit={onSubmit} className="grid my-20 grid-cols-2 gap-x-20 gap-y-10">
                    <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                        <div>
                            <Label className="text-xs" htmlFor="id">
                                Nhóm hàng hoá <span className="text-red-600">*</span>
                            </Label>

                            <Select required name="categoryId" value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger id="types">
                                    <SelectValue placeholder={'Nhóm hàng hoá'} />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {categories?.data?.data && categories?.data?.data.map((val: ICategoryResponse) => (
                                        <SelectItem key={val.id} value={val.id}>{val.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <input type="hidden" name="categoryId" value={categoryId} />
                        </div>

                        <div>
                            <Label className="text-xs" htmlFor="code">
                                Mã hàng hoá <span className="text-red-600">*</span>
                            </Label>
                            <Input name="code" maxLength={200} required className="col-span-2 mt-1" />
                        </div>

                        <div>
                            <Label className="text-xs" htmlFor="unit1">
                                Đơn vị tính
                            </Label>
                            <Input name="unit1" maxLength={200} className="col-span-2" />
                        </div>

                        <div>
                            <Label className="text-xs" htmlFor="tax">
                                Thuế
                            </Label>
                            <Input name="tax" defaultValue={0} min={0} max={100} type='number' className="col-span-2" />
                        </div>

                        <div className="col-span-2">
                            <Label className="text-xs" htmlFor="misaCode">
                                Misa Code
                            </Label>
                            <Input name="misaCode" maxLength={200} className="col-span-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-5">
                        <div>
                            <Label className="text-xs" htmlFor="name">
                                Tên hàng hoá <span className="text-red-600">*</span>
                            </Label>
                            <Textarea rows={3} name="name" maxLength={200} required className="col-span-2" />
                        </div>

                        <div>
                            <Label className="text-xs" htmlFor="description">
                                Mô tả
                            </Label>
                            <Textarea rows={3} name="description" maxLength={200} className="col-span-2" />
                        </div>
                    </div>


                </form>
            </DialogContent>
        </Dialog>
    )

    return null
}

export default FindProduct;