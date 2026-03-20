import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmationDialog({
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  variant = 'default',
  children
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'border-2 border-red-600 bg-red-50';
      case 'warning':
        return 'border-2 border-yellow-600 bg-yellow-50';
      default:
        return 'border-2 border-blue-600 bg-blue-50';
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-md ${getVariantStyles()}`}>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 font-bold text-xl leading-none ml-2"
            aria-label="Close"
          >
            ×
          </button>
        </CardHeader>
        <CardContent>
          {children && <div className="mb-6">{children}</div>}
          <div className="flex gap-3">
            <Button
              variant={getButtonVariant()}
              onClick={onConfirm}
              className="flex-1"
            >
              {confirmText}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {cancelText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}