import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Card } from '@/components/ui/card'
 // import { Input } from '@/components/ui/input'
 // import { Label } from '@/components/ui/label'
 // import { useToast } from '@/hooks/use-toast'
 // import { useUpdateUser } from '@/hooks/use-user'
 // import { IUserUpdateInput } from '@/types'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_app/user/edit/$userId')({
  component: UserEditPage,
})

function UserEditPage() {
  //   const { userId } = useParams({ strict: false })
  //  // const { mutateAsync: getUserByUsername, data: user } = useGetUserByUsername()
  //  // const { mutateAsync: updateUser, isSuccess: isUpdateSuccess, data: updateUserResponse } = useUpdateUser()
  //   const { toast } = useToast()


  //   const [userData, setUserData] = useState<IUserUpdateInput | undefined>(undefined)

  //   useEffect(() => {
  //    // getUserByUsername(userId as string)
  //   }, [])


  //   useEffect(() => {
  //     if (user?.data) {
  //       setUserData({
  //         id: user?.results[0].id,
  //         lastname: user?.results[0].lastname,
  //         firstname: user?.results[0].firstname,
  //         phongBan: user?.results[0].phongBan,
  //         email: user?.results[0].email,
  //       })
  //     }
  //   }, [user])

  //   useEffect(() => {
  //     if (isUpdateSuccess) {
  //       toast({
  //         title: 'Thao tác thành công',
  //         description: 'Cập nhật thành công',
  //         variant: 'success',
  //       })
  //     }
  //   }, [isUpdateSuccess, updateUserResponse])

  //   const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const { name, value } = e.target
  //     setUserData({ ...userData, [name]: value })
  //   }


  //   const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault()

  //     await updateUser(userData as IUserUpdateInput)
  //   }

  return (
    <div>
      <HeaderPageLayout title="Cập nhật tài khoản" idForm="formEditUser" />

      <div className='mt-4'>
        <Card>
          {/* <CardContent className="m-4">
            <form id="formEditUser" className="grid grid-cols-1 gap-8" onSubmit={onSubmit} >
              <div>
                <Label className="text-xs" htmlFor="lastname">Họ</Label>
                <Input onChange={onChange} value={userData?.lastname as string ?? ''} name="lastname" maxLength={200} className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="firstname">Tên</Label>
                <Input onChange={onChange} value={userData?.firstname as string ?? ''} name="firstname" required maxLength={200} className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="phongBan">Phòng ban</Label>
                <Input onChange={onChange} value={userData?.phongBan as string ?? ''} name="phongBan" maxLength={200} className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="email">Email</Label>
                <Input disabled value={userData?.email as string ?? ''} type="email" name="email" maxLength={200} required className="col-span-2" />
              </div>
            </form>
          </CardContent> */}
        </Card>
      </div>
    </div>
  )
}
