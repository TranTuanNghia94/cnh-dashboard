import { useRouter } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";


export interface HeaderPageLayoutProps {
    title: string
    idForm?: string
    buttonSubmit?: React.ReactNode
    otherButton?: React.ReactNode
}

const HeaderPageLayout = ({ title, idForm, buttonSubmit, otherButton }: HeaderPageLayoutProps) => {
    const { history } = useRouter()

    return (
        <div className="flex items-center justify-between space-x-4">
            <div className="uppercase font-bold tracking-tight">{title}</div>

            <div className="flex gap-x-4">
                {
                    buttonSubmit ?? <Button type="submit" form={idForm} size="sm">Lưu</Button>
                }
                {otherButton}
                <Separator orientation="vertical" className="h-7 bg-primary" />
                <Button type="button" size="sm" variant="secondary" onClick={() => history.go(-1)}>Thoát</Button>
            </div>
        </div>
    )
}

export default HeaderPageLayout;