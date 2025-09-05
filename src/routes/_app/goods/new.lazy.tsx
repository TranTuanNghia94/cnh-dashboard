import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateGoods } from '@/hooks/use-goods'
import { useToast } from '@/hooks/use-toast'
import { useGetTypes } from '@/hooks/use-type'
import { IGoodsInput } from '@/types/goods'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/_app/goods/new')({
    component: CreateGoodsPage
})


function CreateGoodsPage() {
    const { toast } = useToast()
    const { history } = useRouter()
    const { mutateAsync, isSuccess, data } = useCreateGoods()
    const { mutateAsync: getTypes, data: types } = useGetTypes()


    useEffect(() => {
        if (!types?.results) {
            getTypes({})
        }
    }, [types?.results])

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
            'id',
            'maHangHoa',
            'tenHang',
            'donViTinh'
        ]

        const formData = new FormData(e.currentTarget)
        const goodsData = fields.reduce(
            (acc, field) => {
                acc[field] = formData.get(field)?.toString().trim() as string
                return acc
            },
            {} as Record<string, string>,
        ) as unknown as IGoodsInput

        goodsData.LoaiHang = {
            connect: {
                id: goodsData.id
            }
        }

        delete goodsData.id
        await mutateAsync(goodsData)
    }

    return (
        <div>
            <HeaderPageLayout idForm="createGoodsForm" title="Thêm hàng hoá" />

            <div>
                <Card className="mt-4">
                    <CardContent>
                        <form id="createGoodsForm" onSubmit={onSubmit} className="grid my-20 grid-cols-2 gap-x-20 gap-y-10">
                            <div>
                                <Label className="text-xs" htmlFor="id">
                                    Nhóm hàng hoá <span className="text-red-600">*</span>
                                </Label>

                                <Select required name="id">
                                    <SelectTrigger id="types">
                                        <SelectValue placeholder={'Nhóm hàng hoá'} />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        {types?.results && types?.results.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>{type.ten}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-xs" htmlFor="maHangHoa">
                                    Mã hàng hoá <span className="text-red-600">*</span>
                                </Label>
                                <Input name="maHangHoa" maxLength={200} required className="col-span-2" />
                            </div>

                            <div>
                                <Label className="text-xs" htmlFor="tenHang">
                                    Tên hàng hoá
                                </Label>
                                <Textarea rows={4} name="tenHang" maxLength={200} required className="col-span-2" />
                            </div>

                            <div>
                                <Label className="text-xs" htmlFor="donViTinh">
                                    Đơn vị tính
                                </Label>
                                <Input name="donViTinh" maxLength={200} className="col-span-2" />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}