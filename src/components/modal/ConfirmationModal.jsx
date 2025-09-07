import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  isDanger = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
          <AlertTriangle size={24} className={isDanger ? 'text-red-600' : 'text-blue-600'} />
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <div className="mt-6 flex gap-3 w-full">
          <Button onClick={onClose} variant="secondary" fullWidth>Cancel</Button>
          <Button onClick={onConfirm} variant={isDanger ? 'danger' : 'primary'} fullWidth>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}