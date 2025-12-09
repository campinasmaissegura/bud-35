import * as React from "react"
import { cn } from "../../utils"
import { ChevronDown, Check } from "lucide-react"

const SelectContext = React.createContext<any>(null)

export const Select = ({ children, value, onValueChange }: any) => {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value)

  React.useEffect(() => {
    setSelectedValue(value)
  }, [value])

  const handleSelect = (val: string) => {
    setSelectedValue(val)
    onValueChange?.(val)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ open, setOpen, value: selectedValue, handleSelect }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = ({ children, className }: any) => {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export const SelectValue = ({ placeholder }: any) => {
  const { value } = React.useContext(SelectContext)
  return <span className="block truncate">{value || placeholder}</span>
}

export const SelectContent = ({ children, className }: any) => {
  const { open } = React.useContext(SelectContext)
  if (!open) return null
  return (
    <div className={cn(
      "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 text-slate-950 shadow-md animate-in fade-in-80",
      className
    )}>
      {children}
    </div>
  )
}

export const SelectItem = ({ children, value, className }: any) => {
  const { handleSelect, value: selectedValue } = React.useContext(SelectContext)
  return (
    <div
      onClick={() => handleSelect(value)}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selectedValue === value && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}