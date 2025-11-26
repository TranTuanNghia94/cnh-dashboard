import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useGetVendorById, useUpdateVendor } from '@/hooks/use-vendor'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { IVendorUpdateRequest } from '@/types/vendor'
import { VendorBanksColumns } from '@/components/table/vendor/column-vendor-banks'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { IVendorBanksCreateRequest } from '@/types/vendor'
import CreateVendorBanks from '@/components/modal/vendor/vendor-banks-create'

export const Route = createLazyFileRoute('/_app/_wrapper/vendor/$vendorId')({
  component: UpdateVendorPage,
})

function UpdateVendorPage() {
  const { toast } = useToast()
  // const { history } = useRouter()

  const { vendorId } = useParams({ strict: false })
  const { mutateAsync, data } = useGetVendorById()
  const {
    mutateAsync: update,
    isSuccess,
    data: dataSuccess,
  } = useUpdateVendor()
  const [listBanks, setListBanks] = useState<IVendorBanksCreateRequest[]>([])

  useEffect(() => {
    if (vendorId) {
      mutateAsync(vendorId as string)
    }
  }, [])

  useEffect(() => {
    if (data?.data?.banks) {
      setListBanks(
        data.data.banks.map((item) => ({
          ...item,
          id: item.id,
          bankName: item.bankName,
          bankAccountName: item.bankAccountName,
          bankAccountNumber: item.bankAccountNumber,
          bankAccountBranch: item.bankAccountBranch,
          bankAccountSwift: item.bankAccountSwift,
          bankAccountIban: item.bankAccountIban,
          isDeleted: item.isDeleted,
        })),
      )
    }
  }, [data?.data?.banks])

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
    const formData = new FormData(e.currentTarget)
    const vendorData: IVendorUpdateRequest = {
      id: vendorId as string,
      name: formData.get('name')?.toString().trim() as string,
      email: formData.get('email')?.toString().trim() as string,
      phone: formData.get('phone')?.toString().trim() as string,
      code: formData.get('code')?.toString().trim() as string,
      taxCode: formData.get('taxCode')?.toString().trim() as string,
      misaCode: formData.get('misaCode')?.toString().trim() as string,
      address: formData.get('address')?.toString().trim() as string,
      currency: formData.get('currency')?.toString().trim() as string,
      country: formData.get('country')?.toString().trim() as string,
      contactPerson: formData.get('contactPerson')?.toString().trim() as string,
      banks: listBanks,
    }

    await update(vendorData)
  }

  const handleAddVendorAddress = (val: IVendorBanksCreateRequest) => {
    setListBanks([...listBanks, val])
  }

  const handleDeleteVendorAddress = (index: number) => {
    const newList = [...listBanks]
    console.log('log newList', newList)

    newList[index].isDeleted = true

    console.log('log  newList[index]', newList[index])
    setListBanks(newList)
  }

  const handleUpdateVendorAddress = (
    index: number,
    val: IVendorBanksCreateRequest,
  ) => {
    const newList = [...listBanks]
    newList[index] = val
    setListBanks(newList)
  }

  return (
    <div>
      <HeaderPageLayout
        idForm="formUpdateVendor"
        title="Cập nhật nhà cung cấp"
      />

      <div className="grid grid-cols-3 gap-x-4">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="uppercase">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="formUpdateVendor" onSubmit={onSubmit}>
              <div>
                <Label className="text-xs" htmlFor="code">
                  Mã nhà cung cấp<span className="text-red-600">*</span>
                </Label>
                <Input
                  name="code"
                  required
                  className="col-span-2"
                  defaultValue={data?.data?.code}
                />
              </div>

              <div className="my-4">
                <Label className="text-xs" htmlFor="misaCode">
                  Mã Misa
                </Label>
                <Input
                  name="misaCode"
                  className="col-span-2"
                  defaultValue={data?.data?.misaCode}
                />
              </div>

              <div className="my-4">
                <Label className="text-xs" htmlFor="name">
                  Tên nhà cung cấp <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  name="name"
                  className="col-span-2"
                  rows={3}
                  defaultValue={data?.data?.name}
                />
              </div>

              <div className="my-4">
                <Label className="text-xs" htmlFor="currency">
                  Tiền tệ
                </Label>
                <Input
                  name="currency"
                  className="col-span-2"
                  defaultValue={data?.data?.currency}
                />
              </div>

              <div className="my-4">
                <Label className="text-xs" htmlFor="country">
                  Quốc gia
                </Label>
                <Input
                  name="country"
                  className="col-span-2"
                  defaultValue={data?.data?.country}
                />
              </div>

              <div className="my-4">
                <Label className="text-xs" htmlFor="phone">
                  Số điện thoại
                </Label>
                <Input
                  name="phone"
                  className="col-span-2"
                  defaultValue={data?.data?.phone}
                />
              </div>

              <div className="my-4">
                <Label className="text-xs" htmlFor="email">
                  Địa chỉ
                </Label>
                <Input
                  name="address"
                  className="col-span-2"
                  defaultValue={data?.data?.address}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="col-span-2 mt-4">
          <Card>
            <CardContent>
              <div className="mt-4">
                <DataTableDetail
                  listTools={
                    <CreateVendorBanks saveDetail={handleAddVendorAddress} />
                  }
                  data={listBanks
                    ?.map((item, index) => {
                      if (!item.isDeleted) {
                        return {
                          ...item,
                          deleteRow: () => handleDeleteVendorAddress(index),
                          updateRow: (val: IVendorBanksCreateRequest) =>
                            handleUpdateVendorAddress(index, val),
                        }
                      }

                      return null
                    })
                    .filter(
                      (item): item is NonNullable<typeof item> => item !== null,
                    )}
                  wrapperClassName="h-[calc(82vh-175px)] max-h-[calc(82vh-175px)]"
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
