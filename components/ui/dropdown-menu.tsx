import * as React from "react"
import { cn } from "../../utils"

const DropdownContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void }>({ open: false, setOpen: () => {} })

export const DropdownMenu = ({ children }: { children?: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export const DropdownMenuTrigger = ({ children, asChild }: { children?: React.ReactNode, asChild?: boolean }) => {
  const { open, setOpen } = React.useContext(DropdownContext)
  
  if (!React.isValidElement(children)) {
    return null;
  }

  return React.cloneElement(children as React.ReactElement<any>, {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setOpen(!open)
      ;(children as React.ReactElement<any>).props.onClick?.(e)
    },
    'aria-expanded': open
  })
}

export const DropdownMenuContent = ({ children, align = "center", className }: { children?: React.ReactNode, align?: "start" | "end" | "center", className?: string }) => {
  const { open } = React.useContext(DropdownContext)
  if (!open) return null
  
  const alignmentClass = align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2"

  return (
    <div className={cn(
      "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
      alignmentClass,
      className
    )}>
      {children}
    </div>
  )
}

export const DropdownMenuItem = ({ children, className, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { setOpen } = React.useContext(DropdownContext)
  return (
    <button
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
}