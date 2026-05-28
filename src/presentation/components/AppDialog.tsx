import React from 'react';

interface AppDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger' | 'swim';
  onConfirm: () => void;
  onCancel?: () => void;
}

export const AppDialog: React.FC<AppDialogProps> = ({
  title,
  message,
  confirmLabel = 'Aceptar',
  cancelLabel,
  tone = 'default',
  onConfirm,
  onCancel,
}) => (
  <div className="dialog-backdrop" role="presentation">
    <div className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="app-dialog-title">
      <h2 id="app-dialog-title" className="dialog-title">
        {title}
      </h2>
      <p className="dialog-message">{message}</p>
      <div className="dialog-actions">
        {cancelLabel && onCancel && (
          <button className="dialog-button secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
        <button className={`dialog-button primary ${tone}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
