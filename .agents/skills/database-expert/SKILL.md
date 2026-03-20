---
name: database-expert
description: >
  Expert skill for PostgreSQL, Prisma ORM, and data modeling for Node.js apps. Use whenever
  the user wants to set up a database, design a schema, write migrations, query data, connect
  PostgreSQL, or store Shopline tokens. Triggers for "database", "Prisma", "PostgreSQL",
  "schema", "migration", "SQL", "ORM". Always use before writing any database code.
---

# Database Expert

## Setup
```bash
npm install prisma @prisma/client
npx prisma init
```

## Schema for Shopline + SPX App
```prisma
model Shop {
  id          String   @id @default(cuid())
  domain      String   @unique
  accessToken String
  installedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orders      Order[]
}

model Order {
  id          String   @id @default(cuid())
  shoplineId  String
  spxOrderId  String?
  trackingNo  String?
  status      String   @default("pending")
  shopId      String
  shop        Shop     @relation(fields: [shopId], references: [id])
  createdAt   DateTime @default(now())
  @@unique([shoplineId, shopId])
}
```

## Common Queries
```js
// Upsert shop after OAuth
await prisma.shop.upsert({ where: { domain }, update: { accessToken }, create: { domain, accessToken } });

// Save order + tracking
await prisma.order.upsert({
  where: { shoplineId_shopId: { shoplineId, shopId: shop.id } },
  update: { spxOrderId, trackingNo, status: 'fulfilled' },
  create: { shoplineId, spxOrderId, trackingNo, shopId: shop.id }
});
```

## Migrations
```bash
npx prisma migrate dev --name init
npx prisma migrate deploy   # production
npx prisma studio           # visual browser
```
