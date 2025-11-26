import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { IAddressRequestCreate } from '@/types/address'
import { useCallback, useEffect, useMemo, useState } from 'react'

type Props = {
  saveDetail: (data: IAddressRequestCreate) => void
  data: IAddressRequestCreate
}

const UpdateCustomerAddress = ({ saveDetail, data }: Props) => {
  const [open, setOpen] = useState(false)
  const [formValues, setFormValues] = useState<IAddressRequestCreate>(data)
  const formId = useMemo(
    () => `updateCustomerAddressForm-${data.id ?? 'new'}`,
    [data.id],
  )

  useEffect(() => {
    setFormValues(data)
  }, [data])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    [],
  )

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      saveDetail({ ...formValues, id: data.id })
      setOpen(false)
    },
    [data.id, formValues, saveDetail],
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="relative w-full flex select-none items-center rounded-sm px-2 py-1.5 text-sm text-blue-600 transition-colors hover:bg-gray-100 focus:bg-accent focus:text-accent-foreground"
        >
          Sửa
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="uppercase">Sửa địa chỉ</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin liên hệ và địa chỉ cụ thể cho khách hàng.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >
          <div className="flex flex-col space-y-2">
            <Label htmlFor={`${formId}-contactPerson`}>
              Người liên hệ <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${formId}-contactPerson`}
              name="contactPerson"
              value={formValues.contactPerson ?? ''}
              onChange={handleChange}
              maxLength={300}
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor={`${formId}-phone`}>Số điện thoại</Label>
            <Input
              id={`${formId}-phone`}
              name="phone"
              value={formValues.phone ?? ''}
              onChange={handleChange}
              type="tel"
              maxLength={20}
            />
          </div>

          <div className="flex flex-col space-y-2 col-span-2">
            <Label htmlFor={`${formId}-email`}>Email</Label>
            <Input
              id={`${formId}-email`}
              name="email"
              value={formValues.email ?? ''}
              onChange={handleChange}
              type="email"
              maxLength={200}
            />
          </div>

          <div className="col-span-2 flex flex-col space-y-2">
            <Label htmlFor={`${formId}-address`}>Địa chỉ</Label>
            <Textarea
              id={`${formId}-address`}
              name="address"
              value={formValues.address ?? ''}
              onChange={handleChange}
              maxLength={500}
              rows={4}
            />
          </div>
        </form>

        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="secondary">Đóng</Button>
          </DialogClose>
          <Button type="submit" form={formId}>
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateCustomerAddress