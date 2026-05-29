import React from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  icon?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  icon = '⚠️',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__icon">{icon}</div>
        <h3 className="dialog__title">{title}</h3>
        <p className="dialog__message">{message}</p>
        <div className="btn-group">
          <button className="btn btn--outline btn--sm" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn--danger btn--sm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
