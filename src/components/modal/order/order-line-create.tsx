import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IOrderLineCreateRequest } from '@/types/order';
import React from 'react';
import { useOrderLineForm, OrderLineFormFields } from './order-line-form';

type Props = {
    saveDetail: (data: IOrderLineCreateRequest) => void
    disabled?: boolean
}

const FORM_ID = 'createSellDetailForm';

const OrderLineCreate = ({ saveDetail, disabled }: Props) => {
    const [open, setOpen] = React.useState(false);

    const form = useOrderLineForm({
        formId: FORM_ID,
        onSubmit: (data) => {
            saveDetail(data);
            setOpen(false);
            form.clearForm();
        },
    });

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = form.buildOrderLine();
        if (!data) return;
        saveDetail(data);
        setOpen(false);
        form.clearForm();
    };

    const handleSaveAndAddAnother = () => {
        const data = form.buildOrderLine();
        if (!data) return;
        saveDetail(data);
        form.clearForm();
    };

    const handleClose = () => {
        form.clearForm();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="default" disabled={disabled}>Thêm mới</Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="uppercase text-center">Thêm mới chi tiết đơn hàng</DialogTitle>
                        <div className="flex gap-x-2">
                            <Button size="sm" type="submit" form={FORM_ID} disabled={form.isSaveDisabled}>
                                Lưu
                            </Button>
                            <Button size="sm" variant="secondary" type="button" disabled={form.isSaveDisabled} onClick={handleSaveAndAddAnother}>
                                Lưu & thêm tiếp
                            </Button>
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

export default OrderLineCreate;
