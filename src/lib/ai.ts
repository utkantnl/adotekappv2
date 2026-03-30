const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getApiKey() {
  return import.meta.env.VITE_OPENROUTER_API_KEY || '';
}

// Best free models for Turkish (March 2026)
// Gemma family: proven #1 for Turkish understanding & generation
// Nemotron: 120B MoE, very capable multilingual
// DeepSeek R1: strong reasoning across languages
const MODEL_PRIORITIES = {
  vision: [
    'google/gemma-3-27b-it:free',
    'google/gemma-3-12b-it:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
  ],
  logic: [
    'nvidia/nemotron-3-super-120b-a12b:free',
    'google/gemma-3-27b-it:free',
    'stepfun/step-3.5-flash:free',
  ],
  writing: [
    'google/gemma-3-27b-it:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'google/gemma-3-12b-it:free',
  ],
} as const;

type ModelType = keyof typeof MODEL_PRIORITIES;

async function callWithFallback(
  type: ModelType,
  messages: Array<{ role: string; content: unknown }>,
  maxTokens = 2000
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('OpenRouter API key not configured');

  const override = import.meta.env.VITE_OPENROUTER_MODEL;
  const models = override ? [override] : [...MODEL_PRIORITIES[type]];

  for (const model of models) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    } catch {
      continue;
    }
  }
  throw new Error('All AI models failed');
}

export async function analyzeOfferNotes(base64: string): Promise<string> {
  return callWithFallback('vision', [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Bu toplantı notu fotoğrafını analiz et. İçindeki makine isimlerini, teknik özellikleri, adetleri ve fiyat bilgilerini JSON formatında çıkar. Format: [{"name": "...", "description": "...", "quantity": 1, "unitPrice": 0}]',
        },
        { type: 'image_url', image_url: { url: base64 } },
      ],
    },
  ]);
}

export async function analyzeMachineLabel(base64: string): Promise<string> {
  return callWithFallback('vision', [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Bu makine etiketini oku. Makine adını ve teknik özelliklerini JSON olarak döndür: {"name": "...", "description": "..."}',
        },
        { type: 'image_url', image_url: { url: base64 } },
      ],
    },
  ]);
}

export async function generateForeword(
  customer: string,
  company: string,
  instruction?: string
): Promise<string> {
  const prompt = instruction
    ? `Şu talimata göre profesyonel bir teklif önsözü yaz: "${instruction}". Müşteri: ${customer}, Firma: ${company}.`
    : `${company} firması adına ${customer} müşterisine profesyonel, samimi ve kurumsal bir teklif önsöz mektubu yaz. 2-3 paragraf, Türkçe.`;

  return callWithFallback('writing', [{ role: 'user', content: prompt }]);
}

export async function refineTechSpec(
  machineName: string,
  details: string,
  instruction?: string
): Promise<string> {
  const prompt = instruction
    ? `Şu talimata göre teknik özellikleri düzenle: "${instruction}". Makine: ${machineName}. Mevcut: ${details}`
    : `"${machineName}" makinesi için aşağıdaki bilgileri profesyonel teknik şartname formatına dönüştür:\n${details}`;

  return callWithFallback('logic', [{ role: 'user', content: prompt }]);
}

export async function optimizeContract(
  terms: string,
  instruction?: string
): Promise<string> {
  const prompt = instruction
    ? `Şu talimata göre sözleşme maddelerini düzenle: "${instruction}". Mevcut: ${terms}`
    : `Aşağıdaki sözleşme maddelerini resmi hukuki dille yeniden yaz:\n${terms}`;

  return callWithFallback('logic', [{ role: 'user', content: prompt }]);
}

export async function analyzeInvoicePhoto(base64: string): Promise<string> {
  return callWithFallback('vision', [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Bu fatura/irsaliye fotoğrafını analiz et. Ürün isimlerini, adetlerini ve fiyatlarını JSON array olarak döndür.',
        },
        { type: 'image_url', image_url: { url: base64 } },
      ],
    },
  ]);
}

export async function analyzePartsList(base64: string): Promise<string> {
  return callWithFallback('vision', [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Bu parça listesini kategorize et. JSON formatında döndür: [{"category": "...", "items": [{"name": "...", "quantity": 1}]}]',
        },
        { type: 'image_url', image_url: { url: base64 } },
      ],
    },
  ]);
}

export async function parseCostItem(text: string): Promise<string> {
  return callWithFallback('logic', [
    {
      role: 'user',
      content: `Şu metinden maliyet kalemini çıkar ve JSON olarak döndür: {"name": "...", "amount": 0, "category": "..."}. Metin: "${text}"`,
    },
  ]);
}
