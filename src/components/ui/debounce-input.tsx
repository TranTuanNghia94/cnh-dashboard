import { Input } from './input'
import { Column } from '@tanstack/react-table'

type Props  = {
    column: Column<unknown, unknown>,
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>

const DebounceInput = ({column, ...props }: Props) => {
    const columnFilterValue = column.getFilterValue()

    return (
        <div>
            <Input {...props}  defaultValue={(columnFilterValue ?? '') as string} onChange={value =>  column.setFilterValue(value.target.value)}/>
        </div>
    )
}

export default DebounceInput