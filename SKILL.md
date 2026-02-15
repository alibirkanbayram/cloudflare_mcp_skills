---
name: cloudflare-management
description: Cloudflare servislerini wrangler CLI ile coklu hesap destegiyle yonetmek icin kullan. D1, Workers, R2 ve zone islemlerinde komut kaliplarini ve guvenli uygulama kurallarini saglar.
---

# Cloudflare Yönetim Skill'i

Bu skill, Cloudflare servislerini wrangler CLI üzerinden yönetmek için kullanılır.
MCP yerine doğrudan terminal komutları çalıştırarak işlem yapar.

## Hesap Sistemi

Bu projede birden fazla Cloudflare hesabı kullanılmaktadır.
Her hesap için ayrı env variable tanımlıdır.

### Tanımlı Hesaplar

| Takma Ad | Proje | Env Prefix |
|----------|-------|------------|
| mivo | MIVO App | `MIVO_CF_` |
| atolye | Atölye Shop | `ATOLYE_CF_` |
| dots | DOTS Platform | `DOTS_CF_` |

### Hesap Seçimi

Komut çalıştırırken env variable ile hesap seçilir:

```bash
# MIVO hesabı
CLOUDFLARE_API_TOKEN="$MIVO_CF_API_TOKEN" CLOUDFLARE_ACCOUNT_ID="$MIVO_CF_ACCOUNT_ID" npx wrangler <komut>

# Shell kısa yolu tanımlıysa:
wr-mivo <komut>
wr-atolye <komut>
wr-dots <komut>
```

Eğer kullanıcı hesap belirtmezse, MIVO varsayılan hesaptır.

## Komut Referansı

### Kimlik Doğrulama
```
wr-mivo whoami           → Hesap bilgisini doğrula
```

### D1 Veritabanı
```
wr-mivo d1 list                                                    → Veritabanlarını listele
wr-mivo d1 info <db-name>                                         → Veritabanı bilgisi
wr-mivo d1 execute <db-name> --remote --command "<SQL>"            → SQL sorgusu çalıştır
wr-mivo d1 execute <db-name> --remote --file <path.sql>            → SQL dosyası çalıştır
wr-mivo d1 export <db-name> --remote --output <backup.sql>         → Backup al
```

### Workers
```
wr-mivo deploy --config wrangler.jsonc                             → Worker deploy et
wr-mivo tail --config wrangler.jsonc                               → Canlı log izle
wr-mivo tail --config wrangler.jsonc --status error                → Sadece hataları izle
wr-mivo secret put <SECRET_NAME> --config wrangler.jsonc           → Secret ekle
wr-mivo secret list --config wrangler.jsonc                        → Secret'ları listele
```

### R2 Storage
```
wr-mivo r2 bucket list                                             → Bucket'ları listele
wr-mivo r2 object list <bucket> --prefix "<prefix>"                → Objeleri listele
wr-mivo r2 object put <bucket>/<key> --file <path> --content-type "<mime>"  → Dosya yükle
wr-mivo r2 object get <bucket>/<key> --file <path>                 → Dosya indir
wr-mivo r2 object delete <bucket>/<key>                            → Dosya sil
```

### DNS / Zones (curl ile)
```bash
curl -s -X GET "https://api.cloudflare.com/client/v4/zones?account.id=$MIVO_CF_ACCOUNT_ID" \
  -H "Authorization: Bearer $MIVO_CF_API_TOKEN" | jq '.result[] | {name, id, status}'
```

## Davranış Kuralları

1. Kullanıcı hangi hesapla çalışmak istediğini belirtmezse, **MIVO** hesabını kullan.
2. D1 sorguları için her zaman `--remote` flag'i kullan (local değil).
3. Deploy öncesi mutlaka `npm install` çalıştır.
4. SQL sorgularında her zaman `LIMIT` kullan (büyük tablolarda).
5. Secret değerlerini loglama veya ekrana yazdırma.
6. Hata alırsan önce `whoami` ile token'ın geçerli olduğunu doğrula.
7. Deploy sonrası `curl <worker-url>/health` ile health check yap.

## MIVO Projesi Dizin Yapısı

```
backend/cloudflare_realtime_worker/    → Worker kaynak kodu + wrangler.jsonc
backend/d1/                            → D1 şema ve migration dosyaları
backend/d1/scripts/                    → apply_schema_remote.sh, apply_data_remote.sh
lib/controllers/api/                   → Flutter backend client
```

## Sık Kullanılan İşlemler

### Tam deploy cycle
```bash
cd backend/cloudflare_realtime_worker && \
  npm install && \
  wr-mivo whoami && \
  wr-mivo deploy --config wrangler.jsonc
```

### Şema güncelleme + deploy
```bash
./backend/d1/scripts/apply_schema_remote.sh && \
  cd backend/cloudflare_realtime_worker && \
  wr-mivo deploy --config wrangler.jsonc
```

### Hızlı veritabanı kontrolü
```bash
wr-mivo d1 execute mivo-db --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```
