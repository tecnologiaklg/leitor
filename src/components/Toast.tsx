import React, { useState, useEffect, useCallback } from 'react'

interface ToastMessage {
  id: string
  text: string
  type: 'success' | 'error' | 'info'
  icon: string
  exiting?: boolean
}

let addToastExternal: ((text: string, type: 'success' | 'error' | 'info', icon?: string) => void) | null = null

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'success', icon?: string) {
  if (addToastExternal) {
    addToastExternal(text, type, icon)
  }
}

const Toast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info', icon?: string) => {
    const defaultIcons = { success: '✅', error: '❌', info: 'ℹ️' }
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const newToast: ToastMessage = {
      id,
      text,
      type,
      icon: icon || defaultIcons[type],
    }

    setToasts((prev) => [newToast, ...prev.slice(0, 2)])

    // Start exit animation after 2.5s
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      )
    }, 2500)

    // Remove after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  useEffect(() => {
    addToastExternal = addToast
    return () => {
      addToastExternal = null
    }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}${toast.exiting ? ' toast--exit' : ''}`}
        >
          <span className="toast__icon">{toast.icon}</span>
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  )
}

export default Toast
