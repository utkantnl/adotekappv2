import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type {
  Quotation,
  MachineTemplate,
  Material,
  CompanyInfo,
  ExchangeRates,
  ViewType,
  BankDetails,
} from '../types';

// --- localStorage persistence helpers ---
const LS_KEYS = {
  quotations: 'adotek_quotations',
  machineTemplates: 'adotek_machine_templates',
  materials: 'adotek_materials',
  companyInfo: 'adotek_company_info',
  defaults: 'adotek_user_defaults',
} as const;

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — silently ignore
  }
}

const defaultBankDetails: BankDetails = {
  bankName: '',
  branch: '',
  iban: '',
};

const defaultCompanyInfo: CompanyInfo = {
  name: 'Adotek Makina',
  logo: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  bankDetails: defaultBankDetails,
  profile: {
    visionTitle: 'Vizyonumuz',
    visionText: '',
    qualityTitle: 'Kalite Politikamız',
    qualityText: '',
    rdTitle: 'AR-GE',
    rdText: '',
    experienceTitle: 'Deneyim',
    projectsCount: '500+',
    experienceYears: '20+',
  },
};

function createDefaultQuotation(): Quotation {
  const now = new Date();
  const year = now.getFullYear();
  const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return {
    id: crypto.randomUUID(),
    number: `TKL-${year}-${num}`,
    date: now.toISOString().split('T')[0],
    customerCompany: '',
    customerName: '',
    type: 'Standard Machine Quotation',
    coverTitle: '',
    coverImage: '',
    foreword: '',
    senderName: '',
    senderTitle: '',
    senderSignature: '',
    machines: [],
    pricing: {
      currency: 'EUR',
      discountRate: 0,
      vatRate: 20,
      includeInstallation: true,
      includeTraining: true,
      warrantyPeriod: '2 Yıl',
      deliveryTime: '8 Hafta',
    },
    terms: '',
    references: { show: false, logos: [] },
    showDocuments: false,
    status: 'draft',
    language: 'tr',
  };
}

interface AppState {
  // View
  view: ViewType;
  setView: (view: ViewType) => void;

  // Quotation
  quotations: Quotation[];
  currentQuotation: Quotation;
  setCurrentQuotation: (q: Quotation) => void;
  updateCurrentQuotation: (partial: Partial<Quotation>) => void;
  resetCurrentQuotation: () => void;
  addQuotation: (q: Quotation) => Promise<void>;
  updateQuotation: (id: string, partial: Partial<Quotation>) => void;
  removeQuotation: (id: string) => void;
  duplicateQuotation: (id: string) => Promise<void>;

  // Machine Templates
  machineTemplates: MachineTemplate[];
  addMachineTemplate: (t: MachineTemplate) => void;
  updateMachineTemplate: (id: string, t: Partial<MachineTemplate>) => void;
  deleteMachineTemplate: (id: string) => void;

  // Materials
  materials: Material[];
  addMaterial: (m: Material) => void;
  updateMaterial: (id: string, m: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  // Company
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;

  // Exchange Rates
  exchangeRates: ExchangeRates;
  fetchExchangeRates: () => Promise<void>;

  // Defaults & History
  defaultTerms: string;
  setDefaultTerms: (terms: string) => void;
  defaultSenderName: string;
  defaultSenderTitle: string;
  defaultSenderSignature: string;
  setDefaultSender: (name: string, title: string, signature: string) => void;
  getCustomerHistory: () => Array<{ company: string; name: string; logo?: string }>;
  getRecentQuotations: (limit?: number) => Quotation[];

  // Init
  initialized: boolean;
  fetchInitialData: (force?: boolean) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // View
  view: 'builder',
  setView: (view) => set({ view }),

  // Quotation (load from localStorage)
  quotations: lsGet<Quotation[]>(LS_KEYS.quotations, []),
  currentQuotation: createDefaultQuotation(),

  setCurrentQuotation: (q) => set({ currentQuotation: q }),

  updateCurrentQuotation: (partial) =>
    set((s) => ({
      currentQuotation: { ...s.currentQuotation, ...partial },
    })),

  resetCurrentQuotation: () => {
    const { defaultSenderName, defaultSenderTitle, defaultSenderSignature, defaultTerms } = get();
    const q = createDefaultQuotation();
    q.senderName = defaultSenderName;
    q.senderTitle = defaultSenderTitle;
    q.senderSignature = defaultSenderSignature;
    q.terms = defaultTerms;
    set({ currentQuotation: q });
  },

  addQuotation: async (q) => {
    const { quotations } = get();
    const exists = quotations.find((x) => x.id === q.id);

    if (exists) {
      set({
        quotations: quotations.map((x) => (x.id === q.id ? q : x)),
      });
    } else {
      set({ quotations: [...quotations, q] });
    }
    lsSet(LS_KEYS.quotations, get().quotations);

    // Save to Supabase
    if (supabase) {
      try {
        await supabase.from('quotations').upsert({
          id: q.id,
          data: q,
          user_id: q.user_id,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Failed to save quotation:', e);
      }
    }

    // Auto-save machine templates
    for (const machine of q.machines) {
      if (!machine.name) continue;
      const { machineTemplates } = get();
      const existing = machineTemplates.find(
        (t) => t.name === machine.name && t.user_id === q.user_id
      );
      const template: MachineTemplate = {
        id: existing?.id || crypto.randomUUID(),
        name: machine.name,
        description: machine.description,
        imageUrl: machine.imageUrl,
        unitPrice: machine.unitPrice,
        materials: machine.materials,
        user_id: q.user_id,
      };
      if (existing) {
        get().updateMachineTemplate(existing.id, template);
      } else {
        get().addMachineTemplate(template);
      }
    }
  },

  updateQuotation: (id, partial) => {
    set((s) => ({
      quotations: s.quotations.map((q) =>
        q.id === id ? { ...q, ...partial } : q
      ),
    }));
    lsSet(LS_KEYS.quotations, get().quotations);
    const updated = get().quotations.find((q) => q.id === id);
    if (updated) {
      supabase
        ?.from('quotations')
        .upsert({ id, data: updated, status: updated.status, updated_at: new Date().toISOString() })
        .then();
    }
  },

  removeQuotation: async (id) => {
    set((s) => ({
      quotations: s.quotations.filter((q) => q.id !== id),
    }));
    lsSet(LS_KEYS.quotations, get().quotations);
    if (supabase) {
      try {
        await supabase.from('quotations').delete().eq('id', id);
      } catch (e) {
        console.error('Failed to delete quotation:', e);
      }
    }
  },

  duplicateQuotation: async (id) => {
    const { quotations } = get();
    const original = quotations.find((q) => q.id === id);
    if (!original) return;

    const now = new Date();
    const year = now.getFullYear();
    const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

    const duplicate: Quotation = {
      ...structuredClone(original),
      id: crypto.randomUUID(),
      number: `TKL-${year}-${num}`,
      date: now.toISOString().split('T')[0],
      status: 'draft',
    };

    await get().addQuotation(duplicate);
  },

  // Machine Templates
  machineTemplates: lsGet<MachineTemplate[]>(LS_KEYS.machineTemplates, []),

  addMachineTemplate: (t) => {
    set((s) => ({ machineTemplates: [...s.machineTemplates, t] }));
    lsSet(LS_KEYS.machineTemplates, get().machineTemplates);
    supabase
      ?.from('machine_templates')
      .upsert({ id: t.id, data: t, user_id: t.user_id })
      .then();
  },

  updateMachineTemplate: (id, partial) => {
    set((s) => ({
      machineTemplates: s.machineTemplates.map((t) =>
        t.id === id ? { ...t, ...partial } : t
      ),
    }));
    lsSet(LS_KEYS.machineTemplates, get().machineTemplates);
    const updated = get().machineTemplates.find((t) => t.id === id);
    if (updated) {
      supabase
        ?.from('machine_templates')
        .upsert({ id, data: updated, user_id: updated.user_id })
        .then();
    }
  },

  deleteMachineTemplate: (id) => {
    set((s) => ({
      machineTemplates: s.machineTemplates.filter((t) => t.id !== id),
    }));
    lsSet(LS_KEYS.machineTemplates, get().machineTemplates);
    supabase?.from('machine_templates').delete().eq('id', id).then();
  },

  // Materials
  materials: lsGet<Material[]>(LS_KEYS.materials, []),

  addMaterial: (m) => {
    set((s) => ({ materials: [...s.materials, m] }));
    lsSet(LS_KEYS.materials, get().materials);
    supabase
      ?.from('materials')
      .upsert({ id: m.id, data: m, user_id: m.user_id })
      .then();
  },

  updateMaterial: (id, partial) => {
    set((s) => ({
      materials: s.materials.map((m) =>
        m.id === id ? { ...m, ...partial } : m
      ),
    }));
    lsSet(LS_KEYS.materials, get().materials);
    const updated = get().materials.find((m) => m.id === id);
    if (updated) {
      supabase
        ?.from('materials')
        .upsert({ id, data: updated, user_id: updated.user_id })
        .then();
    }
  },

  deleteMaterial: (id) => {
    set((s) => ({ materials: s.materials.filter((m) => m.id !== id) }));
    lsSet(LS_KEYS.materials, get().materials);
    supabase?.from('materials').delete().eq('id', id).then();
  },

  // Company Info
  companyInfo: lsGet<CompanyInfo>(LS_KEYS.companyInfo, defaultCompanyInfo),

  updateCompanyInfo: (info) => {
    set((s) => ({
      companyInfo: { ...s.companyInfo, ...info },
    }));
    const updated = get().companyInfo;
    lsSet(LS_KEYS.companyInfo, updated);
    supabase
      ?.from('company_info')
      .upsert({ id: 'main', data: updated })
      .then();
  },

  // Exchange Rates
  exchangeRates: { USD: 0, EUR: 0, TRY: 1, lastUpdate: '' },

  fetchExchangeRates: async () => {
    try {
      const res = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );
      const data = await res.json();
      set({
        exchangeRates: {
          USD: 1,
          EUR: data.rates?.EUR ? 1 / data.rates.EUR : 0,
          TRY: data.rates?.TRY || 0,
          lastUpdate: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.error('Failed to fetch exchange rates:', e);
    }
  },

  // Defaults & History
  defaultTerms: lsGet<{ t: string; sn: string; st: string; ss: string }>(LS_KEYS.defaults, { t: '', sn: '', st: '', ss: '' }).t,
  setDefaultTerms: (terms) => {
    set({ defaultTerms: terms });
    const d = lsGet<{ t: string; sn: string; st: string; ss: string }>(LS_KEYS.defaults, { t: '', sn: '', st: '', ss: '' });
    lsSet(LS_KEYS.defaults, { ...d, t: terms });
    supabase
      ?.from('user_defaults')
      .upsert({ id: 'main', default_terms: terms, updated_at: new Date().toISOString() })
      .then();
  },

  defaultSenderName: lsGet<{ t: string; sn: string; st: string; ss: string }>(LS_KEYS.defaults, { t: '', sn: '', st: '', ss: '' }).sn,
  defaultSenderTitle: lsGet<{ t: string; sn: string; st: string; ss: string }>(LS_KEYS.defaults, { t: '', sn: '', st: '', ss: '' }).st,
  defaultSenderSignature: lsGet<{ t: string; sn: string; st: string; ss: string }>(LS_KEYS.defaults, { t: '', sn: '', st: '', ss: '' }).ss,
  setDefaultSender: (name, title, signature) => {
    set({
      defaultSenderName: name,
      defaultSenderTitle: title,
      defaultSenderSignature: signature,
    });
    const d = lsGet<{ t: string; sn: string; st: string; ss: string }>(LS_KEYS.defaults, { t: '', sn: '', st: '', ss: '' });
    lsSet(LS_KEYS.defaults, { ...d, sn: name, st: title, ss: signature });
    supabase
      ?.from('user_defaults')
      .upsert({
        id: 'main',
        default_sender_name: name,
        default_sender_title: title,
        default_sender_signature: signature,
        updated_at: new Date().toISOString(),
      })
      .then();
  },

  getCustomerHistory: () => {
    const { quotations } = get();
    const seen = new Set<string>();
    const customers: Array<{ company: string; name: string; logo?: string }> = [];
    for (const q of quotations) {
      if (q.customerCompany && !seen.has(q.customerCompany)) {
        seen.add(q.customerCompany);
        customers.push({
          company: q.customerCompany,
          name: q.customerName,
          logo: q.customerLogo,
        });
      }
    }
    return customers;
  },

  getRecentQuotations: (limit = 5) => {
    const { quotations } = get();
    return [...quotations]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  },

  // Init
  initialized: false,

  fetchInitialData: async (force = false) => {
    if (get().initialized && !force) return;

    if (supabase) {
      try {
        // Fetch quotations
        const { data: qData } = await supabase
          .from('quotations')
          .select('*')
          .order('updated_at', { ascending: false });
        if (qData) {
          const quotations = qData.map((r: { data: Quotation }) => r.data);
          set({ quotations });
          lsSet(LS_KEYS.quotations, quotations);
        }

        // Fetch machine templates
        const { data: mtData } = await supabase
          .from('machine_templates')
          .select('*');
        if (mtData) {
          const templates = mtData.map((r: { data: MachineTemplate }) => r.data);
          set({ machineTemplates: templates });
          lsSet(LS_KEYS.machineTemplates, templates);
        }

        // Fetch materials
        const { data: mData } = await supabase.from('materials').select('*');
        if (mData) {
          const materials = mData.map((r: { data: Material }) => r.data);
          set({ materials });
          lsSet(LS_KEYS.materials, materials);
        }

        // Fetch company info
        const { data: cData } = await supabase
          .from('company_info')
          .select('*')
          .eq('id', 'main')
          .single();
        if (cData?.data) {
          const merged = {
            ...defaultCompanyInfo,
            ...cData.data,
            bankDetails: { ...defaultBankDetails, ...cData.data.bankDetails },
            profile: { ...defaultCompanyInfo.profile, ...cData.data.profile },
          };
          set({ companyInfo: merged });
          lsSet(LS_KEYS.companyInfo, merged);
        }

        // Fetch user defaults
        const { data: dData } = await supabase
          .from('user_defaults')
          .select('*')
          .eq('id', 'main')
          .single();
        if (dData) {
          const defaults = {
            defaultTerms: dData.default_terms || '',
            defaultSenderName: dData.default_sender_name || '',
            defaultSenderTitle: dData.default_sender_title || '',
            defaultSenderSignature: dData.default_sender_signature || '',
          };
          set(defaults);
          lsSet(LS_KEYS.defaults, {
            t: defaults.defaultTerms,
            sn: defaults.defaultSenderName,
            st: defaults.defaultSenderTitle,
            ss: defaults.defaultSenderSignature,
          });
        }
      } catch (e) {
        console.error('Failed to fetch initial data:', e);
      }
    }

    // Fetch exchange rates
    get().fetchExchangeRates();
    set({ initialized: true });
  },
}));
