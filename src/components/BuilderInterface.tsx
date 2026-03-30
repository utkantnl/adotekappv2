import { useState, useEffect, useRef } from 'react';
import {
  Layout,
  MessageSquare,
  TrendingUp,
  Briefcase,
  CreditCard,
  FileUp,
  Search,
  CheckCircle2,
  Settings,
  Plus,
  Trash2,
  Upload,
  Wand2,
  Loader2,
  Scan,
  Book,
  X,
  DollarSign,
  Euro,
  Coins,
  Copy,
  Clock,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { fileToBase64, resizeImage } from '../lib/fileUtils';
import { formatCurrency, calculateMargin } from '../lib/pricing';
import {
  generateForeword,
  refineTechSpec,
  optimizeContract,
  analyzeMachineLabel,
  analyzeOfferNotes,
} from '../lib/ai';
import { translateQuotationContent } from '../lib/translateService';
import VoiceInput from './ui/VoiceInput';
import VoiceTextarea from './ui/VoiceTextarea';
import MaterialSelector from './MaterialSelector';
import { forewordTemplates, benefitsTemplates, profileTemplates } from '../lib/templates';
import type { Machine, MachineTemplate, QuotationType, ExtraCost } from '../types';

type TabId =
  | 'general'
  | 'preface'
  | 'benefits'
  | 'machines'
  | 'pricing'
  | 'documents'
  | 'references'
  | 'tasks'
  | 'profile';

const ALL_TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'Kapak & Genel', icon: <Layout className="w-4 h-4" /> },
  { id: 'preface', label: 'Önsöz & Mektup', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'benefits', label: 'ROI & Faydalar', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'machines', label: 'Makine Detayları', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'pricing', label: 'Fiyat & Şartlar', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'documents', label: 'Dokümanlar', icon: <FileUp className="w-4 h-4" /> },
  { id: 'references', label: 'Referanslar', icon: <Search className="w-4 h-4" /> },
  { id: 'tasks', label: 'Görevlerim', icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'profile', label: 'Şirket Profili', icon: <Settings className="w-4 h-4" /> },
];

const PROFORMA_TABS: TabId[] = ['general', 'machines', 'pricing'];

export default function BuilderInterface() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState<string | null>(null);
  const [aiInstruction, setAiInstruction] = useState('');
  const [translating, setTranslating] = useState(false);

  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);

  const q = useAppStore((s) => s.currentQuotation);
  const update = useAppStore((s) => s.updateCurrentQuotation);
  const companyInfo = useAppStore((s) => s.companyInfo);
  const machineTemplates = useAppStore((s) => s.machineTemplates);
  const exchangeRates = useAppStore((s) => s.exchangeRates);
  const fetchExchangeRates = useAppStore((s) => s.fetchExchangeRates);
  const quotations = useAppStore((s) => s.quotations);
  const setCurrentQuotation = useAppStore((s) => s.setCurrentQuotation);
  const getCustomerHistory = useAppStore((s) => s.getCustomerHistory);
  const getRecentQuotations = useAppStore((s) => s.getRecentQuotations);
  const defaultTerms = useAppStore((s) => s.defaultTerms);
  const updateCompanyInfo = useAppStore((s) => s.updateCompanyInfo);

  const isPneuamtic = q.type === 'Pneuamtic Proforma';
  const visibleTabs = isPneuamtic
    ? ALL_TABS.filter((t) => PROFORMA_TABS.includes(t.id))
    : ALL_TABS;

  const lang = q.language === 'en' ? 'en-US' : 'tr-TR';

  // --- Smart cover title auto-generation ---
  const prevCustomerRef = useRef(q.customerCompany);
  useEffect(() => {
    if (
      q.customerCompany &&
      q.customerCompany !== prevCustomerRef.current &&
      !q.coverTitle
    ) {
      const typeMap: Record<string, string> = {
        'Standard Machine Quotation': 'TEKNİK TEKLİF',
        'Comprehensive Machine Quotation': 'KAPSAMLI TEKNİK TEKLİF',
        'Service & Maintenance Quotation': 'SERVİS TEKLİFİ',
        'Pneuamtic Proforma': 'PROFORMA FATURA',
      };
      const title = `${q.customerCompany.toUpperCase()} — ${typeMap[q.type] || 'TEKNİK TEKLİF'}`;
      update({ coverTitle: title });
    }
    prevCustomerRef.current = q.customerCompany;
  }, [q.customerCompany, q.type]);

  // --- Default terms auto-fill ---
  useEffect(() => {
    if (!q.terms && defaultTerms) {
      update({ terms: defaultTerms });
    }
  }, []); // Only on mount

  // --- Tab completion check ---
  const getTabStatus = (tabId: TabId): 'complete' | 'partial' | 'empty' => {
    switch (tabId) {
      case 'general':
        if (q.customerCompany && q.coverTitle && q.coverImage) return 'complete';
        if (q.customerCompany || q.coverTitle) return 'partial';
        return 'empty';
      case 'preface':
        if (q.foreword && q.senderName) return 'complete';
        if (q.foreword || q.senderName) return 'partial';
        return 'empty';
      case 'benefits':
        if (q.benefitsSection?.show && q.benefitsSection.benefits.length > 0) return 'complete';
        if (q.benefitsSection?.title) return 'partial';
        return 'empty';
      case 'machines':
        if (q.machines.length > 0 && q.machines.every((m) => m.name && m.unitPrice > 0)) return 'complete';
        if (q.machines.length > 0) return 'partial';
        return 'empty';
      case 'pricing':
        return q.pricing.currency ? 'complete' : 'empty';
      case 'documents':
        return (q.documents || []).length > 0 ? 'complete' : 'empty';
      case 'references':
        return q.references.logos.length > 0 ? 'complete' : 'empty';
      default:
        return 'empty';
    }
  };

  // --- Customer history filter ---
  const customerHistory = getCustomerHistory();
  const filteredCustomers = q.customerCompany
    ? customerHistory.filter((c) =>
        c.company.toLowerCase().includes(q.customerCompany.toLowerCase())
      )
    : customerHistory;

  // --- Quick start from recent ---
  const recentQuotations = getRecentQuotations(5);

  const quickStartFromQuotation = (sourceId: string) => {
    const source = quotations.find((x) => x.id === sourceId);
    if (!source) return;
    const now = new Date();
    const year = now.getFullYear();
    const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    setCurrentQuotation({
      ...structuredClone(source),
      id: crypto.randomUUID(),
      number: `TKL-${year}-${num}`,
      date: now.toISOString().split('T')[0],
      status: 'draft',
    });
  };

  // --- Helpers ---
  const handleImageUpload = async (
    callback: (base64: string) => void,
    maxW = 1200,
    maxH = 1200
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const base64 = await fileToBase64(file);
      const resized = await resizeImage(base64, maxW, maxH);
      callback(resized);
    };
    input.click();
  };

  const updateMachine = (idx: number, partial: Partial<Machine>) => {
    const machines = [...q.machines];
    machines[idx] = { ...machines[idx], ...partial };
    update({ machines });
  };

  const addMachine = () => {
    const machine: Machine = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      imageUrl: '',
      quantity: 1,
      unitPrice: 0,
      materials: [],
    };
    update({ machines: [...q.machines, machine] });
  };

  const removeMachine = (idx: number) => {
    update({ machines: q.machines.filter((_, i) => i !== idx) });
  };

  const duplicateMachine = (idx: number) => {
    const source = q.machines[idx];
    if (!source) return;
    const clone: Machine = {
      ...structuredClone(source),
      id: crypto.randomUUID(),
    };
    const machines = [...q.machines];
    machines.splice(idx + 1, 0, clone);
    update({ machines });
  };

  const addFromTemplate = (templateId: string) => {
    const t = machineTemplates.find((x) => x.id === templateId);
    if (!t) return;
    const machine: Machine = {
      id: crypto.randomUUID(),
      name: t.name,
      description: t.description,
      imageUrl: t.imageUrl,
      quantity: 1,
      unitPrice: t.unitPrice,
      materials: t.materials,
    };
    update({ machines: [...q.machines, machine] });
  };

  // AI handlers
  const handleAiAction = async (target: string) => {
    setAiLoading(true);
    try {
      if (target === 'foreword') {
        const result = await generateForeword(
          q.customerCompany || q.customerName,
          companyInfo.name,
          aiInstruction || undefined
        );
        update({ foreword: result });
      } else if (target === 'terms') {
        const result = await optimizeContract(q.terms, aiInstruction || undefined);
        update({ terms: result });
      } else if (target.startsWith('machine-')) {
        const idx = parseInt(target.split('-')[1]);
        const m = q.machines[idx];
        if (m) {
          const result = await refineTechSpec(
            m.name,
            m.description,
            aiInstruction || undefined
          );
          updateMachine(idx, { description: result });
        }
      }
    } catch (e) {
      console.error('AI error:', e);
    }
    setAiLoading(false);
    setAiModalOpen(null);
    setAiInstruction('');
  };

  const handleLabelScan = async (idx: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setAiLoading(true);
      try {
        const base64 = await fileToBase64(file);
        const result = await analyzeMachineLabel(base64);
        const parsed = JSON.parse(result);
        updateMachine(idx, {
          name: parsed.name || q.machines[idx].name,
          description: parsed.description || q.machines[idx].description,
        });
      } catch (e) {
        console.error('Label scan error:', e);
      }
      setAiLoading(false);
    };
    input.click();
  };

  const handleOfferNotes = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setAiLoading(true);
      try {
        const base64 = await fileToBase64(file);
        const result = await analyzeOfferNotes(base64);
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) {
          const newMachines: Machine[] = parsed.map((m: Record<string, unknown>) => ({
            id: crypto.randomUUID(),
            name: (m.name as string) || '',
            description: (m.description as string) || '',
            imageUrl: '',
            quantity: (m.quantity as number) || 1,
            unitPrice: (m.unitPrice as number) || 0,
            materials: [],
          }));
          update({ machines: [...q.machines, ...newMachines] });
        }
      } catch (e) {
        console.error('Offer notes error:', e);
      }
      setAiLoading(false);
    };
    input.click();
  };

  const handleLanguageChange = async (newLang: 'tr' | 'en') => {
    if (newLang === q.language) return;
    setTranslating(true);
    try {
      const updates = await translateQuotationContent(q, newLang);
      update(updates);
    } catch {
      update({ language: newLang });
    }
    setTranslating(false);
  };

  // Extra costs
  const addExtraCost = () => {
    const costs = q.pricing.extraCosts || [];
    update({
      pricing: {
        ...q.pricing,
        extraCosts: [
          ...costs,
          { id: crypto.randomUUID(), name: '', amount: 0 },
        ],
      },
    });
  };

  const updateExtraCost = (idx: number, partial: Partial<ExtraCost>) => {
    const costs = [...(q.pricing.extraCosts || [])];
    costs[idx] = { ...costs[idx], ...partial };
    update({ pricing: { ...q.pricing, extraCosts: costs } });
  };

  const removeExtraCost = (idx: number) => {
    update({
      pricing: {
        ...q.pricing,
        extraCosts: (q.pricing.extraCosts || []).filter((_, i) => i !== idx),
      },
    });
  };

  // Document upload
  const handleDocUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      const docs = await Promise.all(
        Array.from(files).map(async (f) => ({
          id: crypto.randomUUID(),
          name: f.name,
          type: f.type,
          content: await fileToBase64(f),
        }))
      );
      update({ documents: [...(q.documents || []), ...docs] });
    };
    input.click();
  };

  // Reference logos
  const handleRefLogoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      const logos = await Promise.all(
        Array.from(files).map(async (f) => {
          const b64 = await fileToBase64(f);
          return resizeImage(b64, 400, 400);
        })
      );
      update({
        references: { ...q.references, logos: [...q.references.logos, ...logos] },
      });
    };
    input.click();
  };

  // Section header helper
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-2 h-6 bg-adotek-red rounded-full" />
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
      {children}
    </label>
  );

  // --- TAB RENDERERS ---

  const renderGeneral = () => (
    <div className="space-y-6">
      <SectionHeader title="Kapak & Genel Bilgiler" />

      {/* Quick Start from recent quotations */}
      {recentQuotations.length > 0 && !q.customerCompany && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-gray-700">Hızlı Başlangıç</span>
            <span className="text-[10px] text-gray-400 ml-1">Son tekliflerden kopyala</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentQuotations.map((rq) => (
              <button
                key={rq.id}
                type="button"
                onClick={() => quickStartFromQuotation(rq.id)}
                className="shrink-0 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left min-w-[180px]"
              >
                <p className="text-sm font-bold text-gray-800 truncate">
                  {rq.customerCompany || 'İsimsiz'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-400">{rq.number}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400">{rq.machines.length} makine</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Teklif No</Label>
          <VoiceInput
            value={q.number}
            onValueChange={(v) => update({ number: v })}
            language={lang}
            placeholder="TKL-2026-001"
          />
        </div>
        <div>
          <Label>Tarih</Label>
          <input
            type="date"
            value={q.date}
            onChange={(e) => update({ date: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Teklif Türü</Label>
          <select
            value={q.type}
            onChange={(e) => update({ type: e.target.value as QuotationType })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
          >
            <option>Standard Machine Quotation</option>
            <option>Comprehensive Machine Quotation</option>
            <option>Service & Maintenance Quotation</option>
            <option>Pneuamtic Proforma</option>
          </select>
        </div>
        <div>
          <Label>Teklif Dili</Label>
          <div className="flex gap-2 mt-1">
            {(['tr', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => handleLanguageChange(l)}
                disabled={translating}
                className={cn(
                  'px-4 py-2.5 rounded-full text-sm font-bold transition-all',
                  q.language === l
                    ? 'bg-adotek-red text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {translating && q.language !== l ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                ) : null}
                {l === 'tr' ? 'Türkçe' : 'English'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label>Kapak Başlığı</Label>
        <VoiceInput
          value={q.coverTitle}
          onValueChange={(v) => update({ coverTitle: v })}
          language={lang}
          placeholder="Otomatik oluşturulur veya kendiniz yazın"
        />
      </div>

      {/* Customer with autocomplete */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Label>Müşteri Firma</Label>
          <VoiceInput
            value={q.customerCompany}
            onValueChange={(v) => {
              update({ customerCompany: v });
              setCustomerDropdownOpen(v.length > 0 && filteredCustomers.length > 0);
            }}
            onFocus={() => {
              if (customerHistory.length > 0) setCustomerDropdownOpen(true);
            }}
            onBlur={() => setTimeout(() => setCustomerDropdownOpen(false), 200)}
            language={lang}
            placeholder="Firma adı yazın..."
          />
          {/* Customer history dropdown */}
          {customerDropdownOpen && filteredCustomers.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl max-h-48 overflow-y-auto">
              {filteredCustomers.slice(0, 8).map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    update({
                      customerCompany: c.company,
                      customerName: c.name,
                      customerLogo: c.logo,
                    });
                    setCustomerDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  {c.logo ? (
                    <img src={c.logo} alt="" className="w-6 h-6 rounded object-contain" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                      {c.company.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.company}</p>
                    {c.name && (
                      <p className="text-[10px] text-gray-400">{c.name}</p>
                    )}
                  </div>
                  <Clock className="w-3 h-3 text-gray-300 ml-auto" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label>Müşteri Yetkili</Label>
          <VoiceInput
            value={q.customerName}
            onValueChange={(v) => update({ customerName: v })}
            language={lang}
            placeholder="Ahmet Yılmaz"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Kapak Görseli</Label>
          <button
            type="button"
            onClick={() =>
              handleImageUpload((b64) => update({ coverImage: b64 }), 1920, 1080)
            }
            className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-adotek-red flex items-center justify-center transition-colors"
          >
            {q.coverImage ? (
              <img
                src={q.coverImage}
                alt="Cover"
                className="h-full w-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-center text-gray-400">
                <Upload className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Görsel Yükle</span>
              </div>
            )}
          </button>
        </div>
        <div>
          <Label>Müşteri Logosu (opsiyonel)</Label>
          <button
            type="button"
            onClick={() =>
              handleImageUpload((b64) => update({ customerLogo: b64 }), 400, 400)
            }
            className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-adotek-red flex items-center justify-center transition-colors"
          >
            {q.customerLogo ? (
              <img
                src={q.customerLogo}
                alt="Logo"
                className="h-20 object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <Upload className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Logo Yükle</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Smart offer notes */}
      <div className="p-4 bg-gray-50 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Scan className="w-4 h-4 text-adotek-red" />
          <span className="text-sm font-bold text-gray-700">
            Akıllı Teklif Hazırlama
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Toplantı notlarının fotoğrafını yükleyin, AI makine bilgilerini otomatik çıkarsın.
        </p>
        <button
          type="button"
          onClick={handleOfferNotes}
          disabled={aiLoading}
          className="px-4 py-2 bg-adotek-dark text-white rounded-full text-sm font-bold hover:bg-black transition-colors disabled:opacity-50"
        >
          {aiLoading ? (
            <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
          ) : null}
          Not Fotoğrafı Yükle
        </button>
      </div>
    </div>
  );

  const handleAutoForeword = async () => {
    if (!q.customerCompany && !q.customerName) return;
    setAiLoading(true);
    try {
      const result = await generateForeword(
        q.customerCompany || q.customerName,
        companyInfo.name
      );
      update({ foreword: result });
    } catch (e) {
      console.error('Auto foreword error:', e);
    }
    setAiLoading(false);
  };

  const applyForewordTemplate = (templateId: string) => {
    const tmpl = forewordTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;
    const content = tmpl.content
      .replace(/\{\{firma\}\}/g, q.customerCompany || '[Firma Adı]')
      .replace(/\{\{tarih\}\}/g, q.date);
    update({ foreword: content });
  };

  const applyBenefitsTemplate = (templateId: string) => {
    const tmpl = benefitsTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;
    // Re-generate IDs to avoid collisions
    const data = structuredClone(tmpl.data);
    data.benefits = data.benefits.map((b) => ({ ...b, id: crypto.randomUUID() }));
    data.roiComparison = data.roiComparison.map((r) => ({ ...r, id: crypto.randomUUID() }));
    update({ benefitsSection: { ...data, show: true } });
  };

  const renderPreface = () => (
    <div className="space-y-6">
      <SectionHeader title="Önsöz & Mektup" />

      {/* Foreword Templates */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Hazır Şablonlar</p>
        <div className="grid grid-cols-5 gap-2">
          {forewordTemplates.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => applyForewordTemplate(tmpl.id)}
              className="group p-3 rounded-xl border border-gray-200 hover:border-adotek-red hover:bg-red-50 transition-all text-left"
            >
              <span className="text-lg">{tmpl.emoji}</span>
              <p className="text-xs font-bold text-gray-700 mt-1 group-hover:text-adotek-red">{tmpl.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{tmpl.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Auto-generate foreword if empty */}
      {!q.foreword && q.customerCompany && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-bold text-gray-700">
                Otomatik önsöz oluşturulsun mu?
              </span>
            </div>
            <button
              type="button"
              onClick={handleAutoForeword}
              disabled={aiLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-full text-xs font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              Oluştur
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            AI, {q.customerCompany} için profesyonel bir önsöz yazacak.
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label>Önsöz Metni</Label>
          <button
            type="button"
            onClick={() => setAiModalOpen('foreword')}
            className="text-xs text-adotek-red font-bold flex items-center gap-1 hover:underline"
          >
            <Wand2 className="w-3 h-3" /> AI ile Düzenle
          </button>
        </div>
        <VoiceTextarea
          value={q.foreword}
          onValueChange={(v) => update({ foreword: v })}
          language={lang}
          rows={8}
          placeholder="Sayın yetkili..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Gönderen Adı</Label>
          <VoiceInput
            value={q.senderName}
            onValueChange={(v) => update({ senderName: v })}
            language={lang}
          />
        </div>
        <div>
          <Label>Gönderen Ünvanı</Label>
          <VoiceInput
            value={q.senderTitle}
            onValueChange={(v) => update({ senderTitle: v })}
            language={lang}
          />
        </div>
      </div>

      <div>
        <Label>İmza Görseli</Label>
        <button
          type="button"
          onClick={() =>
            handleImageUpload((b64) => update({ senderSignature: b64 }), 300, 150)
          }
          className="h-24 w-48 rounded-xl border-2 border-dashed border-gray-300 hover:border-adotek-red flex items-center justify-center transition-colors"
        >
          {q.senderSignature ? (
            <img src={q.senderSignature} alt="Signature" className="h-16 object-contain" />
          ) : (
            <div className="text-center text-gray-400">
              <Upload className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">İmza Yükle</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  const renderBenefits = () => {
    const bs = q.benefitsSection || {
      show: false,
      title: 'Neden Adotek Makina?',
      description: '',
      benefits: [],
      roiComparison: [],
      monthlySaving: 0,
      yearlySaving: 0,
      motivationTitle: '',
      motivationText: '',
    };

    const updateBenefits = (partial: Partial<typeof bs>) => {
      update({ benefitsSection: { ...bs, ...partial } });
    };

    return (
      <div className="space-y-6">
        <SectionHeader title="ROI & Faydalar" />

        {/* Benefits Templates */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Hazır Şablonlar — Tek Tıkla Doldur</p>
          <div className="grid grid-cols-4 gap-2">
            {benefitsTemplates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => applyBenefitsTemplate(tmpl.id)}
                className="group p-3 rounded-xl border border-gray-200 hover:border-adotek-red hover:bg-red-50 transition-all text-left"
              >
                <span className="text-lg">{tmpl.emoji}</span>
                <p className="text-xs font-bold text-gray-700 mt-1 group-hover:text-adotek-red">{tmpl.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{tmpl.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={bs.show}
              onChange={(e) => updateBenefits({ show: e.target.checked })}
              className="w-4 h-4 accent-adotek-red"
            />
            <span className="text-sm font-medium text-gray-700">
              PDF'te ROI sayfasını göster
            </span>
          </label>
        </div>

        <div>
          <Label>Bölüm Başlığı</Label>
          <VoiceInput
            value={bs.title}
            onValueChange={(v) => updateBenefits({ title: v })}
            language={lang}
          />
        </div>

        <div>
          <Label>Açıklama</Label>
          <VoiceTextarea
            value={bs.description}
            onValueChange={(v) => updateBenefits({ description: v })}
            language={lang}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Aylık Kazanç</Label>
            <input
              type="number"
              value={bs.monthlySaving}
              onChange={(e) =>
                updateBenefits({ monthlySaving: Number(e.target.value) })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
            />
          </div>
          <div>
            <Label>Yıllık Kazanç</Label>
            <input
              type="number"
              value={bs.yearlySaving}
              onChange={(e) =>
                updateBenefits({ yearlySaving: Number(e.target.value) })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
            />
          </div>
        </div>

        {/* Benefits list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Avantajlar</Label>
            <button
              type="button"
              onClick={() =>
                updateBenefits({
                  benefits: [
                    ...bs.benefits,
                    { id: crypto.randomUUID(), title: '', description: '' },
                  ],
                })
              }
              className="text-xs text-adotek-red font-bold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Ekle
            </button>
          </div>
          <div className="space-y-3">
            {bs.benefits.map((b, i) => (
              <div key={b.id} className="flex gap-2">
                <input
                  value={b.title}
                  onChange={(e) => {
                    const benefits = [...bs.benefits];
                    benefits[i] = { ...benefits[i], title: e.target.value };
                    updateBenefits({ benefits });
                  }}
                  placeholder="Başlık"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
                />
                <input
                  value={b.description}
                  onChange={(e) => {
                    const benefits = [...bs.benefits];
                    benefits[i] = { ...benefits[i], description: e.target.value };
                    updateBenefits({ benefits });
                  }}
                  placeholder="Açıklama"
                  className="flex-2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateBenefits({
                      benefits: bs.benefits.filter((_, j) => j !== i),
                    })
                  }
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Comparison */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>ROI Kıyaslama</Label>
            <button
              type="button"
              onClick={() =>
                updateBenefits({
                  roiComparison: [
                    ...bs.roiComparison,
                    {
                      id: crypto.randomUUID(),
                      label: '',
                      currentValue: '',
                      newValue: '',
                      benefit: '',
                    },
                  ],
                })
              }
              className="text-xs text-adotek-red font-bold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Ekle
            </button>
          </div>
          <div className="space-y-3">
            {bs.roiComparison.map((r, i) => (
              <div key={r.id} className="grid grid-cols-5 gap-2">
                <input
                  value={r.label}
                  onChange={(e) => {
                    const roi = [...bs.roiComparison];
                    roi[i] = { ...roi[i], label: e.target.value };
                    updateBenefits({ roiComparison: roi });
                  }}
                  placeholder="Kriter"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
                />
                <input
                  value={r.currentValue}
                  onChange={(e) => {
                    const roi = [...bs.roiComparison];
                    roi[i] = { ...roi[i], currentValue: e.target.value };
                    updateBenefits({ roiComparison: roi });
                  }}
                  placeholder="Mevcut"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
                />
                <input
                  value={r.newValue}
                  onChange={(e) => {
                    const roi = [...bs.roiComparison];
                    roi[i] = { ...roi[i], newValue: e.target.value };
                    updateBenefits({ roiComparison: roi });
                  }}
                  placeholder="Yeni"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
                />
                <input
                  value={r.benefit}
                  onChange={(e) => {
                    const roi = [...bs.roiComparison];
                    roi[i] = { ...roi[i], benefit: e.target.value };
                    updateBenefits({ roiComparison: roi });
                  }}
                  placeholder="Fayda"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateBenefits({
                      roiComparison: bs.roiComparison.filter((_, j) => j !== i),
                    })
                  }
                  className="p-2 text-gray-400 hover:text-red-500 justify-self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Motivasyon Başlığı</Label>
          <VoiceInput
            value={bs.motivationTitle}
            onValueChange={(v) => updateBenefits({ motivationTitle: v })}
            language={lang}
          />
        </div>
        <div>
          <Label>Motivasyon Metni</Label>
          <VoiceTextarea
            value={bs.motivationText}
            onValueChange={(v) => updateBenefits({ motivationText: v })}
            language={lang}
            rows={3}
          />
        </div>
      </div>
    );
  };

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [savingToLibrary, setSavingToLibrary] = useState<number | null>(null);

  const filteredTemplates = machineTemplates.filter((t) =>
    !librarySearch || t.name.toLowerCase().includes(librarySearch.toLowerCase())
  );

  const saveToLibrary = (idx: number) => {
    const m = q.machines[idx];
    if (!m || !m.name) return;
    const existing = machineTemplates.find((t) => t.name === m.name);
    const template: MachineTemplate = {
      id: existing?.id || crypto.randomUUID(),
      name: m.name,
      description: m.description,
      imageUrl: m.imageUrl,
      unitPrice: m.unitPrice,
      materials: m.materials,
    };
    if (existing) {
      useAppStore.getState().updateMachineTemplate(existing.id, template);
    } else {
      useAppStore.getState().addMachineTemplate(template);
    }
    setSavingToLibrary(idx);
    setTimeout(() => setSavingToLibrary(null), 1500);
  };

  const removeTemplate = (id: string) => {
    useAppStore.getState().deleteMachineTemplate(id);
  };

  const renderMachines = () => (
    <div className="space-y-6">
      <SectionHeader title="Makine Detayları" />

      {/* Add Machine Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={addMachine}
          className="p-4 rounded-2xl border-2 border-dashed border-gray-300 hover:border-adotek-red hover:bg-red-50/50 text-gray-500 hover:text-adotek-red font-bold text-sm flex flex-col items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          Boş Makine Ekle
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="p-4 rounded-2xl border-2 border-gray-200 hover:border-adotek-red hover:bg-red-50/50 text-gray-600 hover:text-adotek-red font-bold text-sm flex flex-col items-center gap-2 transition-all relative"
        >
          <Book className="w-5 h-5" />
          Kütüphaneden Seç
          {machineTemplates.length > 0 && (
            <span className="absolute top-2 right-2 bg-adotek-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {machineTemplates.length}
            </span>
          )}
        </button>
      </div>

      {/* Machine Library Modal */}
      {libraryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Book className="w-5 h-5 text-adotek-red" />
                  Makine Kütüphanesi
                </h3>
                <button
                  type="button"
                  onClick={() => { setLibraryOpen(false); setLibrarySearch(''); }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {machineTemplates.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Makine ara..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-adotek-red outline-none text-sm"
                    autoFocus
                  />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Book className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">
                    {machineTemplates.length === 0
                      ? 'Kütüphane boş'
                      : 'Sonuç bulunamadı'}
                  </p>
                  <p className="text-xs mt-1">
                    {machineTemplates.length === 0
                      ? 'Makine kartlarındaki "Kütüphaneye Kaydet" butonu ile makine ekleyin'
                      : 'Farklı bir arama terimi deneyin'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredTemplates.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-adotek-red/30 hover:bg-red-50/30 transition-all group"
                    >
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt={t.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          <Briefcase className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 truncate">{t.name}</p>
                        <p className="text-xs text-gray-500 truncate">{t.description || 'Açıklama yok'}</p>
                        <p className="text-xs font-bold text-adotek-red mt-0.5">
                          {t.unitPrice > 0 ? formatCurrency(t.unitPrice, q.pricing.currency) : 'Fiyat girilmemiş'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => { addFromTemplate(t.id); setLibraryOpen(false); setLibrarySearch(''); }}
                          className="px-4 py-2 bg-adotek-red text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
                        >
                          Ekle
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTemplate(t.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Kütüphaneden Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pneuamtic table mode */}
      {isPneuamtic ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Malzeme</th>
                <th className="text-left py-2 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Açıklama</th>
                <th className="text-center py-2 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Adet</th>
                <th className="text-right py-2 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Birim Fiyat</th>
                <th className="text-center py-2 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">İskonto %</th>
                <th className="text-right py-2 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Toplam</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {q.machines.map((m, i) => {
                const lineTotal = m.unitPrice * m.quantity;
                const discount = (lineTotal * (m.discount || 0)) / 100;
                return (
                  <tr key={m.id} className="border-b border-gray-100">
                    <td className="py-2 px-2">
                      <input
                        value={m.name}
                        onChange={(e) => updateMachine(i, { name: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg border border-gray-200 text-sm focus:border-adotek-red outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        value={m.description}
                        onChange={(e) => updateMachine(i, { description: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg border border-gray-200 text-sm focus:border-adotek-red outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={m.quantity}
                        onChange={(e) => updateMachine(i, { quantity: Number(e.target.value) })}
                        className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:border-adotek-red outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={m.unitPrice}
                        onChange={(e) => updateMachine(i, { unitPrice: Number(e.target.value) })}
                        className="w-28 px-2 py-1 rounded-lg border border-gray-200 text-sm text-right focus:border-adotek-red outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={m.discount || 0}
                        onChange={(e) => updateMachine(i, { discount: Number(e.target.value) })}
                        className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:border-adotek-red outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-sm">
                      {formatCurrency(lineTotal - discount, q.pricing.currency)}
                    </td>
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        onClick={() => removeMachine(i)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Standard machine cards */
        <div className="space-y-6">
          {q.machines.map((m, i) => {
            const margin = m.unitCost
              ? calculateMargin(m.unitCost, m.unitPrice)
              : null;
            return (
              <div
                key={m.id}
                className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-800">
                    Makine #{i + 1} {m.name && <span className="text-gray-400 font-normal">— {m.name}</span>}
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => saveToLibrary(i)}
                      disabled={!m.name}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all",
                        savingToLibrary === i
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500 hover:bg-adotek-red/10 hover:text-adotek-red disabled:opacity-30 disabled:cursor-not-allowed"
                      )}
                      title="Kütüphaneye Kaydet"
                    >
                      {savingToLibrary === i ? (
                        <><CheckCircle2 className="w-3 h-3" /> Kaydedildi</>
                      ) : (
                        <><Book className="w-3 h-3" /> Kaydet</>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLabelScan(i)}
                      disabled={aiLoading}
                      className="p-2 text-gray-400 hover:text-adotek-red transition-colors"
                      title="AI Etiket Okuma"
                    >
                      <Scan className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateMachine(i)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Makineyi Kopyala"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMachine(i)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Makine Adı</Label>
                    <VoiceInput
                      value={m.name}
                      onValueChange={(v) => updateMachine(i, { name: v })}
                      language={lang}
                    />
                  </div>
                  <div>
                    <Label>Makine Görseli</Label>
                    <button
                      type="button"
                      onClick={() =>
                        handleImageUpload((b64) => updateMachine(i, { imageUrl: b64 }))
                      }
                      className="w-full h-12 rounded-xl border-2 border-dashed border-gray-200 hover:border-adotek-red flex items-center justify-center transition-colors"
                    >
                      {m.imageUrl ? (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Görsel yüklendi
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Yükle
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label>Teknik Özellikler</Label>
                    <button
                      type="button"
                      onClick={() => setAiModalOpen(`machine-${i}`)}
                      className="text-xs text-adotek-red font-bold flex items-center gap-1 hover:underline"
                    >
                      <Wand2 className="w-3 h-3" /> AI ile Düzenle
                    </button>
                  </div>
                  <VoiceTextarea
                    value={m.description}
                    onValueChange={(v) => updateMachine(i, { description: v })}
                    language={lang}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Adet</Label>
                    <input
                      type="number"
                      value={m.quantity}
                      onChange={(e) =>
                        updateMachine(i, { quantity: Number(e.target.value) })
                      }
                      min={1}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
                    />
                  </div>
                  <div>
                    <Label>Birim Maliyet</Label>
                    <input
                      type="number"
                      value={m.unitCost || ''}
                      onChange={(e) =>
                        updateMachine(i, {
                          unitCost: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Opsiyonel"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
                    />
                  </div>
                  <div>
                    <Label>Birim Fiyat</Label>
                    <input
                      type="number"
                      value={m.unitPrice}
                      onChange={(e) =>
                        updateMachine(i, { unitPrice: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
                    />
                  </div>
                  <div>
                    {margin && (
                      <div>
                        <Label>Kar Marjı</Label>
                        <div
                          className={cn(
                            'px-4 py-3 rounded-xl text-sm font-bold',
                            margin.percentage > 0
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          )}
                        >
                          %{margin.percentage.toFixed(1)} (
                          {formatCurrency(margin.amount, q.pricing.currency)})
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <Label>Dahili Ekipmanlar</Label>
                  <MaterialSelector
                    selected={m.materials}
                    onChange={(materials) => updateMachine(i, { materials })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom quick-add bar */}
      {q.machines.length > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addMachine}
            className="flex-1 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-adotek-red text-gray-400 hover:text-adotek-red font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Boş Ekle
          </button>
          {machineTemplates.length > 0 && (
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:border-adotek-red text-gray-400 hover:text-adotek-red font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Book className="w-3.5 h-3.5" /> Kütüphaneden
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderPricing = () => {
    const totalCost = q.machines.reduce(
      (sum, m) => sum + (m.unitCost || 0) * m.quantity,
      0
    );
    const totalRevenue = q.machines.reduce(
      (sum, m) => sum + m.unitPrice * m.quantity,
      0
    );
    const overallMargin = totalRevenue
      ? calculateMargin(totalCost, totalRevenue)
      : null;

    return (
      <div className="space-y-6">
        <SectionHeader
          title={isPneuamtic ? 'Proforma Ticari Şartlar' : 'Fiyat & Şartlar'}
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Para Birimi</Label>
            <select
              value={q.pricing.currency}
              onChange={(e) =>
                update({
                  pricing: {
                    ...q.pricing,
                    currency: e.target.value as 'TRY' | 'EUR' | 'USD',
                  },
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
            >
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
              <option value="TRY">₺ TRY</option>
            </select>
          </div>
          <div>
            <Label>Genel İskonto %</Label>
            <input
              type="number"
              value={q.pricing.discountRate}
              onChange={(e) =>
                update({
                  pricing: {
                    ...q.pricing,
                    discountRate: Number(e.target.value),
                  },
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
            />
          </div>
          <div>
            <Label>KDV %</Label>
            <input
              type="number"
              value={q.pricing.vatRate}
              onChange={(e) =>
                update({
                  pricing: { ...q.pricing, vatRate: Number(e.target.value) },
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
            />
          </div>
        </div>

        <div>
          <Label>Manuel Ara Toplam (opsiyonel override)</Label>
          <input
            type="number"
            value={q.pricing.manualSubtotal || ''}
            onChange={(e) =>
              update({
                pricing: {
                  ...q.pricing,
                  manualSubtotal: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                },
              })
            }
            placeholder="Boş bırakılırsa otomatik hesaplanır"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none"
          />
        </div>

        {/* Extra costs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Ek Giderler</Label>
            <button
              type="button"
              onClick={addExtraCost}
              className="text-xs text-adotek-red font-bold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Ekle
            </button>
          </div>
          <div className="space-y-2">
            {(q.pricing.extraCosts || []).map((c, i) => (
              <div key={c.id} className="flex gap-2">
                <input
                  value={c.name}
                  onChange={(e) => updateExtraCost(i, { name: e.target.value })}
                  placeholder="Gider adı"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-adotek-red outline-none"
                />
                <input
                  type="number"
                  value={c.amount}
                  onChange={(e) =>
                    updateExtraCost(i, { amount: Number(e.target.value) })
                  }
                  placeholder="Tutar"
                  className="w-32 px-3 py-2 rounded-xl border border-gray-200 text-sm text-right focus:border-adotek-red outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeExtraCost(i)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Garanti Süresi</Label>
            <VoiceInput
              value={q.pricing.warrantyPeriod}
              onValueChange={(v) =>
                update({ pricing: { ...q.pricing, warrantyPeriod: v } })
              }
              language={lang}
              placeholder="2 Yıl"
            />
          </div>
          <div>
            <Label>Teslim Süresi</Label>
            <VoiceInput
              value={q.pricing.deliveryTime}
              onValueChange={(v) =>
                update({ pricing: { ...q.pricing, deliveryTime: v } })
              }
              language={lang}
              placeholder="8 Hafta"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Teslim Yeri</Label>
            <VoiceInput
              value={q.pricing.deliveryPlace || ''}
              onValueChange={(v) =>
                update({ pricing: { ...q.pricing, deliveryPlace: v } })
              }
              language={lang}
              placeholder="İstanbul"
            />
          </div>
          <div>
            <Label>Teslim Şekli</Label>
            <VoiceInput
              value={q.pricing.deliveryType || ''}
              onValueChange={(v) =>
                update({ pricing: { ...q.pricing, deliveryType: v } })
              }
              language={lang}
              placeholder="Exworks / DAP"
            />
          </div>
        </div>

        <div>
          <Label>Ödeme Koşulları</Label>
          <VoiceInput
            value={q.pricing.paymentTerms || ''}
            onValueChange={(v) =>
              update({ pricing: { ...q.pricing, paymentTerms: v } })
            }
            language={lang}
            placeholder="%50 Peşin, %50 Teslimatta"
          />
        </div>

        {!isPneuamtic && (
          <>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={q.pricing.includeInstallation}
                  onChange={(e) =>
                    update({
                      pricing: {
                        ...q.pricing,
                        includeInstallation: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-adotek-red"
                />
                <span className="text-sm text-gray-700">
                  Kurulum Dahil
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={q.pricing.includeTraining}
                  onChange={(e) =>
                    update({
                      pricing: {
                        ...q.pricing,
                        includeTraining: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-adotek-red"
                />
                <span className="text-sm text-gray-700">
                  Eğitim Dahil
                </span>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Şartlar & Koşullar</Label>
                <button
                  type="button"
                  onClick={() => setAiModalOpen('terms')}
                  className="text-xs text-adotek-red font-bold flex items-center gap-1 hover:underline"
                >
                  <Wand2 className="w-3 h-3" /> AI ile Düzenle
                </button>
              </div>
              <VoiceTextarea
                value={q.terms}
                onValueChange={(v) => update({ terms: v })}
                language={lang}
                rows={6}
                placeholder="Sözleşme maddeleri..."
              />
            </div>
          </>
        )}

        {/* Cost / Margin Analysis Panel */}
        {totalCost > 0 && (
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-adotek-red" />
              <span className="text-sm font-bold text-gray-700">
                Maliyet / Kâr Analizi
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Toplam Maliyet:</span>
                <div className="font-bold text-gray-800">
                  {formatCurrency(totalCost, q.pricing.currency)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Toplam Gelir:</span>
                <div className="font-bold text-gray-800">
                  {formatCurrency(totalRevenue, q.pricing.currency)}
                </div>
              </div>
              {overallMargin && (
                <div>
                  <span className="text-gray-500">Genel Kâr Marjı:</span>
                  <div
                    className={cn(
                      'font-bold',
                      overallMargin.percentage > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    %{overallMargin.percentage.toFixed(1)} (
                    {formatCurrency(overallMargin.amount, q.pricing.currency)})
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exchange rate widget */}
        <div className="p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-adotek-red" />
              <span className="text-sm font-bold text-gray-700">
                Döviz Kurları
              </span>
            </div>
            <button
              type="button"
              onClick={fetchExchangeRates}
              className="text-xs text-adotek-red font-bold hover:underline"
            >
              Güncelle
            </button>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">USD/TRY:</span>
              <span className="font-bold">
                {exchangeRates.TRY ? exchangeRates.TRY.toFixed(2) : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">EUR/TRY:</span>
              <span className="font-bold">
                {exchangeRates.EUR && exchangeRates.TRY
                  ? (exchangeRates.TRY / exchangeRates.EUR).toFixed(2)
                  : '—'}
              </span>
            </div>
          </div>
          {exchangeRates.lastUpdate && (
            <p className="text-[10px] text-gray-400 mt-2">
              Son güncelleme:{' '}
              {new Date(exchangeRates.lastUpdate).toLocaleString('tr-TR')}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderDocuments = () => (
    <div className="space-y-6">
      <SectionHeader title="Dokümanlar" />

      <label className="flex items-center gap-2 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={q.showDocuments}
          onChange={(e) => update({ showDocuments: e.target.checked })}
          className="w-4 h-4 accent-adotek-red"
        />
        <span className="text-sm text-gray-700">
          PDF'te doküman sayfasını göster
        </span>
      </label>

      <button
        type="button"
        onClick={handleDocUpload}
        className="w-full py-8 rounded-2xl border-2 border-dashed border-gray-300 hover:border-adotek-red text-gray-500 hover:text-adotek-red transition-colors flex flex-col items-center gap-2"
      >
        <Upload className="w-6 h-6" />
        <span className="text-sm font-bold">Dosya Yükle</span>
        <span className="text-xs text-gray-400">PDF, PNG, JPG</span>
      </button>

      {(q.documents || []).length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {(q.documents || []).map((doc) => (
            <div
              key={doc.id}
              className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileUp className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                    {doc.name}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase">
                    {doc.type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  update({
                    documents: (q.documents || []).filter(
                      (d) => d.id !== doc.id
                    ),
                  })
                }
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReferences = () => (
    <div className="space-y-6">
      <SectionHeader title="Referanslar" />

      <label className="flex items-center gap-2 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={q.references.show}
          onChange={(e) =>
            update({
              references: { ...q.references, show: e.target.checked },
            })
          }
          className="w-4 h-4 accent-adotek-red"
        />
        <span className="text-sm text-gray-700">
          PDF'te referans sayfasını göster
        </span>
      </label>

      <button
        type="button"
        onClick={handleRefLogoUpload}
        className="w-full py-8 rounded-2xl border-2 border-dashed border-gray-300 hover:border-adotek-red text-gray-500 hover:text-adotek-red transition-colors flex flex-col items-center gap-2"
      >
        <Upload className="w-6 h-6" />
        <span className="text-sm font-bold">Referans Logoları Yükle</span>
      </button>

      {q.references.logos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {q.references.logos.map((logo, i) => (
            <div
              key={i}
              className="relative p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-center h-24"
            >
              <img
                src={logo}
                alt={`Ref ${i + 1}`}
                className="max-h-16 object-contain"
              />
              <button
                type="button"
                onClick={() =>
                  update({
                    references: {
                      ...q.references,
                      logos: q.references.logos.filter((_, j) => j !== i),
                    },
                  })
                }
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <SectionHeader title="Görevlerim" />
      <div className="p-8 text-center text-gray-400">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium">Görev planlayıcı yakında burada!</p>
        <p className="text-xs mt-1">Bu özellik geliştirme aşamasındadır.</p>
      </div>
    </div>
  );

  const applyProfileTemplate = (templateId: string) => {
    const tmpl = profileTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;
    updateCompanyInfo({ profile: { ...tmpl.data, experienceTitle: 'Deneyim' } });
  };

  const renderProfile = () => {
    const ci = companyInfo;
    const profile = ci.profile || {
      visionTitle: '', visionText: '', qualityTitle: '', qualityText: '',
      rdTitle: '', rdText: '', experienceTitle: 'Deneyim',
      experienceYears: '', projectsCount: '',
    };
    const updateProfile = (partial: Partial<typeof profile>) => {
      updateCompanyInfo({ profile: { ...profile, ...partial } });
    };
    return (
      <div className="space-y-6">
        <SectionHeader title="Şirket Profili & Bilgileri" />

        {/* Profile Templates */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Hazır Profil Şablonları — Tek Tıkla Doldur</p>
          <div className="grid grid-cols-4 gap-2">
            {profileTemplates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => applyProfileTemplate(tmpl.id)}
                className="group p-3 rounded-xl border border-gray-200 hover:border-adotek-red hover:bg-red-50 transition-all text-left"
              >
                <span className="text-lg">{tmpl.emoji}</span>
                <p className="text-xs font-bold text-gray-700 mt-1 group-hover:text-adotek-red">{tmpl.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{tmpl.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Firma Adı</Label>
            <VoiceInput value={ci.name} onValueChange={(v) => updateCompanyInfo({ name: v })} language={lang} />
          </div>
          <div>
            <Label>Website</Label>
            <VoiceInput value={ci.website} onValueChange={(v) => updateCompanyInfo({ website: v })} language={lang} />
          </div>
        </div>
        <div>
          <Label>Adres</Label>
          <VoiceInput value={ci.address} onValueChange={(v) => updateCompanyInfo({ address: v })} language={lang} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Telefon</Label>
            <VoiceInput value={ci.phone} onValueChange={(v) => updateCompanyInfo({ phone: v })} language={lang} />
          </div>
          <div>
            <Label>E-posta</Label>
            <VoiceInput value={ci.email} onValueChange={(v) => updateCompanyInfo({ email: v })} language={lang} />
          </div>
        </div>

        {/* Logo */}
        <div>
          <Label>Firma Logosu</Label>
          <button
            type="button"
            onClick={() => handleImageUpload((b64) => updateCompanyInfo({ logo: b64 }), 400, 200)}
            className="h-24 w-48 rounded-xl border-2 border-dashed border-gray-300 hover:border-adotek-red flex items-center justify-center transition-colors"
          >
            {ci.logo ? (
              <img src={ci.logo} alt="Logo" className="h-16 object-contain" />
            ) : (
              <div className="text-center text-gray-400">
                <Upload className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Logo Yükle</span>
              </div>
            )}
          </button>
        </div>

        {/* Kurumsal Profil */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Kurumsal Profil (PDF'te görünür)</p>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Vizyon/Misyon Başlık</Label>
                <input value={profile.visionTitle} onChange={(e) => updateProfile({ visionTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm" />
              </div>
              <div className="col-span-2">
                <Label>Vizyon/Misyon Metin</Label>
                <textarea value={profile.visionText} onChange={(e) => updateProfile({ visionText: e.target.value })} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Kalite Başlık</Label>
                <input value={profile.qualityTitle} onChange={(e) => updateProfile({ qualityTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm" />
              </div>
              <div className="col-span-2">
                <Label>Kalite Metin</Label>
                <textarea value={profile.qualityText} onChange={(e) => updateProfile({ qualityText: e.target.value })} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Ar-Ge Başlık</Label>
                <input value={profile.rdTitle} onChange={(e) => updateProfile({ rdTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm" />
              </div>
              <div className="col-span-2">
                <Label>Ar-Ge Metin</Label>
                <textarea value={profile.rdText} onChange={(e) => updateProfile({ rdText: e.target.value })} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Deneyim (Yıl)</Label>
                <input value={profile.experienceYears} onChange={(e) => updateProfile({ experienceYears: e.target.value })}
                  placeholder="25+" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm" />
              </div>
              <div>
                <Label>Tamamlanan Proje</Label>
                <input value={profile.projectsCount} onChange={(e) => updateProfile({ projectsCount: e.target.value })}
                  placeholder="1.500+" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Banka Bilgileri */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Banka Bilgileri</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Banka Adı</Label>
              <input value={ci.bankDetails?.bankName || ''} onChange={(e) => updateCompanyInfo({ bankDetails: { ...ci.bankDetails, bankName: e.target.value } })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm" />
            </div>
            <div>
              <Label>Şube</Label>
              <input value={ci.bankDetails?.branch || ''} onChange={(e) => updateCompanyInfo({ bankDetails: { ...ci.bankDetails, branch: e.target.value } })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm" />
            </div>
            <div>
              <Label>IBAN</Label>
              <input value={ci.bankDetails?.iban || ''} onChange={(e) => updateCompanyInfo({ bankDetails: { ...ci.bankDetails, iban: e.target.value } })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none text-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneral();
      case 'preface':
        return renderPreface();
      case 'benefits':
        return renderBenefits();
      case 'machines':
        return renderMachines();
      case 'pricing':
        return renderPricing();
      case 'documents':
        return renderDocuments();
      case 'references':
        return renderReferences();
      case 'tasks':
        return renderTasks();
      case 'profile':
        return renderProfile();
    }
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-80px)]">
      {/* Left sidebar tabs */}
      <div className="w-56 shrink-0">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-3 sticky top-24">
          <nav className="space-y-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-adotek-red text-white shadow-lg shadow-adotek-red/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                )}
              >
                {tab.icon}
                <span className="flex-1 text-left">{tab.label}</span>
                {/* Tab completion indicator */}
                {(() => {
                  const status = getTabStatus(tab.id);
                  if (status === 'complete')
                    return (
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          activeTab === tab.id ? 'bg-white' : 'bg-green-500'
                        )}
                      />
                    );
                  if (status === 'partial')
                    return (
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          activeTab === tab.id ? 'bg-white/60' : 'bg-amber-400'
                        )}
                      />
                    );
                  return null;
                })()}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {renderTab()}
        </div>
      </div>

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-adotek-red" />
                <h3 className="font-bold text-gray-800">AI ile Düzenle</h3>
              </div>
              <button
                onClick={() => {
                  setAiModalOpen(null);
                  setAiInstruction('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <VoiceTextarea
              value={aiInstruction}
              onValueChange={setAiInstruction}
              language={lang}
              rows={4}
              placeholder="Özel talimat girin (boş bırakılırsa varsayılan düzenleme yapılır)"
              className="mb-4"
            />

            <button
              onClick={() => handleAiAction(aiModalOpen)}
              disabled={aiLoading}
              className="w-full py-3 bg-adotek-red text-white rounded-full font-bold shadow-lg shadow-adotek-red/20 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {aiLoading ? (
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
              ) : (
                <Wand2 className="w-4 h-4 inline mr-2" />
              )}
              AI'yı Çalıştır
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
