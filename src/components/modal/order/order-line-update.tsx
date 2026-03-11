import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IOrderLineCreateRequest } from '@/types/order';
import React from 'react';
import { useOrderLineForm, OrderLineFormFields } from './order-line-form';

type Props = {
    saveDetail: (data: IOrderLineCreateRequest) => void
    data: IOrderLineCreateRequest;
}

const FORM_ID = 'updateOrderLineForm';

const OrderLineUpdate = ({ saveDetail, data }: Props) => {
    const [open, setOpen] = React.useState(false);

    const form = useOrderLineForm({
        formId: FORM_ID,
        initialData: data,
        onSubmit: (lineData) => {
            saveDetail(lineData);
            setOpen(false);
        },
    });

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const lineData = form.buildOrderLine();
        if (!lineData) return;
        saveDetail(lineData);
        setOpen(false);
    };

    const handleClose = () => {
        form.resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-blue-600 outline-none transition-colors hover:bg-gray-100 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Sửa
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-5xl" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase text-center">Cập nhật chi tiết đơn hàng</DialogTitle>
                        <div className="flex gap-x-2">
                            <Button size="sm" type="submit" form={FORM_ID} disabled={form.isSaveDisabled}>Lưu</Button>
                            <DialogClose asChild>
                                <Button size="sm" variant="outline" type="button" onClick={handleClose}>
                                    Đóng
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogHeader>
                <OrderLineFormFields
                    formId={FORM_ID}
                    formRef={form.formRef}
                    quantityRef={form.quantityRef}
                    code={form.code}
                    activeProduct={form.activeProduct}
                    isSearching={form.isSearching}
                    computedTotalAmount={form.computedTotalAmount}
                    initialData={data}
                    onFormSubmit={handleFormSubmit}
                    handleCodeChange={form.handleCodeChange}
                    handleSearchByEnter={form.handleSearchByEnter}
                    handleSearchProduct={form.handleSearchProduct}
                    handleResetProduct={form.handleResetProduct}
                    handleSelectProduct={form.handleSelectProduct}
                    handleQuantityChange={form.handleQuantityChange}
                    handleUnitPriceChange={form.handleUnitPriceChange}
                />
            </DialogContent>
        </Dialog>
    )
}

export default OrderLineUpdate;
