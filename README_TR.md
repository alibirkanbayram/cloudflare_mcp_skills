# mcp-cloudflare-lite

D1, Workers, R2, Zone ve genel Wrangler komutlari icin hafif bir Cloudflare MCP sunucusu.

Yayinlanan paket:
- `@dots_software/mcp-cloudflare-lite`

## Ozellikler

- Daha odakli tool seti
- Sadece API token + account ID ile calisir (`wrangler login` gerekmez)
- Tek hesap ve coklu hesap env destegi
- Gelismis kullanim icin `wrangler_run` tool'u

## Kurulum (lokal gelistirme)

```bash
npm install
npm run build
```

## Path Vermeden Kullanim (npm uzerinden)

MCP istemcisi config'ine sunu ekleyebilirsin:

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "npx",
      "args": ["-y", "-p", "@dots_software/mcp-cloudflare-lite@latest", "mcp-cloudflare-lite"],
      "env": {
        "CLOUDFLARE_ACCOUNT_ID": "account_id",
        "CLOUDFLARE_API_TOKEN": "api_token"
      }
    }
  }
}
```

Eger `npx` path sorunu olursa (ozellikle `nvm` kullaniminda), `command` alanina `npx` tam yolunu verebilirsin.

## Kimlik Dogrulama

Tek hesap (onerilen):

```bash
export CLOUDFLARE_ACCOUNT_ID="account_id"
export CLOUDFLARE_API_TOKEN="api_token"
```

Alternatif token env:
- `CLOUDFLARE_TOKEN`

Coklu hesap (opsiyonel):

```bash
export ACCOUNT_MAIN_ID="account_id"
export ACCOUNT_MAIN_TOKEN="api_token"
export ACCOUNT_STAGE_ID="account_id"
export ACCOUNT_STAGE_TOKEN="api_token"
```

`ACCOUNT_<NAME>_API_TOKEN` de desteklenir.

## Mevcut Tool'lar

- `list_accounts`
- `whoami`
- `d1_list`
- `d1_query`
- `d1_execute_file`
- `worker_list`
- `worker_deploy`
- `worker_tail`
- `r2_list_buckets`
- `r2_list_objects`
- `r2_delete_object`
- `zones_list`
- `secret_put`
- `wrangler_run`

## Ornek Prompt'lar

- "D1 veritabanlarini listele"
- "Tum worker'lari goster"
- "Bu SQL'i veritabaninda calistir"
- "Bu klasordeki worker'i deploy et"
- "Su wrangler komutunu calistir: d1 info my-db"

## Test

```bash
npm run inspector
node build/index.js
```
