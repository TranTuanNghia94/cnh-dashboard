import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useCreateVendor } from '@/hooks/use-vendor'
import { IVendorInput } from '@/types/vendor'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/_app/vendor/new')({
  component: NewVendorPage,
})

function NewVendorPage() {
  const { mutateAsync, isSuccess, data } = useCreateVendor()
  const { toast } = useToast()
  const { history } = useRouter()

  useEffect(() => {
    if (data && isSuccess) {
      toast({
        title: 'Thao tác thành công',
        description: 'Tạo nhà cung cấp thành công',
        variant: 'success',
      })

      history.back()
    }
  }, [isSuccess, data])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fields = [
      'maNhaCungCap',
      'misaCode',
      'tenNhaCungCap',
      'ngoaiTe',
      'quocGia',
      'bank_name',
      'bank_accountName',
      'bank_accountNum',
    ]

    const formData = new FormData(e.currentTarget)
    const vendorData = fields.reduce(
      (acc, field) => {
        acc[field] = formData.get(field)?.toString().trim() as string
        return acc
      },
      {} as Record<string, string>,
    ) as unknown as IVendorInput
    vendorData.ngoaiTe = vendorData.ngoaiTe?.toUpperCase()

    await mutateAsync(vendorData)
  }

  return (
    <div>
      <HeaderPageLayout idForm="createVendorForm" title="Thêm nhà cung cấp" />

      <div>
        <Card className="mt-4">
          <CardContent>
            <form
              id="createVendorForm"
              onSubmit={onSubmit}
              className="grid my-20 grid-cols-3 gap-x-20 gap-y-10"
            >
              <div>
                <Label className="text-xs" htmlFor="maNhaCungCap">
                  Mã nhà cung cấp <span className="text-red-600">*</span>
                </Label>
                <Input
                  name="maNhaCungCap"
                  maxLength={200}
                  required
                  className="col-span-2"
                />
              </div>

              <div>
                <Label className="text-xs" htmlFor="misaCode">
                  Mã Misa
                </Label>
                <Input name="misaCode" maxLength={100} className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="tenNhaCungCap">
                  Tên nhà cung cấp
                </Label>
                <Input name="tenNhaCungCap" className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="ngoaiTe">
                  Tiền tệ <span className="text-red-600">*</span>
                </Label>
                <Input
                  name="ngoaiTe"
                  maxLength={30}
                  required
                  className="col-span-2"
                />
              </div>

              <div>
                <Label className="text-xs" htmlFor="quocGia">
                  Quốc gia
                </Label>
                <Input name="quocGia" maxLength={200} className="col-span-2" />
              </div>

              <div />

              <div>
                <Label className="text-xs" htmlFor="bank_name">
                  Ngân hàng
                </Label>
                <Input
                  name="bank_name"
                  maxLength={200}
                  className="col-span-2"
                />
              </div>

              <div>
                <Label className="text-xs" htmlFor="bank_accountName">
                  Tên tài khoản
                </Label>
                <Input
                  name="bank_accountName"
                  maxLength={200}
                  className="col-span-2"
                />
              </div>

              <div>
                <Label className="text-xs" htmlFor="bank_accountNum">
                  Số tài khoản
                </Label>
                <Input
                  name="bank_accountNum"
                  maxLength={50}
                  className="col-span-2"
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
