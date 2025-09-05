import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/payment/new')({
    component: NewPaymentPage
})


function NewPaymentPage() {
    return (
        <div>
            <HeaderPageLayout idForm="createPaymentForm" title="Thêm đề nghị thanh toán" />

            <div className="mt-4 grid grid-cols-4 gap-x-4">
                <div>
                    <Card className="mt-4">
                        <CardContent>
                            <div>

                            </div>
                        </CardContent>
                    </Card>
                    <Card className="mt-4">
                        <CardContent>
                            <form id="createGoodsForm" className="my-5">
                                <div>
                                    <Label className="text-xs" htmlFor="id">
                                        Số chứng từ
                                    </Label>

                                    <div>
                                        <span>asdc</span>
                                    </div>
                                </div>

                                <div className="my-3">
                                    <Label className="text-xs" htmlFor="maHangHoa">
                                        Hạn thanh toán <span className="text-red-600">*</span>
                                    </Label>
                                    <Input name="maHangHoa" maxLength={200} required className="col-span-2" />
                                </div>

                                <div className="my-3">
                                    <Label className="text-xs" htmlFor="donViTinh">
                                        Công ty thanh toán <span className="text-red-600">*</span>
                                    </Label>
                                    <Input name="donViTinh" maxLength={200} className="col-span-2" />
                                </div>


                                <div className="my-3">
                                    <Label className="text-xs" htmlFor="donViTinh">
                                        Trạng thái thanh toán <span className="text-red-600">*</span>
                                    </Label>
                                    <Input name="donViTinh" maxLength={200} className="col-span-2" />
                                </div>


                                <div className="my-3">
                                    <Label className="text-xs" htmlFor="donViTinh">
                                        Tên ngân hàng
                                    </Label>
                                    <Input name="donViTinh" maxLength={200} className="col-span-2" />
                                </div>


                                <div className="my-3">
                                    <Label className="text-xs" htmlFor="donViTinh">
                                        Số tài khoản
                                    </Label>
                                    <Input name="donViTinh" maxLength={200} className="col-span-2" />
                                </div>

                                <div className="my-3">
                                    <Label className="text-xs" htmlFor="donViTinh">
                                        Họ tên người nhận

                                    </Label>
                                    <Input name="donViTinh" maxLength={200} className="col-span-2" />
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-3">
                   
                </div>
            </div>
        </div>
    )
}