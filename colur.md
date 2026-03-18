
📄 design-system.md
# SmartSwarm AlertIQ – Design System (Color + UI Schema)

## 1. Overview

This document defines the complete design system for the AlertIQ dashboard, including:

- Color schema
- UI structure
- Component styling rules
- Usage guidelines

The system follows a **dark, minimal, high-contrast design** optimized for operational clarity.

---

## 2. Design Principles

- Clarity over complexity
- Data-first UI
- Progressive disclosure
- Consistent visual hierarchy
- Color = meaning (not decoration)

---

# 🎨 3. Color System

## 3.1 Background Colors

### Primary Background (App Base)
```css
--bg-primary: #0F172A;
Secondary Background (Panels)
--bg-secondary: #111827;
Card Background
--bg-card: #1E293B;
________________________________________
3.2 Text Colors
--text-primary: #F9FAFB;
--text-secondary: #9CA3AF;
--text-muted: #6B7280;
________________________________________
3.3 Status Colors
Critical (Root Cause / P1)
--color-critical: #EF4444;
High Impact (P2)
--color-high: #F97316;
Medium (P3 / Warning)
--color-medium: #F59E0B;
Healthy
--color-healthy: #22C55E;
________________________________________
3.4 Accent Color
--color-accent: #3B82F6;
Used for:
•	Buttons
•	Active tabs
•	Interactive highlights
________________________________________
3.5 Borders & Dividers
--border-color: #374151;
________________________________________
3.6 Interaction States
--hover-bg: #1F2937;
--hover-glow: rgba(59, 130, 246, 0.2);
________________________________________
🧱 4. Layout Schema
4.1 Global Layout
[ Sidebar Navigation ] [ Main Content Area ]
________________________________________
4.2 Sidebar
•	Dark background
•	Minimal icons + labels
•	Active item → accent color highlight
________________________________________
4.3 Main Content
•	Uses card-based layout
•	Spacing between sections: 16–24px
•	Grid-based structure
________________________________________
🧩 5. Component Schema
________________________________________
5.1 Cards
•	Background: --bg-card
•	Border radius: 12–16px
•	Padding: 16–24px
•	Shadow: subtle
________________________________________
5.2 Incident Cards
Show:
•	Incident name
•	Severity
•	Alert count
Visual:
•	Left border color based on severity
•	Hover → slight scale + glow
________________________________________
5.3 Root Cause Panel
•	High emphasis component
•	Use red highlight (--color-critical)
•	Show:
o	Cause
o	Confidence %
________________________________________
5.4 Timeline
•	Vertical list or step line
•	Event types:
o	Alert
o	Change
o	Anomaly
Use color-coded indicators
________________________________________
5.5 Topology Nodes
•	Shape: rounded rectangles or circles
•	Colors:
o	Root → red
o	Impacted → orange
o	Healthy → green
Edges:
•	Thin, subtle lines
________________________________________
5.6 Chat Interface
•	AI messages → left
•	User messages → right
•	Input → sticky bottom bar
________________________________________
⚡ 6. Interaction & Animation
6.1 Hover Effects
•	Scale: 1.02
•	Glow: accent color
________________________________________
6.2 Transitions
•	Duration: 150–300ms
•	Smooth easing
________________________________________
6.3 Loading States
•	Skeleton loaders
•	Shimmer effect
________________________________________
6.4 Data Updates
•	Fade-in for new content
•	Number animation for metrics
________________________________________
📊 7. Visual Hierarchy
Priority order:
1.	Incident Header
2.	Root Cause
3.	Timeline
4.	Impact (Blast Radius / Topology)
5.	Secondary Insights
________________________________________
🧠 8. Usage Guidelines
Do
•	Use color to indicate status
•	Keep layout clean and spaced
•	Highlight only important data
•	Use consistent card patterns
________________________________________
Don’t
•	Don’t overload screen with cards
•	Don’t use bright colors randomly
•	Don’t mix light and dark themes
•	Don’t duplicate information
________________________________________
🔗 9. Module Color Mapping
Executive Dashboard
•	Cards → neutral
•	Critical metrics → red
________________________________________
Investigative Workspace
•	Root cause → red highlight
•	Timeline → mixed status colors
________________________________________
Topology Map
•	Root node → red
•	Impact → orange
•	Healthy → green
________________________________________
Conversational Triage
•	Background → secondary dark
•	Actions → accent blue
________________________________________
🎯 10. Final Principle
The UI should feel:
Calm, intelligent, and focused
Not noisy or cluttered.

