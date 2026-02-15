# Skills vs MCP: Hangi Platformda Nasıl Kullanılır?

## Skills Nedir?

Skills, agent'ın context'ine eklenen markdown dosyalarıdır.
Agent bu dosyaları okur ve içindeki komutları/kuralları takip eder.
MCP gibi ayrı bir process başlatmaz — sadece bilgi sağlar, agent terminali kullanarak işlem yapar.

## Platform Karşılaştırması

| Platform | MCP Desteği | Skills Desteği | Önerilen Yöntem |
|----------|-------------|----------------|-----------------|
| Antigravity | ❌ Sorunlu | ✅ Custom Rules/Docs | **Skills** |
| Codex (OpenAI) | ✅ Çalışıyor | ✅ Dahili skills sistemi | Skills veya MCP |
| Cursor | ✅ Çalışıyor | ✅ .cursor/rules | MCP veya Skills |
| Claude Code | ✅ Çalışıyor | ✅ CLAUDE.md | MCP veya Skills |
| Claude Desktop | ✅ Çalışıyor | ❌ Yok | **MCP** |
| Windsurf | ✅ Çalışıyor | ✅ .windsurfrules | MCP veya Skills |

## Antigravity'de Skills Kullanımı

Antigravity'de "skills" doğrudan desteklenmez ama aynı etkiyi 2 yolla elde edebilirsin:

### Yöntem 1: Custom Rules (Önerilen)
1. Antigravity'de "..." menüsü → "Custom Rules" (veya "Agent Settings")
2. `SKILL.md` dosyasının içeriğini buraya yapıştır
3. Agent her sohbette bu kuralları otomatik okuyacak

### Yöntem 2: Proje Dosyası Olarak
1. `SKILL.md` dosyasını projenin kök dizinine koy
2. Agent'a her sohbet başında "Read SKILL.md first" de
3. Veya `.antigravity/rules.md` dosyasına koy (varsa)

## Codex'te Skills Kullanımı
Codex'in kendi skills sistemi var. `SKILL.md` dosyasını projenin kök dizinine koy,
Codex otomatik olarak okur.

## Cursor'da Skills Kullanımı
`.cursor/rules` dosyasına `SKILL.md` içeriğini ekle.
Veya `.cursorrules` dosyasını kullan.

## Claude Code'da Skills Kullanımı
`CLAUDE.md` dosyasına `SKILL.md` içeriğini ekle.
Claude Code bunu otomatik okur.

## Windsurf'te Skills Kullanımı
`.windsurfrules` dosyasına ekle.

## Ne Zaman MCP, Ne Zaman Skills?

**MCP tercih et:**
- Platform MCP'yi düzgün destekliyorsa
- Birden fazla agent/araç aynı tool'ları kullanacaksa
- Tool çağrılarının programatik olmasını istiyorsan

**Skills tercih et:**
- MCP sorunluysa (Antigravity gibi)
- Basitlik istiyorsan (kurulum yok, sadece bir dosya)
- Agent'ın terminali zaten kullanabildiği durumlarda
- Hızlı başlangıç istiyorsan
