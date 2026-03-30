import type { BenefitsSection } from '../types';

/* ══════════════════════════════════════
   ÖNSÖZ ŞABLONLARI (Foreword Templates)
   ══════════════════════════════════════ */

export interface ForewordTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Use {{firma}} for customer company, {{tarih}} for date */
  content: string;
}

export const forewordTemplates: ForewordTemplate[] = [
  {
    id: 'professional',
    name: 'Profesyonel',
    emoji: '💼',
    description: 'Kurumsal ve resmi ton',
    content: `Sayın Yetkili,

{{firma}} firmasının değerli iş ortaklığına sunulmak üzere hazırlanan bu teknik teklifimizi dikkatinize sunarız.

Adotek Makina olarak, endüstriyel otomasyon ve makine üretimi alanında edindiğimiz deneyim ve uzmanlıkla, üretim süreçlerinizi optimize edecek çözümler sunmaktayız. Bu teklif kapsamında yer alan ürünlerimiz, en son teknoloji standartlarına uygun olarak tasarlanmış ve üretilmiştir.

Teklifimiz, ihtiyaç analizi doğrultusunda özelleştirilmiş olup, teslimat süreleri, garanti koşulları ve teknik destek hizmetleri dahil edilmiştir. Tüm ürünlerimiz CE sertifikasına sahip olup, uluslararası kalite standartlarını karşılamaktadır.

İş birliğimizin karşılıklı fayda sağlayacağına olan inancımızla, teklifimizin değerlendirilmesini arz eder, olumlu dönüşünüzü bekleriz.`,
  },
  {
    id: 'friendly',
    name: 'Samimi',
    emoji: '🤝',
    description: 'Sıcak ve ilişki odaklı',
    content: `Sayın Yetkili,

{{firma}} ile olan iş birliğimiz için hazırladığımız bu teklifi sizinle paylaşmaktan mutluluk duyarız.

Üretim hatlarınızdaki ihtiyaçları yakından inceledik ve sizin için en uygun çözümleri bu teklifte bir araya getirdik. Amacımız sadece makine satmak değil; üretim verimliliğinizi artırarak uzun vadeli bir çözüm ortağı olmaktır.

Teknik ekibimiz, kurulum aşamasından itibaren yanınızda olacak ve personelinize kapsamlı eğitim sağlayacaktır. Satış sonrası destek hizmetlerimiz ile yatırımınızın her zaman en yüksek performansla çalışmasını garanti ediyoruz.

Herhangi bir sorunuz olduğunda bize ulaşmaktan çekinmeyin. Görüşmek dileğiyle.`,
  },
  {
    id: 'technical',
    name: 'Teknik',
    emoji: '⚙️',
    description: 'Mühendislik odaklı detaylı',
    content: `Sayın Yetkili,

{{firma}} üretim tesislerinin modernizasyonu kapsamında talep edilen teknik teklifi aşağıda bilgilerinize sunarız.

Teklif kapsamındaki ekipmanlar, yüksek hassasiyet gerektiren endüstriyel uygulamalar için optimize edilmiş olup, PLC kontrollü otomasyon sistemleri ile donatılmıştır. Servo motor tahrikli mekanizmalar, ±0.01mm hassasiyet seviyesinde tekrarlanabilirlik sağlamaktadır.

Tüm sistemler fabrika ortamında test edilmiş olup, ISO 9001:2015 kalite yönetim sistemi çerçevesinde üretilmektedir. Enerji verimliliği açısından mevcut sistemlere kıyasla %25-35 oranında tasarruf sağlanması hedeflenmektedir.

Detaylı teknik spesifikasyonlar ve performans verileri teklif içeriğinde sunulmuştur.`,
  },
  {
    id: 'solution',
    name: 'Çözüm Odaklı',
    emoji: '🎯',
    description: 'Problem-çözüm yaklaşımı',
    content: `Sayın Yetkili,

{{firma}} ile gerçekleştirdiğimiz görüşmeler doğrultusunda, üretim süreçlerinizde tespit edilen iyileştirme alanlarına yönelik çözüm önerimizi içeren teklifimizi sunuyoruz.

Mevcut üretim hattınızda karşılaşılan darboğazların analizi sonucunda, kapasite artışı ve kalite iyileştirmesi sağlayacak ekipman seçimi yapılmıştır. Önerilen sistemin devreye alınmasıyla birlikte:

• Üretim kapasitesinde %40'a varan artış
• Fire oranında %60'a varan azalma
• İşçilik maliyetlerinde %30 tasarruf
• Enerji tüketiminde %25 azalma

hedeflenmektedir. Yatırımın geri dönüş süresi yaklaşık 12-18 ay olarak öngörülmektedir.

Bu teklifin, üretim hedeflerinize ulaşmanızda önemli bir adım olacağına inanıyoruz.`,
  },
  {
    id: 'premium',
    name: 'Premium',
    emoji: '👑',
    description: 'Üst düzey ve prestijli',
    content: `Sayın Yetkili,

{{firma}} gibi sektörünün önde gelen kuruluşlarıyla çalışmak bizim için her zaman bir ayrıcalık olmuştur. Bu doğrultuda, özel olarak hazırladığımız teklifimizi dikkatinize sunmaktan onur duyarız.

Adotek Makina, yılların getirdiği mühendislik birikimi ve yenilikçi yaklaşımıyla, her projeyi bir prestij meselesi olarak ele almaktadır. Bu teklifte yer alan çözümler, sektördeki en ileri teknolojileri barındırmakta olup, {{firma}} üretim standartlarının daha da yukarı taşınmasını hedeflemektedir.

Anahtar teslim proje yönetimi, 7/24 teknik destek hattı ve genişletilmiş garanti paketlerimiz ile yatırımınızın her anında yanınızdayız.

Bu iş birliğinin her iki taraf için de değer yaratacak uzun soluklu bir ortaklığa dönüşeceğine olan inancımızla, en derin saygılarımızı sunarız.`,
  },
];

/* ══════════════════════════════════════
   ROI & FAYDALAR ŞABLONLARI
   ══════════════════════════════════════ */

export interface BenefitsTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  data: Omit<BenefitsSection, 'show'>;
}

const uid = () => crypto.randomUUID();

export const benefitsTemplates: BenefitsTemplate[] = [
  {
    id: 'productivity',
    name: 'Verimlilik Artışı',
    emoji: '📈',
    description: 'Üretim hızı ve kapasite odaklı',
    data: {
      title: 'Üretim Verimliliği & Kapasite Artışı',
      description: 'Yeni sistemin devreye alınmasıyla üretim hattınızda elde edilecek verimlilik kazanımları',
      monthlySaving: 15000,
      yearlySaving: 180000,
      benefits: [
        { id: uid(), title: 'Yüksek Üretim Hızı', description: 'Otomatik besleme ve çıkarma sistemleri ile çevrim süreleri %40 kısalır' },
        { id: uid(), title: '7/24 Kesintisiz Üretim', description: 'Güvenilir yapı sayesinde plansız duruşlar minimize edilir' },
        { id: uid(), title: 'Düşük Fire Oranı', description: 'Hassas kontrol sistemi ile malzeme firesi %60 azalır' },
        { id: uid(), title: 'Hızlı Kalıp Değişimi', description: 'Quick-change sistemi ile ürün geçiş süreleri 5 dakikaya düşer' },
        { id: uid(), title: 'Minimum Operatör Müdahalesi', description: 'Tam otomatik çalışma ile insan hatası riski ortadan kalkar' },
        { id: uid(), title: 'Gerçek Zamanlı İzleme', description: 'Dijital kontrol paneli ile üretim verilerine anında erişim' },
      ],
      roiComparison: [
        { id: uid(), label: 'Günlük Üretim Kapasitesi', currentValue: '500 adet', newValue: '850 adet', benefit: '%70 artış' },
        { id: uid(), label: 'Çevrim Süresi', currentValue: '45 saniye', newValue: '28 saniye', benefit: '%38 kısalma' },
        { id: uid(), label: 'Fire Oranı', currentValue: '%8', newValue: '%3', benefit: '%62 azalma' },
        { id: uid(), label: 'Enerji Tüketimi', currentValue: '25 kWh', newValue: '18 kWh', benefit: '%28 tasarruf' },
      ],
      motivationTitle: 'Yatırımınızın Geri Dönüşü',
      motivationText: 'Yapılan hesaplamalara göre bu yatırım, mevcut üretim koşullarında 12-14 ay içinde kendini amorti edecektir. İlk yılın sonunda net kâr elde etmeye başlayacaksınız.',
    },
  },
  {
    id: 'cost-saving',
    name: 'Maliyet Tasarrufu',
    emoji: '💰',
    description: 'İşçilik ve enerji tasarrufu odaklı',
    data: {
      title: 'Maliyet Optimizasyonu & Tasarruf Analizi',
      description: 'Yeni yatırımla birlikte operasyonel maliyetlerinizde sağlanacak somut tasarruflar',
      monthlySaving: 25000,
      yearlySaving: 300000,
      benefits: [
        { id: uid(), title: 'İşçilik Maliyeti Düşüşü', description: '3 operatör yerine 1 operatör ile çalışma imkanı' },
        { id: uid(), title: 'Enerji Verimliliği', description: 'IE4 sınıfı motorlar ile %30 daha az enerji tüketimi' },
        { id: uid(), title: 'Bakım Maliyeti Azalması', description: 'Prediktif bakım sistemi ile plansız arıza maliyetleri %80 düşer' },
        { id: uid(), title: 'Malzeme Tasarrufu', description: 'Optimize edilmiş kesim planları ile hammadde israfı minimuma iner' },
        { id: uid(), title: 'Düşük Yedek Parça Gideri', description: 'Uzun ömürlü bileşenler ve kolay temin edilebilir parçalar' },
        { id: uid(), title: 'Azalan Kalite Kontrol Maliyeti', description: 'Otomatik kalite kontrol ile ayrı KK personeli ihtiyacı ortadan kalkar' },
      ],
      roiComparison: [
        { id: uid(), label: 'Aylık İşçilik Gideri', currentValue: '₺85.000', newValue: '₺35.000', benefit: '₺50.000 tasarruf' },
        { id: uid(), label: 'Aylık Enerji Faturası', currentValue: '₺12.000', newValue: '₺8.400', benefit: '₺3.600 tasarruf' },
        { id: uid(), label: 'Yıllık Bakım Gideri', currentValue: '₺45.000', newValue: '₺15.000', benefit: '₺30.000 tasarruf' },
        { id: uid(), label: 'Malzeme Fire Maliyeti', currentValue: '₺18.000/ay', newValue: '₺6.000/ay', benefit: '₺12.000/ay tasarruf' },
      ],
      motivationTitle: 'Her Ay Cebinizde Kalan Para',
      motivationText: 'Toplam operasyonel maliyet düşüşü aylık 65.000₺ ve üzeri olarak öngörülmektedir. Bu yatırım 8-10 ay gibi kısa bir sürede kendini geri öder.',
    },
  },
  {
    id: 'quality',
    name: 'Kalite İyileştirme',
    emoji: '✅',
    description: 'Ürün kalitesi ve standart odaklı',
    data: {
      title: 'Kalite Standartlarında Sıçrama',
      description: 'Yeni ekipmanın ürün kalitenize ve müşteri memnuniyetinize sağlayacağı katkılar',
      monthlySaving: 12000,
      yearlySaving: 144000,
      benefits: [
        { id: uid(), title: 'Sıfır Hata Üretimi', description: 'CNC hassasiyetinde otomasyon ile hata oranı %0.1 altına iner' },
        { id: uid(), title: 'Tutarlı Kalite', description: 'Her üründe aynı standart, lot bazında sapma ortadan kalkar' },
        { id: uid(), title: 'Uluslararası Sertifikalar', description: 'CE, ISO ve sektörel standartlara tam uyumluluk' },
        { id: uid(), title: 'İzlenebilirlik', description: 'Her ürünün üretim parametreleri kayıt altında tutulur' },
        { id: uid(), title: 'Müşteri Memnuniyeti', description: 'İade ve şikayet oranlarında %75 azalma' },
        { id: uid(), title: 'Yüzey Kalitesi', description: 'Superior yüzey işleme kalitesi ile ek operasyon ihtiyacı ortadan kalkar' },
      ],
      roiComparison: [
        { id: uid(), label: 'Ürün Toleransı', currentValue: '±0.1mm', newValue: '±0.01mm', benefit: '10x hassasiyet' },
        { id: uid(), label: 'Hata Oranı', currentValue: '%5', newValue: '%0.1', benefit: '%98 azalma' },
        { id: uid(), label: 'Müşteri İade Oranı', currentValue: '%3', newValue: '%0.5', benefit: '%83 azalma' },
        { id: uid(), label: 'Kalite Kontrol Süresi', currentValue: '15 dk/parti', newValue: '2 dk/parti', benefit: '%87 kısalma' },
      ],
      motivationTitle: 'Kaliteniz, Markanızın Güvencesidir',
      motivationText: 'Üstün kalite standartları ile müşteri güvenini artırır, yeni pazarlara açılma imkanı elde edersiniz. Kalite yatırımı, uzun vadede en yüksek getiriyi sağlayan yatırımdır.',
    },
  },
  {
    id: 'automation',
    name: 'Otomasyon & Dijitalleşme',
    emoji: '🤖',
    description: 'Endüstri 4.0 ve akıllı fabrika',
    data: {
      title: 'Endüstri 4.0 & Akıllı Üretim',
      description: 'Dijital dönüşüm yolculuğunuzda atacağınız bu adımla elde edeceğiniz stratejik avantajlar',
      monthlySaving: 20000,
      yearlySaving: 240000,
      benefits: [
        { id: uid(), title: 'IoT Entegrasyonu', description: 'Tüm üretim verilerinin bulut üzerinden gerçek zamanlı takibi' },
        { id: uid(), title: 'Prediktif Bakım', description: 'Sensör verileri ile arıza öncesi uyarı ve planlı bakım' },
        { id: uid(), title: 'ERP Entegrasyonu', description: 'Üretim verileri otomatik olarak ERP sisteminize aktarılır' },
        { id: uid(), title: 'Uzaktan İzleme', description: 'Tablet veya telefon üzerinden makinenizi her yerden kontrol edin' },
        { id: uid(), title: 'Veri Analitiği', description: 'Üretim trendleri ve performans raporları ile veri tabanlı kararlar alın' },
        { id: uid(), title: 'Esnek Üretim', description: 'Yazılım güncellemeleri ile yeni ürün tiplerini hızla devreye alın' },
      ],
      roiComparison: [
        { id: uid(), label: 'Plansız Duruş Süresi', currentValue: '48 saat/ay', newValue: '4 saat/ay', benefit: '%92 azalma' },
        { id: uid(), label: 'Ürün Değiştirme Süresi', currentValue: '2 saat', newValue: '15 dakika', benefit: '%87 kısalma' },
        { id: uid(), label: 'Veri Toplama', currentValue: 'Manuel', newValue: 'Otomatik', benefit: 'Gerçek zamanlı' },
        { id: uid(), label: 'Raporlama', currentValue: 'Haftalık', newValue: 'Anlık', benefit: 'Hızlı karar alma' },
      ],
      motivationTitle: 'Geleceğin Fabrikası Bugün Başlıyor',
      motivationText: 'Endüstri 4.0 dönüşümüne erken adapte olan firmalar, rekabette 3-5 yıllık avantaj elde etmektedir. Bu yatırım, sadece bugünkü verimliliğinizi değil, yarının rekabet gücünüzü de şekillendirecektir.',
    },
  },
];

/* ══════════════════════════════════════
   ŞİRKET PROFİLİ ŞABLONLARI
   ══════════════════════════════════════ */

export interface ProfileTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  data: {
    visionTitle: string;
    visionText: string;
    qualityTitle: string;
    qualityText: string;
    rdTitle: string;
    rdText: string;
    experienceYears: string;
    projectsCount: string;
  };
}

export const profileTemplates: ProfileTemplate[] = [
  {
    id: 'industrial',
    name: 'Endüstriyel Makine',
    emoji: '🏭',
    description: 'Ağır sanayi ve makine üretimi',
    data: {
      visionTitle: 'Vizyonumuz',
      visionText: 'Türk makine sanayisinin küresel arenada söz sahibi olmasına öncülük etmek. Yenilikçi mühendislik çözümleri ve yüksek kalite standartlarıyla müşterilerimizin üretim kapasitelerini sürekli artırmayı hedefliyoruz.',
      qualityTitle: 'Kalite Anlayışımız',
      qualityText: 'ISO 9001:2015 kalite yönetim sistemi çerçevesinde, her üretim aşamasında titiz kalite kontrol süreçleri uyguluyoruz. CE sertifikalı ürünlerimiz, uluslararası güvenlik ve performans standartlarını eksiksiz karşılamaktadır.',
      rdTitle: 'Ar-Ge & İnovasyon',
      rdText: 'Bünyesindeki mühendislik ekibiyle sürekli Ar-Ge faaliyetleri yürüten firmamız, Endüstri 4.0 uyumlu akıllı üretim sistemleri geliştirmektedir. IoT entegrasyonu, prediktif bakım algoritmaları ve enerji optimizasyon çözümleri ile müşterilerimize katma değer sağlıyoruz.',
      experienceYears: '25+',
      projectsCount: '1.500+',
    },
  },
  {
    id: 'automation',
    name: 'Otomasyon Çözümleri',
    emoji: '🤖',
    description: 'Endüstriyel otomasyon ve robotik',
    data: {
      visionTitle: 'Misyonumuz',
      visionText: 'Endüstriyel otomasyon alanında yenilikçi ve sürdürülebilir çözümler sunarak, müşterilerimizin dijital dönüşüm yolculuğunda güvenilir teknoloji ortağı olmak. Her projede verimliliği artıran, maliyetleri düşüren akıllı sistemler tasarlıyoruz.',
      qualityTitle: 'Teknoloji Liderliği',
      qualityText: 'PLC, SCADA, HMI ve robotik entegrasyon konularında uzmanlaşmış ekibimiz, Siemens, ABB ve Mitsubishi gibi dünya liderlerinin yetkili çözüm ortağıdır. Anahtar teslim otomasyon projeleri ile sıfırdan devreye alma hizmeti sunuyoruz.',
      rdTitle: 'Yazılım & Donanım Geliştirme',
      rdText: 'Kendi bünyemizde geliştirdiğimiz SCADA yazılımları ve özel kontrol kartları ile standart çözümlerin ötesinde, ihtiyaca özel otomasyon sistemleri tasarlıyoruz. Uzaktan izleme, veri analitiği ve makine öğrenmesi tabanlı kalite kontrol sistemlerimiz sektörde fark yaratmaktadır.',
      experienceYears: '18+',
      projectsCount: '800+',
    },
  },
  {
    id: 'precision',
    name: 'Hassas İşleme',
    emoji: '🔬',
    description: 'CNC ve hassas metal işleme',
    data: {
      visionTitle: 'Hassasiyet İlkemiz',
      visionText: 'Mikron düzeyinde hassasiyetin kritik olduğu sektörlere, en ileri CNC teknolojileri ve deneyimli kadromuzla hizmet veriyoruz. Havacılık, medikal ve otomotiv gibi yüksek standart gerektiren sektörlerin güvenilir tedarikçisiyiz.',
      qualityTitle: 'Sertifikalarımız',
      qualityText: 'ISO 9001, ISO 14001, AS9100 (havacılık) ve ISO 13485 (medikal) sertifikalarına sahip tesisimizde, 3D ölçüm cihazları ve CMM sistemleri ile her parçanın kalitesini garanti altına alıyoruz. Sıfır hata politikamız, müşteri güveninin temelini oluşturmaktadır.',
      rdTitle: 'İleri Üretim Teknolojileri',
      rdText: '5 eksen CNC işleme merkezleri, EDM tezgahları ve 3D metal baskı teknolojileri ile geleneksel yöntemlerle üretilmesi güç olan parçaları bile yüksek hassasiyetle üretebiliyoruz. CAD/CAM entegre tasarım sürecimiz, prototipten seri üretime hızlı geçiş imkanı sunar.',
      experienceYears: '30+',
      projectsCount: '2.000+',
    },
  },
  {
    id: 'packaging',
    name: 'Paketleme Sistemleri',
    emoji: '📦',
    description: 'Gıda, ilaç ve kozmetik paketleme',
    data: {
      visionTitle: 'Sektörel Uzmanlık',
      visionText: 'Gıda, ilaç ve kozmetik sektörlerine özel paketleme ve dolum makineleri üretiminde Türkiye\'nin lider firmalarından biriyiz. FDA ve GMP uyumlu çözümlerimizle, ürünlerinizin güvenle tüketiciye ulaşmasını sağlıyoruz.',
      qualityTitle: 'Hijyen & Güvenlik',
      qualityText: 'Paslanmaz çelik (AISI 304/316L) gövde yapısı, CIP temizleme sistemi ve ATEX sertifikalı bileşenlerle üretilen makinelerimiz, en katı hijyen standartlarını karşılar. Her makine fabrikamızda gerçek üretim koşullarında test edilir.',
      rdTitle: 'Modüler Tasarım Felsefesi',
      rdText: 'Modüler yapıdaki makinelerimiz, üretim hattınız büyüdükçe kolayca genişletilebilir. Farklı ürün boyutları ve ambalaj tipleri arasında hızlı geçiş yapabilen esnek sistemlerimiz, çok çeşitli ürün gamına sahip firmaların ilk tercihidir.',
      experienceYears: '20+',
      projectsCount: '1.200+',
    },
  },
];
