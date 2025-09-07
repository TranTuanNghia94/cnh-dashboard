import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useGetGoodsByCode, useUpdateGoods } from '@/hooks/use-product'
import { useToast } from '@/hooks/use-toast'
import { useGetTypes } from '@/hooks/use-type'
import { IGoodsInput } from '@/types/goods'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/_app/goods/$goodsId')({
    component: UpdateGoodsPage
})

function UpdateGoodsPage() {
    const { toast } = useToast()
    const { goodsId } = useParams({ strict: false })

    const { mutateAsync: getGoods, data: goods } = useGetGoodsByCode()
    const { mutateAsync: update, isSuccess, data } = useUpdateGoods()
    const { mutateAsync: getTypes, data: types } = useGetTypes()


    useEffect(() => {
        if (!types?.results) {
            getTypes({})
        }

        if (goodsId) {
            getGoods(goodsId)
        }
    }, [])

    useEffect(() => {
        if (data && isSuccess) {
            toast({
                title: 'Thao tác thành công',
                description: 'Cập nhật thành công',
                variant: 'success',
            })
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
        goodsData.id = goods?.results ? goods?.results[0]?.id : ''
        await update(goodsData)
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

                                <Select required name="id" defaultValue={goods?.results ? goods?.results[0]?.LoaiHang?.id : ''}>
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
                                <Input defaultValue={goods?.results ? goods?.results[0]?.maHangHoa : ''} name="maHangHoa" maxLength={200} required className="col-span-2" />
                            </div>

                            <div>
                                <Label className="text-xs" htmlFor="tenHang">
                                    Tên hàng hoá
                                </Label>
                                <Textarea defaultValue={goods?.results ? goods?.results[0]?.tenHang : ''} rows={4} name="tenHang" maxLength={200} required className="col-span-2" />
                            </div>

                            <div>
                                <Label className="text-xs" htmlFor="donViTinh">
                                    Đơn vị tính
                                </Label>
                                <Input defaultValue={goods?.results ? goods?.results[0]?.donViTinh : ''} name="donViTinh" maxLength={200} className="col-span-2" />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}