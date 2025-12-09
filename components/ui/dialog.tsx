import * as React from "react"
import { cn } from "../../utils"
import { X } from "lucide-react"

const DialogContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null)

export const Dialog = ({ children, open, onOpenChange }: { children?: React.ReactNode, open: boolean, onOpenChange: (open: boolean) => void }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
           {children}
        </div>
      )}
    </DialogContext.Provider>
  )
}

export const DialogContent = ({ children, className }: { children?: React.ReactNode, className?: string }) => {
  const context = React.useContext(DialogContext)
  return (
    <div className={cn("relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg", className)}>
        <button 
            onClick={() => context?.onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500"
        >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </button>
        {children}
    </div>
  )
}

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)} {...props} />
)

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
DialogTitle.displayName = "DialogTitle"

export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-slate-500", className)} {...props} />
))
DialogDescription.displayName = "DialogDescription"

export const DialogTrigger = ({ children }: { children?: React.ReactNode }) => <>{children}</>