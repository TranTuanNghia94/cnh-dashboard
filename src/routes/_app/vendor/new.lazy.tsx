import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useCreateVendor } from '@/hooks/use-vendor'
import { IVendorCreateRequest } from '@/types/vendor'
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
    ) as unknown as IVendorCreateRequest
    vendorData.currency = vendorData.currency?.toUpperCase()

    await mutateAsync(vendorData)
  }

  return (
    <div>
      <HeaderPageLayout idForm="createVendorForm" title="Thêm nhà cung cấp" />

      <div className="grid grid-cols-3 gap-x-4">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="uppercase">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="formCreateVendor" onSubmit={onSubmit}>
              <div>
                <Label className="text-xs" htmlFor="code">Mã nhà cung cấp<span className="text-red-600">*</span></Label>
                <Input name="code" required className="col-span-2" />
              </div>

              <div className="my-4">
                <Label className="text-xs" htmlFor="misaCode">Mã Misa</Label>
                <Input name="misaCode" className="col-span-2" />
              </div>

              <div className="my-4">
                <Label  className="text-xs" htmlFor="name">Tên nhà cung cấp <span className="text-red-600">*</span></Label>
                <Textarea name="name" className="col-span-2" rows={3} />
              </div>

              <div className="my-4">
                <Label  className="text-xs" htmlFor="currency">Tiền tệ</Label>
                <Input name="currency" className="col-span-2" />
              </div>

              <div className="my-4"> 
                <Label  className="text-xs" htmlFor="country">Quốc gia</Label>
                <Input name="country" className="col-span-2" />
              </div>

              <div className="my-4"> 
                <Label  className="text-xs" htmlFor="phone">Số điện thoại</Label>
                <Input name="phone" className="col-span-2" />
              </div>

              <div className="my-4"> 
                <Label  className="text-xs" htmlFor="email">Địa chỉ</Label>
                <Input name="address" className="col-span-2" />
              </div>
            </form>
          </CardContent>
        </Card>


        <div className="col-span-2 mt-4">
          <Card>
            <CardContent>
              <div className="mt-4">
                {/* <DataTableDetail listTools={<CreateVendorAddress saveDetail={handleAddVendorAddress} />}
                  data={listAddress.map((item, index) => ({
                    ...item,
                    deleteRow: () => handleDeleteCustomerAddress(index),
                    updateRow: (val: IAddressRequestCreate) => handleUpdateCustomerAddress(index, val)
                  }))}
                  wrapperClassName='h-[calc(82vh-175px)] max-h-[calc(82vh-175px)]'
                  columns={CustomerAddressColumns}
                /> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
