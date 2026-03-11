import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IOrderLineCreateRequest } from '@/types/order';
import { IProductResponse } from '@/types/product';
import { Loader2, SearchIcon, XIcon } from 'lucide-react';
import { useGetProductByCode } from '@/hooks/use-product';
import FindProduct from '../product/find';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { formatNumberVN } from '@/lib/other';

export type OrderLineFormProps = {
    formId: string;
    initialData?: IOrderLineCreateRequest;
    onSubmit: (data: IOrderLineCreateRequest) => void;
};

export function useOrderLineForm(props: OrderLineFormProps) {
    const { initialData } = props;
    const initialProduct = initialData?.product as IProductResponse | undefined;

    const [goodsSelected, setGoodsSelected] = React.useState<IProductResponse | undefined>(initialProduct);
    const [code, setCode] = React.useState<string>(initialData?.productCodeSuggest ?? '');
    const [quantity, setQuantity] = React.useState<number | undefined>(initialData?.quantity);
    const [unitPrice, setUnitPrice] = React.useState<number | undefined>(initialData?.unitPrice);
    const formRef = useRef<HTMLFormElement>(null);
    const quantityRef = useRef<HTMLInputElement>(null);
    const { mutateAsync, data: productData, isPending: isSearching } = useGetProductByCode();

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

    useEffect(() => {
        if (initialData) {
            setGoodsSelected(initialProduct);
            setCode(initialData.productCodeSuggest ?? '');
            setQuantity(initialData.quantity);
            setUnitPrice(initialData.unitPrice);
        }
    }, [initialData, initialProduct]);

    const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setCode(e.target.value ?? '');
    }, []);

    const handleResetProduct = useCallback(() => {
        setGoodsSelected(undefined);
        setCode('');
        setQuantity(undefined);
        setUnitPrice(undefined);
    }, []);

    const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuantity(value ? Number(value) : undefined);
    }, []);

    const handleUnitPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUnitPrice(value ? Number(value) : undefined);
    }, []);

    const handleSearchProduct = useCallback(() => {
        if (!code?.trim()) return;
        mutateAsync(code.trim());
    }, [code, mutateAsync]);

    const handleSearchByEnter = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearchProduct();
        }
    }, [handleSearchProduct]);

    const handleSelectProduct = useCallback((product: IProductResponse) => {
        setGoodsSelected(product);
        setCode(product.code ?? '');
    }, []);

    const computedTotalAmount = useMemo(() => {
        const qty = quantity ?? initialData?.quantity;
        const price = unitPrice ?? initialData?.unitPrice;
        if (qty === undefined || price === undefined) return initialData?.totalAmount;
        return qty * price;
    }, [quantity, unitPrice, initialData?.quantity, initialData?.unitPrice, initialData?.totalAmount]);

    const activeProduct = goodsSelected ?? initialProduct;
    const canSubmitProduct = Boolean(activeProduct?.id ?? initialData?.productId);

    const isSaveDisabled = useMemo(() => {
        const qty = quantity ?? initialData?.quantity;
        const price = unitPrice ?? initialData?.unitPrice;
        return !canSubmitProduct || qty === undefined || price === undefined;
    }, [canSubmitProduct, quantity, unitPrice, initialData?.quantity, initialData?.unitPrice]);

    const buildOrderLine = useCallback((): IOrderLineCreateRequest | null => {
        if (!formRef.current) return null;
        const selectedProduct = activeProduct;
        if (!selectedProduct && !initialData?.productId) return null;

        const formData = new FormData(formRef.current);
        const vendorCode = (formData.get('vendorCodeSuggest') as string) || initialData?.vendorCodeSuggest || '';
        const uom = (formData.get('uom') as string) || initialData?.uom || '';
        const receiverNote = (formData.get('receiverNote') as string) || initialData?.receiverNote || '';
        const deliveryNote = (formData.get('deliveryNote') as string) || initialData?.deliveryNote || '';
        const referenceNote = (formData.get('referenceNote') as string) || initialData?.referenceNote || '';
        const notes = (formData.get('notes') as string) || initialData?.notes || '';
        const taxValue = formData.get('isIncludedTax') ?? (initialData?.isIncludedTax ? '1' : '0');

        const qty = quantity ?? initialData?.quantity ?? 0;
        const price = unitPrice ?? initialData?.unitPrice ?? 0;
        const total = qty * price;

        return {
            ...initialData,
            product: selectedProduct,
            vendorCodeSuggest: vendorCode,
            vendorNameSuggest: vendorCode,
            quantity: qty,
            unitPrice: price,
            totalAmount: total,
            isIncludedTax: taxValue === '1',
            productId: selectedProduct?.id ?? initialData?.productId,
            productCodeSuggest: selectedProduct?.code ?? code,
            productNameSuggest: selectedProduct?.name ?? initialData?.productNameSuggest ?? '',
            uom,
            receiverNote,
            deliveryNote,
            referenceNote,
            notes,
            taxRate: initialData?.taxRate ?? 0,
            taxAmount: initialData?.taxAmount ?? 0,
        };
    }, [activeProduct, code, initialData, quantity, unitPrice]);

    const resetForm = useCallback(() => {
        formRef.current?.reset();
        setGoodsSelected(initialProduct);
        setCode(initialData?.productCodeSuggest ?? '');
        setQuantity(initialData?.quantity);
        setUnitPrice(initialData?.unitPrice);
    }, [initialData, initialProduct]);

    const clearForm = useCallback(() => {
        formRef.current?.reset();
        setGoodsSelected(undefined);
        setCode('');
        setQuantity(undefined);
        setUnitPrice(undefined);
    }, []);

    return {
        formRef,
        quantityRef,
        code,
        goodsSelected,
        activeProduct,
        isSearching,
        quantity,
        unitPrice,
        computedTotalAmount,
        isSaveDisabled,
        handleCodeChange,
        handleResetProduct,
        handleQuantityChange,
        handleUnitPriceChange,
        handleSearchProduct,
        handleSearchByEnter,
        handleSelectProduct,
        buildOrderLine,
        resetForm,
        clearForm,
    };
}

type OrderLineFormRenderProps = {
    formId: string;
    formRef: React.RefObject<HTMLFormElement>;
    quantityRef: React.RefObject<HTMLInputElement>;
    code: string;
    activeProduct: IProductResponse | undefined;
    isSearching: boolean;
    computedTotalAmount: number | undefined;
    initialData?: IOrderLineCreateRequest;
    onFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSearchByEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleSearchProduct: () => void;
    handleResetProduct: () => void;
    handleSelectProduct: (product: IProductResponse) => void;
    handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleUnitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const OrderLineFormFields = React.memo(function OrderLineFormFields({
    formId,
    formRef,
    quantityRef,
    code,
    activeProduct,
    isSearching,
    computedTotalAmount,
    initialData,
    onFormSubmit,
    handleCodeChange,
    handleSearchByEnter,
    handleSearchProduct,
    handleResetProduct,
    handleSelectProduct,
    handleQuantityChange,
    handleUnitPriceChange,
}: OrderLineFormRenderProps) {
    return (
        <form id={formId} onSubmit={onFormSubmit} ref={formRef}>
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
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
                        </Button>
                        <Button type="button" variant="outline" size="icon" disabled={!code} onClick={handleResetProduct} className="h-9 w-9">
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
                        {activeProduct ? (
                            <dl className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="font-semibold text-foreground/80">Tên hàng</dt>
                                    <dd className="mt-1">{activeProduct.name ?? initialData?.productNameSuggest}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-foreground/80">Nhóm hàng</dt>
                                    <dd className="mt-1">{activeProduct.categoryName ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-foreground/80">Mã gợi ý</dt>
                                    <dd className="mt-1">{activeProduct.code ?? initialData?.productCodeSuggest}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-foreground/80">Đơn vị chuẩn</dt>
                                    <dd className="mt-1">{activeProduct.unit1 ?? initialData?.uom ?? '—'}</dd>
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

            <Separator className="bg-primary my-6" />

            <div className="grid grid-cols-3 gap-x-12 gap-y-10 mt-4">
                <div>
                    <Label htmlFor="vendorCodeSuggest">Nhà cung cấp <span className="text-red-600">*</span></Label>
                    <Input required name="vendorCodeSuggest" maxLength={200} defaultValue={initialData?.vendorCodeSuggest} />
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
                        defaultValue={initialData?.quantity}
                        ref={quantityRef}
                    />
                </div>

                <div>
                    <Label htmlFor="uom">Đơn vị tính <span className="text-red-600">*</span></Label>
                    <Input required name="uom" maxLength={50} defaultValue={initialData?.uom} />
                </div>

                <div>
                    <Label htmlFor="isIncludedTax">Thuế <span className="text-red-600">*</span></Label>
                    <Select required name="isIncludedTax" defaultValue={initialData?.isIncludedTax !== false ? '1' : '0'}>
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
                        defaultValue={initialData?.unitPrice}
                    />
                </div>

                <div>
                    <Label htmlFor="totalAmount">Thành tiền</Label>
                    <Input
                        name="totalAmount"
                        readOnly
                        value={computedTotalAmount !== undefined ? formatNumberVN(computedTotalAmount) : ''}
                        className="bg-muted/60 font-semibold text-foreground cursor-default border-dashed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Tự động tính dựa trên số lượng và đơn giá.</p>
                </div>
            </div>

            <Separator className="bg-primary my-6" />

            <div className="grid grid-cols-3 gap-x-12 my-4">
                <div>
                    <Label htmlFor="receiverNote">Giáo viên</Label>
                    <Input name="receiverNote" maxLength={300} defaultValue={initialData?.receiverNote ?? ''} />
                </div>

                <div>
                    <Label htmlFor="deliveryNote">Phòng</Label>
                    <Input name="deliveryNote" maxLength={300} defaultValue={initialData?.deliveryNote ?? ''} />
                </div>

                <div>
                    <Label htmlFor="referenceNote">Tham chiếu</Label>
                    <Input name="referenceNote" maxLength={300} defaultValue={initialData?.referenceNote ?? ''} placeholder="Số hợp đồng, PO..." />
                </div>

                <div>
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Input name="notes" maxLength={500} defaultValue={initialData?.notes ?? ''} />
                </div>
            </div>
        </form>
    );
});
