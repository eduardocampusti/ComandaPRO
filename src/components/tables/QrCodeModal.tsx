import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/AppPrimitives';
import { TableData } from '../../lib/database';

interface QrCodeModalProps {
  table: TableData | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: (url: string, id: string) => void;
  getOrderUrl: (id: string) => string;
}

export function QrCodeModal({ 
  table, 
  isOpen, 
  onClose, 
  onCopyLink,
  getOrderUrl
}: QrCodeModalProps) {
  if (!table) return null;

  const url = getOrderUrl(table.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`QR Code Mesa ${String(table.number).padStart(2, '0')}`}
      size="sm"
    >
      <div className="flex flex-col items-center text-center">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl mb-8 inline-block border border-slate-100 dark:border-slate-800 shadow-inner">
          <QRCodeSVG 
            value={url} 
            size={200} 
            level="H"
            includeMargin={false}
            className="dark:bg-white dark:p-2 dark:rounded-lg"
          />
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 px-4 font-medium">
          Aponte a câmera do celular para abrir o cardápio digital desta mesa.
        </p>

        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            variant="secondary"
            onClick={() => onCopyLink(url, table.id)}
            className="font-bold"
          >
            Copiar Link
          </Button>
          <Button
            onClick={onClose}
            className="font-bold"
          >
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
