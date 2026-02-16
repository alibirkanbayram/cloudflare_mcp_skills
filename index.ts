#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFileSync, execSync } from "child_process";

// ── Config ────────────────────────────────────────────────
// Hesaplar env'den okunur: ACCOUNT_<NAME>_ID ve ACCOUNT_<NAME>_TOKEN
// Örnek: ACCOUNT_MIVO_ID=abc123 ACCOUNT_MIVO_TOKEN=xyz789

interface Account {
  id: string;
  token: string;
}

const accounts = new Map<string, Account>();

// Env'den hesapları parse et
for (const [key, value] of Object.entries(process.env)) {
  const idMatch = key.match(/^ACCOUNT_(.+)_ID$/);
  if (idMatch && value) {
    const name = idMatch[1].toLowerCase();
    const token =
      process.env[`ACCOUNT_${idMatch[1]}_TOKEN`] ||
      process.env[`ACCOUNT_${idMatch[1]}_API_TOKEN`];
    if (token) {
      accounts.set(name, { id: value, token });
    }
  }
}

// Fallback: tek hesap modu
if (accounts.size === 0) {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_TOKEN;
  if (id && token) {
    accounts.set("default", { id, token });
  }
}

if (accounts.size === 0) {
  console.error(
    "HATA: Hesap bilgisi bulunamadı.\n" +
      "Tek hesap: CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN\n" +
      "Çoklu: ACCOUNT_MIVO_ID + ACCOUNT_MIVO_TOKEN, ACCOUNT_ATOLYE_ID + ACCOUNT_ATOLYE_TOKEN, ..."
  );
  process.exit(1);
}

console.error(`Yüklenen hesaplar: ${[...accounts.keys()].join(", ")}`);

// ── Helpers ───────────────────────────────────────────────

function getAccount(name?: string): Account {
  if (!name || name === "") {
    const mivo = accounts.get("mivo");
    if (mivo) {
      return mivo;
    }
    if (accounts.size === 1) {
      return accounts.values().next().value!;
    }
    throw new Error(
      `Birden fazla hesap var, hesap adı belirt: ${[...accounts.keys()].join(", ")}`
    );
  }
  const acc = accounts.get(name.toLowerCase());
  if (!acc) {
    throw new Error(
      `"${name}" hesabı bulunamadı. Mevcut hesaplar: ${[...accounts.keys()].join(", ")}`
    );
  }
  return acc;
}

function runWrangler(args: string, account: Account, cwd?: string): string {
  const env = {
    ...process.env,
    CLOUDFLARE_API_TOKEN: account.token,
    CLOUDFLARE_ACCOUNT_ID: account.id,
  };

  try {
    const result = execSync(`npx -y wrangler ${args}`, {
      env,
      cwd: cwd || process.cwd(),
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024,
      encoding: "utf-8",
    });
    return result;
  } catch (err: any) {
    return `HATA: ${err.stderr || err.message}`;
  }
}

function cfApi(
  account: Account,
  path: string,
  method: string = "GET",
  body?: any
): string {
  const baseUrl = "https://api.cloudflare.com/client/v4";
  const url = path.startsWith("/accounts/") || path.startsWith("/zones")
    ? `${baseUrl}${path}`
    : `${baseUrl}/accounts/${account.id}${path}`;
  const curlCmd = [
    "curl",
    "-s",
    "-X",
    method,
    `"${url}"`,
    `-H "Authorization: Bearer ${account.token}"`,
    `-H "Content-Type: application/json"`,
  ];
  if (body) {
    curlCmd.push(`-d '${JSON.stringify(body)}'`);
  }

  try {
    return execSync(curlCmd.join(" "), {
      timeout: 30000,
      encoding: "utf-8",
    });
  } catch (err: any) {
    return `HATA: ${err.message}`;
  }
}

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function errorResult(msg: string) {
  return { content: [{ type: "text" as const, text: `❌ ${msg}` }], isError: true };
}

// ── MCP Server ────────────────────────────────────────────

const server = new McpServer({
  name: "mcp-cloudflare-lite",
  version: "1.0.0",
});

// ── Tool: Hesapları listele ───────────────────────────────
server.tool(
  "list_accounts",
  "Tanımlı Cloudflare hesaplarını listele",
  {},
  async () => {
    const list = [...accounts.entries()]
      .map(([name, acc]) => `• ${name} (account: ${acc.id.slice(0, 8)}...)`)
      .join("\n");
    return textResult(`Tanımlı hesaplar:\n${list}`);
  }
);

// ── Tool: whoami ──────────────────────────────────────────
server.tool(
  "whoami",
  "Cloudflare hesap bilgisini doğrula",
  { account: z.string().optional().describe("Hesap adı (örn: mivo, atolye)") },
  async ({ account: accName }) => {
    try {
      const acc = getAccount(accName);
      const result = runWrangler("whoami", acc);
      return textResult(result);
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: D1 listele ─────────────────────────────────────
server.tool(
  "d1_list",
  "D1 veritabanlarını listele",
  { account: z.string().optional().describe("Hesap adı") },
  async ({ account: accName }) => {
    try {
      const acc = getAccount(accName);
      return textResult(runWrangler("d1 list", acc));
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: D1 sorgu ───────────────────────────────────────
server.tool(
  "d1_query",
  "D1 veritabanında SQL sorgusu çalıştır",
  {
    account: z.string().optional().describe("Hesap adı"),
    database: z.string().describe("Veritabanı adı (örn: mivo-db)"),
    sql: z.string().describe("Çalıştırılacak SQL sorgusu"),
  },
  async ({ account: accName, database, sql }) => {
    try {
      const acc = getAccount(accName);
      const escaped = sql.replace(/"/g, '\\"');
      return textResult(
        runWrangler(`d1 execute ${database} --remote --command "${escaped}"`, acc)
      );
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: D1 dosyadan SQL çalıştır ──────────────────────
server.tool(
  "d1_execute_file",
  "D1 veritabanında SQL dosyası çalıştır (migration/schema)",
  {
    account: z.string().optional().describe("Hesap adı"),
    database: z.string().describe("Veritabanı adı"),
    file: z.string().describe("SQL dosya yolu"),
  },
  async ({ account: accName, database, file }) => {
    try {
      const acc = getAccount(accName);
      return textResult(
        runWrangler(`d1 execute ${database} --remote --file ${file}`, acc)
      );
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: Worker listele ─────────────────────────────────
server.tool(
  "worker_list",
  "Worker'ları listele",
  { account: z.string().optional().describe("Hesap adı") },
  async ({ account: accName }) => {
    try {
      const acc = getAccount(accName);
      const result = cfApi(acc, "/workers/scripts");
      const parsed = JSON.parse(result);
      if (parsed.result) {
        const workers = parsed.result
          .map((w: any) => `• ${w.id} (modified: ${w.modified_on})`)
          .join("\n");
        return textResult(`Workers:\n${workers}`);
      }
      return textResult(result);
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: Worker deploy ──────────────────────────────────
server.tool(
  "worker_deploy",
  "Worker deploy et",
  {
    account: z.string().optional().describe("Hesap adı"),
    directory: z.string().describe("Worker dizini (wrangler.jsonc olan yer)"),
    config: z.string().optional().default("wrangler.jsonc").describe("Config dosya adı"),
  },
  async ({ account: accName, directory, config }) => {
    try {
      const acc = getAccount(accName);
      return textResult(runWrangler(`deploy --config ${config}`, acc, directory));
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: Worker tail (log) ──────────────────────────────
server.tool(
  "worker_tail",
  "Worker loglarını göster (son hatalar)",
  {
    account: z.string().optional().describe("Hesap adı"),
    name: z.string().describe("Worker adı"),
  },
  async ({ account: accName, name }) => {
    try {
      const acc = getAccount(accName);
      // Tail sürekli çalışır, biz kısa bir snapshot alıyoruz
      return textResult(
        runWrangler(`tail ${name} --format json --once`, acc)
      );
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: R2 bucket listele ──────────────────────────────
server.tool(
  "r2_list_buckets",
  "R2 bucket'ları listele",
  { account: z.string().optional().describe("Hesap adı") },
  async ({ account: accName }) => {
    try {
      const acc = getAccount(accName);
      return textResult(runWrangler("r2 bucket list", acc));
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: R2 obje listele ────────────────────────────────
server.tool(
  "r2_list_objects",
  "R2 bucket içindeki objeleri listele",
  {
    account: z.string().optional().describe("Hesap adı"),
    bucket: z.string().describe("Bucket adı"),
    prefix: z.string().optional().describe("Prefix filtresi (örn: images/)"),
  },
  async ({ account: accName, bucket, prefix }) => {
    try {
      const acc = getAccount(accName);
      const prefixArg = prefix ? ` --prefix "${prefix}"` : "";
      return textResult(runWrangler(`r2 object list ${bucket}${prefixArg}`, acc));
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: R2 obje sil ────────────────────────────────────
server.tool(
  "r2_delete_object",
  "R2'den obje sil",
  {
    account: z.string().optional().describe("Hesap adı"),
    bucket: z.string().describe("Bucket adı"),
    key: z.string().describe("Obje key'i (örn: images/photo.jpg)"),
  },
  async ({ account: accName, bucket, key }) => {
    try {
      const acc = getAccount(accName);
      return textResult(runWrangler(`r2 object delete ${bucket}/${key}`, acc));
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: Zone listele ───────────────────────────────────
server.tool(
  "zones_list",
  "DNS zone'ları (domainleri) listele",
  { account: z.string().optional().describe("Hesap adı") },
  async ({ account: accName }) => {
    try {
      const acc = getAccount(accName);
      const result = cfApi(acc, `/zones?account.id=${acc.id}`);
      const parsed = JSON.parse(result);
      if (parsed.result) {
        const zones = parsed.result
          .map((z: any) => `• ${z.name} (${z.status}) [${z.id}]`)
          .join("\n");
        return textResult(`Zones:\n${zones}`);
      }
      return textResult(result);
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: Secret yönetimi ────────────────────────────────
server.tool(
  "secret_put",
  "Worker'a secret ekle",
  {
    account: z.string().optional().describe("Hesap adı"),
    worker: z.string().describe("Worker adı"),
    name: z.string().describe("Secret adı"),
    value: z.string().describe("Secret değeri"),
    config: z.string().optional().default("wrangler.jsonc").describe("Config dosya adı"),
  },
  async ({ account: accName, worker, name: secretName, value, config }) => {
    try {
      const acc = getAccount(accName);
      const result = execFileSync(
        "npx",
        ["-y", "wrangler", "secret", "put", secretName, "--name", worker, "--config", config],
        {
          env: {
            ...process.env,
            CLOUDFLARE_API_TOKEN: acc.token,
            CLOUDFLARE_ACCOUNT_ID: acc.id,
          },
          input: `${value}\n`,
          timeout: 30000,
          encoding: "utf-8",
        }
      );
      return textResult(result);
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Tool: Genel wrangler komutu ──────────────────────────
server.tool(
  "wrangler_run",
  "Herhangi bir wrangler komutu çalıştır (gelişmiş kullanım)",
  {
    account: z.string().optional().describe("Hesap adı"),
    command: z.string().describe("Wrangler komutu (örn: 'd1 info mivo-db')"),
    cwd: z.string().optional().describe("Çalışma dizini"),
  },
  async ({ account: accName, command, cwd }) => {
    try {
      const acc = getAccount(accName);
      return textResult(runWrangler(command, acc, cwd));
    } catch (e: any) {
      return errorResult(e.message);
    }
  }
);

// ── Start ─────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-cloudflare-lite çalışıyor");
}

main().catch(console.error);
