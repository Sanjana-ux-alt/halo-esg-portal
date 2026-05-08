# HALO ESG Module — Product Requirements Document

**Product:** HALO (Stride Ventures internal platform)
**Module:** ESG Assessment & Reporting
**Owner:** ESG Team · Stride Ventures
**Status:** Draft v1.0
**Last updated:** May 5, 2026

---

## 1. Overview

We are building an **ESG assessment dashboard module inside HALO**, Stride Ventures' internal investment operating platform. Today, ESG diligence is run through a mix of Excel templates, email threads, and PDF reports — opaque to deal teams and painful for founders to fill out.

The HALO ESG module replaces that workflow end-to-end. It lets a founder complete a structured ESG survey in a single guided interface, lets the Stride ESG team score and review responses with full audit history, and produces an investment-committee-ready report — all on the Stride brand, all in one tool.

This document covers the requirements for the **four core screens** of the module:

1. **Deal Team Dashboard** (Stride-internal pipeline overview)
2. **Survey** (founder-facing intake form)
3. **Review** (ESG-team scoring & approval)
4. **Report** (final IC-grade ESG report)

---

## 2. Goals & Non-Goals

### 2.1 Goals
- Reduce founder time-to-complete an ESG survey from ~5 days to **under 90 minutes**.
- Give the ESG team a **single queue** with clear ownership and SLA visibility.
- Produce a **consistent, branded report** ready for Investment Committee within minutes of approval.
- Surface **portfolio-level ESG benchmarking** so deal partners can compare against peers and sector medians.
- Build everything on the **Stride Ventures brand system** — Figtree sans, Nunito display, the navy / periwinkle / orange / plum palette.

### 2.2 Non-Goals (this release)
- No founder onboarding flow / account self-signup (Stride invites by email link).
- No real-time multiplayer editing inside one survey.
- No carbon accounting calculation engine — Scope data captured but not modelled.
- No external regulator submissions (BRSR, etc.) — export-only.

---

## 3. Personas

| Persona | Goal in HALO ESG |
|---|---|
| **Krishti — Head of ESG** | Triage queue, score responses, approve/reject, export reports |
| **Akshat — Deal Partner** | Trigger surveys, monitor pipeline status, read final reports |
| **Vikram — Founder / Sustainability Lead** (external) | Complete survey accurately with minimum back-and-forth |
| **Risk Committee member** | Read PDF reports for IC sign-off |

---

## 4. Core Screens — Functional Requirements

### 4.1 Deal Team Dashboard

**Purpose:** Krishti's morning landing page. Triage the queue, see pipeline health, jump to any open assessment in one click.

**Must-have features**
- **Greeting header** with date, name, and a one-line summary ("3 assessments need your attention today").
- **Four KPI cards**: Active Assessments, Pending Reviews, Pass Rate, Avg ESG Score — each with delta vs. last period and an inline sparkline.
- **Three quick-action tiles** (gradient): Send New Survey, Review Pending Queue, Generate IC Report.
- **Filter chip row** for status (All, Drafts, Submitted, In Review, Approved) with counts; secondary filters for Sector, Category (L1/L2/L3), Sort order.
- **Pipeline table** with one row per portfolio company:
  - Logo monogram + name + deal stage
  - Sector, Category badge (L1/L2/L3 in brand colors), Status pill
  - ESG score with mini E/S/G distribution bar
  - Submitted date, Days-in-review (color-coded by SLA), Owner avatar
  - Row click opens a **company detail drawer** (right-side, 460px) with score breakdown, recent activity, and "Open in Review" / "View Report" buttons.
- **Right rail**: Inbox preview (4 latest items), Pipeline-by-Sector horizontal bar chart.
- **⌘K command palette** for keyboard navigation across screens, companies, and quick actions.
- **Top utility bar**: breadcrumbs, global search, notification bell with unread pulse, user avatar.

---

### 4.2 Survey (Founder-facing)

**Purpose:** Single, guided intake form. Replaces the 60-question Excel template.

**Must-have features**
- **Sticky top progress bar** with section title eyebrow, gradient progress fill, "{n} of {total} questions complete · ~{minutes} min remaining", auto-save indicator ("Saved 2 sec ago"), and Save-&-exit link.
- **Three-column layout**: 240px section nav · fluid question column · 280px contextual help sidebar.
- **Section nav** (left): 9 sections with status markers (✓ done, ● current, ○ todo); current is a white card; click to switch.
- **9 sections** covering: Company Info, Water Management, Energy & Emissions, **Workforce & Diversity**, Health & Safety, Community & CSR, Governance & Compliance, Supply Chain, Sector-Specific.
- **7 question input types**, all stateful and accessible:
  1. Numeric input with unit suffix
  2. Custom slider (drag-to-set, blue→orange gradient fill, mono value readout)
  3. Multi-select cards (2-column grid, toggleable, blue border + filled checkbox when selected)
  4. Yes/No tile pair
  5. Matrix table (rows × labelled cells, mono numeric values)
  6. Single-select radio cards
  7. File upload zone (drag-drop, PDF/DOCX/XLSX up to 10MB)
- Each question card: numbered circle on the outside-left edge, required-asterisk in orange, optional helper text, "Why we ask" inline button.
- **Help sidebar** (sticky right): "Why we're asking" + "Example response" quote block + "Ask Krishti's team" CTA.
- **Bottom action bar** (sticky): Previous-section ghost button, "Last edited" caption, Save draft + Continue-to-next-section primary CTA.
- **Auto-save** every 10 seconds; offline-tolerant.

---

### 4.3 Review (ESG-team scoring)

**Purpose:** Krishti reviews each submitted response, assigns scores, flags concerns, and signs off.

**Must-have features**
- **Header card** with company logo, legal name, Category badge, sector, fund, submission meta, status pill.
- **Live score widget** (gradient navy panel): cumulative score out of 100, three pillar mini-bars, verdict pill (PASS / REVIEW / FAIL), L1 threshold callout.
- **Action buttons**: Save progress, Request revision (orange outline), Approve & notify (accent CTA).
- **Tab strip**: All Responses · By Section · Concerns Only (with count badge) · Comparison View.
- **Q&A list**: per-question card showing question, founder's answer (with periwinkle left border, or orange if flagged), score input (X / max), Flag toggle, Rubric link, Comment.
- **Right scoring rail (sticky)**:
  - Cumulative score ring + verdict
  - E/S/G breakdown with progress + "X of Y scored" per pillar
  - Peer benchmarking (this co. vs. sector avg vs. portfolio avg vs. top quartile) with delta callout
  - Areas of Concern (severity-coded list)
  - Activity feed (who did what, when)

---

### 4.4 Report (Final IC document)

**Purpose:** Investment-committee-ready PDF, generated from approved scores.

**Must-have features**
- **Sticky preview toolbar**: version, page count, Print / Share / Download PDF.
- **Hero block**: Stride logo, report ID (e.g. `ESG-2026-0428-TAP`), generation date, company logo monogram + display name + legal description; orange bottom border accent.
- **Executive summary**: large green "PASS" verdict block + 6-stat grid (Submitted / Reviewed by / Duration / Confidence / Deal SPOC / Stage) + a one-paragraph narrative summary.
- **Score Breakdown section**: 3 pillar tiles (E / S / G) each with score, max, mini-ring, headline note; followed by a stacked horizontal bar showing E + S + G against the L1 threshold marker.
- **Detailed Performance**: 8-axis radar chart (Energy, Water, Waste, Diversity, Safety, Governance, Community, Supply) with company polygon vs. dashed sector benchmark; alongside a green "Top Strengths" panel and orange "Priority Improvements" panel.
- **Peer Benchmarking table**: 6 sector peers, current company highlighted.
- **Strategic Recommendations**: 3 prioritized actions with priority pill, body, expected score impact, timeline.
- **Approval & Sign-off**: 3 signoff cards (Reviewed by / Approved by / Acknowledged by) with role, name, status, signed-date.
- **Footer**: confidentiality notice, page count, version stamp.

---

## 5. Cross-cutting Requirements

### 5.1 Design system
- **Type**: Figtree (sans) for UI; Nunito (display) for hero numbers and section titles; JetBrains Mono with `tabular-nums` for all numeric values.
- **Color**: Stride palette only — primary blue `#292F80`, deep navy `#14234B`, periwinkle `#ADAFD8`, orange `#F07222`, plum `#7B1D5C`, success `#2E7D5B`, warn `#C8821A`, error `#B3261E`. No invented hues.
- **Spacing & radii**: 4 / 8 / 12 / 16 / 24 / 32 / 48 px scale; 8 / 12 / 16 / 24 px radii; pill = 999.
- **Shadows**: navy-tinted `rgba(20,35,75,0.06–0.14)` only.
- **Iconography**: 1.75-stroke line icons in a single inline SVG library; no emoji.

### 5.2 Navigation shell
- 240px dark-navy sidebar with brand mark, Workspace nav (Pipeline / Reviews / Surveys / Reports), Insights group (Benchmarks / Rubric / Portfolio), user card pinned bottom.
- 60px white topbar with breadcrumbs, global search (⌘K), bell with pulse, info button, user avatar.
- All four screens reachable in one click; ⌘K palette navigates to any screen, company, or action.

### 5.3 Tweaks panel (internal demo controls)
A floating, dismissable panel exposing:
- Accent color override
- Dark / light sidebar toggle
- Quick-action tiles on/off
- Direct-jump buttons to each screen and the company drawer

### 5.4 States & micro-interactions
- All filter chips, tabs, sliders, checkboxes, drawers, palette are interactive.
- Hover lifts on KPI cards (translateY(-2px) + shadow-2).
- Entry animations: 240ms fade for screen swaps; 200ms slide for drawers and ⌘K.
- Number tickers, ring charts, sparklines computed inline (no chart library).

### 5.5 Data model (mock)
- 12 portfolio companies across Consumer / SaaS / Healthtech / Fintech / Agritech / Mobility, with realistic Indian-startup names and ₹ formatting.
- 9 survey sections with progress states; 6 fully-built questions in Workforce & Diversity for demo depth.
- Activity log, notification inbox, and risk-flag list seeded with realistic copy.

### 5.6 Accessibility
- WCAG AA contrast across all text.
- Visible focus rings (`box-shadow: 0 0 0 3px rgba(41,47,128,0.28)`).
- Full keyboard navigation (Tab through every interactive element; Esc closes drawers and palette; ⌘K opens search).

### 5.7 Tech constraints
- React 18 + Babel via CDN, multi-file with shared `window.SV_DATA` data layer.
- Pinned dependency versions with integrity hashes.
- No Tailwind, no UI kit — vanilla CSS using Stride tokens (`--sv-*` custom properties from `colors_and_type.css`).
- Single HTML entry point that mounts the entire SPA.

---

## 6. Out of Scope (for v1)
- Founder account management / SSO
- Multi-language survey
- Mobile-responsive layout below 1280px (desktop-first)
- Real PDF rendering pipeline (the report is HTML-only; print-to-PDF works but no server export)
- Webhook / API integrations with portfolio HR or accounting systems

---

## 7. Acceptance Criteria

A build is acceptance-ready when:
- All four screens are reachable from the sidebar and ⌘K.
- Every filter chip, tab, slider, checkbox, yes/no, drawer, and palette item is interactive.
- The Workforce & Diversity section of the survey shows all 7 input types and they all respond to user input.
- The Review screen's score ring, E/S/G bars, and peer benchmarking all render with seeded data.
- The Report's hero, exec summary, score tiles, radar, peer table, recommendations, and sign-off cards all render with no console errors.
- Tweaks panel can change accent color and sidebar theme live.
- Zero usage of fonts, colors, or spacing values outside the Stride design tokens.
