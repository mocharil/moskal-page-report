"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CheckCircle, X, Mail, AlertCircle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const notificationVariants = cva(
  "fixed z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg border transition-all duration-500 transform",
  {
    variants: {
      variant: {
        success: "bg-gradient-to-r from-green-50 to-blue-50 border-green-200 text-green-800",
        error: "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800",
        info: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800",
      },
      position: {
        topRight: "top-4 right-4",
        topCenter: "top-4 left-1/2 -translate-x-1/2",
        bottomRight: "bottom-4 right-4",
        bottomCenter: "bottom-4 left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: {
      variant: "success",
      position: "topRight",
    },
  },
)

export interface NotificationProps extends VariantProps<typeof notificationVariants> {
  title: string
  message: string
  icon?: React.ReactNode
  duration?: number
  onClose?: () => void
}

export function Notification({
  title,
  message,
  icon,
  variant = "success",
  position = "topRight",
  duration = 5000,
  onClose,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, 500)
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        notificationVariants({ variant, position }),
        isExiting ? "opacity-0 translate-y-[-10px]" : "opacity-100 translate-y-0",
      )}
    >
      <div className="flex-shrink-0">
        {icon ||
          (variant === "success" ? (
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          ) : variant === "error" ? (
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          ) : (
            <div className="rounded-full bg-blue-100 p-2">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
          ))}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs opacity-90">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 rounded-full p-1 hover:bg-black/5 transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function NotificationSuccess({
  title = "Success!",
  message,
  position = "topRight",
  duration,
  onClose,
}: Omit<NotificationProps, "variant" | "icon"> & { title?: string }) {
  return (
    <Notification
      title={title}
      message={message}
      variant="success"
      position={position}
      duration={duration}
      onClose={onClose}
      icon={
        <div className="rounded-full bg-green-100 p-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
      }
    />
  )
}

export function NotificationError({
  title = "Error",
  message,
  position = "topRight",
  duration,
  onClose,
}: Omit<NotificationProps, "variant" | "icon"> & { title?: string }) {
  return (
    <Notification
      title={title}
      message={message}
      variant="error"
      position={position}
      duration={duration}
      onClose={onClose}
      icon={
        <div className="rounded-full bg-red-100 p-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
      }
    />
  )
}
