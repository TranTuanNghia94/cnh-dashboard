import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useGetVendorByCode, useUpdateVendor } from '@/hooks/use-vendor'
import { IVendorInput } from '@/types/vendor'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/_app/vendor/$vendorId')({
  component: UpdateVendorPage,
})

function UpdateVendorPage() {
  const { toast } = useToast()
  // const { history } = useRouter()

  const { vendorId } = useParams({ strict: false })
  const { mutateAsync, data } = useGetVendorByCode()
  const { mutateAsync: update, isSuccess, data: dataSuccess } = useUpdateVendor()

  useEffect(() => {
    if (vendorId) {
      mutateAsync(vendorId)
    }
  }, [])

  useEffect(() => {
    if (isSuccess && dataSuccess) {
      toast({
        title: 'Thao tác thành công',
        description: 'Cập nhật thành công',
        variant: 'success',
      })
    }
  }, [isSuccess, dataSuccess])

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
    vendorData.id = data?.results ? data.results[0]?.id : ''

    await update(vendorData)
  }


  return (
    <div>
      <HeaderPageLayout
        idForm="updateVendorForm"
        title="Cập nhật nhà cung cấp"
      />

      <div>
        <Card className="mt-4">
          <CardContent>
            <form
              onSubmit={onSubmit}
              id="updateVendorForm"
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
                  defaultValue={data?.results ? data.results[0]?.maNhaCungCap : ''}
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
                <Input name="tenNhaCungCap" className="col-span-2" defaultValue={data?.results ? data.results[0]?.tenNhaCungCap : ''} />
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
                  defaultValue={data?.results ? data.results[0]?.ngoaiTe : ''}
                />
              </div>

              <div>
                <Label className="text-xs" htmlFor="quocGia">
                  Quốc gia
                </Label>
                <Input name="quocGia" maxLength={200} className="col-span-2" defaultValue={data?.results ? data.results[0]?.quocGia : ''} />
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
                  defaultValue={data?.results ? data.results[0]?.bank_name : ''}
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
                  defaultValue={data?.results ? data.results[0]?.bank_accountName : ''}
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
                  defaultValue={data?.results ? data.results[0]?.bank_accountNum : ''}
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
