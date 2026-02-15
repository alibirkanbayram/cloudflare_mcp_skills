# mcp-cloudflare-lite

Cloudflare'in 89 tool'luk MCP sunucusu yerine, sadece ihtiyacın olan **14 tool** ile çalışan hafif MCP sunucusu.
Çoklu hesap desteği dahil.

## Özellikler

- **14 tool** (89 yerine) — Antigravity, Cursor, Claude Desktop hepsinde sorunsuz çalışır
- **Çoklu hesap** — MIVO, Atölye, DOTS... hepsi aynı MCP'den yönetilir
- **wrangler CLI tabanlı** — Altta wrangler çalıştırır, ekstra API yoktur
- **Genel wrangler komutu** — `wrangler_run` ile istediğin komutu geçebilirsin

## Kurulum

```bash
cd mcp-cloudflare-lite
npm install
npm run build
```

## Hesap Ayarları

### Tek hesap
```bash
export CLOUDFLARE_ACCOUNT_ID="hesap_id"
export CLOUDFLARE_API_TOKEN="api_token"
```

### Çoklu hesap
```bash
export ACCOUNT_MIVO_ID="mivo_hesap_id"
export ACCOUNT_MIVO_TOKEN="mivo_token"
export ACCOUNT_ATOLYE_ID="atolye_hesap_id"
export ACCOUNT_ATOLYE_TOKEN="atolye_token"
export ACCOUNT_DOTS_ID="dots_hesap_id"
export ACCOUNT_DOTS_TOKEN="dots_token"
```

## MCP Config (Tüm Platformlar İçin)

### Antigravity (mcp_config.json)
```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "node",
      "args": ["/FULL/PATH/TO/mcp-cloudflare-lite/build/index.js"],
      "env": {
        "ACCOUNT_MIVO_ID": "hesap_id_buraya",
        "ACCOUNT_MIVO_TOKEN": "token_buraya",
        "ACCOUNT_ATOLYE_ID": "hesap_id_buraya",
        "ACCOUNT_ATOLYE_TOKEN": "token_buraya"
      }
    }
  }
}
```

### Cursor / Windsurf / VS Code (.cursor/mcp.json)
```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "node",
      "args": ["/FULL/PATH/TO/mcp-cloudflare-lite/build/index.js"],
      "env": {
        "ACCOUNT_MIVO_ID": "hesap_id_buraya",
        "ACCOUNT_MIVO_TOKEN": "token_buraya"
      }
    }
  }
}
```

### Claude Desktop (claude_desktop_config.json)
```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "node",
      "args": ["/FULL/PATH/TO/mcp-cloudflare-lite/build/index.js"],
      "env": {
        "ACCOUNT_MIVO_ID": "hesap_id_buraya",
        "ACCOUNT_MIVO_TOKEN": "token_buraya"
      }
    }
  }
}
```

### Claude Code (~/.claude/settings.json)
```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "node",
      "args": ["/FULL/PATH/TO/mcp-cloudflare-lite/build/index.js"],
      "env": {
        "ACCOUNT_MIVO_ID": "hesap_id_buraya",
        "ACCOUNT_MIVO_TOKEN": "token_buraya"
      }
    }
  }
}
```

## Mevcut Tool'lar (14 adet)

| Tool | Açıklama |
|------|----------|
| `list_accounts` | Tanımlı hesapları listele |
| `whoami` | Hesap doğrulama |
| `d1_list` | D1 veritabanlarını listele |
| `d1_query` | D1'de SQL sorgusu çalıştır |
| `d1_execute_file` | D1'de SQL dosyası çalıştır |
| `worker_list` | Worker'ları listele |
| `worker_deploy` | Worker deploy et |
| `worker_tail` | Worker loglarını göster |
| `r2_list_buckets` | R2 bucket'ları listele |
| `r2_list_objects` | R2 objeleri listele |
| `r2_delete_object` | R2 objesi sil |
| `zones_list` | DNS zone'ları listele |
| `secret_put` | Worker'a secret ekle |
| `wrangler_run` | Herhangi bir wrangler komutu çalıştır |

## Kullanım Örnekleri

Agent'a şu şekilde prompt verebilirsin:

- "MIVO hesabındaki D1 tablolarını listele"
- "Atölye hesabındaki worker'ları göster"
- "mivo-db'de users tablosundaki son 10 kaydı getir"
- "Worker'ı deploy et"

`wrangler_run` tool'u ile herhangi bir wrangler komutu çalıştırılabilir:
- `wrangler_run` → command: "d1 export mivo-db --remote --output backup.sql"
- `wrangler_run` → command: "r2 object put bucket/key --file ./file.jpg"

## Test

```bash
# MCP Inspector ile test
npm run inspector

# Veya doğrudan
node build/index.js
```
