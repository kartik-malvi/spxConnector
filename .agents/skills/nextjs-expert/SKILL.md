---
name: nextjs-expert
description: >
  Expert skill for building Next.js apps with App Router, server components, and API routes.
  Use whenever the user wants to build with Next.js, create pages, use server/client components,
  set up API routes, or configure Next.js for Shopline. Triggers for "Next.js", "App Router",
  "server component", "use client", "API route", "next.config".
---

# Next.js Expert

## Structure
```
src/app/
├── layout.tsx         page.tsx
├── api/products/route.ts
├── api/webhooks/route.ts
└── dashboard/page.tsx
```

## Server vs Client
```tsx
// SERVER (default) — DB access, secrets OK
export default async function Page() {
  const data = await prisma.order.findMany();
  return <List data={data} />;
}

// CLIENT — useState, onClick, browser APIs
"use client";
export default function Button() {
  const [loading, setLoading] = useState(false);
  return <button onClick={() => setLoading(true)}>Click</button>;
}
```

## API Route
```ts
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop');
  const data = await prisma.order.findMany({ where: { shop: { domain: shop } } });
  return NextResponse.json({ data });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(body, { status: 201 });
}
```

## next.config.js for Shopline Embedded App
```js
const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: [{ key: 'Content-Security-Policy', value: "frame-ancestors https://*.myshopline.com" }] }];
  },
  images: { domains: ['cdn.myshopline.com'] }
};
export default nextConfig;
```
