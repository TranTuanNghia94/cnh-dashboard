import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IOrderLineCreateRequest } from '@/types/order';
import { IProductResponse } from '@/types/product';
import { Loader2, SearchIcon, XIcon } from 'lucide-react';
import { useGetProductByCode } from '@/hooks/use-product';
import FindProduct from '../product/find';
import { useEffect, useMemo, useRef } from 'react';

type Props = {
    saveDetail: (data: IOrderLineCreateRequest) => void
    disabled?: boolean
}

const OrderLineCreate = ({ saveDetail, disabled }: Props) => {
    const [goodsSelected, setGoodsSelected] = React.useState<IProductResponse>();
    const [open, setOpen] = React.useState(false);
    const [code, setCode] = React.useState<string>('');
    const [quantity, setQuantity] = React.useState<number | undefined>();
    const [unitPrice, setUnitPrice] = React.useState<number | undefined>();
    const formRef = useRef<HTMLFormElement>(null);
    const quantityRef = useRef<HTMLInputElement>(null);
    const { mutateAsync, data: productData, isPending } = useGetProductByCode();

    useEffect(() => {
        if (productData?.data) {
            const product = productData.data as IProductResponse;
            setGoodsSelected(product);
            setCode(product.code ?? '');
        }
    }, [productData?.data]);

    useEffect(() => {
        if (goodsSelected) {
            quantityRef.current?.focus();
        }
    }, [goodsSelected]);

    const clearForm = () => {
        formRef.current?.reset();
        setGoodsSelected(undefined);
        setCode('');
        setQuantity(undefined);
        setUnitPrice(undefined);
        setOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setCode(e.target.value ?? '');
    };

    const handleResetProduct = () => {
        setCode('');
        setGoodsSelected(undefined);
        setQuantity(undefined);
        setUnitPrice(undefined);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuantity(value ? Number(value) : undefined);
    };

    const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUnitPrice(value ? Number(value) : undefined);
    };

    const handleSearchProduct = React.useCallback(() => {
        if (!code?.trim()) return;
        mutateAsync(code.trim());
    }, [code, mutateAsync]);

    const handleSearchByEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearchProduct();
        }
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!goodsSelected) return;

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        if (data && data?.['unitPrice'] && data?.['quantity']) {
            data['totalAmount'] = `${Number(data['unitPrice']) * Number(data['quantity'])}`;
        }

        const formatData: IOrderLineCreateRequest = {
            ...data,
            quantity: Number(data['quantity']),
            unitPrice: Number(data['unitPrice']),
            totalAmount: Number(data['totalAmount']),
            isIncludedTax: data['isIncludedTax'] === '0' ? false : true,
            productCodeSuggest: goodsSelected.code,
            productNameSuggest: goodsSelected.name,
            taxRate: 0,
            taxAmount: 0,
            notes: data?.notes as string,
            productId: goodsSelected.id,
            uom: data['uom'] as string,
            receiverNote: data['receiverNote'] as string,
            deliveryNote: data['deliveryNote'] as string,
            referenceNote: data['referenceNote'] as string,
            vendorCodeSuggest: data['vendorCodeSuggest'] as string,
            vendorNameSuggest: data['vendorCodeSuggest'] as string,
        };

        saveDetail(formatData);
        setOpen(false);
        clearForm();
    };

    const handleSelectProduct = React.useCallback((data: IProductResponse) => {
        setGoodsSelected(data);
        setCode(data.code ?? '');
    }, []);

    const computedTotalAmount = useMemo(() => {
        if (quantity === undefined || unitPrice === undefined) return undefined;
        return quantity * unitPrice;
    }, [quantity, unitPrice]);

    const isSaveDisabled = useMemo(() => {
        return !goodsSelected || quantity === undefined || unitPrice === undefined;
    }, [goodsSelected, quantity, unitPrice]);


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="default" disabled={disabled}>Thêm mới</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase text-center">Thêm mới chi tiết đơn hàng</DialogTitle>

                        <div className="flex gap-x-4">
                            <Button size="sm" type="submit" form="createSellDetailForm" disabled={isSaveDisabled}>
                                Lưu
                            </Button>
                            <DialogClose onClick={clearForm} className="h-8 bg-primary-foreground rounded-md px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <form id="createSellDetailForm" onSubmit={onSubmit} ref={formRef}>
                    <div>

                        <div className="grid grid-cols-3 gap-x-12 gap-y-10 mt-4">
                            <div>
                                <Label>Mã hàng <span className="text-red-600">*</span></Label>
                                <div className="flex gap-x-2">
                                    <Input
                                        name="code"
                                        maxLength={300}
                                        onChange={handleChange}
                                        onKeyDown={handleSearchByEnter}
                                        value={code}
                                        placeholder="Nhập mã sản phẩm"
                                    />
                                    <Button type="button" disabled={!code?.trim()} size="sm" onClick={handleSearchProduct}>
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={!code}
                                        onClick={handleResetProduct}
                                        className="h-9 w-9"
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Tìm sản phẩm theo mã hoặc chọn nhanh bên dưới.</p>
                                <div className="mt-3">
                                    <FindProduct setProductData={handleSelectProduct} />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <div className="rounded-md border bg-muted/40 p-4 min-h-[120px]" aria-live="polite">
                                    {goodsSelected ? (
                                        <dl className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <dt className="font-semibold text-foreground/80">Tên hàng</dt>
                                                <dd className="mt-1">{goodsSelected.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-semibold text-foreground/80">Nhóm hàng</dt>
                                                <dd className="mt-1">{goodsSelected.categoryName ?? '—'}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-semibold text-foreground/80">Mã gợi ý</dt>
                                                <dd className="mt-1">{goodsSelected.code}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-semibold text-foreground/80">Đơn vị chuẩn</dt>
                                                <dd className="mt-1">{goodsSelected.unit1 ?? '—'}</dd>
                                            </div>
                                        </dl>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                            Chưa có sản phẩm được chọn.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-primary my-6" />

                    <div>
                        <div className="grid grid-cols-3 gap-x-12 gap-y-10 mt-4">
                            <div>
                                <Label htmlFor="vendorCodeSuggest">Nhà cung cấp <span className="text-red-600">*</span></Label>
                                <Input required name="vendorCodeSuggest" />
                            </div>

                            <div>
                                <Label htmlFor="quantity">Số lượng <span className="text-red-600">*</span></Label>
                                <Input
                                    required
                                    name="quantity"
                                    min={1}
                                    max={1000000}
                                    maxLength={7}
                                    type="number"
                                    inputMode="decimal"
                                    onChange={handleQuantityChange}
                                    ref={quantityRef}
                                />
                            </div>

                            <div>
                                <Label htmlFor="uom">Đơn vị tính <span className="text-red-600">*</span></Label>
                                <Input required name="uom" maxLength={50} />
                            </div>

                            <div>
                                <Label htmlFor="isIncludedTax">Thuế <span className="text-red-600">*</span></Label>
                                <Select required name="isIncludedTax" defaultValue="1">
                                    <SelectTrigger id="isIncludedTax">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectItem value="1">Đã bao gồm thuế</SelectItem>
                                        <SelectItem value="0">Chưa bao gồm thuế</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="unitPrice">Đơn giá <span className="text-red-600">*</span></Label>
                                <Input
                                    required
                                    maxLength={100}
                                    name="unitPrice"
                                    type="number"
                                    min={0}
                                    step="100"
                                    inputMode="decimal"
                                    onChange={handleUnitPriceChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="totalAmount">Thành tiền</Label>
                                <Input
                                    name="totalAmount"
                                    readOnly
                                    value={computedTotalAmount?.toString() ?? ''}
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Tự động tính dựa trên số lượng và đơn giá.</p>
                            </div>

                        </div>
                    </div>

                    <Separator className="bg-primary my-6" />

                    <div>
                        <div className="grid grid-cols-3 gap-x-12 my-4">
                            <div>
                                <Label htmlFor="receiverNote">Giáo viên</Label>
                                <Input name="receiverNote" maxLength={300} />
                            </div>

                            <div>
                                <Label htmlFor="deliveryNote">Phòng</Label>
                                <Input name="deliveryNote" maxLength={300} />
                            </div>

                            <div>
                                <Label htmlFor="referenceNote">Tham chiếu</Label>
                                <Input name="referenceNote" maxLength={300} placeholder="Số hợp đồng, PO..." />
                            </div>

                            <div>
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Input name="notes" maxLength={500} />
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default OrderLineCreate;