import HeaderPageLayout from '@/components/layout/HeaderPage'
import CreateCustomerAddress from '@/components/modal/customer/customer-address-create'
import { CustomerAddressColumns, ICustomerAddressExtends } from '@/components/table/customer/column-customer-address'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useDeleteAddress, useGetAddressByCustomerId, useGetCustomerByCode, useUpdateAddress, useUpdateCustomer } from '@/hooks/use-customer'
import { useToast } from '@/hooks/use-toast'
import { ICustomerAddressInput, ICustomerInput } from '@/types/customer'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import moment from 'moment'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_app/customer/$customerId')({
    component: UpdateCustomerPage
})


function UpdateCustomerPage() {
    const { toast } = useToast()
    // const { history } = useRouter()
    const { customerId } = useParams({ strict: false })

    const { mutateAsync, data, isSuccess } = useGetCustomerByCode()
    const { mutateAsync: getAddress, data: dataAddress, isSuccess: isSuccessAddress } = useGetAddressByCustomerId()
    const { mutateAsync: updateCustomer, data: dataUpdate, isSuccess: isSuccessUpdate } = useUpdateCustomer()
    const { mutateAsync: updateAddress } = useUpdateAddress()
    const { mutateAsync: deleteAddress } = useDeleteAddress()
    const [listAddress, setListAddress] = useState<ICustomerAddressInput[]>([])
    const [customerData, setCustomerData] = useState<ICustomerInput>({
        id: data?.results ? data.results[0].id : '',
        maKhachHang: data?.results ? data.results[0].maKhachHang : '',
        tenKhachHang: data?.results ? data.results[0].tenKhachHang : '',
        misaCode: data?.results ? data.results[0].misaCode : '',
        deletedAt: null,
        updatedAt: null
    })

    useEffect(() => {
        if (customerId) {
            mutateAsync(customerId)
        }
    }, [])

    useEffect(() => {
        if (isSuccess && data?.results) {
            getAddress(data.results[0].id as string)
            setCustomerData({
                id: data?.results ? data.results[0].id : '',
                maKhachHang: data?.results ? data.results[0].maKhachHang : '',
                tenKhachHang: data?.results ? data.results[0].tenKhachHang : '',
                misaCode: data?.results ? data.results[0].misaCode : '',
                deletedAt: null,
                updatedAt: null
            })
        }
    }, [isSuccess, data])


    useEffect(() => {
        if (isSuccessAddress && dataAddress?.results) {
            const listAddress = dataAddress.results.map((item) => {
                return {
                    id: item.id,
                    tenNguoiLienHe: item?.tenNguoiLienHe,
                    soDienThoai: item?.soDienThoai,
                    email: item?.email,
                    soNhaTenDuong_1: item?.soNhaTenDuong_1,
                    createdAt: item?.createdAt,
                    updatedAt: null,
                    deletedAt: null
                } as ICustomerAddressInput
            })

            setListAddress(listAddress)
        }
    }, [isSuccessAddress, dataAddress])


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


    const handleAddCustomerAddress = (data: ICustomerAddressInput) => {
        setListAddress([...listAddress, data])
    }

    const handleDeleteCustomerAddress = (index: number) => {
        const item = listAddress[index]

        if (item.id) {
            item.deletedAt = moment().toISOString()
            item.updatedAt = moment().toISOString()

            setListAddress([...listAddress])
        } else {
            const newList = [...listAddress]
            newList.splice(index, 1)
            setListAddress(newList)
        }
    }

    const handleUpdateCustomerAddress = (index: number, data: ICustomerAddressInput) => {
        const newList = [...listAddress]
        newList[index] = {
            ...newList[index],
            ...data,
            updatedAt: new Date()
        }
        setListAddress(newList)

    }

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        event.preventDefault()

        setCustomerData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const listCreate = listAddress.filter((item) => {
            return !item.id
        })

        customerData.LienHe_s = {
            create: listCreate
        }

        updateCustomer(customerData)

        listAddress.forEach((item) => {
            if (item.id !== '' && item.updatedAt !== '' && item.deletedAt === null) {
                updateAddress(item)
            } else if (item.id !== '' && item.deletedAt !== null) {
                deleteAddress(item.id as string)
            }
        })
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
                            <div className="grid grid-cols-3 mt-4">
                                <Label className="text-xs" htmlFor="maKhachHang">Mã khách hàng <span className="text-red-600">*</span></Label>
                                <Input onChange={handleChange} value={customerData?.maKhachHang} name="maKhachHang" required className="col-span-2" />
                            </div>

                            <div className="grid grid-cols-3 my-4">
                                <Label className="text-xs" htmlFor="misaCode">Mã Misa</Label>
                                <Input onChange={handleChange} value={customerData?.misaCode as string} name="misaCode" className="col-span-2" />
                            </div>

                            <div className="grid grid-cols-3">
                                <Label className="text-xs" htmlFor="tenKhachHang">Tên khách hàng</Label>
                                <Textarea onChange={handleChange} value={customerData?.tenKhachHang} name="tenKhachHang" className="col-span-2" rows={4} />
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
                                        if (item.deletedAt === null) {
                                            return {
                                                ...item,
                                                deleteRow: () => handleDeleteCustomerAddress(index),
                                                updateRow: (val: ICustomerAddressInput) => handleUpdateCustomerAddress(index, val)
                                            }
                                        }
                                    }) as ICustomerAddressExtends[] || []}
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