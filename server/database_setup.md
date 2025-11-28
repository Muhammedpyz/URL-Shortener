# 🚀 Yüksek Kapasiteli Veritabanı Kurulumu (TiDB Serverless)

Bu proje için **TiDB Serverless** kullanacağız. Neden?
- **5 GB Ücretsiz Alan**: Yaklaşık 50 Milyon kayıt sığar.
- **MySQL Uyumlu**: Kodlarımızda hiçbir değişiklik yapmamıza gerek yok.
- **Serverless**: Sunucu yönetimi derdi yok, otomatik ölçeklenir.

## Adım 1: Hesap Oluşturma
1. [TiDB Cloud](https://tidbcloud.com/free-trial) adresine git.
2. Google veya GitHub ile ücretsiz üye ol.
3. **"Create Cluster"** butonuna bas.
4. **"Serverless"** seçeneğini seç (Ücretsiz olan).
5. Bölge olarak sana en yakın olanı (genelde Europe-Frankfurt) seç.
6. Cluster'ına bir isim ver (örn: `url-shortener-db`) ve oluştur.

## Adım 2: Bağlantı Bilgilerini Alma
1. Cluster oluşturulduktan sonra **"Connect"** butonuna tıkla.
2. **"Connect with General Client"** veya **"Connect with Code"** sekmesine gel.
3. Orada sana bir bağlantı string'i verecek. Şuna benzer:
   `mysql://2.RO.xxxxxxxx:3306/test?ssl={"minVersion":"TLSv1.2"}`
4. **"Generate Password"** diyerek şifreni al.

## Adım 3: .env Dosyasını Güncelleme
Vercel'e deploy ederken veya localde çalışırken `.env` dosyanı şu şekilde güncelle:

```env
DATABASE_URL="mysql://<KULLANICI_ADI>:<SIFRE>@<HOST>:4000/test?sslaccept=strict"
```
*Not: TiDB genelde 4000 portunu kullanır. Sana verilen string'i aynen kopyala.*

## Adım 4: Veritabanını Hazırlama
Bağlantı ayarını yaptıktan sonra terminalde şu komutu çalıştırarak tabloları oluştur:

```bash
npx prisma db push
```

Artık 5GB'lık devasa veritabanın hazır! 🚀
