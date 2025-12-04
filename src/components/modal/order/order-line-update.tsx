import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { IOrderLineCreateRequest } from '@/types/order';
import { IProductResponse } from '@/types/product';
import React, { useEffect, useMemo, useRef } from 'react';
import FindProduct from '../product/find';
import { Loader2, SearchIcon, XIcon } from 'lucide-react';
import { useGetProductByCode } from '@/hooks/use-product';

type Props = {
    saveDetail: (data: IOrderLineCreateRequest) => void
    data: IOrderLineCreateRequest;
}

const OrderLineUpdate = ({ saveDetail, data }: Props) => {
    const initialProduct = data?.product as IProductResponse | undefined
    const [goodsSelected, setGoodsSelected] = React.useState<IProductResponse | undefined>(initialProduct)
    const [open, setOpen] = React.useState(false)
    const [code, setCode] = React.useState<string>(data?.productCodeSuggest ?? '')
    const [quantity, setQuantity] = React.useState<number | undefined>(data?.quantity)
    const [unitPrice, setUnitPrice] = React.useState<number | undefined>(data?.unitPrice)
    const formRef = useRef<HTMLFormElement>(null)
    const quantityRef = useRef<HTMLInputElement>(null)
    const { mutateAsync, data: productData, isPending } = useGetProductByCode()

    useEffect(() => {
        if (productData?.data) {
            const product = productData.data as IProductResponse
            setGoodsSelected(product)
            setCode(product.code ?? '')
        }
    }, [productData?.data])

    useEffect(() => {
        if (goodsSelected) {
            quantityRef.current?.focus()
        }
    }, [goodsSelected])

    useEffect(() => {
        setGoodsSelected(initialProduct)
        setCode(data?.productCodeSuggest ?? '')
        setQuantity(data?.quantity)
        setUnitPrice(data?.unitPrice)
    }, [data, initialProduct])

    const handleSelectProduct = React.useCallback((product: IProductResponse) => {
        setGoodsSelected(product)
        setCode(product.code ?? '')
    }, [])

    const handleSearchProduct = React.useCallback(() => {
        if (!code?.trim()) return
        mutateAsync(code.trim())
    }, [code, mutateAsync])

    const handleSearchByEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            handleSearchProduct()
        }
    }

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setCode(e.target.value ?? '')
    }

    const handleResetProduct = () => {
        setGoodsSelected(undefined)
        setCode('')
    }

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuantity(value ? Number(value) : undefined)
    }

    const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setUnitPrice(value ? Number(value) : undefined)
    }

    const computedTotalAmount = useMemo(() => {
        const qty = quantity ?? data?.quantity
        const price = unitPrice ?? data?.unitPrice
        if (qty === undefined || price === undefined) return data?.totalAmount
        return qty * price
    }, [quantity, unitPrice, data?.quantity, data?.unitPrice, data?.totalAmount])

    const activeProduct = goodsSelected ?? initialProduct
    const canSubmitProduct = Boolean(activeProduct?.id ?? data?.productId)

    const isSaveDisabled = useMemo(() => {
        const qty = quantity ?? data?.quantity
        const price = unitPrice ?? data?.unitPrice
        return !canSubmitProduct || qty === undefined || price === undefined
    }, [canSubmitProduct, quantity, unitPrice, data?.quantity, data?.unitPrice])

    const clearForm = () => {
        formRef.current?.reset()
        setGoodsSelected(initialProduct)
        setCode(data?.productCodeSuggest ?? '')
        setQuantity(data?.quantity)
        setUnitPrice(data?.unitPrice)
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const selectedProduct = activeProduct
        if (!selectedProduct) return

        const formData = new FormData(e.currentTarget)
        const vendorCode = (formData.get('vendorCodeSuggest') as string) || data?.vendorCodeSuggest || ''
        const uom = (formData.get('uom') as string) || data?.uom || ''
        const receiverNote = (formData.get('receiverNote') as string) || data?.receiverNote || ''
        const deliveryNote = (formData.get('deliveryNote') as string) || data?.deliveryNote || ''
        const referenceNote = (formData.get('referenceNote') as string) || data?.referenceNote || ''
        const notes = (formData.get('notes') as string) || data?.notes || ''
        const taxValue = formData.get('isIncludedTax') ?? (data?.isIncludedTax ? '1' : '0')

        const quantityValue = quantity ?? data?.quantity ?? 0
        const unitPriceValue = unitPrice ?? data?.unitPrice ?? 0
        const totalAmountValue = computedTotalAmount ?? quantityValue * unitPriceValue

        const formatData: IOrderLineCreateRequest = {
            ...data,
            vendorCodeSuggest: vendorCode,
            vendorNameSuggest: vendorCode,
            quantity: quantityValue,
            unitPrice: unitPriceValue,
            totalAmount: totalAmountValue ?? data?.totalAmount ?? 0,
            isIncludedTax: taxValue === '1',
            productId: selectedProduct.id ?? data?.productId,
            productCodeSuggest: selectedProduct.code ?? code,
            productNameSuggest: selectedProduct.name ?? data?.productNameSuggest,
            uom,
            receiverNote,
            deliveryNote,
            referenceNote,
            notes,
        }

        saveDetail(formatData)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-blue-600 outline-none transition-colors hover:bg-gray-100 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Sửa
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase text-center">Cập nhật chi tiết đơn hàng</DialogTitle>

                        <div className="flex gap-x-4">
                            <Button size="sm" type="submit" form="updateOrderLineForm" disabled={isSaveDisabled}>Lưu</Button>
                            <DialogClose onClick={clearForm} className="h-8 rounded-md bg-primary-foreground px-3 text-xs">Đóng</DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <form id="updateOrderLineForm" onSubmit={onSubmit} ref={formRef}>
                    <div>
                        <div className="grid grid-cols-3 gap-x-12 gap-y-10 mt-4">
                            <div>
                                <Label>Mã hàng <span className="text-red-600">*</span></Label>
                                <div className="flex gap-x-2">
                                    <Input
                                        name="code"
                                        maxLength={300}
                                        onChange={handleCodeChange}
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
                                <p className="mt-1 text-xs text-muted-foreground">Tìm sản phẩm theo mã hoặc chọn nhanh bên dưới.</p>
                                <div className="mt-3">
                                    <FindProduct setProductData={handleSelectProduct} />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <div className="rounded-md border bg-muted/40 p-4 min-h-[120px]" aria-live="polite">
                                    {activeProduct ? (
                                        <dl className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <dt className="font-semibold text-foreground/80">Tên hàng</dt>
                                                <dd className="mt-1">{activeProduct.name ?? data?.productNameSuggest}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-semibold text-foreground/80">Nhóm hàng</dt>
                                                <dd className="mt-1">{activeProduct.categoryName ?? '—'}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-semibold text-foreground/80">Mã gợi ý</dt>
                                                <dd className="mt-1">{activeProduct.code ?? data?.productCodeSuggest}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-semibold text-foreground/80">Đơn vị chuẩn</dt>
                                                <dd className="mt-1">{activeProduct.unit1 ?? data?.uom ?? '—'}</dd>
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
                                <Input required name="vendorCodeSuggest" maxLength={200} defaultValue={data?.vendorCodeSuggest} />
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
                                    defaultValue={data?.quantity}
                                    ref={quantityRef}
                                />
                            </div>

                            <div>
                                <Label htmlFor="uom">Đơn vị tính <span className="text-red-600">*</span></Label>
                                <Input required name="uom" maxLength={50} defaultValue={data?.uom} />
                            </div>

                            <div>
                                <Label htmlFor="isIncludedTax">Thuế <span className="text-red-600">*</span></Label>
                                <Select required name="isIncludedTax" defaultValue={data?.isIncludedTax ? '1' : '0'}>
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
                                    defaultValue={data?.unitPrice}
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
                                <p className="mt-1 text-xs text-muted-foreground">Tự động tính dựa trên số lượng và đơn giá.</p>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-primary my-6" />

                    <div>
                        <div className="grid grid-cols-3 gap-x-12 my-4">
                            <div>
                                <Label htmlFor="receiverNote">Giáo viên</Label>
                                <Input name="receiverNote" maxLength={300} defaultValue={data?.receiverNote ?? ''} />
                            </div>

                            <div>
                                <Label htmlFor="deliveryNote">Phòng</Label>
                                <Input name="deliveryNote" maxLength={300} defaultValue={data?.deliveryNote ?? ''} />
                            </div>

                            <div>
                                <Label htmlFor="referenceNote">Tham chiếu</Label>
                                <Input name="referenceNote" maxLength={300} defaultValue={data?.referenceNote ?? ''} placeholder="Số hợp đồng, PO..." />
                            </div>

                            <div>
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Input name="notes" maxLength={500} defaultValue={data?.notes ?? ''} />
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default OrderLineUpdate;