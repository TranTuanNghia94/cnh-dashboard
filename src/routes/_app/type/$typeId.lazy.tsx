import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useGetTypeById, useUpdateType } from '@/hooks/use-type'
import { IGroupOfGoodsInput } from '@/types/type'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/_app/type/$typeId')({
    component: UpdateTypePage
})


function UpdateTypePage() {
    const { toast } = useToast()
    const { typeId } = useParams({ strict: false })
    const { mutateAsync, data } = useGetTypeById()
    const {mutateAsync: update, isSuccess, data: dataSuccess} = useUpdateType()

    useEffect(() => {
        if (typeId) {
            mutateAsync(typeId)
        }
    }, [])


    useEffect(() => {
        if (isSuccess && dataSuccess) {
          toast({
            title: 'Thao tác thành công',
            description: 'Cập nhật thành công',
            variant: 'success',
          })
        }
      }, [isSuccess, dataSuccess])

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

        typeData.id = data?.results ? data.results[0].id : ''

        await update(typeData)
    }

    return (
        <div>
            <HeaderPageLayout idForm="updateTypeForm" title="Thêm nhóm hàng hoá" />

            <div>
                <Card className="mt-4">
                    <CardContent>
                        <form id="updateTypeForm" onSubmit={onSubmit} className="grid my-20 grid-cols-2 gap-x-20 gap-y-10">
                            <div>
                                <Label className="text-xs" htmlFor="ten">
                                    Tên nhóm hàng <span className="text-red-600">*</span>
                                </Label>
                                <Input name="ten" defaultValue={data?.results ? data.results[0]?.ten : ""} maxLength={200} required className="col-span-2" />
                            </div>

                            <div>
                                <Label className="text-xs" htmlFor="donViTinh">
                                    Đơn vị tính
                                </Label>
                                <Input name="donViTinh" defaultValue={data?.results ? data.results[0]?.donViTinh : ""} maxLength={200} required className="col-span-2" />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}