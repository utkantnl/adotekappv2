import { forwardRef } from 'react';
import type { Quotation, CompanyInfo } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../lib/pricing';

interface PrintLayoutProps {
  quotation: Quotation;
  companyInfo: CompanyInfo;
}

const translations = {
  tr: {
    preparedFor: 'Hazırlayan',
    foreword: 'Önsöz',
    regards: 'Saygılarımızla,',
    details: 'Teknik Detaylar',
    subtotal: 'Ara Toplam',
    discount: 'İskonto',
    vat: 'KDV',
    grandTotal: 'GENEL TOPLAM',
    warranty: 'Garanti Süresi',
    delivery: 'Teslim Süresi',
    deliveryPlace: 'Teslim Yeri',
    deliveryType: 'Teslim Şekli',
    installation: 'Kurulum',
    training: 'Eğitim',
    included: 'Dahil',
    excluded: 'Hariç',
    payment: 'Ödeme Koşulları',
    bankInfo: 'Banka Bilgileri',
    termsTitle: 'Fiyat & Ticari Şartlar',
    references: 'Referanslarımız',
    documents: 'Ek Dokümanlar',
    thankYou: 'Teşekkür Ederiz',
    quantity: 'Adet',
    unitPrice: 'Birim Fiyat',
    total: 'Toplam',
    description: 'Açıklama',
    item: 'Kalem',
    discountPercent: 'İskonto %',
    equipments: 'Dahili Ekipmanlar',
    monthlySaving: 'Aylık Tasarruf',
    yearlySaving: 'Yıllık Tasarruf',
    current: 'Mevcut Durum',
    newSystem: 'Yeni Sistem',
    benefit: 'Fayda',
    criterion: 'Kriter',
    quotationNo: 'Teklif No',
    date: 'Tarih',
    extraCosts: 'Ek Giderler',
    corporateProfile: 'Kurumsal Profil',
    technicalSpecs: 'Teknik Özellikler',
    priceBreakdown: 'Fiyat Detayı',
    commercialTerms: 'Ticari Şartlar',
    contactUs: 'İletişim',
  },
  en: {
    preparedFor: 'Prepared By',
    foreword: 'Foreword',
    regards: 'Best regards,',
    details: 'Technical Details',
    subtotal: 'Subtotal',
    discount: 'Discount',
    vat: 'VAT',
    grandTotal: 'GRAND TOTAL',
    warranty: 'Warranty',
    delivery: 'Delivery Time',
    deliveryPlace: 'Delivery Place',
    deliveryType: 'Delivery Type',
    installation: 'Installation',
    training: 'Training',
    included: 'Included',
    excluded: 'Excluded',
    payment: 'Payment Terms',
    bankInfo: 'Bank Details',
    termsTitle: 'Pricing & Commercial Terms',
    references: 'Our References',
    documents: 'Appendix Documents',
    thankYou: 'Thank You',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    total: 'Total',
    description: 'Description',
    item: 'Item',
    discountPercent: 'Discount %',
    equipments: 'Included Equipment',
    monthlySaving: 'Monthly Saving',
    yearlySaving: 'Yearly Saving',
    current: 'Current',
    newSystem: 'New System',
    benefit: 'Benefit',
    criterion: 'Criterion',
    quotationNo: 'Quotation No',
    date: 'Date',
    extraCosts: 'Additional Costs',
    corporateProfile: 'Corporate Profile',
    technicalSpecs: 'Technical Specifications',
    priceBreakdown: 'Price Breakdown',
    commercialTerms: 'Commercial Terms',
    contactUs: 'Contact',
  },
};

/* ── Shared page footer strip ── */
function PageFooter({ companyInfo, pageNum, color = 'dark' }: { companyInfo: CompanyInfo; pageNum?: number; color?: 'dark' | 'light' }) {
  const textCls = color === 'light' ? 'text-white/40' : 'text-gray-300';
  return (
    <div className="mt-auto pt-6">
      <div className="flex items-center justify-between text-[9px]" style={{ color: color === 'light' ? 'rgba(255,255,255,0.35)' : '#bbb' }}>
        <span>{companyInfo.name} — {companyInfo.website}</span>
        {pageNum && <span className={textCls}>—  {pageNum}  —</span>}
      </div>
    </div>
  );
}

/* ── Section title component ── */
function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-[3px] bg-[#E30613]" />
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '26px', fontWeight: 900, letterSpacing: '-0.02em', color: '#111' }}>
          {children}
        </h2>
      </div>
      {sub && <p style={{ fontSize: '12px', color: '#888', maxWidth: '480px', marginLeft: '44px' }}>{sub}</p>}
    </div>
  );
}

const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(
  ({ quotation, companyInfo }, ref) => {
    const q = quotation;
    const t = translations[q.language] || translations.tr;
    const totals = calculateQuotationTotals(q);
    const isPneuamtic = q.type === 'Pneuamtic Proforma';

    if (isPneuamtic) {
      return (
        <div ref={ref}>
          <PneuamticLayout quotation={q} companyInfo={companyInfo} t={t} totals={totals} />
        </div>
      );
    }

    let pageNum = 1;

    return (
      <div ref={ref} style={{ fontFamily: "'Inter', sans-serif", color: '#333', background: '#fff' }}>

        {/* ════════════════════════════════════════════
            PAGE 1: COVER
        ════════════════════════════════════════════ */}
        <div className="page-break" style={{ position: 'relative', width: '100%', minHeight: '276mm', overflow: 'hidden', background: '#0a0a0a' }}>
          {/* Background image with overlay */}
          {q.coverImage && (
            <img src={q.coverImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
          )}

          {/* Geometric accent */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', background: 'linear-gradient(135deg, transparent 0%, rgba(227,6,19,0.08) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: '#E30613' }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', minHeight: '276mm' }}>
            {/* Top: logos */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                {companyInfo.logo && (
                  <img src={companyInfo.logo} alt="" style={{ height: '80px', objectFit: 'contain', filter: 'brightness(0) invert(1)', display: 'block' }} />
                )}
              </div>
              {q.customerLogo && (
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '16px', padding: '16px 24px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <img src={q.customerLogo} alt="" style={{ height: '160px', maxWidth: '280px', objectFit: 'contain', display: 'block' }} />
                </div>
              )}
            </div>

            {/* Center: Title block */}
            <div style={{ maxWidth: '600px' }}>
              <div style={{ width: '48px', height: '3px', background: '#E30613', marginBottom: '24px' }} />
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '52px', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                {q.coverTitle || 'TEKNİK TEKLİF'}
              </h1>
              {q.customerCompany && (
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginTop: '16px', fontWeight: 500, letterSpacing: '0.02em' }}>
                  {q.language === 'tr' ? 'için hazırlanmıştır' : 'prepared for'} — <span style={{ color: '#fff', fontWeight: 700 }}>{q.customerCompany}</span>
                </p>
              )}
            </div>

            {/* Bottom: Meta info */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '32px' }}>
                <div>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{t.quotationNo}</p>
                  <p style={{ fontSize: '14px', color: '#fff', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{q.number}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{t.date}</p>
                  <p style={{ fontSize: '14px', color: '#fff', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{q.date}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '10px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{companyInfo.name}</p>
                <p>{companyInfo.address}</p>
                <p>{companyInfo.phone} · {companyInfo.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            PAGE 2: CORPORATE PROFILE
        ════════════════════════════════════════════ */}
        {companyInfo.profile && (
          <div className="page-break" style={{ padding: '48px', minHeight: '276mm', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle sub={q.language === 'tr' ? 'Adotek Makina hakkında bilgi' : 'About Adotek Makina'}>
              {q.language === 'tr' ? `Neden ${companyInfo.name}?` : `Why ${companyInfo.name}?`}
            </SectionTitle>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
              {[
                { title: companyInfo.profile.visionTitle, text: companyInfo.profile.visionText },
                { title: companyInfo.profile.qualityTitle, text: companyInfo.profile.qualityText },
              ].map((item, i) => (
                <div key={i} style={{ padding: '24px', borderRadius: '12px', border: '1px solid #eee', background: '#fafafa' }}>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.8 }}>{item.text}</p>
                </div>
              ))}
            </div>

            {/* R&D full width */}
            <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #eee', background: '#fafafa', marginBottom: '40px' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>{companyInfo.profile.rdTitle}</h3>
              <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.8 }}>{companyInfo.profile.rdText}</p>
            </div>

            {/* Stats bar */}
            <div style={{ background: '#0a0a0a', borderRadius: '16px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '80px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '48px', fontWeight: 900, color: '#E30613', lineHeight: 1 }}>{companyInfo.profile.experienceYears}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {q.language === 'tr' ? 'Yıllık Deneyim' : 'Years of Experience'}
                </p>
              </div>
              <div style={{ width: '1px', height: '48px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '48px', fontWeight: 900, color: '#E30613', lineHeight: 1 }}>{companyInfo.profile.projectsCount}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {q.language === 'tr' ? 'Tamamlanan Proje' : 'Completed Projects'}
                </p>
              </div>
            </div>

            <PageFooter companyInfo={companyInfo} pageNum={++pageNum} />
          </div>
        )}

        {/* ════════════════════════════════════════════
            PAGE 3: ROI & BENEFITS (optional)
        ════════════════════════════════════════════ */}
        {q.benefitsSection?.show && (
          <div className="page-break" style={{ padding: '48px', minHeight: '276mm', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle>{q.benefitsSection.title}</SectionTitle>

            {/* Description — always visible under title */}
            {q.benefitsSection.description ? (
              <div style={{ marginTop: '-24px', marginBottom: '28px', padding: '16px 20px', background: '#f8f9fa', borderLeft: '4px solid #E30613', borderRadius: '0 8px 8px 0' }}>
                <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.8, margin: 0 }}>{q.benefitsSection.description}</p>
              </div>
            ) : null}

            {/* Savings cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{t.monthlySaving}</p>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', fontWeight: 900, color: '#15803d' }}>
                  {formatCurrency(q.benefitsSection.monthlySaving, q.pricing.currency)}
                </p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{t.yearlySaving}</p>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', fontWeight: 900, color: '#15803d' }}>
                  {formatCurrency(q.benefitsSection.yearlySaving, q.pricing.currency)}
                </p>
              </div>
            </div>

            {/* Benefits grid */}
            {q.benefitsSection.benefits.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                {q.benefitsSection.benefits.map((b) => (
                  <div key={b.id} style={{ padding: '16px 20px', borderLeft: '3px solid #E30613', background: '#fafafa', borderRadius: '0 8px 8px 0' }}>
                    <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>{b.title}</h4>
                    <p style={{ fontSize: '11px', color: '#888', lineHeight: 1.6 }}>{b.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ROI Table */}
            {q.benefitsSection.roiComparison.length > 0 && (
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '32px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #111' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 800, color: '#111' }}>{t.criterion}</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 800, color: '#111' }}>{t.current}</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 800, color: '#111' }}>{t.newSystem}</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 800, color: '#111' }}>{t.benefit}</th>
                  </tr>
                </thead>
                <tbody>
                  {q.benefitsSection.roiComparison.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '10px 12px', color: '#444' }}>{r.label}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#dc2626' }}>{r.currentValue}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{r.newValue}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#666' }}>{r.benefit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Motivation */}
            {q.benefitsSection.motivationTitle && (
              <div style={{ background: '#0a0a0a', borderRadius: '16px', padding: '32px', marginTop: 'auto' }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>{q.benefitsSection.motivationTitle}</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>{q.benefitsSection.motivationText}</p>
              </div>
            )}

            <PageFooter companyInfo={companyInfo} pageNum={++pageNum} />
          </div>
        )}

        {/* ════════════════════════════════════════════
            PAGE 4: FOREWORD LETTER
        ════════════════════════════════════════════ */}
        <div className="page-break" style={{ padding: '48px', minHeight: '276mm', display: 'flex', flexDirection: 'column' }}>
          <SectionTitle>{t.foreword}</SectionTitle>

          {/* Letter body */}
          <div style={{ flex: 1, maxWidth: '520px' }}>
            <div style={{ fontSize: '12.5px', color: '#444', lineHeight: 2, whiteSpace: 'pre-wrap' }}>
              {q.foreword}
            </div>
          </div>

          {/* Signature block */}
          <div style={{ marginTop: '48px' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>{t.regards}</p>
            {q.senderSignature && (
              <img src={q.senderSignature} alt="" style={{ height: '56px', objectFit: 'contain', marginBottom: '8px' }} />
            )}
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 800, color: '#111' }}>{q.senderName}</p>
            <p style={{ fontSize: '12px', color: '#888' }}>{q.senderTitle}</p>

            <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #eee', display: 'flex', gap: '32px', fontSize: '10px', color: '#aaa' }}>
              <span>{companyInfo.name}</span>
              <span>{companyInfo.phone}</span>
              <span>{companyInfo.email}</span>
              <span>{companyInfo.website}</span>
            </div>
          </div>

          <PageFooter companyInfo={companyInfo} pageNum={++pageNum} />
        </div>

        {/* ════════════════════════════════════════════
            PAGES 5-N: MACHINE DETAIL PAGES
        ════════════════════════════════════════════ */}
        {q.machines.map((machine, idx) => {
          pageNum++;
          return (
            <div key={machine.id} className="page-break" style={{ padding: '48px', minHeight: '276mm', display: 'flex', flexDirection: 'column' }}>
              <SectionTitle sub={machine.description ? undefined : (q.language === 'tr' ? 'Teknik detaylar ve fiyatlandırma' : 'Technical details and pricing')}>
                {idx + 1}. {machine.name}
              </SectionTitle>

              {/* Machine image */}
              {machine.imageUrl && (
                <div style={{ marginBottom: '28px', borderRadius: '16px', overflow: 'hidden', background: '#f8f8f8', border: '1px solid #eee' }}>
                  <img src={machine.imageUrl} alt={machine.name} style={{ width: '100%', maxHeight: '220mm', objectFit: 'contain', padding: '16px' }} />
                </div>
              )}

              {/* Tech specs */}
              {machine.description && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', fontWeight: 700, marginBottom: '12px' }}>{t.technicalSpecs}</p>
                  <div style={{ fontSize: '11.5px', color: '#555', lineHeight: 1.9, whiteSpace: 'pre-wrap', columnCount: 2, columnGap: '32px' }}>
                    {machine.description}
                  </div>
                </div>
              )}

              {/* Equipment chips */}
              {machine.materials.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', fontWeight: 700, marginBottom: '10px' }}>{t.equipments}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {machine.materials.map((mat) => (
                      <span key={mat.id} style={{ padding: '5px 14px', background: '#f3f3f3', borderRadius: '20px', fontSize: '10px', color: '#555', fontWeight: 500 }}>
                        {mat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price bar */}
              <div style={{ background: '#0a0a0a', borderRadius: '16px', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{t.quantity}</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 900, color: '#fff' }}>{machine.quantity}</p>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{t.unitPrice}</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 900, color: '#fff' }}>{formatCurrency(machine.unitPrice, q.pricing.currency)}</p>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{t.total}</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 900, color: '#E30613' }}>
                    {formatCurrency(machine.unitPrice * machine.quantity, q.pricing.currency)}
                  </p>
                </div>
              </div>

              <PageFooter companyInfo={companyInfo} pageNum={pageNum} />
            </div>
          );
        })}

        {/* ════════════════════════════════════════════
            PRICING & TERMS PAGE
        ════════════════════════════════════════════ */}
        <div className="page-break" style={{ padding: '48px', minHeight: '276mm', display: 'flex', flexDirection: 'column' }}>
          <SectionTitle>{t.termsTitle}</SectionTitle>

          {/* Pricing table */}
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '32px' }}>
            <thead>
              <tr style={{ background: '#0a0a0a' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: '#fff', borderRadius: '8px 0 0 0', fontSize: '11px' }}>#</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: '#fff', fontSize: '11px' }}>{t.description}</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 700, color: '#fff', fontSize: '11px' }}>{t.quantity}</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: '#fff', fontSize: '11px' }}>{t.unitPrice}</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: '#fff', borderRadius: '0 8px 0 0', fontSize: '11px' }}>{t.total}</th>
              </tr>
            </thead>
            <tbody>
              {q.machines.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', color: '#aaa', fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</td>
                  <td style={{ padding: '12px 16px', color: '#333', fontWeight: 600 }}>{m.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#666' }}>{m.quantity}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#666' }}>{formatCurrency(m.unitPrice, q.pricing.currency)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#111' }}>{formatCurrency(m.unitPrice * m.quantity, q.pricing.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '12px' }}>
                <span style={{ color: '#888' }}>{t.subtotal}</span>
                <span style={{ fontWeight: 600, color: '#333' }}>{formatCurrency(totals.subtotal, q.pricing.currency)}</span>
              </div>
              {q.pricing.discountRate > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '12px' }}>
                  <span style={{ color: '#888' }}>{t.discount} ({q.pricing.discountRate}%)</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>-{formatCurrency(totals.discountAmount, q.pricing.currency)}</span>
                </div>
              )}
              {(q.pricing.extraCosts || []).map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '12px' }}>
                  <span style={{ color: '#888' }}>{c.name}</span>
                  <span style={{ fontWeight: 600, color: '#333' }}>{formatCurrency(c.amount, q.pricing.currency)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '12px' }}>
                <span style={{ color: '#888' }}>{t.vat} ({q.pricing.vatRate}%)</span>
                <span style={{ fontWeight: 600, color: '#333' }}>{formatCurrency(totals.vatAmount, q.pricing.currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', marginTop: '8px', borderTop: '3px solid #0a0a0a' }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 900, color: '#111' }}>{t.grandTotal}</span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 900, color: '#E30613' }}>{formatCurrency(totals.totalAmount, q.pricing.currency)}</span>
              </div>
            </div>
          </div>

          {/* Terms + Bank grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Commercial terms */}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', fontWeight: 700, marginBottom: '16px' }}>{t.commercialTerms}</p>
              <div style={{ fontSize: '12px', lineHeight: 2.2 }}>
                {[
                  { label: t.warranty, value: q.pricing.warrantyPeriod },
                  { label: t.delivery, value: q.pricing.deliveryTime },
                  ...(q.pricing.deliveryPlace ? [{ label: t.deliveryPlace, value: q.pricing.deliveryPlace }] : []),
                  ...(q.pricing.deliveryType ? [{ label: t.deliveryType, value: q.pricing.deliveryType }] : []),
                  { label: t.installation, value: q.pricing.includeInstallation ? t.included : t.excluded },
                  { label: t.training, value: q.pricing.includeTraining ? t.included : t.excluded },
                  ...(q.pricing.paymentTerms ? [{ label: t.payment, value: q.pricing.paymentTerms }] : []),
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', padding: '0 0 2px' }}>
                    <span style={{ color: '#888' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: '#333' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {q.terms && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#fafafa', borderRadius: '8px', borderLeft: '3px solid #E30613' }}>
                  <p style={{ fontSize: '10px', color: '#666', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{q.terms}</p>
                </div>
              )}
            </div>

            {/* Bank details */}
            <div style={{ background: '#0a0a0a', borderRadius: '16px', padding: '28px', height: 'fit-content' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '20px' }}>{t.bankInfo}</p>
              <div style={{ fontSize: '12px', color: '#fff', lineHeight: 2.4 }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{q.language === 'tr' ? 'Banka' : 'Bank'}</span>
                  <p style={{ fontWeight: 600 }}>{companyInfo.bankDetails?.bankName}</p>
                </div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{q.language === 'tr' ? 'Şube' : 'Branch'}</span>
                  <p style={{ fontWeight: 600 }}>{companyInfo.bankDetails?.branch}</p>
                </div>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>IBAN</span>
                  <p style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em', fontSize: '11px' }}>{companyInfo.bankDetails?.iban}</p>
                </div>
              </div>
            </div>
          </div>

          <PageFooter companyInfo={companyInfo} pageNum={++pageNum} />
        </div>

        {/* ════════════════════════════════════════════
            DOCUMENTS PAGE (optional)
        ════════════════════════════════════════════ */}
        {q.showDocuments && q.documents && q.documents.length > 0 && (
          <div className="page-break" style={{ padding: '48px', minHeight: '276mm', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle>{t.documents}</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {q.documents.map((doc) => (
                <div key={doc.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
                  {doc.type.startsWith('image/') ? (
                    <img src={doc.content} alt={doc.name} style={{ width: '100%', height: 'auto' }} />
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#fafafa' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>{doc.name}</p>
                      <p style={{ fontSize: '10px', color: '#bbb', marginTop: '4px' }}>{doc.type}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <PageFooter companyInfo={companyInfo} pageNum={++pageNum} />
          </div>
        )}

        {/* ════════════════════════════════════════════
            REFERENCES PAGE (optional)
        ════════════════════════════════════════════ */}
        {q.references.show && q.references.logos.length > 0 && (
          <div className="page-break" style={{ padding: '48px', minHeight: '276mm', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle>{t.references}</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignContent: 'start' }}>
              {q.references.logos.map((logo, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px', border: '1px solid #eee', borderRadius: '12px', height: '120px', background: '#fafafa' }}>
                  <img src={logo} alt={`Reference ${i + 1}`} style={{ maxHeight: '64px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
            <PageFooter companyInfo={companyInfo} pageNum={++pageNum} />
          </div>
        )}

        {/* ════════════════════════════════════════════
            THANK YOU PAGE
        ════════════════════════════════════════════ */}
        <div className="page-break" style={{ minHeight: '276mm', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
          {/* Subtle gradient accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#E30613' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(227,6,19,0.06) 0%, transparent 70%)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {companyInfo.logo && (
              <img src={companyInfo.logo} alt="" style={{ height: '56px', objectFit: 'contain', filter: 'brightness(0) invert(1)', marginBottom: '40px' }} />
            )}
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '48px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '12px' }}>{t.thankYou}</h2>
            <div style={{ width: '48px', height: '3px', background: '#E30613', margin: '0 auto 24px' }} />

            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              {q.language === 'tr' ? 'Daha fazla ürün ve çözümlerimiz için' : 'For more products and solutions'}
            </p>
            {companyInfo.website && (
              <a href={`https://${companyInfo.website.replace(/^https?:\/\//, '')}`} style={{ fontSize: '18px', color: '#E30613', fontWeight: 700, fontFamily: "'Outfit', sans-serif", textDecoration: 'none', letterSpacing: '0.02em' }}>
                {companyInfo.website.replace(/^https?:\/\//, '')}
              </a>
            )}

            <div style={{ marginTop: '48px', fontSize: '10px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.8 }}>
              <p>{companyInfo.address}</p>
              <p>{companyInfo.phone} · {companyInfo.email}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintLayout.displayName = 'PrintLayout';

/* ════════════════════════════════════════════
   PROFORMA INVOICE LAYOUT (Pneuamtic)
════════════════════════════════════════════ */
function PneuamticLayout({
  quotation: q,
  companyInfo,
  t,
  totals,
}: {
  quotation: Quotation;
  companyInfo: CompanyInfo;
  t: (typeof translations)['tr'];
  totals: ReturnType<typeof calculateQuotationTotals>;
}) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', color: '#333', padding: '40px', minHeight: '276mm' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: '3px solid #E30613' }}>
        <div>
          {companyInfo.logo && (
            <img src={companyInfo.logo} alt="" style={{ height: '44px', objectFit: 'contain', marginBottom: '8px' }} />
          )}
          <p style={{ fontSize: '10px', color: '#888' }}>{companyInfo.address}</p>
          <p style={{ fontSize: '10px', color: '#888' }}>{companyInfo.phone} · {companyInfo.email}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Proforma Invoice</h1>
          <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{t.quotationNo}: <strong style={{ color: '#333' }}>{q.number}</strong></p>
          <p style={{ fontSize: '11px', color: '#888' }}>{t.date}: <strong style={{ color: '#333' }}>{q.date}</strong></p>
        </div>
      </div>

      {/* Customer */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '9px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{t.preparedFor}</p>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 800, color: '#111' }}>{q.customerCompany}</p>
        <p style={{ fontSize: '12px', color: '#888' }}>{q.customerName}</p>
      </div>

      {/* Table */}
      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '32px' }}>
        <thead>
          <tr style={{ background: '#0a0a0a' }}>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#fff', borderRadius: '8px 0 0 0' }}>{t.item}</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#fff' }}>{t.description}</th>
            <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 700, color: '#fff' }}>{t.quantity}</th>
            <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: '#fff' }}>{t.unitPrice}</th>
            <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 700, color: '#fff' }}>{t.discountPercent}</th>
            <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: '#fff', borderRadius: '0 8px 0 0' }}>{t.total}</th>
          </tr>
        </thead>
        <tbody>
          {q.machines.map((m, i) => {
            const line = m.unitPrice * m.quantity;
            const disc = (line * (m.discount || 0)) / 100;
            return (
              <tr key={m.id} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#333' }}>{m.name}</td>
                <td style={{ padding: '10px 12px', color: '#888' }}>{m.description}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#555' }}>{m.quantity}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#555' }}>{formatCurrency(m.unitPrice, q.pricing.currency)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#888' }}>{m.discount ? `%${m.discount}` : '—'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#111' }}>{formatCurrency(line - disc, q.pricing.currency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
            <span style={{ color: '#888' }}>{t.subtotal}</span>
            <span style={{ fontWeight: 600 }}>{formatCurrency(totals.subtotal, q.pricing.currency)}</span>
          </div>
          {q.pricing.discountRate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
              <span style={{ color: '#888' }}>{t.discount} ({q.pricing.discountRate}%)</span>
              <span style={{ fontWeight: 600, color: '#dc2626' }}>-{formatCurrency(totals.discountAmount, q.pricing.currency)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
            <span style={{ color: '#888' }}>{t.vat} ({q.pricing.vatRate}%)</span>
            <span style={{ fontWeight: 600 }}>{formatCurrency(totals.vatAmount, q.pricing.currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: '8px', borderTop: '3px solid #0a0a0a' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 900, color: '#111' }}>{t.grandTotal}</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 900, color: '#E30613' }}>{formatCurrency(totals.totalAmount, q.pricing.currency)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
        <div style={{ fontSize: '10px', color: '#888', lineHeight: 2 }}>
          <p><strong style={{ color: '#555' }}>{t.warranty}:</strong> {q.pricing.warrantyPeriod}</p>
          <p><strong style={{ color: '#555' }}>{t.delivery}:</strong> {q.pricing.deliveryTime}</p>
          {q.pricing.deliveryPlace && <p><strong style={{ color: '#555' }}>{t.deliveryPlace}:</strong> {q.pricing.deliveryPlace}</p>}
          {q.pricing.deliveryType && <p><strong style={{ color: '#555' }}>{t.deliveryType}:</strong> {q.pricing.deliveryType}</p>}
          {q.pricing.paymentTerms && <p><strong style={{ color: '#555' }}>{t.payment}:</strong> {q.pricing.paymentTerms}</p>}
        </div>
        <div style={{ background: '#0a0a0a', borderRadius: '12px', padding: '16px', fontSize: '10px', color: '#fff', lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, marginBottom: '4px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.05em' }}>{t.bankInfo}</p>
          <p>{companyInfo.bankDetails?.bankName}</p>
          <p>{companyInfo.bankDetails?.branch}</p>
          <p style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{companyInfo.bankDetails?.iban}</p>
        </div>
      </div>
    </div>
  );
}

export default PrintLayout;
