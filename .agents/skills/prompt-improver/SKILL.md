---
name: prompt-improver
description: >
  Automatically improves any rough prompt the user writes using all installed skills. Use
  whenever the user writes a rough prompt, says "improve this prompt", "enhance my prompt",
  "make this better", "fix my prompt", or pastes any task description and wants it improved.
  Detects relevant skills automatically and rewrites with Goal, Steps, Stack, Constraints,
  Deliverables. Always activate before rewriting any prompt.
---

# Prompt Improver

## Step 1 — Detect relevant skills from the prompt
| Mentions | Add skill |
|---|---|
| Shopline, order, webhook, product | $shopline-expert |
| UI, page, dashboard, design | $shopline-design-system $frontend-ui-expert |
| API, backend, route, server | $express-api-expert |
| Database, schema, Prisma | $database-expert |
| Auth, JWT, HMAC, secure | $auth-security-expert |
| Next.js, App Router | $nextjs-expert |
| Deploy, Render, hosting | $render-cli-expert |
| Test, unit test | $testing-expert |
| Queue, async, worker | $background-jobs-expert |
| Error, log, Sentry | $error-logging-expert |
| Git, CI/CD, GitHub | $git-workflow-expert |
| Prompt, AI, bot | $prompt-expert |

## Step 2 — Rewrite using this template
```
[DETECTED $SKILLS]

## Goal
[1-2 sentence clear objective]

## Exact Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Tech Stack
- [Stack]

## Flow
[trigger] → [action] → [result]

## Constraints
- [Security, performance, error handling rules]

## Deliverables
1. [File or feature]
2. [File or feature]
```

## Step 3 — Always output
1. The improved prompt (copy-paste ready)
2. Before/after table
3. Exact codex command to run
