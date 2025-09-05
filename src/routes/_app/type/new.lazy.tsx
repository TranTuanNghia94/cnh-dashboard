import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useCreateType } from '@/hooks/use-type'
import { IGroupOfGoodsInput } from '@/types/type'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/_app/type/new')({
    component: NewTypePage
})


function NewTypePage() {
    const { toast } = useToast()
    const { history } = useRouter()
    const { mutateAsync, isSuccess, data } = useCreateType()

    useEffect(() => {
        if (data && isSuccess) {
            toast({
                title: 'Thao tác thành công',
                description: 'Tạo nhóm hàng thành công',
                variant: 'success',
            })

            history.back()
        }
    }, [isSuccess, data])


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fields = [
            'ten',
            'donViTinh',
        ]

        const formData = new FormData(e.currentTarget)
        const typeData = fields.reduce(
            (acc, field) => {
                acc[field] = formData.get(field)?.toString().trim() as string
                return acc
            },
            {} as Record<string, string>,
        ) as unknown as IGroupOfGoodsInput

        await mutateAsync(typeData)
    }

    return (
        <div>
            <HeaderPageLayout idForm="createTypeForm" title="Thêm nhóm hàng hoá" />

            <div>
                <Card className="mt-4">
                    <CardContent>
                        <form id="createTypeForm" onSubmit={onSubmit} className="grid my-20 grid-cols-2 gap-x-20 gap-y-10">
                            <div>
                                <Label className="text-xs" htmlFor="ten">
                                    Tên nhóm hàng <span className="text-red-600">*</span>
                                </Label>
                                <Input name="ten" maxLength={200} required className="col-span-2" />
                            </div>

                            <div>
                                <Label className="text-xs" htmlFor="donViTinh">
                                    Đơn vị tính
                                </Label>
                                <Input name="donViTinh" maxLength={200} required className="col-span-2" />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}