---
name: render-cli-expert
description: >
  Expert skill for deploying apps on Render.com using CLI and render.yaml. Use whenever the
  user wants to deploy a web service, worker, cron job, or database to Render, configure env
  vars, or manage services. Triggers for "Render", "deploy", "render.yaml", "host on Render".
  Always use before writing any Render config or CLI commands.
---

# Render CLI Expert

## CLI Commands
```bash
render login
render services list
render deploys create --service <id>
render logs --service <id>
render env set KEY=VALUE --service <id>
```

## render.yaml for SPX Connector App
```yaml
services:
  - type: web
    name: spx-connector
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SHOPLINE_API_KEY
        sync: false
      - key: SHOPLINE_API_SECRET
        sync: false
      - key: SPX_API_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: spx-db
          property: connectionString

  - type: worker
    name: spx-worker
    runtime: node
    startCommand: node dist/workers/webhook.worker.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: spx-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: spx-redis
          type: redis
          property: connectionString

databases:
  - name: spx-db
    plan: free
```
