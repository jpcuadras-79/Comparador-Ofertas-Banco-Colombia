import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2, CheckCircle2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { ProposalFile } from '../types';

interface Props {
  proposals: ProposalFile[];
  onAddProposal: (file: ProposalFile) => void;
  onRemoveProposal: (id: string) => void;
  onLoadSamples: () => Promise<void>;
  isLoadingSamples: boolean;
}

export const ProposalUploader: React.FC<Props> = ({
  proposals,
  onAddProposal,
  onRemoveProposal,
  onLoadSamples,
  isLoadingSamples,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg(`El archivo "${file.name}" no es un PDF válido.`);
      return;
    }

    if (proposals.length >= 3) {
      setErrorMsg('Ya has alcanzado el límite máximo de 3 propuestas.');
      return;
    }

    // Check duplicate
    if (proposals.some((p) => p.name === file.name)) {
      setErrorMsg(`El archivo "${file.name}" ya fue cargado.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      onAddProposal({
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        displayName: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        size: file.size,
        dataBase64: base64,
        mimeType: 'application/pdf',
      });
    };
    reader.onerror = () => {
      setErrorMsg(`Error al leer "${file.name}".`);
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remainingSlots = 3 - proposals.length;
    if (remainingSlots <= 0) {
      setErrorMsg('Límite de 3 propuestas alcanzado.');
      return;
    }

    const fileList = Array.from(files);
    const toProcess = fileList.slice(0, remainingSlots);
    if (fileList.length > remainingSlots) {
      setErrorMsg(`Solo se pueden agregar ${remainingSlots} propuesta(s) más (máximo 3 en total).`);
    }

    toProcess.forEach((file) => processFile(file));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">
              1
            </span>
            Propuestas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Sube de 1 a 3 archivos PDF emitidos por las aseguradoras (una propuesta por entidad).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadSamples}
            disabled={isLoadingSamples}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-colors disabled:opacity-50 cursor-pointer"
            title="Carga las propuestas de Cordillera, Alborada y Protectora del Valle"
          >
            {isLoadingSamples ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Cargando ejemplos...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Cargar cotizaciones de ejemplo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (proposals.length < 3) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          proposals.length >= 3
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-75'
            : dragActive
            ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 cursor-pointer'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/80 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          disabled={proposals.length >= 3}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-sm">
            <span className="font-semibold text-blue-700 hover:underline">
              {proposals.length >= 3 ? 'Capacidad máxima de 3 propuestas' : 'Haz clic para explorar'}
            </span>
            {proposals.length < 3 && <span className="text-slate-600"> o arrastra tus archivos PDF aquí</span>}
          </div>
          <p className="text-xs text-slate-400">
            Formato PDF · Mínimo 1 archivo, máximo 3 · {proposals.length}/3 cargados
          </p>
        </div>
      </div>

      {/* File List */}
      {proposals.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
            Archivos seleccionados ({proposals.length} de 3):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {proposals.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span>Propuesta #{index + 1}</span>
                      <span>•</span>
                      <span>{formatSize(item.size)}</span>
                      {item.isSample && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">Ejemplo</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveProposal(item.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Eliminar propuesta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {proposals.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>
            {proposals.length === 1
              ? '1 propuesta lista para análisis.'
              : `${proposals.length} propuestas listas para comparación simultánea.`}
          </span>
        </div>
      )}
    </div>
  );
};
