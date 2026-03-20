---
name: git-workflow-expert
description: >
  Expert skill for Git workflows, branching, commit conventions, and GitHub Actions CI/CD. Use
  whenever the user wants to set up Git, create branches, write commits, set up GitHub Actions,
  or manage PRs. Triggers for "git", "branch", "commit", "PR", "GitHub Actions", "CI/CD".
  Always use before setting up any Git or CI/CD config.
---

# Git Workflow Expert

## Branch Strategy
```
main      → production (never push directly)
dev       → integration
feature/* → new features  (feature/spx-integration)
fix/*     → bug fixes     (fix/webhook-hmac)
```

## Commit Convention
```
feat(spx): add SPX order creation API call
fix(webhooks): correct HMAC base64 comparison
chore(deps): update bullmq to v5
test(orders): add webhook handler integration tests
```

## .gitignore
```
node_modules/  .env  .env.local  .next/  dist/  *.log  .DS_Store
```

## GitHub Actions CI
```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [dev, main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci && npm test
```

## Auto Deploy to Render
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```
