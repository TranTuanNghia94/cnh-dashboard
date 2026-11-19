import { useRouter } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";


export interface HeaderPageLayoutProps {
    title: string
    idForm?: string
    buttonSubmit?: React.ReactNode
    otherButton?: React.ReactNode
    /** Prefer explicit list route over browser history back. */
    exitTo?: string
}

const HeaderPageLayout = ({ title, idForm, buttonSubmit, otherButton, exitTo }: HeaderPageLayoutProps) => {
    const { history, navigate } = useRouter()

    const handleExit = () => {
        if (exitTo) {
            void navigate({ to: exitTo as never })
            return
        }
        if (typeof window !== "undefined" && window.history.length > 1) {
            history.go(-1)
            return
        }
        void navigate({ to: "/home" })
    }

    return (
        <div className="flex items-center justify-between space-x-4">
            <div className="uppercase font-bold tracking-tight">{title}</div>

            <div className="flex gap-x-4">
                {buttonSubmit === undefined ? (
                    <Button type="submit" form={idForm} size="sm">Lưu</Button>
                ) : (
                    buttonSubmit
                )}
                {otherButton}
                <Separator orientation="vertical" className="h-7 bg-primary" />
                <Button type="button" size="sm" variant="secondary" onClick={handleExit}>Thoát</Button>
            </div>
        </div>
    )
}

export default HeaderPageLayout;
