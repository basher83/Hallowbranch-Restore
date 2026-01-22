# Next Actions

## Deploy the worker

```bash
cd worker
npm install
npm run secret # Enter your GEMINI_API_KEY when prompted
npm run deploy # Deploys to Cloudflare
```

Then add to .env.local:

```text
VITE_WORKER_URL=<https://restora-gemini-proxy.your-subdomain.workers.dev>
```
