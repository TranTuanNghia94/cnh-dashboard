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
    data: ISellDetailInput;
}

const SellDetailUpdate = ({ saveDetail, data }: Props) => {
    const [goodsSelected, setGoodsSelected] = React.useState<IGoodsResponse | undefined>({
        maHangHoa: data.cust_maHangHoa as string,
        tenHang: data.cust_tenHangHoa as string,
        id: data.HangHoa?.connect?.id as string
    });
    const [open, setOpen] = React.useState(false);

    const [formValues, setFormValues] = React.useState<ISellDetailInput>({
        soLuong: data?.soLuong,
        donViTinh: data?.donViTinh,
        daBaoGomThue: data?.daBaoGomThue,
        donGia: data?.donGia,
        thanhTien: data?.thanhTien,
        giaoVien: data?.giaoVien,
        dept_room: data?.dept_room,
        ghiChu: data?.ghiChu as string[],
        cust_vendorCode: data.cust_vendorCode as string,
    });


    const handleSelectGoods = (data: IGoodsResponse) => {
        setGoodsSelected(data)
    }


    const clearForm = () => {
        setGoodsSelected(undefined)
    }


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()

        setFormValues((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!goodsSelected) return

        const formatData: ISellDetailInput = {
            ...formValues,
            donGia: Number(formValues.donGia),
            soLuong: Number(formValues.soLuong),
            thanhTien: Number(formValues.donGia) * Number(formValues.soLuong),
            cust_maHangHoa: goodsSelected.maHangHoa,
            cust_tenHangHoa: goodsSelected.tenHang,
            HangHoa: {
                connect: {
                    id: goodsSelected.id
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
                <div className="relative flex cursor-default select-none hover:bg-gray-100 items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-blue-600">
                    Cập nhật
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase">Cập nhật chi tiết đơn hàng</DialogTitle>

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
                                <Label>Mã hàng <span className="text-red-600">*</span></Label>
                                <FindGoods setGoodsData={handleSelectGoods} />

                                <div className="text-sm text-gray-500">{goodsSelected?.maHangHoa}</div>

                            </div>

                            <div>
                                <Label>Tên hàng <span className="text-red-600">*</span></Label>
                                <div className="text-sm text-gray-500">{goodsSelected?.tenHang}</div>
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
                                <Input onChange={handleChange} value={formValues.cust_vendorCode as string} required name="cust_vendorCode" />
                            </div>

                            <div>
                                <Label htmlFor="soLuong">Số lượng <span className="text-red-600">*</span></Label>
                                <Input onChange={handleChange} value={formValues?.soLuong} required name="soLuong" min={0} max={1000000} maxLength={7} type="number" />
                            </div>

                            <div>
                                <Label htmlFor="donViTinh">Đơn vị tính <span className="text-red-600">*</span></Label>
                                <Input onChange={handleChange} value={formValues?.donViTinh as string} required name="donViTinh" maxLength={50} />
                            </div>

                            <div>
                                <Label htmlFor="daBaoGomThue">Thuế <span className="text-red-600">*</span></Label>
                                <Select value={formValues?.daBaoGomThue ? "1" : "0"} required name="daBaoGomThue">
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
                                <Input onChange={handleChange} value={formValues?.donGia} required maxLength={100} name="donGia" />
                            </div>

                        </div>
                    </div>

                    <Separator className="bg-primary my-6" />

                    <div>
                        <div className="grid grid-cols-3 gap-x-12 my-4">
                            <div>
                                <Label htmlFor="giaoVien">Giáo viên</Label>
                                <Input onChange={handleChange} value={formValues?.giaoVien as string} name="giaoVien" maxLength={300} />
                            </div>

                            <div>
                                <Label htmlFor="dept_room">Phòng</Label>
                                <Input onChange={handleChange} value={formValues?.dept_room as string} name="dept_room" maxLength={300} />
                            </div>

                            <div>
                                <Label htmlFor="ghiChu">Ghi chú</Label>
                                <Input onChange={handleChange} value={(formValues?.ghiChu as string[])[0]} name="ghiChu" maxLength={500} />
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default SellDetailUpdate;