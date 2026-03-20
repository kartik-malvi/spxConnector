---
name: frontend-ui-expert
description: >
  Expert frontend UI developer skill for building polished, production-grade interfaces.
  Use this skill whenever the user wants to build UI components, pages, layouts, dashboards,
  or any web interface. Triggers for React, Next.js, Tailwind CSS, components, responsive
  design, accessibility. Always use before writing any frontend code.
---

# Frontend UI Expert

## Stack: React + Tailwind CSS + Lucide React

## Buttons
```jsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Primary</button>
<button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm">Secondary</button>
<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Danger</button>
```

## Form Input
```jsx
<div className="space-y-1.5">
  <label className="block text-sm font-medium text-gray-700">Label</label>
  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  <p className="text-xs text-gray-500">Helper text</p>
</div>
```

## Empty State
```jsx
<div className="text-center py-16">
  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <Icon className="w-6 h-6 text-gray-400" />
  </div>
  <h3 className="text-base font-semibold text-gray-900 mb-1">No items yet</h3>
  <p className="text-sm text-gray-500 mb-6">Get started by creating your first item.</p>
  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Create</button>
</div>
```

## Checklist
- [ ] Mobile (375px) and desktop (1280px) tested
- [ ] Loading, empty, error states handled
- [ ] Hover/focus states on all interactive elements
