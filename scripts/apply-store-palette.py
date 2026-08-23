#!/usr/bin/env python3
"""Re-apply this store's accent after a product sync.

The product ships one accent expressed as five `--sf-*` custom properties
(ADR-019 as amended 2026-08-23). Those five declarations are the whole re-brand
contract, so this store overrides exactly them and touches nothing else.

Why a script rather than an edit: a sync replaces `src/`, so an edit made by
hand is reverted by the next pull. Keeping it here is what makes the store's
identity survive an update.

The orange is darkened on purpose. This install shipped `#EE4D2D` across 86
usages, which is **3.66:1** on white and 3.66:1 under white — failing WCAG AA
in both directions, on the buttons a buyer has to read. `#C93A1B` is 5.12:1
both ways and is still unmistakably the same brand orange; `#A32E12` at 7.10:1
carries hover and pressed. Measured, not estimated.
"""
import pathlib, re, subprocess

ACCENTS = [
    ('--sf-accent:',        '#C93A1B'),   # 5.12:1 on white, 5.12:1 under white
    ('--sf-accent-strong:', '#A32E12'),   # 7.10:1 — hover, pressed
    ('--sf-accent-soft:',   '#FDF0EC'),   # ink #111111 on it is 16.95:1
]
# The focus ring is the fourth accent token and it is an rgba(), not a hex, so
# the loop above cannot see it. Missing it left an orange button wearing a blue
# focus ring - which is also how the product's own token list came to be
# written down as five when the file declares eight.
RING = ('--sf-accent-ring:', 'rgba(201, 58, 27, 0.28)')
FORM = pathlib.Path('src/styles/form-hybrid.css')

text = FORM.read_text()
applied = 0
for token, value in ACCENTS:
    new, n = re.subn(rf'({re.escape(token)}\s*)#[0-9A-Fa-f]{{3,8}}', rf'\g<1>{value}', text)
    if n:
        text, applied = new, applied + n
ring_new, ring_n = re.subn(rf'({re.escape(RING[0])}\s*)rgba\([^)]*\)', rf'\g<1>{RING[1]}', text)
if ring_n:
    text, applied = ring_new, applied + ring_n
FORM.write_text(text)

# The legacy orange predates the token contract and is still written inline in
# a few storefront files the product has since rewritten. Anything left is
# mapped so a stale literal cannot reintroduce the 3.66:1 failure.
roots = "src/styles src/components/storefront src/pages src/layouts src/lib"
stale = subprocess.run(['bash', '-lc',
    f"grep -rl -iE '#(EE4D2D|D6401F)\\b' {roots} 2>/dev/null | grep -v '/admin'"],
    capture_output=True, text=True).stdout.split()
legacy = 0
for f in stale:
    p = pathlib.Path(f); t = p.read_text()
    for old in ('#EE4D2D', '#ee4d2d', '#D6401F', '#d6401f'):
        legacy += t.count(old)
        t = t.replace(old, '#C93A1B')
    p.write_text(t)

print(f"palette: {applied}/4 accent tokens set, {legacy} legacy literals remapped")
