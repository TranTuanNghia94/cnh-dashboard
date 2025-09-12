import HeaderPageLayout from '@/components/layout/HeaderPage'
import CreateCustomerAddress from '@/components/modal/customer/customer-address-create'
import { CustomerAddressColumns } from '@/components/table/customer/column-customer-address'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useGetAddressByCustomerId, useGetCustomerById, useUpdateCustomer } from '@/hooks/use-customer'
import { useToast } from '@/hooks/use-toast'
import { IAddressRequestCreate } from '@/types/address'
import { ICustomerRequestUpdate } from '@/types/customer'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_app/customer/$customerId')({
    component: UpdateCustomerPage
})


function UpdateCustomerPage() {
    const { toast } = useToast()
    // const { history } = useRouter()
    const { customerId } = useParams({ strict: false })

    const { mutateAsync, data: customer } = useGetCustomerById()
    const { mutateAsync: getAddress, data: dataAddress} = useGetAddressByCustomerId()
    const { mutateAsync: updateCustomer, data: dataUpdate, isSuccess: isSuccessUpdate } = useUpdateCustomer()
    const [listAddress, setListAddress] = useState<IAddressRequestCreate[]>([])


    useEffect(() => {
        if (customerId) {
            mutateAsync(customerId)
            getAddress(customerId)
        }
    }, [])

    useEffect(() => {
        if (isSuccessUpdate && dataUpdate) {
            toast({
                title: 'Thao tác thành công',
                description: 'Cập nhật thành công',
                variant: 'success',
            })
            // history.go(-1)
        }
    }, [isSuccessUpdate, dataUpdate])

    useEffect(() => {
        if (dataAddress) {
            setListAddress(dataAddress.data.map((item) => { return {
                ...item,
                id: item.id,
                address: item.address,
                contactPerson: item.contactPerson,
                phone: item.phone,
                email: item.email,
                customerId: item.customerId,
                isDeleted: item.isDeleted,
            } }))
        }
    }, [dataAddress])

    const handleAddCustomerAddress = (data: IAddressRequestCreate) => {
        setListAddress([...listAddress, data])
    }

    const handleDeleteCustomerAddress = (index: number) => {
        const newList = [...listAddress]
        newList[index].isDeleted = true
        setListAddress(newList)
    }

    const handleUpdateCustomerAddress = (index: number, data: IAddressRequestCreate) => {
        const newList = [...listAddress]
        newList[index] = data
        setListAddress(newList)

    }


    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const data = new FormData(e.currentTarget)

        const customerData: ICustomerRequestUpdate = {
            id: customer?.data?.id as string,
            code: data.get('code')?.toString().trim() as string,
            name: data.get('name')?.toString().trim() as string,
            email: data.get('email')?.toString().trim() as string,
            phone: data.get('phone')?.toString().trim() as string,
            taxCode: data.get('taxCode')?.toString().trim() as string,
            misaCode: data.get('misaCode')?.toString().trim() as string,
            addresses: listAddress,
        }

        updateCustomer(customerData)
    }

    return (
        <div>
            <HeaderPageLayout title="Thêm khách hàng" idForm="formCreateCustomer" />

            <div className="grid grid-cols-3 gap-x-4">
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="uppercase">Thông tin chung</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form id="formCreateCustomer" onSubmit={onSubmit} >
                            <div>
                                <Label className="text-xs" htmlFor="code">Mã khách hàng <span className="text-red-600">*</span></Label>
                                <Input name="code" required className="col-span-2" defaultValue={customer?.data?.code} />
                            </div>

                            <div className="my-4">
                                <Label className="text-xs" htmlFor="misaCode">Mã Misa</Label>
                                <Input name="misaCode" className="col-span-2" defaultValue={customer?.data?.misaCode} />
                            </div>

                            <div className="my-4">
                                <Label className="text-xs" htmlFor="name">Tên khách hàng <span className="text-red-600">*</span></Label>
                                <Textarea name="name" className="col-span-2" rows={4} defaultValue={customer?.data?.name} />
                            </div>

                            <div className="my-4">
                                <Label className="text-xs" htmlFor="name">Email</Label>
                                <Input name="email" className="col-span-2" defaultValue={customer?.data?.email} />
                            </div>
                        </form>
                    </CardContent>
                </Card>


                <div className="col-span-2 mt-4">
                    <Card>
                        <CardContent>
                            <div className="mt-4">
                                <DataTableDetail listTools={<CreateCustomerAddress saveDetail={handleAddCustomerAddress} />}
                                    data={listAddress.map((item, index) => {
                                        return {
                                            ...item,
                                            deleteRow: () => handleDeleteCustomerAddress(index),
                                            updateRow: (val: IAddressRequestCreate) => handleUpdateCustomerAddress(index, val)
                                        }
                                    })}
                                    columns={CustomerAddressColumns}
                                    wrapperClassName='h-[calc(82vh-175px)] max-h-[calc(82vh-175px)]'
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )

}