export type Currency = 'TRY' | 'EUR' | 'USD';

export interface ExchangeRates {
  USD: number;
  EUR: number;
  TRY: number;
  lastUpdate: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  unitPrice?: number;
  currency?: Currency;
  user_id?: string;
}

export interface BankDetails {
  bankName: string;
  branch: string;
  iban: string;
}

export interface Machine {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  discount?: number;
  materials: Material[];
}

export interface MachineTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  unitPrice: number;
  materials: Material[];
  user_id?: string;
}

export interface ExtraCost {
  id: string;
  name: string;
  amount: number;
}

export interface Pricing {
  currency: Currency;
  manualSubtotal?: number;
  discountRate: number;
  vatRate: number;
  includeInstallation: boolean;
  includeTraining: boolean;
  warrantyPeriod: string;
  deliveryTime: string;
  deliveryPlace?: string;
  deliveryType?: string;
  paymentTerms?: string;
  extraCosts?: ExtraCost[];
}

export interface CompanyProfile {
  visionTitle: string;
  visionText: string;
  qualityTitle: string;
  qualityText: string;
  rdTitle: string;
  rdText: string;
  experienceTitle: string;
  projectsCount: string;
  experienceYears: string;
}

export interface CompanyInfo {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  bankDetails: BankDetails;
  profile?: CompanyProfile;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
}

export interface ROIComparison {
  id: string;
  label: string;
  currentValue: string;
  newValue: string;
  benefit: string;
}

export interface BenefitsSection {
  show: boolean;
  title: string;
  description: string;
  benefits: Benefit[];
  roiComparison: ROIComparison[];
  monthlySaving: number;
  yearlySaving: number;
  motivationTitle: string;
  motivationText: string;
}

export interface QuotationDocument {
  id: string;
  name: string;
  type: string;
  content: string;
}

export type QuotationType =
  | 'Standard Machine Quotation'
  | 'Comprehensive Machine Quotation'
  | 'Service & Maintenance Quotation'
  | 'Pneuamtic Proforma';

export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected';
export type QuotationLanguage = 'tr' | 'en';

export interface Quotation {
  id: string;
  number: string;
  date: string;
  customerCompany: string;
  customerName: string;
  customerLogo?: string;
  type: QuotationType;
  coverTitle: string;
  coverImage: string;
  foreword: string;
  senderName: string;
  senderTitle: string;
  senderSignature: string;
  machines: Machine[];
  pricing: Pricing;
  terms: string;
  references: {
    show: boolean;
    logos: string[];
  };
  benefitsSection?: BenefitsSection;
  documents?: QuotationDocument[];
  showDocuments: boolean;
  status: QuotationStatus;
  language: QuotationLanguage;
  user_id?: string;
}

export type ViewType =
  | 'dashboard'
  | 'builder'
  | 'list'
  | 'settings'
  | 'finance'
  | 'stock'
  | 'calculator'
  | 'customers'
  | 'production'
  | 'tasks'
  | 'management'
  | 'technical-service'
  | 'team-management';
