import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useGetAllRoles, useGetUserById } from '@/hooks/use-user'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/_app/user/$aclUserId')({
    component: AclUserPage,
})

function AclUserPage() {
    const { aclUserId } = useParams({ strict: false })
    const { mutateAsync: getAllRoles, data: roles } = useGetAllRoles()
    const { mutateAsync: getUserById, data: user } = useGetUserById()
    // const { mutateAsync: updateUser, isSuccess: isUpdateSuccess, data: updateUserResponse } = useUpdateUser()
  

    // const [acl, setAcl] = useState<{ [key: string]: IUserRoles } | undefined>(undefined)


    useEffect(() => {
        getUserById(aclUserId as string)

        if (!roles) {
            getAllRoles()
        }
    }, [])

    useEffect(() => {
        if (user?.data) {
            const userAcl = user.data.roles
            
            console.log("userAcl", userAcl)
            // setAcl(userAcl)
        }
    }, [user])



    const onSave = async () => {
    

    }

    return (
        <div>
            <HeaderPageLayout title='Gán quyền người dùng' buttonSubmit={<Button type="button" size="sm" onClick={onSave}>Lưu</Button>} />

            <div className='mt-4'>
                <Badge>{user?.data?.username}</Badge>
            </div>

            <div className="mt-2">
                <Card>
                    <CardContent className='mt-4'>

                        <div className='grid grid-cols-5 gap-4 items-center'>
                            <div className="col-span-2 text-sm">Chức vụ</div>
                            <div className="col-span-2 text-sm">Mô tả</div>
                            <div className="text-center">
                                <Checkbox  />
                            </div>

                            <div className='col-span-5 mb-2'>
                                <Separator />
                            </div>
                        </div>
                        {roles?.data?.data?.map((role) => (
                            <div className='grid grid-cols-5 gap-4 items-center' key={role.id}>
                                <div className="col-span-2 text-sm">{role.name}</div>
                                <div className="col-span-2 text-sm">{role.description}</div>
                                <div className="text-center">
                                    <Checkbox  />
                                </div>

                                <div className='col-span-5 mb-2'>
                                    <Separator />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}