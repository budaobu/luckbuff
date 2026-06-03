# luckbuff project notes

## Production deploy

Use `scripts/deploy.sh`, not the bare `nuxt-vps-deploy` skill flow.

The script wraps the standard skill steps but also rsyncs
`liuyao-three-coin-physical-core-SKILL-contract-v2.md` to `/var/www/luckbuff/`.
That file is gitignored and lives outside `.output`; the liu-yao engine extracts
its embedded Python engine + lunar_python vendor from it on first request and
caches them under `.cache/liuyao-engine/`. Without it the engine throws
`SKILL.md not found` and every liu-yao prediction returns 500.

Target host and key are overridable via `LUCKBUFF_DEPLOY_HOST` and
`LUCKBUFF_DEPLOY_KEY`; defaults match the current production server.

## Build pitfalls (already pinned in nuxt.config.ts)

- `pinia` is aliased to its ESM build via absolute `createRequire` lookup.
  Vite's prod build resolves `pinia` via the `production` export condition to
  `pinia.prod.cjs`, which Rollup's commonjs plugin then turns into
  `import Vue__default from 'vue'`. Vue 3.5's `index.mjs` only `export *` from
  CJS, so `default` is missing and SSR crashes at startup.
- `icon.serverBundle = 'remote'` so `@iconify-json/*` collections load from
  JSDelivr at request time. Otherwise the Nuxt Icon endpoint does a runtime
  `createRequire(_importMeta_.url)('@iconify-json/heroicons/icons.json')` that
  cannot resolve inside `.output` and 500s.

## Liu-yao engine runtime

- Python interpreter resolution lives in `server/utils/liuyao/engine.ts`:
  `LIUYAO_PYTHON` env var > local `.venv/bin/python` > system `python3`.
  Production has no venv; system `python3` (3.12+) is enough because the
  vendored `lunar_python` is pure stdlib.
- Engine payload is passed via a per-request temp file under `.cache/`, not
  `/dev/stdin`. The stdin path races with `child.stdin.end()` on Linux and
  fails with `ENXIO`.

## Vedic chart microservice

- Code lives in `vedic-service/` (own venv, own PM2 process at
  `127.0.0.1:8765`). Pinned to `pyswisseph` because Swiss Ephemeris has no
  JS equivalent — bundle is C-extension, must run in Python.
- Nuxt server API at `server/api/vedic/{chart,analyze}.post.ts` reads
  `process.env.VEDIC_SERVICE_URL` (default `http://127.0.0.1:8765`) — set in
  PM2 `env` block of `ecosystem.config.cjs`.
- `scripts/deploy.sh` rsyncs `vedic-service/` (without `.venv/`/`.ephe/`) to
  `/opt/vedic-service`, then runs `pip install -r requirements.txt` and warms
  up Swiss Ephemeris `.se1` download to `/opt/ephe`. Without warmup the first
  prod request stalls 30s+ pulling the ephemeris from ftp.astro.com.
- SSE flow: `analyze.post.ts` writes `data: {"type":"chart",...}` first, then
  parses the upstream OpenAI-compatible stream and re-emits each delta as
  `{"type":"text",...}`. Sets `X-Accel-Buffering: no` so Nginx does not
  buffer the stream — production Nginx already has `proxy_buffering off`.

## Production env vars

Server `.env` lives at `/home/deploy/envs/luckbuff.env` and is sourced into
PM2 by `scripts/deploy.sh`. `NUXT_PUBLIC_*` keys must be declared in
`runtimeConfig.public` in `nuxt.config.ts` or Nuxt won't pick them up from env.
