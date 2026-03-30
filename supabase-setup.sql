-- =============================================
-- ADOTEK TEKLİF SİSTEMİ - SUPABASE KURULUM SQL
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'e yapıştırıp çalıştırın.

-- 1. TABLOLAR
-- =============================================

-- Teklifler
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL DEFAULT '{}',
  user_id TEXT,
  status TEXT DEFAULT 'draft',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Makine Kütüphanesi
CREATE TABLE IF NOT EXISTS machine_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL DEFAULT '{}',
  user_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Malzemeler
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL DEFAULT '{}',
  user_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Şirket Bilgileri
CREATE TABLE IF NOT EXISTS company_info (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Kullanıcı Varsayılanları (terms, sender bilgileri)
CREATE TABLE IF NOT EXISTS user_defaults (
  id TEXT PRIMARY KEY DEFAULT 'main',
  default_terms TEXT DEFAULT '',
  default_sender_name TEXT DEFAULT '',
  default_sender_title TEXT DEFAULT '',
  default_sender_signature TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ROW LEVEL SECURITY (RLS)
-- =============================================
-- Basit kurulum: anon key ile tam erişim (tek kullanıcı senaryosu)

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_defaults ENABLE ROW LEVEL SECURITY;

-- Herkese okuma/yazma izni (tek kullanıcılı uygulama için)
CREATE POLICY "Allow all on quotations" ON quotations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on machine_templates" ON machine_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on materials" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on company_info" ON company_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_defaults" ON user_defaults FOR ALL USING (true) WITH CHECK (true);

-- 3. INDEXLER
-- =============================================
CREATE INDEX IF NOT EXISTS idx_quotations_updated_at ON quotations (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations (status);
CREATE INDEX IF NOT EXISTS idx_machine_templates_user ON machine_templates (user_id);

-- 4. VARSAYILAN ŞİRKET BİLGİSİ KAYDI
-- =============================================
INSERT INTO company_info (id, data) VALUES ('main', '{"name": "Adotek Makina", "logo": "", "address": "", "phone": "", "email": "", "website": ""}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_defaults (id) VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- KURULUM TAMAMLANDI!
-- Şimdi Supabase Dashboard > Settings > API kısmından
-- Project URL ve anon public key bilgilerini alın.
-- =============================================
