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
import { useDeleteSellDetail, useGetSellByOrderCode, useUpdateSell, useUpdateSellDetail } from '@/hooks/use-sell'
import { useToast } from '@/hooks/use-toast'
import { ICustomerAddressResponse, ICustomerResponse } from '@/types/customer'
import { ISellDetailInput, ISellInput } from '@/types/sell'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import moment from 'moment'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_app/sell/$sellId')({
    component: UpdateSellPage
})

function UpdateSellPage() {
    const { sellId } = useParams({ strict: false })
    const { toast } = useToast()
    const { mutateAsync: getSell, data: sellData, isSuccess: getSuccess } = useGetSellByOrderCode()
    const { mutateAsync, isSuccess, data } = useUpdateSell()
    const { mutateAsync: updateDetail } = useUpdateSellDetail()
    const { mutateAsync: deleteDetail } = useDeleteSellDetail()

    const [listDetail, setListDetail] = useState<ISellDetailInput[]>([])
    const [customer, setCustomer] = useState<ICustomerResponse | undefined>(undefined)
    const [address, setAddress] = useState<ICustomerAddressResponse | undefined>(undefined)
    const [sell, setSell] = useState<ISellInput | undefined>(undefined)

    useEffect(() => {
        getSell(sellId as string)
    }, [])

    useEffect(() => {
        if (isSuccess && data) {
            toast({
                title: 'Thao tác thành công',
                description: 'Cập nhật đơn hàng thành công',
                variant: 'success',
            })
        }
    }, [isSuccess, data])


    useEffect(() => {
        if (getSuccess && sellData.results) {
            setCustomer(sellData.results[0].KhachHang)
            setAddress(sellData.results[0].LienHeGiaoHang)
            setSell({
                id: sellData.results[0].id,
                soHopDong: sellData.results[0]?.soHopDong,
                ngayHoanThanh: sellData.results[0]?.ngayHoanThanh,
                hanThanhToan: sellData.results[0]?.hanThanhToan,
                ngayTao: sellData.results[0]?.ngayTao,
                orderNumber: sellData.results[0]?.orderNumber,
                ghiChu: sellData.results[0]?.ghiChu
            })
            if (sellData.results[0].ChiTietDonHang_s) {
                const listDetail = sellData.results[0].ChiTietDonHang_s.map((item) => {
                    return {
                        id: item.id,
                        soLuong: item?.soLuong,
                        donGia: item?.donGia,
                        thanhTien: item?.thanhTien,

                        thue: item?.thue,
                        donViTinh: item?.donViTinh,
                        giaoVien: item?.giaoVien,
                        dept_room: item?.dept_room,
                        ghiChu: item?.ghiChu,
                        createdAt: item?.createdAt,
                        updatedAt: null,
                        deletedAt: null,
                        cust_maHangHoa: item?.cust_maHangHoa ?? item.HangHoa?.maHangHoa,
                        cust_tenHangHoa: item?.cust_tenHangHoa ?? item.HangHoa?.tenHang,
                        cust_vendorCode: item?.cust_vendorCode,

                    } as ISellDetailInput
                })

                setListDetail(listDetail)
            }
        }
    }, [getSuccess, sellData])

    const handleSelectCustomer = (data: ICustomerResponse) => {
        setCustomer(data)
    }

    const handleSelectAddress = (data: ICustomerAddressResponse) => {
        setAddress(data)
    }

    const handleAddDetail = (data: ISellDetailInput) => {
        setListDetail([...listDetail, {
            ...data,
            id: "",
            donGia: data.donGia.toString(),
            soLuong: data.soLuong.toString(),
            thanhTien: data.thanhTien.toString(),
            ghiChu: data.ghiChu ?? [],
        }])
    }

    const handleDeleteDetail = (index: number) => {
        const item = listDetail[index]

        if (item.id) {
            item.deletedAt = moment().toISOString()
            item.updatedAt = moment().toISOString()

            setListDetail([...listDetail])
        } else {
            const newList = [...listDetail]
            newList.splice(index, 1)
            setListDetail(newList)
        }

    }

    const handleUpdateDetail = (index: number, data: ISellDetailInput) => {
        const newList = [...listDetail]
        newList[index] = {
            ...newList[index],
            ...data,
            updatedAt: moment().toISOString()
        }
        setListDetail(newList)
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault()
        if (e.target.value) {
            setSell({
                ...sell,
                [e.target.name]: e.target.value as string
            })
        }

    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!customer || !address) {
            toast({
                title: 'Thao tác khóa',
                description: 'Vui lòng chọn khách hàng và điểm giao hàng',
                variant: 'destructive',
            })
        }

        const listCreate = listDetail.filter((item) => {
            return !item.id
        })


        listDetail.forEach((item) => {
            if (item.id !== "" && item.updatedAt && item.deletedAt === null) {
                updateDetail(item)
            } else if (item.id !== "" && item.deletedAt !== null) {
                deleteDetail(item.id as string)
            }
        })


        if (sell) {
            sell.ChiTietDonHang_s = {
                create: listCreate
            }
        }


        mutateAsync(sell)
    }

    return (
        <div >
            <HeaderPageLayout idForm="updateSellForm" title="Chỉnh sửa đơn bán hàng" />

            <div className="grid grid-cols-4 gap-x-4">
                <div>
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Thông tin đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form id="updateSellForm" onSubmit={onSubmit}>
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
                                    <Input onChange={handleOnChange} value={sell?.soHopDong ?? ""} name="soHopDong" maxLength={200} required className="col-span-2" />
                                </div>

                                <div className="my-3">
                                    <Label className="text-xs" htmlFor="maHangHoa">
                                        Ngày hợp đồng <span className="text-red-600">*</span>
                                    </Label>
                                    <Input onChange={handleOnChange} value={sell?.ngayTao ? moment(sell?.ngayTao?.toString()).format('YYYY-MM-DD') : ""} name="ngayTao" type="date" maxLength={200} required className="col-span-2" />
                                </div>

                                <div className="my-3">
                                    <Label className="text-xs" htmlFor="hanThanhToan">
                                        Deadline <span className="text-red-600">*</span>
                                    </Label>
                                    <Input onChange={handleOnChange} value={sell?.hanThanhToan ? moment(sell?.hanThanhToan?.toString()).format('YYYY-MM-DD') : ""} name="hanThanhToan" type="date" className="col-span-2" />
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
                                    <Textarea onChange={handleOnChange} name="ghiChu" maxLength={200} required className="col-span-2" />
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
                                    wrapperClassName='h-[calc(92vh-175px)] max-h-[calc(92vh-175px)]'
                                    columns={SellDetailColumns} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}