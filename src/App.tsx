import { useEffect, useRef, useState, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Eye,
  Edit,
  Printer,
  Save,
  FilePlus,
  CheckCircle2,
  Loader2,
  FileText,
  Layout,
  Cloud,
  CloudOff,
} from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import BuilderInterface from './components/BuilderInterface';
import PrintLayout from './components/PrintLayout';
import QuotationList from './components/QuotationList';
import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { cn } from './lib/utils';
import './index.css';

class PrintErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidUpdate(prevProps: { resetKey?: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('PrintLayout render error:', error.message, info.componentStack);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function App() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const currentQuotation = useAppStore((s) => s.currentQuotation);
  const companyInfo = useAppStore((s) => s.companyInfo);
  const addQuotation = useAppStore((s) => s.addQuotation);
  const resetCurrentQuotation = useAppStore((s) => s.resetCurrentQuotation);
  const fetchInitialData = useAppStore((s) => s.fetchInitialData);
  const setDefaultSender = useAppStore((s) => s.setDefaultSender);
  const setDefaultTerms = useAppStore((s) => s.setDefaultTerms);

  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const printRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${currentQuotation.number} - ${currentQuotation.customerCompany}`,
  });

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- Auto-save with 3s debounce ---
  const doSave = useCallback(async () => {
    const serialized = JSON.stringify(currentQuotation);
    if (serialized === lastSavedRef.current) return; // No changes

    setSaveStatus('saving');
    try {
      await addQuotation(currentQuotation);
      lastSavedRef.current = serialized;

      // Persist sender defaults for future quotations
      if (currentQuotation.senderName || currentQuotation.senderTitle || currentQuotation.senderSignature) {
        setDefaultSender(
          currentQuotation.senderName,
          currentQuotation.senderTitle,
          currentQuotation.senderSignature
        );
      }
      if (currentQuotation.terms) {
        setDefaultTerms(currentQuotation.terms);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [currentQuotation, addQuotation, setDefaultSender, setDefaultTerms]);

  useEffect(() => {
    if (view !== 'builder') return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      // Only auto-save if there's meaningful content
      if (currentQuotation.customerCompany || currentQuotation.machines.length > 0) {
        doSave();
      }
    }, 3000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [currentQuotation, view, doSave]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 's') {
        e.preventDefault();
        doSave();
      } else if (e.key === 'p' && view === 'builder') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'e' && view === 'builder') {
        e.preventDefault();
        setMode((m) => (m === 'edit' ? 'preview' : 'edit'));
      } else if (e.key === 'n' && view === 'builder') {
        e.preventDefault();
        handleNew();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, doSave, handlePrint]);

  const handleNew = () => {
    if (
      window.confirm(
        'Mevcut teklifiniz otomatik kaydedildi. Yeni teklif oluşturmak istiyor musunuz?'
      )
    ) {
      resetCurrentQuotation();
      setMode('edit');
      lastSavedRef.current = '';
    }
  };

  const saveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
      case 'saved':
        return <Cloud className="w-4 h-4 text-green-500" />;
      case 'error':
        return <CloudOff className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const saveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Kaydediliyor...';
      case 'saved': return 'Kaydedildi';
      case 'error': return 'Kayıt hatası';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="no-print sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-adotek-red rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="font-black text-gray-900 text-lg font-[Outfit]">
                Adotek
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setView('builder');
                  setMode('edit');
                }}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  view === 'builder'
                    ? 'bg-adotek-red text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Layout className="w-4 h-4 inline mr-1.5" />
                Teklif Oluştur
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  view === 'list'
                    ? 'bg-adotek-red text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <FileText className="w-4 h-4 inline mr-1.5" />
                Teklifler
              </button>
            </div>
          </div>

          {/* Right: Builder actions */}
          {view === 'builder' && (
            <div className="flex items-center gap-3">
              {/* Auto-save status */}
              {saveStatus !== 'idle' && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-2">
                  {saveStatusIcon()}
                  <span>{saveStatusText()}</span>
                </div>
              )}

              {/* Preview / Edit toggle */}
              <button
                onClick={() =>
                  setMode((m) => (m === 'edit' ? 'preview' : 'edit'))
                }
                title="Ctrl+E"
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all',
                  mode === 'preview'
                    ? 'bg-adotek-dark text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {mode === 'preview' ? (
                  <>
                    <Edit className="w-4 h-4" /> Düzenle
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" /> Önizleme
                  </>
                )}
              </button>

              {/* Manual Save */}
              <button
                onClick={doSave}
                title="Ctrl+S"
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all',
                  saveStatus === 'saved'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {saveStatus === 'saving' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveStatus === 'saved' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saveStatus === 'saved' ? 'Kaydedildi' : 'Kaydet'}
              </button>

              {/* Print/PDF */}
              <button
                onClick={() => handlePrint()}
                title="Ctrl+P"
                className="px-4 py-2 bg-adotek-red text-white rounded-full text-sm font-bold shadow-lg shadow-adotek-red/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> PDF / Yazdır
              </button>

              {/* New */}
              <button
                onClick={handleNew}
                title="Ctrl+N"
                className="px-4 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4" /> Yeni
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {view === 'builder' && (
          <>
            {mode === 'edit' ? (
              <BuilderInterface />
            ) : (
              <div className="flex justify-center">
                <div
                  className="bg-slate-900 rounded-2xl shadow-2xl p-8 overflow-auto"
                  style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}
                >
                  <PrintLayout
                    quotation={currentQuotation}
                    companyInfo={companyInfo}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {view === 'list' && <QuotationList />}
      </main>

      {/* Hidden print area */}
      <div className="hidden">
        <PrintErrorBoundary resetKey={`${currentQuotation.id}-${JSON.stringify(companyInfo).length}`}>
          <PrintLayout
            ref={printRef}
            quotation={currentQuotation}
            companyInfo={companyInfo}
          />
        </PrintErrorBoundary>
      </div>
    </div>
  );
}

export default App;
