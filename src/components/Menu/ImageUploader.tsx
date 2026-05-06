
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button, cx } from '../ui/AppPrimitives';
import { uploadImage } from '../../lib/database';
import { compressImage } from '../../lib/image-utils';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  variant?: 'default' | 'premium';
}

export function ImageUploader({ value, onChange, className, variant = 'default' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('A imagem é muito grande. Tente um arquivo com menos de 10MB.');
      return;
    }

    setUploading(true);
    try {
      const compressedBlob = await compressImage(file);
      const processedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      const url = await uploadImage(processedFile);
      onChange(url);
      toast.success('Imagem carregada e otimizada com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Falha ao carregar imagem.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    onChange('');
  };

  if (variant === 'premium') {
    return (
      <div className={cx("relative", className)}>
        <div 
          className={cx(
            "group relative h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-[12px] border border-dashed transition-all",
            value 
              ? "border-transparent" 
              : "border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 dark:border-slate-800"
          )}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {value ? (
            <>
              <img 
                src={value} 
                alt="Preview" 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-[10px] font-bold text-white">Alterar</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1 text-slate-400 group-hover:text-primary-500">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
              <p className="text-[9px] font-bold uppercase tracking-wider text-center">
                {uploading ? '...' : 'Imagem'}
              </p>
            </div>
          )}
        </div>
        
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeImage();
            }}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-slate-400 shadow-sm border border-slate-100 hover:text-red-500 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
          accept="image/*"
        />
      </div>
    );
  }

  return (
    <div className={cx("space-y-2", className)}>
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
        Imagem do Produto
      </label>
      
      <div 
        className={cx(
          "group relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all",
          value 
            ? "border-transparent" 
            : "border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 dark:border-slate-800 dark:hover:border-primary-400 dark:hover:bg-primary-950/20"
        )}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {value ? (
          <>
            <img 
              src={value} 
              alt="Preview" 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-sm font-bold text-white">Alterar Imagem</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-900 shadow-lg transition-transform hover:scale-110 active:scale-95 dark:bg-slate-900/90 dark:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary-500">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 transition-transform group-hover:-translate-y-1" />
            )}
            <p className="text-xs font-bold uppercase tracking-wider">
              {uploading ? 'Carregando...' : 'Clique para subir'}
            </p>
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" 
        accept="image/*"
      />
      
      <p className="text-[10px] text-slate-500">
        Recomendado: PNG ou JPG. O sistema otimiza automaticamente o tamanho.
      </p>
    </div>
  );
}
