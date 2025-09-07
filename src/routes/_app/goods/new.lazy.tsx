import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateProduct } from '@/hooks/use-product'
import { useToast } from '@/hooks/use-toast'
import { useGetCategories } from '@/hooks/use-category'
import { ICategoryResponse } from '@/types/category'
import { ICreateProductRequest } from '@/types/product'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/_app/goods/new')({
    component: CreateGoodsPage
})


function CreateGoodsPage() {
    const { toast } = useToast()
    const { history } = useRouter()
    const { mutateAsync, isSuccess, data } = useCreateProduct()
    const { mutateAsync: getCategories, data: categories } = useGetCategories()


    useEffect(() => {
        if (!categories?.data?.data) {
            getCategories()
        }
    }, [categories?.data?.data])

    useEffect(() => {
        if (data && isSuccess) {
            toast({
                title: 'Thao tác thành công',
                description: 'Tạo hàng hoá thành công',
                variant: 'success',
            })

            history.go(-1)
        }
    }, [isSuccess, data])


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fields = [
            'categoryId',
            'code',
            'name',
            'unit1',
            'tax',
            'misaCode'
        ]

        const formData = new FormData(e.currentTarget)
        const productData = fields.reduce(
            (acc, field) => {
                acc[field] = formData.get(field)?.toString().trim() as string
                return acc
            },
            {} as Record<string, string>,
        ) as unknown as ICreateProductRequest

        await mutateAsync(productData)
    }

    return (
        <div>
            <HeaderPageLayout idForm="createGoodsForm" title="Thêm hàng hoá" />

            <div>
                <Card className="mt-4">
                    <CardContent>
                        <form id="createGoodsForm" onSubmit={onSubmit} className="grid my-20 grid-cols-2 gap-x-20 gap-y-10">
                            <div className="grid grid-cols-2 gap-x-10 gap-y-10">
                                <div>
                                    <Label className="text-xs" htmlFor="id">
                                        Nhóm hàng hoá <span className="text-red-600">*</span>
                                    </Label>

                                    <Select required name="categoryId">
                                        <SelectTrigger id="types">
                                            <SelectValue placeholder={'Nhóm hàng hoá'} />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            {categories?.data?.data && categories?.data?.data.map((val: ICategoryResponse) => (
                                                <SelectItem key={val.id} value={val.id}>{val.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                    <Input name="tax" type='number' className="col-span-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-5">
                                <div>
                                    <Label className="text-xs" htmlFor="name">
                                        Tên hàng hoá
                                    </Label>
                                    <Textarea rows={2} name="name" maxLength={200} required className="col-span-2" />
                                </div>

                                <div>
                                    <Label className="text-xs" htmlFor="misaCode">
                                        Misa Code
                                    </Label>
                                    <Input name="misaCode" maxLength={200} className="col-span-2" />
                                </div>
                            </div>


                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}