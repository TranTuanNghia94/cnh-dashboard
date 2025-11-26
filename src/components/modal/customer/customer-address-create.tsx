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
import { useCallback, useState } from 'react'

type Props = {
    saveDetail: (data: IAddressRequestCreate) => void
}

const CreateCustomerAddress = ({ saveDetail }: Props) => {
  const [open, setOpen] = useState(false)
  const formId = 'createCustomerAddressForm'

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      const getValue = (key: keyof IAddressRequestCreate) =>
        formData.get(key)?.toString().trim() ?? ''

      const payload: IAddressRequestCreate = {
        contactPerson: getValue('contactPerson'),
        phone: getValue('phone'),
        email: getValue('email'),
        address: getValue('address'),
      }

      saveDetail(payload)
      event.currentTarget.reset()
      setOpen(false)
    },
    [saveDetail],
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Thêm địa chỉ</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="uppercase">Thêm địa chỉ</DialogTitle>
          <DialogDescription>
            Nhập thông tin liên hệ và địa chỉ mới cho khách hàng.
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
              placeholder="Nhập tên người liên hệ"
              maxLength={300}
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor={`${formId}-phone`}>Số điện thoại</Label>
            <Input
              id={`${formId}-phone`}
              name="phone"
              type="tel"
              placeholder="Nhập số điện thoại"
              maxLength={20}
            />
          </div>

          <div className="col-span-2 flex flex-col space-y-2">
            <Label htmlFor={`${formId}-email`}>Email</Label>
            <Input
              id={`${formId}-email`}
              name="email"
              type="email"
              placeholder="example@email.com"
              maxLength={200}
            />
          </div>

          <div className="col-span-2 flex flex-col space-y-2">
            <Label htmlFor={`${formId}-address`}>Địa chỉ</Label>
            <Textarea
              id={`${formId}-address`}
              name="address"
              placeholder="Nhập địa chỉ giao/nhận"
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

export default CreateCustomerAddress