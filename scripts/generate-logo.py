#!/usr/bin/env python3
"""Generate SportsMCP app icon/logo."""

from PIL import Image, ImageDraw, ImageFont
import math
import os

def generate_logo(size=512, output_dir='.'):
    """Generate a modern SportsMCP logo."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2
    r = size // 2 - 8  # outer radius with padding

    # Background: rounded square with dark gradient feel
    # Draw a rounded rectangle background
    bg_color = (24, 24, 27)  # zinc-900
    corner_r = size // 5
    draw.rounded_rectangle(
        [4, 4, size - 4, size - 4],
        radius=corner_r,
        fill=bg_color,
    )

    # Subtle border glow
    for i in range(3):
        alpha = 60 - i * 20
        draw.rounded_rectangle(
            [4 + i, 4 + i, size - 4 - i, size - 4 - i],
            radius=corner_r - i,
            outline=(249, 115, 22, alpha),  # orange with fade
            width=1,
        )

    # === Draw a stylized running figure + signal waves (sports + AI) ===

    # Running figure (simplified stick figure with motion)
    figure_cx = cx - size * 0.08
    figure_cy = cy + size * 0.02

    # Head
    head_r = size * 0.055
    draw.ellipse(
        [figure_cx - head_r - size * 0.05, figure_cy - size * 0.28 - head_r,
         figure_cx - head_r + head_r * 2 - size * 0.05, figure_cy - size * 0.28 + head_r],
        fill=(249, 115, 22),  # orange
    )

    lw = max(3, size // 60)  # line width

    # Body
    body_top = (figure_cx - size * 0.05, figure_cy - size * 0.22)
    body_bottom = (figure_cx - size * 0.02, figure_cy + size * 0.02)
    draw.line([body_top, body_bottom], fill=(249, 115, 22), width=lw + 2)

    # Arms - running pose
    shoulder = (figure_cx - size * 0.04, figure_cy - size * 0.15)
    # Left arm back
    draw.line([shoulder, (figure_cx - size * 0.18, figure_cy - size * 0.08)],
              fill=(249, 115, 22), width=lw + 1)
    # Right arm forward
    draw.line([shoulder, (figure_cx + size * 0.10, figure_cy - size * 0.22)],
              fill=(249, 115, 22), width=lw + 1)

    # Legs - running stride
    hip = body_bottom
    # Left leg back
    draw.line([hip, (figure_cx - size * 0.16, figure_cy + size * 0.20)],
              fill=(249, 115, 22), width=lw + 1)
    draw.line([(figure_cx - size * 0.16, figure_cy + size * 0.20),
               (figure_cx - size * 0.20, figure_cy + size * 0.16)],
              fill=(249, 115, 22), width=lw + 1)
    # Right leg forward
    draw.line([hip, (figure_cx + size * 0.12, figure_cy + size * 0.22)],
              fill=(249, 115, 22), width=lw + 1)
    draw.line([(figure_cx + size * 0.12, figure_cy + size * 0.22),
               (figure_cx + size * 0.16, figure_cy + size * 0.18)],
              fill=(249, 115, 22), width=lw + 1)

    # === Signal/broadcast arcs (representing AI/MCP connection) ===
    arc_cx = cx + size * 0.15
    arc_cy = cy - size * 0.05
    arc_color_base = (249, 115, 22)

    for i, arc_r in enumerate([size * 0.12, size * 0.20, size * 0.28]):
        alpha = 220 - i * 60
        color = (*arc_color_base, alpha)
        arc_lw = max(2, lw - i)
        bbox = [arc_cx - arc_r, arc_cy - arc_r, arc_cx + arc_r, arc_cy + arc_r]
        draw.arc(bbox, start=-60, end=60, fill=color, width=arc_lw)

    # Small dot at signal origin
    dot_r = size * 0.02
    draw.ellipse([arc_cx - dot_r, arc_cy - dot_r, arc_cx + dot_r, arc_cy + dot_r],
                 fill=(249, 115, 22))

    # === Text: "MCP" at the bottom ===
    try:
        font_size = size // 8
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except (IOError, OSError):
        font = ImageFont.load_default()

    text = "MCP"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_x = cx - text_w // 2
    text_y = cy + size * 0.28
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 200), font=font)

    # Save at multiple sizes
    os.makedirs(output_dir, exist_ok=True)

    # Main logo
    logo_path = os.path.join(output_dir, 'sportsmcp-logo-512.png')
    img.save(logo_path, 'PNG')
    print(f"Saved: {logo_path}")

    # Strava requires various sizes
    for s in [256, 128, 64]:
        resized = img.resize((s, s), Image.LANCZOS)
        path = os.path.join(output_dir, f'sportsmcp-logo-{s}.png')
        resized.save(path, 'PNG')
        print(f"Saved: {path}")

    # Also save a square version without transparency for Strava upload
    flat = Image.new('RGB', (size, size), (24, 24, 27))
    flat.paste(img, (0, 0), img)
    flat_path = os.path.join(output_dir, 'sportsmcp-logo-flat.png')
    flat.save(flat_path, 'PNG')
    print(f"Saved: {flat_path} (no transparency, for Strava upload)")

    return logo_path

if __name__ == '__main__':
    output = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
    generate_logo(512, output)
