# 🚀 Modern URL Kısaltıcı (URL Shortener)

Bu proje, modern web teknolojileri kullanılarak geliştirilmiş, tam özellikli bir URL kısaltma servisidir. Kullanıcılar uzun linklerini kısaltabilir, tıklanma istatistiklerini takip edebilir ve hesap oluşturarak linklerini yönetebilirler.


## ✨ Özellikler

*   **🔗 Hızlı Link Kısaltma:** Uzun URL'leri anında kısa ve paylaşılabilir linklere dönüştürün.
*   **📊 Detaylı Analitik:**
    *   Toplam tıklanma sayısı.
    *   Tıklayanların konumu (Ülke/Şehir).
    *   Cihaz, Tarayıcı ve İşletim Sistemi bilgileri.
    *   IP adresi takibi (anonimleştirilmiş).
*   **👤 Kullanıcı Yönetimi:**
    *   Kayıt Ol / Giriş Yap.
    *   E-posta doğrulama sistemi.
    *   Şifremi unuttum / Hesap silme.
    *   Kullanıcı paneli (Linklerim).
*   **🎨 Modern Arayüz:**
    *   Glassmorphism tasarım dili.
    *   Responsive (Mobil uyumlu) yapı.
    *   Toast bildirimleri ile kullanıcı dostu deneyim.
*   **☁️ Bulut Tabanlı:**
    *   Veritabanı: TiDB (MySQL).
    *   Backend: Vercel (Serverless).

## 🛠️ Teknolojiler

*   **Backend:** Node.js, Express.js, TypeScript
*   **Veritabanı:** Prisma ORM, MySQL (TiDB Cloud)
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript
*   **Güvenlik:** JWT (JSON Web Tokens), Bcrypt, Helmet, CORS

## 🚀 Kurulum (Local)

Projeyi kendi bilgisayarınızda çalıştırmak için:

1.  **Repoyu klonlayın:**
    ```bash
    git clone https://github.com/Muhammedpyz/URL-Shortener.git
    ```

2.  **Bağımlılıkları yükleyin:**
    ```bash
    cd server
    npm install
    ```

3.  **Çevresel Değişkenleri (.env) ayarlayın:**
    `server/.env` dosyasını oluşturun ve aşağıdaki bilgileri girin:
    ```env
    PORT=3000
    DATABASE_URL="mysql://..."
    JWT_SECRET="gizli_sifreniz"
    SMTP_USER="email@gmail.com"
    SMTP_PASS="uygulama_sifresi"
    BASE_URL="http://localhost:3000"
    ```

4.  **Uygulamayı başlatın:**
    ```bash
    npm run dev
    ```
    Frontend için `client/index.html` dosyasını tarayıcıda açın veya Live Server kullanın.

## 🌐 Dağıtım (Vercel)

Bu proje Vercel üzerinde çalışmak üzere optimize edilmiştir.

1.  GitHub reponuzu Vercel'e bağlayın.
2.  Environment Variables kısmına `.env` bilgilerini girin.
3.  Deploy tuşuna basın!

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
