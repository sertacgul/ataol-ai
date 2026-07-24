# ATAOL Yapay Zeka - Mobil Web Uygulaması

Bu proje, 10 yaşındaki oğlunuz **Deha Ataol GÜL** için özel olarak tasarlanmış, mobil uyumlu, ebeveyn kontrollü ve oyunlaştırılmış bir yapay zeka rehberidir.

## Proje Dosyaları
* `index.html`: Uygulamanın ana arayüzü ve yapısı.
* `styles.css`: iPhone 12'ye tam uyumlu, yumuşak geçişli, modern ve çocuk dostu tasarım teması.
* `app.js`: Tüm uygulama mantığı, ödül sistemi (yıldızlar/madalyalar), 9 haftalık gelişim planı ve Gemini API entegrasyonu.
* `manifest.json` & `sw.js`: Uygulamanın telefona yerel uygulama (PWA) olarak kurulmasını sağlayan dosyalar.
* `logo.png`: Uygulama logosu (gönderdiğiniz logo).

---

## 🚀 GitHub'a Yükleme ve iPhone 12 Kurulumu

Uygulamanın tamamen sunucusuz çalışması sayesinde, hiçbir ek ücret ödemeden **GitHub Pages** üzerinde barındırabilir ve iPhone'unuza bir mobil uygulama gibi yükleyebilirsiniz.

### 1. Adım: GitHub Deposu (Repository) Oluşturma
1. [GitHub](https://github.com/) hesabınıza giriş yapın.
2. Sağ üstteki **+** simgesine tıklayıp **New repository** (Yeni Depo) seçeneğini seçin.
3. Depo adını `ataol-ai` yapın.
4. Deponuzu **Public** (Kamuya Açık) olarak işaretleyin (GitHub Pages ücretsiz sürümü için gereklidir).
5. Depoyu oluşturun.

### 2. Adım: Kodları GitHub'a Yükleme
Bu klasördeki tüm dosyaları (`index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.json`, `logo.png`) yeni oluşturduğunuz depoya yükleyin. 

Bunu bilgisayarınızdaki Git terminali ile yapmak için:
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/ataol-ai.git
git push -u origin main
```
*(Alternatif olarak, GitHub web arayüzündeki **"uploading an existing file"** linkine tıklayarak dosyaları sürükle-bırak yöntemiyle de yükleyebilirsiniz.)*

### 3. Adım: GitHub Pages'i Etkinleştirme
1. GitHub deposunda üstteki menüden **Settings** (Ayarlar) sekmesine gidin.
2. Sol menüden **Pages** seçeneğine tıklayın.
3. **Build and deployment** başlığı altında, **Source** kısmını `Deploy from a branch` olarak seçin.
4. **Branch** kısmını `main` (veya `master`) ve klasörü `/ (root)` seçip **Save** butonuna tıklayın.
5. Birkaç dakika içinde GitHub size `https://kullanici_adiniz.github.io/ataol-ai/` şeklinde bir web adresi verecektir.

### 4. Adım: iPhone 12'ye Uygulama Olarak Yükleme
1. iPhone 12'nizde **Safari** tarayıcısını açın.
2. GitHub Pages adresinize (`https://kullanici_adiniz.github.io/ataol-ai/`) gidin.
3. Alt menüdeki **Paylaş (Share)** butonuna (yukarı oklu kare simgesi) dokunun.
4. Menüyü aşağı kaydırıp **Ana Ekrana Ekle (Add to Home Screen)** seçeneğini seçin.
5. Uygulama adını `ATAOL AI` olarak doğrulayıp sağ üstteki **Ekle (Add)** butonuna dokunun.
6. Artık uygulama ana ekranınızda bir uygulama simgesi olarak belirecektir!

---

## 🔑 Gemini API Key ve Ebeveyn Kontrolü

1. Uygulamayı ilk kez açtığınızda sizden bir **Gemini API Key** isteyecektir.
2. API Key'inizi [Google AI Studio](https://aistudio.google.com/) üzerinden tamamen ücretsiz oluşturabilirsiniz.
3. Anahtarınızı girip kaydettiğinizde, bu anahtar yalnızca telefonunuzun tarayıcı hafızasında (`localStorage`) saklanır. GitHub kodlarınızda asla görünmez, bu sayede API anahtarınız **100% güvendedir**.
4. Sol üstteki **ATAOL** logosuna **5 kez tıkladığınızda** veya sağ üstteki **Ayarlar** çarkına dokunduğunuzda bir **Ebeveyn Doğrulama Sorusu** açılır.
5. Soruyu doğru yanıtlayarak ebeveyn paneline girebilir; gelişim haftasını değiştirebilir, API anahtarını güncelleyebilir veya ilerlemeyi sıfırlayabilirsiniz. Deha bu panele şifreyi çözmeden erişemez.

---

## Geliştirme

Bu proje bağımlılık kullanmaz. `node_modules` yoktur, build adımı yoktur.

Testler Node 22 yerleşik test runner'ı ile çalışır:

```bash
node --test "tests/**/*.test.js"
```

### Mimari kuralları

1. **Bağımlılık yönü tek taraflı:** `views` → `engines` → `core`. Ters import yasak.
2. **Motorlar saftır:** `engines/` altındaki modüller `localStorage`, `Date.now()` veya `Math.random()` çağırmaz. Zaman ve rastgelelik dışarıdan enjekte edilir.
3. **Kodda kişi adı sabit yazılmaz.** Tüm isimler profil verisinden gelir. Bu kural `tests/profile.test.js` ile korunur.
4. **Ebeveyn günlüğü cihazı terk etmez.** `engines/diary.js` içinde ağ çağrısı bulunması testle engellenir.
