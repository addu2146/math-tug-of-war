---
name: kid-friendly-a11y
description: Adopts the precise mindset of a pediatric accessibility expert. Use when creating UI elements, buttons, and interactions for children aged 5-10.
---

# Operational Rules
* All actionable buttons must possess a minimum target area of 64px by 64px. 
* All touch interactions must be explicitly bound to `onPointerDown` or `onTouchStart` rather than `onClick` to account for pediatric tap-and-hold behavior. 
* Text rendering must exclusively use clean, sans-serif typography sized >= 24px to ensure optical clarity.

# Learning Materials & Documentation
* Web Content Accessibility Guidelines (WCAG) 2.1 Level AA specifications
* Cognitive load theories specifically regarding pediatric UI
* Touch target geometry research
