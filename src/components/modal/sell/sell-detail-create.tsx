import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react'
import FindGoods from '../goods/find';
import { IGoodsResponse } from '@/types/goods';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ISellDetailInput } from '@/types/sell';

type Props = {
    saveDetail: (data: ISellDetailInput) => void
}

const SellDetail = ({ saveDetail }: Props) => {
    const [goodsSelected, setGoodsSelected] = React.useState<IGoodsResponse>();
    const [open, setOpen] = React.useState(false);

    const handleSelectGoods = (data: IGoodsResponse) => {
        setGoodsSelected(data)
    }


    const clearForm = () => {
        setGoodsSelected(undefined)
    }


    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!goodsSelected) return

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        if (data && data?.["donGia"] && data?.["soLuong"]) {
            data["thanhTien"] = `${Number(data["donGia"]) * Number(data["soLuong"])}`
        }

        const formatData: ISellDetailInput = {
            ...data,
            soLuong: Number(data["soLuong"]),
            donGia: Number(data["donGia"]),
            thanhTien: Number(data["thanhTien"]),
            daBaoGomThue: data["daBaoGomThue"] === "0" ? false : true,
            cust_maHangHoa: goodsSelected.maHangHoa,
            cust_tenHangHoa: goodsSelected.tenHang,
            thue: '0',
            ghiChu: data?.ghiChu ? [data?.ghiChu] as string[] : [],
            HangHoa: {
                connect: {
                    id: goodsSelected.id,
                }
            }
        }

        saveDetail(formatData)
        setOpen(false)
        clearForm()
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Thêm chi tiết đơn hàng</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase">Thêm chi tiết đơn hàng</DialogTitle>

                        <div className="flex gap-x-4">
                            <Button size="sm" type="submit" form="createSellDetailForm">Lưu</Button>
                            <DialogClose onClick={clearForm} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <form id="createSellDetailForm" onSubmit={onSubmit}>
                    <div>
                        <div className="text-md font-semibold">Thông tin chung</div>

                        <div className="grid grid-cols-3 gap-x-12 gap-y-10 mt-4">
                            <div>
                                <div className="flex gap-x-4">
                                    <Label>Mã hàng <span className="text-red-600">*</span></Label>
                                    <FindGoods setGoodsData={handleSelectGoods} />
                                </div>

                                <div className="text-sm text-gray-500 mt-2">{goodsSelected?.maHangHoa}</div>

                            </div>

                            <div>
                                <Label>Tên hàng <span className="text-red-600">*</span></Label>
                                <div className="text-sm text-gray-500 mt-2">{goodsSelected?.tenHang}</div>
                            </div>

                            {/* <div>
                                <Label>Nhóm hàng <span className="text-red-600">*</span></Label>
                                <div className="text-sm text-gray-500">{goodsSelected?.LoaiHang?.ten}</div>
                            </div> */}
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

export default SellDetail;