# Design System Document: The Clinical Sanctuary

## 1. Overview & Creative North Star: "The Clinical Sanctuary"
The "Clinical Sanctuary" is the Creative North Star for this design system. In the high-stakes world of healthcare and patient tracking, we reject the cluttered, anxiety-inducing layouts of legacy medical software. Instead, we embrace a "High-End Editorial" approach. 

This system breaks the "template" look through **Intentional Asymmetry** and **Tonal Depth**. We treat the interface not as a flat screen, but as a series of sophisticated, layered surfaces. By utilizing breathing room (whitespace) as a functional element rather than a void, we convey professional authority and calm. This is where medical precision meets boutique hospitality.

---

## 2. Colors: Tonal Architecture
We move beyond "blue boxes." Our palette is designed to create a sense of sterilized warmth and unwavering trust.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders (`#000` or high-contrast grays) for sectioning. 
- Boundaries must be defined solely through background color shifts.
- Example: Use a `surface-container-low` (#f2f4f6) section sitting on a `surface` (#f7f9fb) background to define a sidebar or header.

### Surface Hierarchy & Nesting
Treat the UI as physical layers. Use the surface-container tiers to create "nested" depth:
- **Level 0 (Base):** `surface` (#f7f9fb)
- **Level 1 (Sections):** `surface-container-low` (#f2f4f6)
- **Level 2 (Cards):** `surface-container-lowest` (#ffffff) for high-focus data points.
- **Level 3 (Pop-overs):** `surface-container-high` (#e6e8ea).

### The "Glass & Gradient" Rule
To escape the "Standard SaaS" look, use Glassmorphism for floating navigation or critical alerts:
- **Floating Header:** Use `surface` at 80% opacity with a `backdrop-blur: 20px`.
- **Signature Textures:** For primary CTAs or high-level health stats, use a subtle linear gradient from `primary` (#00458d) to `primary_container` (#005cb9) at a 135-degree angle. This adds "soul" and depth.

---

## 3. Typography: Authoritative Clarity
We utilize **Inter** to bridge the gap between technical legibility and modern elegance.

*   **Display (Display-LG to SM):** Reserved for high-level dashboard summaries (e.g., "Total Patients: 1,240"). Use these sparingly to create an editorial "magazine" feel.
*   **Headline (Headline-LG to SM):** Used for page titles and major section headers. These provide the "anchor" for the user's eye.
*   **Title (Title-LG to SM):** Used for card titles and patient names. 
*   **Body (Body-LG to SM):** Optimized for long-form medical notes. Ensure a line height of at least 1.5x for readability.
*   **Labels (Label-MD to SM):** Used for metadata, timestamps, and micro-copy. Always use `on_surface_variant` (#424752) to ensure a clear hierarchy against body text.

---

## 4. Elevation & Depth: The Layering Principle
Forget traditional drop shadows. We achieve hierarchy through **Tonal Layering**.

*   **Natural Lift:** Place a `surface-container-lowest` card on a `surface-container-low` background. The subtle shift from `#f2f4f6` to `#ffffff` creates a soft, natural lift without the "dirty" look of heavy shadows.
*   **Ambient Shadows:** If an element must float (e.g., a modal), use a "Cloud Shadow": `box-shadow: 0 20px 40px rgba(25, 28, 30, 0.06)`. Note the use of `on_surface` color at 6% opacity rather than pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in input fields, use `outline_variant` (#c2c6d4) at 20% opacity. **Never use 100% opacity for structural lines.**

---

## 5. Components: The Building Blocks

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary_container`), `DEFAULT` (0.5rem) roundedness.
- **Secondary:** `secondary_container` background with `on_secondary_container` text. No border.
- **Tertiary:** Pure text using `primary` color, used for low-priority actions like "Cancel."

### Input Fields
- **Container:** `surface_container_lowest` (#ffffff).
- **Styling:** No bottom line. Use a "Ghost Border" (20% opacity `outline_variant`). 
- **Focus:** Transition the ghost border to 100% `primary` with a 2px outer glow of `primary_fixed` at 30% opacity.

### Cards & Patient Profiles
- **Rule:** **Strictly forbid divider lines.** 
- **Separation:** Use vertical white space (Spacing `6` - 1.5rem) or a subtle background shift to `surface_container_low` for the card header.
- **Corner Radius:** Use `lg` (1rem) for large dashboard cards to maintain the "Soft Minimalism" aesthetic.

### Data Visualization (The "Net" Elements)
- **Vital Signs:** Use `primary` for stable data, `tertiary` (#793000) for "caution/attention," and `error` (#ba1a1a) for critical alerts.
- **Backgrounds:** Graphs should sit on `surface_container_lowest` with `outline_variant` (10% opacity) grid lines.

### Specialized Component: The Patient "Timeline Ribbon"
Instead of a list, use a vertical "ribbon" using `surface_container_high` as the track, with `primary` nodes. This creates a clear chronological flow for patient history.

---

## 6. Do's and Don'ts

### Do:
- **DO** use asymmetry. A wide column for patient vitals next to a narrow column for metadata creates a premium, intentional look.
- **DO** use `surface_container_lowest` for any area where the user must input or read critical data.
- **DO** utilize the `Spacing 12` (3rem) for top-level page margins to ensure the interface "breathes."

### Don't:
- **DON'T** use 1px dividers to separate list items. Use a 4px `0.25rem` gap and a subtle hover state shift to `surface_container_low`.
- **DON'T** use pure black (#000000) for text. Always use `on_surface` (#191c1e) to keep the contrast high but the "vibe" soft.
- **DON'T** use "Alert Red" for everything. Use `tertiary` for warnings that are not life-threatening to avoid "alarm fatigue."

---
*Director's Final Note: Every pixel must feel like it was placed by a human, not a framework. If the layout feels too symmetrical or "grid-locked," break it with a floating action or an oversized display-sm statistic.*