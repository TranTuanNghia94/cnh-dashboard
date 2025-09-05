import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useGetAllRoles, useGetUserByUsername, useUpdateUser } from '@/hooks/use-user'
import { IRolesResponse, IUserRoles, IUserUpdateInput } from '@/types'
import { CheckedState } from '@radix-ui/react-checkbox'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_app/user/$aclUserId')({
    component: AclUserPage,
})

function AclUserPage() {
    const { aclUserId } = useParams({ strict: false })
    const { mutateAsync: getAllRoles, data: roles } = useGetAllRoles()
    const { mutateAsync: getUserByUsername, data: user } = useGetUserByUsername()
    const { mutateAsync: updateUser, isSuccess: isUpdateSuccess, data: updateUserResponse } = useUpdateUser()
    const { toast } = useToast()    

    const [acl, setAcl] = useState<{ [key: string]: IUserRoles } | undefined>(undefined)

    useEffect(() => {
        if (isUpdateSuccess) {
            toast({
                title: 'Thao tác thành công',
                description: 'Cập nhật thành công',
                variant: 'success',
              })
        }
    }, [isUpdateSuccess, updateUserResponse])

    useEffect(() => {
        getUserByUsername(aclUserId as string)

        if (!roles) {
            getAllRoles()
        }
    }, [])

    useEffect(() => {
        if (user?.results && user?.results?.[0]) {
            const userAcl = user.results[0].Assignment?.Roles
            const aclObj = userAcl?.reduce((acc, role) => {
                acc[role.name as string] = {
                    roles: role,
                    undoDefault: false,
                    default: true
                };
                return acc;
            }, {} as { [key: string]: IUserRoles })

            setAcl(aclObj)
        }
    }, [user])


    const handleChangeAcl = (e: CheckedState, role: IRolesResponse) => {
        console.log("e", e)

        const newUserAcl = { ...acl };

        newUserAcl[role.name as string] = {
            ...newUserAcl[role.name as string],
            roles: e ? role : newUserAcl[role.name as string]?.roles,
            undoDefault: !e
        };

        setAcl(newUserAcl);
    }

    const onSave = async () => {
        const connect: { id: string }[] = []
        const disconnect: { id: string }[] = []

        if (acl) {
            Object.values(acl).forEach(item => {
                if (!item.default && item.undoDefault === false) {
                    connect.push({ id: item.roles.id as string })
                } else if (item.default && item.undoDefault === true) {
                    disconnect.push({ id: item.roles.id as string })
                }
            })
        }

        const payload: IUserUpdateInput = {
            id: user?.results?.[0]?.id,
            Assignment: {
                update: {
                    Roles: {
                        connect,
                        disconnect
                    }
                }
            }
        }

        updateUser(payload)
    }

    return (
        <div>
            <HeaderPageLayout title='Gán quyền người dùng' buttonSubmit={<Button type="button" size="sm" onClick={onSave}>Lưu</Button>} />

            <div className='mt-4'>
                <Badge>{user?.results?.[0]?.email}</Badge>
            </div>

            <div className="mt-2">
                <Card>
                    <CardContent className='mt-4'>
                        {roles?.results?.map((role) => (
                            <div className='grid grid-cols-5 gap-4 items-center' key={role.id}>
                                <div className="col-span-2 text-sm">{role.name}</div>
                                <div className="col-span-2 text-sm">{role.description}</div>
                                <div className="text-center">
                                    <Checkbox onCheckedChange={(e) => handleChangeAcl(e, role)} checked={acl && acl[role.name as string]?.undoDefault === false} id={role?.name} />
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