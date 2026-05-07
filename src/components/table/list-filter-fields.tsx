import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ReactNode } from 'react'

interface FilterTextFieldProps {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export function FilterTextField({ label, value, placeholder, onChange }: FilterTextFieldProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <Label className="mb-2 block text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm"
      />
    </div>
  )
}

interface FilterFieldGroupProps {
  label: string
  children: ReactNode
}

export function FilterFieldGroup({ label, children }: FilterFieldGroupProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <Label className="mb-2 block text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

interface FilterSelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}

export function FilterSelectField({ label, value, onChange, options }: FilterSelectFieldProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <Label className="mb-2 block text-xs font-medium text-muted-foreground">{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((option) => (
          <option key={option.value || '__empty'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
