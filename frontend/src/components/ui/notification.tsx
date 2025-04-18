
import * as React from "react"
import { Bell, X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const notificationVariants = cva(
  "relative flex items-center gap-2 w-full rounded-md border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success: "bg-green-50 text-green-900 border-green-200",
        warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
        error: "bg-red-50 text-red-900 border-red-200",
        info: "bg-blue-50 text-blue-900 border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title: string
  description?: string
  onClose?: () => void
  action?: React.ReactNode
  showIcon?: boolean
}

function Notification({
  className,
  variant,
  title,
  description,
  onClose,
  action,
  showIcon = true,
  ...props
}: NotificationProps) {
  return (
    <div className={cn(notificationVariants({ variant }), className)} {...props}>
      {showIcon && (
        <div className="shrink-0">
          <Bell className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      {action && <div>{action}</div>}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

interface NotificationModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  description: string
  action?: React.ReactNode
  cancelText?: string
  actionText?: string
  onAction?: () => void
}

function NotificationModal({
  open,
  setOpen,
  title,
  description,
  cancelText = "Close",
  actionText,
  onAction,
}: NotificationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          {actionText && onAction && (
            <AlertDialogAction onClick={onAction}>{actionText}</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Notification, NotificationModal }
