import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { IDSSData, parseCSVFile } from '../utils/csvParser';

interface FileUploadProps {
  onDataLoaded: (data: IDSSData[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Por favor, selecione um arquivo CSV válido');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = await parseCSVFile(file);
      if (data.length === 0) {
        setError('O arquivo CSV está vazio ou não contém dados válidos');
      } else {
        onDataLoaded(data);
      }
    } catch (err) {
      setError('Erro ao processar o arquivo CSV. Verifique o formato do arquivo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-[var(--brand-wine)] bg-[var(--brand-wine-soft)]' 
            : 'border-gray-300 bg-white hover:border-[var(--brand-wine-light)] hover:bg-[var(--brand-wine-soft)]'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <>
              <div className="w-12 h-12 border-4 border-[var(--brand-wine)] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-700">Processando arquivo...</p>
            </>
          ) : (
            <>
              <div className="bg-[var(--brand-wine-soft)] p-4 rounded-full">
                <FileSpreadsheet className="w-8 h-8 text-[var(--brand-wine-dark)]" />
              </div>
              <div>
                <p className="text-lg text-gray-700 mb-1">
                  <span className="text-[var(--brand-wine-dark)]">Clique para fazer upload</span> ou arraste o arquivo
                </p>
                <p className="text-sm text-gray-500">
                  Arquivo CSV com dados das operadoras IDSS ANS
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
