import React, { useState } from 'react'
import { Calendar } from './calendar'
import { Popover, PopoverContent } from './popover'
import { PopoverTrigger } from './popover'
import { Button } from './button'
import moment from 'moment'
import { ChevronDownIcon } from 'lucide-react'

type Props = {
    date: Date | undefined
    setDate: (date: Date | undefined) => void,
    placeholder: string
}

const CalendarPicker = (props: Props) => {
    const [open, setOpen] = useState(false)
    const { date, setDate, placeholder } = props

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    id="date"
                    className="w-full justify-between font-normal"
                >
                    {date ? moment(date).format("DD/MM/YYYY") : placeholder}
                    <ChevronDownIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar mode="single" selected={date} captionLayout="dropdown" onSelect={(date) => { setDate(date); setOpen(false) }} />
            </PopoverContent>
        </Popover>
    )
}

export default CalendarPicker;