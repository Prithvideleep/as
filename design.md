# SmartSwarm AlertIQ – Design System & UI Guidelines

## 1. Design Philosophy

The UI must follow:

- Clarity over complexity
- Focus over information overload
- Progressive disclosure
- Dark theme with high contrast

Goal:
Enable users to understand incidents within seconds.

---

## 2. Color System (Based on Provided Design)

### Primary Background
- Deep dark blue / black

### Secondary Background
- Slightly lighter panels/cards

### Accent Colors

- Red → Critical / Root Cause
- Orange → High impact
- Yellow → Medium / warning
- Green → Healthy

### Text Colors

- Primary → White
- Secondary → Light gray
- Muted → Dim gray

---

## 3. Layout Structure

### Global Layout

[ Sidebar ] [ Main Content Area ]

Sidebar:
- Navigation tabs

Main Content:
- Dynamic modules

---

### Card Layout

Each section uses cards:

- Rounded corners (12px–16px)
- Soft shadow
- Slight elevation
- Padding: 16–24px

---

## 4. Typography

- Headings → Bold, large
- Body → Medium weight
- Labels → Small, muted

Hierarchy:
- Title
- Section header
- Content
- Metadata

---

## 5. Component Design

---

### 5.1 Incident Cards

- Highlight severity with color strip
- Show:
  - name
  - severity
  - alert count

Hover:
- Slight scale (1.02)
- Glow border

---

### 5.2 Root Cause Panel

- Prominent placement
- Highlight with subtle glow
- Show confidence %

---

### 5.3 Timeline

- Vertical or horizontal line
- Nodes:
  - Alert
  - Change
  - Anomaly

Icons differentiate types

---

### 5.4 Topology Graph

- Nodes:
  - Circular or rounded rectangles
- Edges:
  - Thin lines

Color coding:
- Red → root
- Orange → impacted
- Green → healthy

---

### 5.5 Chat Interface

- Left: AI responses
- Right: user messages

Input:
- Sticky bottom bar

---

## 6. Animations

### General Rules
- Smooth, subtle, fast (150–300ms)

---

### Interactions

#### Hover
- Slight scale
- Glow

#### Click
- Ripple or highlight

---

### Loading

- Skeleton loaders
- Shimmer effect

---

### Transitions

- Fade-in for new data
- Slide for panel updates

---

## 7. Microinteractions

- Status badges update live
- Numbers animate on change
- Alerts pulse when critical

---

## 8. Responsiveness

- Desktop-first
- Tablet support
- Minimal mobile support (optional)

---

## 9. Accessibility

- High contrast
- Clear color meaning (not color only)
- Readable fonts

---

## 10. UX Guidelines

- Avoid clutter
- Show only key info first
- Allow expansion for details

---

## 11. Visual Hierarchy

Priority order:

1. Incident header
2. Root cause
3. Timeline
4. Impact
5. Secondary data

---

## 12. Final Principle

The UI should feel like:

“Calm, intelligent, and in control”

Not noisy or overwhelming.