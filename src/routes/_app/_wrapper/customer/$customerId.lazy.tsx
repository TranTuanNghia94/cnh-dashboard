import HeaderPageLayout from '@/components/layout/HeaderPage'
import CreateCustomerAddress from '@/components/modal/customer/customer-address-create'
import { CustomerAddressColumns } from '@/components/table/customer/column-customer-address'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useGetAddressByCustomerId,
  useGetCustomerById,
  useUpdateCustomer,
} from '@/hooks/use-customer'
import { useToast } from '@/hooks/use-toast'
import { IAddressRequestCreate } from '@/types/address'
import { ICustomerRequestUpdate } from '@/types/customer'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/customer/$customerId')(
  {
    component: UpdateCustomerPage,
  },
)

type CustomerFormDefaults = Partial<
  Pick<
    ICustomerRequestUpdate,
    'code' | 'name' | 'email' | 'phone' | 'taxCode' | 'misaCode'
  >
>

function UpdateCustomerPage() {
  const { toast } = useToast()
  const { customerId } = useParams({ strict: false })

  const { mutateAsync: fetchCustomer, data: customerResponse } =
    useGetCustomerById()
  const { mutateAsync: fetchCustomerAddresses, data: customerAddresses } =
    useGetAddressByCustomerId()
  const {
    mutateAsync: updateCustomerMutation,
    data: dataUpdate,
    isSuccess: isSuccessUpdate,
  } = useUpdateCustomer()
  const [addresses, setAddresses] = useState<IAddressRequestCreate[]>([])
  const customerDetail = customerResponse?.data
  const formId = 'formUpdateCustomer'

  useEffect(() => {
    if (!customerId) {
      return
    }

    void fetchCustomer(customerId)
    void fetchCustomerAddresses(customerId)
  }, [customerId, fetchCustomer, fetchCustomerAddresses])

  useEffect(() => {
    if (isSuccessUpdate && dataUpdate) {
      toast({
        title: 'Thao tác thành công',
        description: 'Cập nhật thành công',
        variant: 'success',
      })
      // history.go(-1)
    }
  }, [dataUpdate, isSuccessUpdate, toast])

  useEffect(() => {
    if (!customerAddresses?.data) {
      return
    }

    setAddresses(
      customerAddresses.data.map((item) => ({
        ...item,
        isDeleted: item.isDeleted,
      })),
    )
  }, [customerAddresses])

  const handleAddCustomerAddress = useCallback(
    (data: IAddressRequestCreate) => {
      setAddresses((prev) => [...prev, data])
    },
    [],
  )

  const handleDeleteCustomerAddress = useCallback((index: number) => {
    setAddresses((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index ? { ...item, isDeleted: true } : item,
      ),
    )
  }, [])

  const handleUpdateCustomerAddress = useCallback(
    (index: number, data: IAddressRequestCreate) => {
      setAddresses((prev) =>
        prev.map((item, currentIndex) =>
          currentIndex === index ? data : item,
        ),
      )
    },
    [],
  )

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!customerDetail?.id) {
        toast({
          title: 'Không tìm thấy khách hàng',
          description: 'Vui lòng tải lại trang và thử lại.',
          variant: 'destructive',
        })
        return
      }

      const formData = new FormData(event.currentTarget)
      const getValue = (key: string) =>
        formData.get(key)?.toString().trim() ?? ''

      const payload: ICustomerRequestUpdate = {
        id: customerDetail.id,
        code: getValue('code'),
        name: getValue('name'),
        email: getValue('email'),
        phone: getValue('phone'),
        taxCode: getValue('taxCode'),
        misaCode: getValue('misaCode'),
        addresses,
      }

      void updateCustomerMutation(payload)
    },
    [addresses, customerDetail?.id, toast, updateCustomerMutation],
  )

  const formDefaultValues = useMemo<CustomerFormDefaults>(
    () => ({
      code: customerDetail?.code ?? '',
      misaCode: customerDetail?.misaCode ?? '',
      name: customerDetail?.name ?? '',
      email: customerDetail?.email ?? '',
      phone: customerDetail?.phone ?? '',
      taxCode: customerDetail?.taxCode ?? '',
    }),
    [customerDetail],
  )

  const headerTitle = customerDetail?.name
    ? `Cập nhật ${customerDetail.name}`
    : 'Cập nhật khách hàng'

  return (
    <div>
      <HeaderPageLayout title={headerTitle} idForm={formId} />

      <div className="grid grid-cols-3 gap-x-4">
        <CustomerInfoForm
          formId={formId}
          defaultValues={formDefaultValues}
          onSubmit={handleSubmit}
        />

        <div className="col-span-2 mt-4">
          <CustomerAddressTable
            addresses={addresses}
            onAdd={handleAddCustomerAddress}
            onDelete={handleDeleteCustomerAddress}
            onUpdate={handleUpdateCustomerAddress}
          />
        </div>
      </div>
    </div>
  )
}

type CustomerInfoFormProps = {
  formId: string
  defaultValues: CustomerFormDefaults
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

const CustomerInfoForm = ({
  formId,
  defaultValues,
  onSubmit,
}: CustomerInfoFormProps) => (
  <Card className="mt-4">
    <CardHeader>
      <CardTitle className="uppercase">Thông tin chung</CardTitle>
    </CardHeader>
    <CardContent>
      <form id={formId} onSubmit={onSubmit}>
        <div>
          <Label className="text-xs" htmlFor="code">
            Mã khách hàng <span className="text-red-600">*</span>
          </Label>
          <Input
            id="code"
            name="code"
            required
            className="col-span-2"
            defaultValue={defaultValues.code}
          />
        </div>

        <div className="my-4">
          <Label className="text-xs" htmlFor="misaCode">
            Mã Misa
          </Label>
          <Input
            id="misaCode"
            name="misaCode"
            className="col-span-2"
            defaultValue={defaultValues.misaCode}
          />
        </div>

        <div className="my-4">
          <Label className="text-xs" htmlFor="name">
            Tên khách hàng <span className="text-red-600">*</span>
          </Label>
          <Textarea
            id="name"
            name="name"
            className="col-span-2"
            rows={4}
            defaultValue={defaultValues.name}
          />
        </div>

        <div className="my-4">
          <Label className="text-xs" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            className="col-span-2"
            defaultValue={defaultValues.email}
          />
        </div>

        <div className="my-4">
          <Label className="text-xs" htmlFor="phone">
            Số điện thoại
          </Label>
          <Input
            id="phone"
            name="phone"
            className="col-span-2"
            defaultValue={defaultValues.phone}
          />
        </div>

        <div className="my-4">
          <Label className="text-xs" htmlFor="taxCode">
            Mã số thuế
          </Label>
          <Input
            id="taxCode"
            name="taxCode"
            className="col-span-2"
            defaultValue={defaultValues.taxCode}
          />
        </div>
      </form>
    </CardContent>
  </Card>
)

type CustomerAddressTableProps = {
  addresses: IAddressRequestCreate[]
  onAdd: (data: IAddressRequestCreate) => void
  onDelete: (index: number) => void
  onUpdate: (index: number, data: IAddressRequestCreate) => void
}

const CustomerAddressTable = ({
  addresses,
  onAdd,
  onDelete,
  onUpdate,
}: CustomerAddressTableProps) => {
  const tableData = useMemo(
    () =>
      addresses
        .map((item, index) => {
          if (item.isDeleted) {
            return null
          }

          return {
            ...item,
            deleteRow: () => onDelete(index),
            updateRow: (val: IAddressRequestCreate) => onUpdate(index, val),
          }
        })
        .filter(
          (item): item is NonNullable<typeof item> => item !== null,
        ),
    [addresses, onDelete, onUpdate],
  )

  return (
    <Card>
      <CardContent>
        <div className="mt-4">
          <DataTableDetail
            listTools={<CreateCustomerAddress saveDetail={onAdd} />}
            data={tableData}
            columns={CustomerAddressColumns}
            wrapperClassName="h-[calc(82vh-175px)] max-h-[calc(82vh-175px)]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
