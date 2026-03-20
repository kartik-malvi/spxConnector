---
name: shopline-design-system
description: >
  Expert skill for building UIs that match the Shopline merchant dashboard design system.
  Use this skill whenever the user wants their app UI to look like Shopline admin dashboard,
  use Shopline colors/typography/components, build an embedded app inside Shopline admin,
  or create any merchant-facing UI. Triggers for "match Shopline UI", "Shopline dashboard style",
  "embedded app UI", "Shopline design", "make it look native".
---

# Shopline Design System

## Colors
```
Primary:  #2563EB (blue)   Light: #EFF6FF
BG:       #F9FAFB (gray-50)
Borders:  #E5E7EB (gray-200)
Text:     #111827 (gray-900)  Secondary: #4B5563 (gray-600)
Success:  #16A34A   Warning: #D97706   Error: #DC2626
```

## Page Layout
```jsx
<div className="min-h-screen bg-gray-50">
  <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
    <h1 className="text-xl font-semibold text-gray-900">Title</h1>
    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Action</button>
  </header>
  <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">{/* content */}</main>
</div>
```

## Card
```jsx
<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
  <div className="px-6 py-4 border-b border-gray-200">
    <h2 className="text-base font-semibold text-gray-900">Title</h2>
  </div>
  <div className="px-6 py-5">{/* content */}</div>
  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
  </div>
</div>
```

## Status Badge
```jsx
const badges = { active:'bg-green-50 text-green-700 border-green-200', pending:'bg-yellow-50 text-yellow-700 border-yellow-200', error:'bg-red-50 text-red-700 border-red-200', inactive:'bg-gray-100 text-gray-600 border-gray-200' };
<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[status]}`}>{status}</span>
```

## Rules
- White cards on gray-50 background
- Always border border-gray-200 on cards
- Page max-width: max-w-6xl mx-auto
- Table headers: uppercase text-xs text-gray-500
- Never dark mode, never gradients, never rounded-full on cards
