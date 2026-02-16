# mcp-cloudflare-lite

A lightweight Cloudflare MCP server focused on the most common workflows (D1, Workers, R2, Zones, and raw Wrangler commands).

Published package:
- `@dots_software/mcp-cloudflare-lite`

## Features

- Smaller tool surface (focused set of tools)
- Works with API token + account ID (no `wrangler login` required)
- Supports single-account and multi-account env setups
- Includes `wrangler_run` for advanced/custom Wrangler commands

## Install (local development)

```bash
npm install
npm run build
```

## Use Without Local Path (via npm)

Use this in MCP client configs:

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "npx",
      "args": ["-y", "-p", "@dots_software/mcp-cloudflare-lite@latest", "mcp-cloudflare-lite"],
      "env": {
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id",
        "CLOUDFLARE_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

If your environment has `npx` path issues (for example with `nvm`), set an absolute command path and/or explicit `PATH`.

## Authentication

Single account (recommended):

```bash
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
export CLOUDFLARE_API_TOKEN="your_api_token"
```

Also supported:
- `CLOUDFLARE_TOKEN` (as an alternative token variable name)

Multi-account (optional):

```bash
export ACCOUNT_MAIN_ID="account_id"
export ACCOUNT_MAIN_TOKEN="api_token"
export ACCOUNT_STAGE_ID="account_id"
export ACCOUNT_STAGE_TOKEN="api_token"
```

You can also use `ACCOUNT_<NAME>_API_TOKEN`.

## Available Tools

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

## Example Prompts

- "List D1 databases"
- "Show all workers"
- "Run this SQL on my database"
- "Deploy the worker in this directory"
- "Run wrangler command: d1 info my-db"

## Test

```bash
npm run inspector
node build/index.js
```

## Turkish Documentation

See: `README_tr.md`
