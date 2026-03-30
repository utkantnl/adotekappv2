import type { Quotation, QuotationLanguage } from '../types';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function translate(
  text: string,
  targetLang: QuotationLanguage
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey || !text.trim()) return text;

  const langName = targetLang === 'tr' ? 'Turkish' : 'English';
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: `Translate the following text to ${langName}. Return ONLY the translation, nothing else:\n\n${text}`,
          },
        ],
        max_tokens: 3000,
      }),
    });

    if (!res.ok) return text;
    const data = await res.json();
    return data.choices?.[0]?.message?.content || text;
  } catch {
    return text;
  }
}

export async function translateQuotationContent(
  quotation: Quotation,
  targetLang: QuotationLanguage
): Promise<Partial<Quotation>> {
  const updates: Partial<Quotation> = { language: targetLang };

  try {
    // Batch translate main fields
    const batchText = [
      `[FIELD_1]${quotation.coverTitle}`,
      `[FIELD_2]${quotation.foreword}`,
      `[FIELD_3]${quotation.terms}`,
    ].join('\n');

    const translated = await translate(batchText, targetLang);
    const parts = translated.split(/\[FIELD_\d\]/);
    if (parts.length >= 4) {
      updates.coverTitle = parts[1].trim();
      updates.foreword = parts[2].trim();
      updates.terms = parts[3].trim();
    }

    // Translate benefits section if present
    if (quotation.benefitsSection) {
      const bs = quotation.benefitsSection;
      const benefitFields = [
        `TITLE:${bs.title}`,
        `DESC:${bs.description}`,
        `MOTTO:${bs.motivationTitle}`,
        `MOTTEXT:${bs.motivationText}`,
        ...bs.benefits.map(
          (b, i) => `BEN_TITLE_${i}:${b.title}\nBEN_DESC_${i}:${b.description}`
        ),
      ].join('\n');

      const translatedBenefits = await translate(benefitFields, targetLang);
      const getField = (label: string) => {
        const match = translatedBenefits.match(
          new RegExp(`${label}:(.+?)(?=\\n[A-Z_]+:|$)`, 's')
        );
        return match?.[1]?.trim() || '';
      };

      updates.benefitsSection = {
        ...bs,
        title: getField('TITLE') || bs.title,
        description: getField('DESC') || bs.description,
        motivationTitle: getField('MOTTO') || bs.motivationTitle,
        motivationText: getField('MOTTEXT') || bs.motivationText,
        benefits: bs.benefits.map((b, i) => ({
          ...b,
          title: getField(`BEN_TITLE_${i}`) || b.title,
          description: getField(`BEN_DESC_${i}`) || b.description,
        })),
      };
    }
  } catch {
    // Fallback: at least update the language
  }

  return updates;
}
