'use client';

import { useRef, useState } from 'react';
import { useInsightStore } from '@/lib/store';
import { parseCSV, exportToCSV, downloadCSV, validateData } from '@/lib/csv';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle, X } from 'lucide-react';

export function DataImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, setData, clearForecast } = useInsightStore();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationResult, setValidationResult] = useState<{
    errors: string[];
    warnings: string[];
  } | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const parsedData = parseCSV(content);
      const validation = validateData(parsedData);

      setValidationResult(validation);

      if (!validation.valid) {
        setImportStatus('error');
        return;
      }

      clearForecast();
      setData(parsedData);
      setImportStatus('success');

      setTimeout(() => {
        setImportStatus('idle');
        setValidationResult(null);
      }, 3000);
    } catch (error) {
      setImportStatus('error');
      setValidationResult({
        errors: [error instanceof Error ? error.message : 'Failed to parse CSV'],
        warnings: []
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    if (data.length === 0) return;

    const csv = exportToCSV(data, `insightflow-export-${new Date().toISOString().split('T')[0]}.csv`);
    downloadCSV(csv, `insightflow-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
        <span className="text-sm text-zinc-300 font-medium">Data</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          disabled={data.length === 0}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <AnimatePresence>
        {importStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className={importStatus === 'success' ? 'border-emerald-600' : 'border-red-600'}>
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  {importStatus === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    {importStatus === 'success' ? (
                      <p className="text-sm text-emerald-400">
                        Data imported successfully
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm text-red-400">Import failed</p>
                        {validationResult?.errors.map((err, i) => (
                          <p key={i} className="text-xs text-red-500">
                            {err}
                          </p>
                        ))}
                      </div>
                    )}
                    {validationResult?.warnings && validationResult.warnings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {validationResult.warnings.map((warn, i) => (
                          <p key={i} className="text-xs text-amber-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {warn}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setImportStatus('idle');
                      setValidationResult(null);
                    }}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {data.length > 0 && importStatus === 'idle' && (
        <p className="text-xs text-zinc-500">
          {data.length} data points loaded
        </p>
      )}
    </div>
  );
}