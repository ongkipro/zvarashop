---
name: zvarashop-storefront
description: Product neutrals with one brand orange, darkened until it passes AA
theme: { default: light, dark: out-of-scope,
         white-temperature: neutral,
         why: "The neutrals are the product's own. This store overrides the
               accent and nothing else, which is what ADR-019 as amended makes
               the re-brand surface." }
colors:
  accent:        "#C93A1B"                 # --sf-accent        5.12:1 on white, 5.12:1 under white
  accent-strong: "#A32E12"                 # --sf-accent-strong 7.10:1 — hover, pressed
  accent-soft:   "#FDF0EC"                 # --sf-accent-soft   ink #111111 on it is 16.95:1
  accent-ring:   "rgba(201, 58, 27, 0.28)" # --sf-accent-ring   focus ring, derived from accent
---

## Rationale

This store does not re-theme the product. It overrides four of the eight
`--sf-*` tokens `form-hybrid.css` declares — the accent family — and leaves the
neutrals, the field, its border, the alternate surface and the hairline exactly
as the product ships them. That is deliberate: the smaller the override, the
more of the product's own work the store keeps getting for free.

The orange is the brand and stays the brand. It is darker than it was, and the
reason is measured rather than aesthetic.

## Accessibility notes

The install shipped `#EE4D2D` across 86 usages before 2026-08-23. That colour
is **3.66:1 on white and 3.66:1 under white** — failing WCAG AA 4.5:1 in both
directions, on the buttons and prices a buyer has to read. It was the same
defect ADR-019 originally removed the product's gold accent for, running live
on a store taking real orders.

| Pair | Ratio |
| --- | --- |
| `accent` as text on white | 5.12:1 |
| white on `accent` | 5.12:1 |
| `accent-strong` as text on white | 7.10:1 |
| ink `#111111` on `accent-soft` | 16.95:1 |

`#D6401F` was the first candidate and clears the bar at 4.55:1, but with no
headroom — a single future tweak to a background puts it back under. `#C93A1B`
was taken instead for the 0.6 of margin, and reads as the same orange.

`accent-soft` is a fill with text on it, so it is measured against the ink that
sits on it, not against white. That distinction is what a sister install got
wrong: it shipped a struck-through price at 4.41:1 because its contrast table
listed surfaces but not fills.

`accent-ring` is the one token that is not a hex, which is exactly why it was
missed on the first pass and left an orange button wearing a blue focus ring.
A ring needs 3:1 as an indicator, not 4.5:1; it is derived from the accent so
it cannot drift away from it.
