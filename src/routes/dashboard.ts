import { Router } from "express";

import { asyncHandler } from "../lib/async-handler.js";
import { env } from "../config/env.js";
import { dashboardService } from "../services/dashboard.service.js";

const navItems = [
  { href: "/", label: "Dashboard", icon: "home" },
  { href: "/logs", label: "Sync Logs", icon: "logs" },
  { href: "/settings", label: "Settings", icon: "settings" }
] as const;

const iconSvg = (name: string) => {
  const icons: Record<string, string> = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>`,
    logs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.7Z"/></svg>`,
    shop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9 4.5 4h15L21 9"/><path d="M5 10v10h14V10"/><path d="M9 20v-5h6v5"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.1 0l2.8-2.8a5 5 0 0 0-7.1-7.1L11 4"/><path d="M14 11a5 5 0 0 0-7.1 0L4.1 13.8a5 5 0 0 0 7.1 7.1L13 19"/></svg>`,
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>`,
    pending: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
    webhook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a5 5 0 1 1 5-5"/><path d="M14 10a5 5 0 1 1 5 5"/><path d="M9 14h6"/><path d="M12 11v6"/></svg>`
  };

  return icons[name] ?? icons.settings;
};

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    fulfilled: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    created: "bg-blue-50 text-blue-700 border-blue-200"
  };

  return classes[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
};

const pageTemplate = (options: { title: string; activePath: string; body: string }) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${options.title}</title>
    <style>
      :root {
        --bg: #f9fafb;
        --card: #ffffff;
        --border: #e5e7eb;
        --text: #111827;
        --muted: #4b5563;
        --soft: #6b7280;
        --primary: #2563eb;
        --primary-soft: #eff6ff;
        --success: #16a34a;
        --warning: #d97706;
        --danger: #dc2626;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
        background: var(--bg);
        color: var(--text);
      }
      .layout {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 260px 1fr;
      }
      .sidebar {
        background: #0f172a;
        color: #e5eefb;
        padding: 24px 18px;
        border-right: 1px solid rgba(255,255,255,0.06);
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 28px;
      }
      .brand-mark {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, #2563eb 0%, #0f172a 100%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .brand-mark svg {
        width: 20px;
        height: 20px;
        color: white;
      }
      .brand h1 {
        font-size: 18px;
        margin: 0;
      }
      .brand p {
        margin: 2px 0 0;
        font-size: 12px;
        color: #93a3b8;
      }
      .nav {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .nav a {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: #dbe7f7;
        padding: 11px 12px;
        border-radius: 12px;
        font-size: 14px;
      }
      .nav a.active {
        background: rgba(37, 99, 235, 0.18);
        color: white;
      }
      .nav-icon {
        width: 18px;
        height: 18px;
      }
      .content {
        padding: 28px;
      }
      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .topbar h2 {
        margin: 0;
        font-size: 28px;
        letter-spacing: -0.03em;
      }
      .topbar p {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: 14px;
      }
      .actions {
        display: flex;
        gap: 12px;
      }
      .button {
        border: 1px solid var(--border);
        color: var(--text);
        background: white;
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 13px;
        text-decoration: none;
      }
      .button.primary {
        background: var(--primary);
        border-color: var(--primary);
        color: white;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      }
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 18px;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      }
      .stat-card {
        padding: 18px;
      }
      .stat-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
      }
      .stat-top .icon-wrap {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: var(--primary-soft);
        color: var(--primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stat-top svg, .icon-wrap svg, .meta-icon svg, .inline-icon svg {
        width: 18px;
        height: 18px;
      }
      .stat-label {
        color: var(--muted);
        font-size: 13px;
        margin-bottom: 6px;
      }
      .stat-value {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.04em;
      }
      .grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }
      .panel-header {
        padding: 18px 20px;
        border-bottom: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .panel-header h3 {
        margin: 0;
        font-size: 15px;
      }
      .panel-header p {
        margin: 6px 0 0;
        font-size: 12px;
        color: var(--soft);
      }
      .panel-body {
        padding: 8px 20px 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        text-align: left;
        padding: 13px 0;
        border-bottom: 1px solid var(--border);
        font-size: 14px;
      }
      th {
        color: var(--soft);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      tr:last-child td {
        border-bottom: none;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 9px;
        border-radius: 999px;
        border: 1px solid var(--border);
        font-size: 12px;
        font-weight: 600;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .list-item {
        padding: 14px 0;
        border-bottom: 1px solid var(--border);
      }
      .list-item:last-child {
        border-bottom: none;
      }
      .list-item h4 {
        margin: 0 0 6px;
        font-size: 14px;
      }
      .list-item p {
        margin: 0;
        color: var(--muted);
        font-size: 13px;
      }
      .meta {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--soft);
        font-size: 12px;
        margin-top: 8px;
      }
      .meta-icon, .inline-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .settings-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .field {
        padding: 18px;
      }
      .field-label {
        color: var(--soft);
        font-size: 12px;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .field-value {
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
      }
      .muted {
        color: var(--soft);
      }
      .hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        background: white;
        border: 1px solid var(--border);
        border-radius: 22px;
        padding: 22px 24px;
        margin-bottom: 20px;
      }
      .hero h3 {
        margin: 0;
        font-size: 18px;
      }
      .hero p {
        margin: 8px 0 0;
        color: var(--muted);
        max-width: 600px;
      }
      .hero-mark {
        width: 54px;
        height: 54px;
        border-radius: 16px;
        background: #eff6ff;
        color: var(--primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .hero-mark svg {
        width: 24px;
        height: 24px;
      }
      @media (max-width: 1080px) {
        .layout { grid-template-columns: 1fr; }
        .sidebar { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .stats, .grid, .settings-grid { grid-template-columns: 1fr; }
        .content { padding: 20px; }
        .topbar, .hero { flex-direction: column; align-items: flex-start; }
      }
    </style>
  </head>
  <body>
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">${iconSvg("shop")}</span>
          <div>
            <h1>SPX Connector</h1>
            <p>Shopline merchant dashboard</p>
          </div>
        </div>
        <nav class="nav">
          ${navItems
            .map(
              (item) => `<a href="${item.href}" class="${options.activePath === item.href ? "active" : ""}">
                <span class="nav-icon">${iconSvg(item.icon)}</span>
                <span>${item.label}</span>
              </a>`
            )
            .join("")}
        </nav>
      </aside>
      <main class="content">${options.body}</main>
    </div>
  </body>
</html>`;

const dashboardPage = async () => {
  const snapshot = await dashboardService.getDashboardSnapshot();

  const body = `
    <div class="topbar">
      <div>
        <h2>Operations Dashboard</h2>
        <p>Monitor app health, Shopline installs, and recent order sync activity from one place.</p>
      </div>
      <div class="actions">
        <a class="button" href="/settings">Review settings</a>
        <a class="button primary" href="/logs">Open sync logs</a>
      </div>
    </div>

    <section class="hero">
      <div>
        <h3>Shopline backend is connected and serving merchant traffic</h3>
        <p>Use this dashboard to confirm store installs, webhook intake, and sync outcomes before real SPX credentials are added.</p>
      </div>
      <div class="hero-mark">${iconSvg("link")}</div>
    </section>

    <section class="stats">
      <div class="card stat-card">
        <div class="stat-top">
          <span class="icon-wrap">${iconSvg("shop")}</span>
          <span class="badge ${statusClass("created")}">Connected</span>
        </div>
        <div class="stat-label">Installed shops</div>
        <div class="stat-value">${snapshot.stats.totalShops}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-top">
          <span class="icon-wrap">${iconSvg("success")}</span>
          <span class="badge ${statusClass("fulfilled")}">Healthy</span>
        </div>
        <div class="stat-label">Fulfilled syncs</div>
        <div class="stat-value">${snapshot.stats.fulfilledOrders}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-top">
          <span class="icon-wrap">${iconSvg("pending")}</span>
          <span class="badge ${statusClass("pending")}">Active</span>
        </div>
        <div class="stat-label">Pending syncs</div>
        <div class="stat-value">${snapshot.stats.pendingOrders}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-top">
          <span class="icon-wrap">${iconSvg("alert")}</span>
          <span class="badge ${statusClass("failed")}">Needs review</span>
        </div>
        <div class="stat-label">Failed syncs</div>
        <div class="stat-value">${snapshot.stats.failedOrders}</div>
      </div>
    </section>

    <section class="grid">
      <div class="card">
        <div class="panel-header">
          <div>
            <h3>Recent sync attempts</h3>
            <p>Latest order processing activity across connected stores.</p>
          </div>
          <a class="button" href="/logs">View all</a>
        </div>
        <div class="panel-body">
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Order</th>
                <th>Status</th>
                <th>Tracking</th>
              </tr>
            </thead>
            <tbody>
              ${
                snapshot.recentSyncs.length
                  ? snapshot.recentSyncs
                      .map(
                        (sync) => `<tr>
                          <td>${sync.shop.domain}</td>
                          <td>#${sync.shoplineOrderNumber ?? sync.shoplineOrderId}</td>
                          <td><span class="badge ${statusClass(sync.status)}">${sync.status}</span></td>
                          <td>${sync.spxTrackingNumber ?? '<span class="muted">Not available</span>'}</td>
                        </tr>`
                      )
                      .join("")
                  : `<tr><td colspan="4"><span class="muted">No sync records yet. Install the app and place a test order to populate this table.</span></td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="panel-header">
          <div>
            <h3>Recent webhook deliveries</h3>
            <p>Incoming Shopline webhooks captured by the app.</p>
          </div>
          <span class="badge ${statusClass("created")}"><span class="inline-icon">${iconSvg("webhook")}</span>Live intake</span>
        </div>
        <div class="panel-body list">
          ${
            snapshot.recentDeliveries.length
              ? snapshot.recentDeliveries
                  .map(
                    (delivery) => `<div class="list-item">
                      <h4>${delivery.topic}</h4>
                      <p>${delivery.shop.domain}</p>
                      <div class="meta">
                        <span class="meta-icon">${iconSvg("pending")}</span>
                        <span>${new Date(delivery.createdAt).toLocaleString()}</span>
                      </div>
                    </div>`
                  )
                  .join("")
              : `<div class="list-item"><h4>No webhook deliveries yet</h4><p>Once Shopline starts sending orders or uninstall events, they will appear here.</p></div>`
          }
        </div>
      </div>
    </section>

    <section class="card">
      <div class="panel-header">
        <div>
          <h3>Connected stores</h3>
          <p>Latest installations captured by the OAuth callback flow.</p>
        </div>
      </div>
      <div class="panel-body">
        <table>
          <thead>
            <tr>
              <th>Store domain</th>
              <th>Shopline ID</th>
              <th>Status</th>
              <th>Installed</th>
            </tr>
          </thead>
          <tbody>
            ${
              snapshot.shops.length
                ? snapshot.shops
                    .map(
                      (shop) => `<tr>
                        <td>${shop.domain}</td>
                        <td>${shop.shoplineShopId}</td>
                        <td><span class="badge ${statusClass(shop.uninstalledAt ? "failed" : "fulfilled")}">${shop.uninstalledAt ? "uninstalled" : "active"}</span></td>
                        <td>${new Date(shop.installedAt).toLocaleString()}</td>
                      </tr>`
                    )
                    .join("")
                : `<tr><td colspan="4"><span class="muted">No stores installed yet. Use the Shopline install URL to add your first store.</span></td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;

  return pageTemplate({
    title: "SPX Connector Dashboard",
    activePath: "/",
    body
  });
};

const settingsPage = () => {
  const fields = [
    { label: "App URL", value: env.APP_URL, icon: "link" },
    { label: "Callback URL", value: env.SHOPLINE_REDIRECT_URI, icon: "link" },
    { label: "Shopline scopes", value: env.SHOPLINE_APP_SCOPES, icon: "settings" },
    { label: "Shopline API base", value: env.SHOPLINE_API_BASE_URL, icon: "link" },
    { label: "Accounts base", value: env.SHOPLINE_ACCOUNTS_BASE_URL, icon: "link" },
    { label: "SPX API base", value: env.SPX_API_BASE_URL, icon: "link" },
    {
      label: "SPX credentials",
      value:
        env.SPX_CLIENT_ID === "dummy"
          ? "Placeholder credentials detected. Replace before enabling real order sync."
          : "SPX credentials configured.",
      icon: env.SPX_CLIENT_ID === "dummy" ? "alert" : "success"
    },
    {
      label: "Webhook signing",
      value: "Shopline webhook secret is configured and enforced on incoming requests.",
      icon: "webhook"
    }
  ];

  const body = `
    <div class="topbar">
      <div>
        <h2>Settings</h2>
        <p>Review the current deployment configuration used by the app and worker.</p>
      </div>
      <div class="actions">
        <a class="button" href="/health">Health endpoint</a>
      </div>
    </div>

    <section class="hero">
      <div>
        <h3>Deployment configuration overview</h3>
        <p>This page is read-only. Keep secrets in Render environment variables and use this view to confirm the public URLs and integration state.</p>
      </div>
      <div class="hero-mark">${iconSvg("settings")}</div>
    </section>

    <section class="settings-grid">
      ${fields
        .map(
          (field) => `<div class="card field">
            <div class="field-label">${field.label}</div>
            <div class="field-value">
              <span class="inline-icon" style="margin-right:8px;color:#2563eb;">${iconSvg(field.icon)}</span>
              ${field.value}
            </div>
          </div>`
        )
        .join("")}
    </section>
  `;

  return pageTemplate({
    title: "SPX Connector Settings",
    activePath: "/settings",
    body
  });
};

const logsPage = async () => {
  const logs = await dashboardService.getSyncLogSnapshot();

  const body = `
    <div class="topbar">
      <div>
        <h2>Sync Logs</h2>
        <p>Recent Shopline to SPX order sync results with status and error visibility.</p>
      </div>
      <div class="actions">
        <a class="button" href="/">Back to dashboard</a>
      </div>
    </div>

    <section class="card">
      <div class="panel-header">
        <div>
          <h3>Order sync history</h3>
          <p>Use this page to inspect failed, pending, and fulfilled sync attempts.</p>
        </div>
      </div>
      <div class="panel-body">
        <table>
          <thead>
            <tr>
              <th>Updated</th>
              <th>Store</th>
              <th>Order</th>
              <th>Status</th>
              <th>SPX ref</th>
              <th>Tracking</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            ${
              logs.length
                ? logs
                    .map(
                      (log) => `<tr>
                        <td>${new Date(log.updatedAt).toLocaleString()}</td>
                        <td>${log.shop.domain}</td>
                        <td>#${log.shoplineOrderNumber ?? log.shoplineOrderId}</td>
                        <td><span class="badge ${statusClass(log.status)}">${log.status}</span></td>
                        <td>${log.spxOrderReference ?? '<span class="muted">—</span>'}</td>
                        <td>${log.spxTrackingNumber ?? '<span class="muted">—</span>'}</td>
                        <td>${log.lastError ?? '<span class="muted">None</span>'}</td>
                      </tr>`
                    )
                    .join("")
                : `<tr><td colspan="7"><span class="muted">No logs yet. When orders are received, their sync records will show up here.</span></td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;

  return pageTemplate({
    title: "SPX Connector Sync Logs",
    activePath: "/logs",
    body
  });
};

export const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.type("html").send(await dashboardPage());
  })
);

dashboardRouter.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    res.type("html").send(settingsPage());
  })
);

dashboardRouter.get(
  "/logs",
  asyncHandler(async (_req, res) => {
    res.type("html").send(await logsPage());
  })
);
