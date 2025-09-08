import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useGetProductById, useUpdateProduct } from '@/hooks/use-product'
import { useToast } from '@/hooks/use-toast'
import { useGetCategories } from '@/hooks/use-category'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ICategoryResponse } from '@/types/category'
import { IUpdateProductRequest } from '@/types/product'

export const Route = createLazyFileRoute('/_app/goods/$goodsId')({
    component: UpdateGoodsPage
})

function UpdateGoodsPage() {
    const { toast } = useToast()
    const { goodsId } = useParams({ strict: false })

    const { mutateAsync: getProduct, data: product } = useGetProductById()
    const { mutateAsync: update, isSuccess, data } = useUpdateProduct()
    const { mutateAsync: getCategories, data: categories } = useGetCategories()
    const [categoryId, setCategoryId] = useState<string>("")


    useEffect(() => {
        if (!categories?.data?.data) {
            getCategories()
        }

        if (goodsId) {
            getProduct(goodsId)
        }
    }, [categories?.data?.data, getCategories, goodsId, getProduct])

    useEffect(() => {
        if (data && isSuccess) {
            toast({
                title: 'Thao tác thành công',
                description: 'Cập nhật thành công',
                variant: 'success',
            })
        }
    }, [isSuccess, data, toast])

    useEffect(() => {
        if (product?.data?.categoryId) {
            setCategoryId(product.data.categoryId)
        }
    }, [product?.data?.categoryId])


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)

        const productData: IUpdateProductRequest = {
            id: product?.data?.id as string,
            name: formData.get('name')?.toString().trim() as string,
            code: formData.get('code')?.toString().trim() as string,
            unit1: formData.get('unit1')?.toString().trim() as string,
            tax: Number(formData.get('tax')?.toString().trim() as string),
            description: formData.get('description')?.toString().trim() as string,
            misaCode: formData.get('misaCode')?.toString().trim() as string,
            categoryId: formData.get('categoryId')?.toString().trim() as string,
            isActive: true,
        }

        await update(productData)
    }

    return (
        <div>
            <HeaderPageLayout idForm="updateGoodsForm" title="Chỉnh sửa hàng hoá" />

            <div>
                <Card className="mt-4">
                    <CardContent>
                        <form id="updateGoodsForm" onSubmit={onSubmit} className="grid my-20 grid-cols-2 gap-x-20 gap-y-10">
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
                                    <Input name="code" maxLength={200} required className="col-span-2 mt-1" defaultValue={product?.data?.code} />
                                </div>

                                <div>
                                    <Label className="text-xs" htmlFor="unit1">
                                        Đơn vị tính
                                    </Label>
                                    <Input name="unit1" maxLength={200} className="col-span-2" defaultValue={product?.data?.unit1} />
                                </div>

                                <div>
                                    <Label className="text-xs" htmlFor="tax">
                                        Thuế
                                    </Label>
                                    <Input name="tax" min={0} max={100} type='number' className="col-span-2" defaultValue={(product?.data?.tax)} />
                                </div>

                                <div className="col-span-2">
                                    <Label className="text-xs" htmlFor="misaCode">
                                        Misa Code
                                    </Label>
                                    <Input name="misaCode" maxLength={200} className="col-span-2" defaultValue={product?.data?.misaCode} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-5">
                                <div>
                                    <Label className="text-xs" htmlFor="name">
                                        Tên hàng hoá <span className="text-red-600">*</span>
                                    </Label>
                                    <Textarea rows={3} name="name" maxLength={200} required className="col-span-2" defaultValue={product?.data?.name} />
                                </div>

                                <div>
                                    <Label className="text-xs" htmlFor="description">
                                        Mô tả
                                    </Label>
                                    <Textarea rows={3} name="description" maxLength={200} className="col-span-2" defaultValue={product?.data?.description} />
                                </div>
                            </div>


                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}