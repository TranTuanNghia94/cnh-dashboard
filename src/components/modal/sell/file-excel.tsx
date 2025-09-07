import { DataTableDetail } from '@/components/table/data-table-detail';
import { ModalValidateGoodsColumns } from '@/components/table/product/validate-goods';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateManyGoods, useValidateGoods } from '@/hooks/use-product';
import { useCreateManySells, useGetSellIndex } from '@/hooks/use-sell';
import { toast } from '@/hooks/use-toast';
import { MAX_PAYLOAD_ORDER_SIZE, MAX_PAYLOAD_SIZE } from '@/lib/constants';
import { convertStringDate, isValidISBN } from '@/lib/other';
import { IGoodsInput, IGoodsValidate } from '@/types/goods';
import { Prisma } from '@/types/schema';
import { ISellFileExcel, ISellInput } from '@/types/sell';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react'

type Props = {
    data: ISellFileExcel[]
}

const SellFileExcel = ({ data }: Props) => {
    const navigate = useNavigate()

    const { mutateAsync: validateGoods } = useValidateGoods()
    const { mutateAsync: createManyGoods } = useCreateManyGoods()
    const { mutateAsync: getIndex } = useGetSellIndex()
    const { mutateAsync: createManySells } = useCreateManySells()

    const [open, setOpen] = useState(false);
    const [listGoods, setListGoods] = useState<IGoodsValidate[]>();


    useEffect(() => {
        if (open) {
            handleValidateGoods()
        }
    }, [open])


    const createOrderLine = (item: ISellFileExcel) => {
        const maHangCustomer = item['MA HANG CUSTOMER']?.toString()?.trim()?.toUpperCase();
        const vendor = item['VENDOR']?.toString()?.trim();

        return {
            cust_maHangHoa: maHangCustomer,
            cust_tenHangHoa: item['TEN HANG'],
            cust_vendorCode: vendor,
            cust_vendorName: vendor,
            soLuong: item['SL BAN'],
            donGia: item['DON GIA BAN'],
            donViTinh: item['DON VI TINH 1'],
            ngoaiTe: 'VND',
            thanhTien: item['THANH TIEN'] ?? Number(item['SL BAN']) * Number(item['DON GIA BAN']),
            giaoVien: item['GIAO VIEN']?.toString() || null,
            dept_room: item['DEPT']?.toString() || null,
            daBaoGomThue: item['DA GOM THUE (Y/N) BAN'] === 'Y',
            thue: item['THUE SUAT BAN'] ?? 0,
            HangHoa: {
                connect: { maHangHoa: maHangCustomer }
            },
            ref: item['REF #']?.toString()?.trim(),
            ghiChu: item['GHI CHU CHI TIET'] ? [item['GHI CHU CHI TIET']] : []
        };
    };

    const createOrder = (soHopDong: string, item: ISellFileExcel, orderNumber: string) => {
        return {
            orderNumber,
            KhachHang: {
                connect: {
                    maKhachHang: item['MA KHACH HANG']?.toString()?.trim()
                }
            },
            soHopDong: soHopDong.toString()?.trim(),
            ngayTao: convertStringDate(item['NGAY PO']?.toString().replace(/'/g, '')),
            hanThanhToan: convertStringDate(item['DEADLINE']?.toString().replace(/'/g, '')),
            ChiTietDonHang_s: {
                createMany: {
                    data: [createOrderLine(item)],
                    skipDuplicates: true
                }
            }
        };
    };

    const handleMapper = async (data: ISellFileExcel[]) => {
        if (!data?.length) return [];

        const { results } = await getIndex();
        const [prefix, counter] = (results?.[0] || '0').split('.');
        let orderCounter = parseInt(counter);

        const mapperData = new Map<string, ISellInput>();

        data.forEach(item => {
            const soHopDong = item['SO HOP DONG']?.toString()?.trim();
            const orderLine = createOrderLine(item);

            if (mapperData.has(soHopDong)) {
                const existingOrder = mapperData.get(soHopDong)!;
                const details = existingOrder.ChiTietDonHang_s?.createMany?.data as unknown as Prisma.DonHangChiTietCreateManyDonHangInput[] || [];
                existingOrder.ChiTietDonHang_s = {
                    createMany: {
                        data: [...details, orderLine],
                        skipDuplicates: true
                    }
                };
            } else {
                const orderNumber = `${prefix}.${String(orderCounter++).padStart(3, '0')}`;
                mapperData.set(soHopDong, createOrder(soHopDong, item, orderNumber));
            }
        });

        return Array.from(mapperData.values());
    };

    const handleValidateGoods = async () => {
        if (!data || data.length === 0) {
            return
        }

        const goodsObj = data.reduce((acc: { [key: string]: unknown }, item: unknown) => {
            const i = item as ISellFileExcel;
            const key = i['DEPT'] ? i['MA HANG CUSTOMER'] + '-' + i['DEPT'] : i['MA HANG CUSTOMER'];

            acc[key] = {
                maHangHoa: i['MA HANG CUSTOMER']?.toString()?.trim()?.toUpperCase() || '',
                tenHangHoa: i['TEN HANG']?.trim() || '',
                donViTinh: i['DON VI TINH 1']?.trim() || '',
                soHopDong: i['SO HOP DONG']?.toString()?.trim()?.toUpperCase() || '',
            };
            return acc;
        }, {});

        const array = Object.values(goodsObj);

        const chunks = Array(Math.ceil(array.length / MAX_PAYLOAD_SIZE)).fill('').map((_, index) => {
            return array.slice(index * MAX_PAYLOAD_SIZE, (index + 1) * MAX_PAYLOAD_SIZE);
        })


        const mess = (await Promise.all(chunks.map(chunk => validateGoods(chunk as unknown as IGoodsValidate[]))))
            .flatMap(({ results }) => results || []);

        console.log("log mess:", mess)
        setListGoods(mess);
    }

    const handleCreateGoods = async () => {
        const listInputGoods: IGoodsInput[] = listGoods?.map(item => {
            return {
                tenHang: item?.tenHangHoa?.trim() || '',
                maHangHoa: item?.maHangHoa?.trim()?.toUpperCase() || '',
                donViTinh: item?.donViTinh?.trim() || '',
                id_Category: item?.loaiHang || isValidISBN(item?.maHangHoa?.trim() as string) ? 'Sách' : 'Thiết bị',
            }
        }) || [];

        const chunks = Array.from({ length: Math.ceil(listInputGoods.length / MAX_PAYLOAD_SIZE) }, (_, index) =>
            listInputGoods.slice(index * MAX_PAYLOAD_SIZE, (index + 1) * MAX_PAYLOAD_SIZE)
        );

        const statusNumber = (await Promise.all(chunks.map(chunk => createManyGoods(chunk))))
            .flatMap(({ status }) => status || []);

        console.log("log statusNumber:", statusNumber)
    }

    const handleCreateSell = async () => {
        const payload = await handleMapper(data)

        const chunks = Array.from({ length: Math.ceil(payload.length / MAX_PAYLOAD_ORDER_SIZE) }, (_, index) =>
            payload.slice(index * MAX_PAYLOAD_ORDER_SIZE, (index + 1) * MAX_PAYLOAD_ORDER_SIZE)
        );

        (await Promise.all(chunks.map(chunk => createManySells(chunk))))
            .flatMap(({ status }) => status || []);

        toast({
            title: "Thành công",
            description: "Đơn hàng đã được tạo thành công",
            variant: "success"
        })

        navigate({ to: "/sell" })
    }

    const handleSave = () => {
        if (listGoods) {
            handleCreateGoods()
        }

        handleCreateSell()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm" >
                    Lưu
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase">Cập nhật chi tiết đơn hàng</DialogTitle>

                        <div className="flex gap-x-4">
                            <Button size="sm" type="button" onClick={handleSave} disabled={listGoods?.some(item => item.ghiChu?.includes('Số hợp đồng đã tồn tại, vui lòng kiểm tra lại'))}>Lưu</Button>
                            <DialogClose className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>

                <div>
                    <DataTableDetail noDataText={listGoods?.length === 0 ? "Dữ liệu đã hợp lệ" : null} wrapperClassName="h-[calc(82vh-180px)] max-h-[calc(82vh-180px)]" data={listGoods || []} columns={ModalValidateGoodsColumns} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SellFileExcel