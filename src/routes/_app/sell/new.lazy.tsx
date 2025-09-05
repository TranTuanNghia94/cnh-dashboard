import HeaderPageLayout from '@/components/layout/HeaderPage'
import FindAddress from '@/components/modal/address/find'
import FindCustomer from '@/components/modal/customer/find'
import SellDetail from '@/components/modal/sell/sell-detail-create'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { SellDetailColumns } from '@/components/table/sell/columns-sell-detail'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateSell } from '@/hooks/use-sell'
import { useToast } from '@/hooks/use-toast'
import { ICustomerAddressResponse, ICustomerResponse } from '@/types/customer'
import { ISellDetailInput, ISellInput } from '@/types/sell'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import moment from 'moment'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_app/sell/new')({
    component: NewSellPage
})


function NewSellPage() {
    const { toast } = useToast()
    const { history } = useRouter()
    const { mutateAsync, isSuccess, data } = useCreateSell()

    const [listDetail, setListDetail] = useState<ISellDetailInput[]>([])
    const [customer, setCustomer] = useState<ICustomerResponse | undefined>(undefined)
    const [address, setAddress] = useState<ICustomerAddressResponse | undefined>(undefined)

    useEffect(() => {
        if (isSuccess && data) {
            toast({
                title: 'Thao tác thành công',
                description: 'Tạo đơn hàng thành công',
                variant: 'success',
            })

            history.go(-1)
        }
    }, [isSuccess, data])


    const handleSelectCustomer = (data: ICustomerResponse) => {
        setCustomer(data)
    }

    const handleSelectAddress = (data: ICustomerAddressResponse) => {
        setAddress(data)
    }

    const handleAddDetail = (data: ISellDetailInput) => {
        setListDetail([...listDetail, {
            ...data,
            donGia: data.donGia.toString(),
            soLuong: data.soLuong.toString(),
            thanhTien: data.thanhTien.toString(),
            ghiChu: data.ghiChu ?? [],
        }])
    }

    const handleDeleteDetail = (index: number) => {
        const newList = [...listDetail]
        newList.splice(index, 1)
        setListDetail(newList)
    }

    const handleUpdateDetail = (index: number, data: ISellDetailInput) => {
        const newList = [...listDetail]
        newList[index] = data
        setListDetail(newList)
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!customer || !address) {
            toast({
                title: 'Thao tác không hợp lệ',
                description: 'Vui lòng chọn khách hàng và điểm giao hàng',
                variant: 'warning',
            })
        }

        const formData = new FormData(e.currentTarget)

        const total = listDetail.reduce((acc, item) => {
            acc += item.soLuong * item.donGia
            return acc
        }, 0)

        const sellData: ISellInput = {
            orderNumber: moment().format('YYYYMMDDHHmmss'),
            soHopDong: formData.get('soHopDong')?.toString().trim() as string,
            ngayTao: formData.get('ngayTao')?.toString().trim() as string,
            hanThanhToan: formData.get('hanThanhToan')?.toString().trim() as string,
            ghiChu: formData.get('ghiChu')?.toString().trim() as string ? [formData.get('ghiChu')?.toString().trim() as string] : [],
            thanhTien: total.toString(),
            thanhTienTruocThue: total.toString(),
            LienHeGiaoHang: {
                connect: {
                    id: address?.id
                }
            },
            KhachHang: {
                connect: {
                    id: customer?.id
                }
            },
            ChiTietDonHang_s: {
                create: listDetail
            }
        }

        mutateAsync(sellData)
    }

    return (
        <div >
            <HeaderPageLayout idForm="createSellForm" title="Thêm đơn bán hàng" />

            <div className="grid grid-cols-4 gap-x-4">
                <div>
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Thông tin đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form id="createSellForm" onSubmit={onSubmit}>
                                <div className="my-3">
                                    <div className="flex justify-between">
                                        <Label className="text-xs" htmlFor="maKhachHang">
                                            Khách hàng <span className="text-red-600">*</span>
                                        </Label>
                                        <FindCustomer setCustomerData={handleSelectCustomer} />
                                    </div>

                                    <Badge variant="outline">{customer?.maKhachHang}</Badge>

                                </div>

                                <div>
                                    <Label className="text-xs" htmlFor="soHopDong">
                                        Số hợp đồng <span className="text-red-600">*</span>
                                    </Label>
                                    <Input name="soHopDong" maxLength={200} required className="col-span-2" />
                                </div>

                                <div className="my-3">
                                    <Label className="text-xs" htmlFor="maHangHoa">
                                        Ngày hợp đồng <span className="text-red-600">*</span>
                                    </Label>
                                    <Input name="ngayTao" type="date" maxLength={200} required className="col-span-2" />
                                </div>

                                <div className="my-3">
                                    <Label className="text-xs" htmlFor="hanThanhToan">
                                        Deadline <span className="text-red-600">*</span>
                                    </Label>
                                    <Input name="hanThanhToan" type="date" className="col-span-2" />
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Thông tin giao hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form>
                                <div>
                                    <div className="flex justify-between">
                                        <Label className="text-xs" htmlFor="maHangHoa">
                                            Người liên hệ <span className="text-red-600">*</span>
                                        </Label>
                                        <FindAddress dataAddress={customer?.LienHe_s as ICustomerAddressResponse[] || []} setAddressData={handleSelectAddress} />
                                    </div>

                                    <Badge variant="outline">{address?.tenNguoiLienHe}</Badge>
                                </div>

                                <div className="my-2">
                                    <Label className="text-xs" htmlFor="maHangHoa">
                                        SDT <span className="text-red-600">*</span>
                                    </Label>
                                    <div>
                                        <Badge variant="outline">{address?.soDienThoai}</Badge>
                                    </div>
                                </div>

                                <div className="my-2">
                                    <Label className="text-xs" htmlFor="maHangHoa">
                                        Địa chỉ <span className="text-red-600">*</span>
                                    </Label>
                                    <div>
                                        <Badge variant="outline">{address?.soNhaTenDuong_1}</Badge>
                                    </div>
                                </div>

                                <div className="my-2">
                                    <Label className="text-xs" htmlFor="maHangHoa">
                                        Ghi chú <span className="text-red-600">*</span>
                                    </Label>
                                    <Textarea name="ghiChu" maxLength={200} required className="col-span-2" />
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-3">
                    <Card className="mt-4">
                        <CardContent>
                            <div className="mt-4">
                                <DataTableDetail
                                    listTools={<SellDetail saveDetail={handleAddDetail} />}
                                    data={listDetail.map((item, index) => ({
                                        ...item,
                                        deleteRow: () => handleDeleteDetail(index),
                                        updateRow: (val: ISellDetailInput) => handleUpdateDetail(index, val)
                                    }))}
                                    columns={SellDetailColumns} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}