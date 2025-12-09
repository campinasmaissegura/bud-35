import * as React from "react"
import { cn } from "../../utils"

const AlertDialogContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null)

export const AlertDialog = ({ children, open, onOpenChange }: { children?: React.ReactNode, open: boolean, onOpenChange: (open: boolean) => void }) => {
  if (!open) return null;
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
         <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
           {children}
         </div>
      </div>
    </AlertDialogContext.Provider>
  )
}

export const AlertDialogContent = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={cn("grid gap-4", className)}>{children}</div>
)

export const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)

export const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)

export const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

export const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-slate-500", className)} {...props} />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-50 transition-colors hover:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props} />
))
AlertDialogAction.displayName = "AlertDialogAction"

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => {
  const context = React.useContext(AlertDialogContext);
  return (
    <button 
      ref={ref} 
      className={cn("mt-2 sm:mt-0 inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} 
      onClick={(e) => {
        props.onClick?.(e);
        context?.onOpenChange(false);
      }}
      {...props} 
    />
  )
})
AlertDialogCancel.displayName = "AlertDialogCancel"