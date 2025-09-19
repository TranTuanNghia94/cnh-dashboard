import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useCreateVendor } from '@/hooks/use-vendor'
import { IVendorBanksCreateRequest, IVendorCreateRequest } from '@/types/vendor'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { DataTableDetail } from '@/components/table/data-table-detail'
import CreateVendorBanks from '@/components/modal/vendor/vendor-banks-create'
import { VendorBanksColumns } from '@/components/table/vendor/column-vendor-banks'

export const Route = createLazyFileRoute('/_app/vendor/new')({
  component: NewVendorPage,
})

function NewVendorPage() {
  const { mutateAsync, isSuccess, data } = useCreateVendor()
  const { toast } = useToast()
  const { history } = useRouter()
  const [listBanks, setListBanks] = useState<IVendorBanksCreateRequest[]>([])
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
    const formData = new FormData(e.currentTarget)
    const vendorData: IVendorCreateRequest = {
      code: formData.get('code')?.toString().trim() as string,
      name: formData.get('name')?.toString().trim() as string,
      email: formData.get('email')?.toString().trim() as string,
      country: formData.get('country')?.toString().trim() as string,
      currency: formData.get('currency')?.toString().trim() as string,
      phone: formData.get('phone')?.toString().trim() as string,
      misaCode: formData.get('misaCode')?.toString().trim() as string,
      address: formData.get('address')?.toString().trim() as string,
      banks: listBanks,
      taxCode: '',
      contactPerson: ''
    }

    await mutateAsync(vendorData)
  }

  const handleAddVendorAddress = (val: IVendorBanksCreateRequest) => {
    setListBanks([...listBanks, val])
  }

  const handleDeleteVendorAddress = (index: number) => {
    setListBanks(listBanks.filter((_, i) => i !== index))
  }

  const handleUpdateVendorAddress = (index: number, val: IVendorBanksCreateRequest) => {
    setListBanks(listBanks.map((item, i) => i === index ? val : item))
  }

  return (
    <div>
      <HeaderPageLayout idForm="formCreateVendor" title="Thêm nhà cung cấp" />

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
                <Label  className="text-xs" htmlFor="currency">Tiền tệ<span className="text-red-600">*</span></Label>
                <Input name="currency" className="col-span-2" required />
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
                <DataTableDetail listTools={<CreateVendorBanks saveDetail={handleAddVendorAddress} />}
                  data={listBanks?.map((item, index) => ({
                    ...item,
                    deleteRow: () => handleDeleteVendorAddress(index),
                    updateRow: (val: IVendorBanksCreateRequest) => handleUpdateVendorAddress(index, val)
                  }))}
                  wrapperClassName='h-[calc(82vh-175px)] max-h-[calc(82vh-175px)]'
                  columns={VendorBanksColumns}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
