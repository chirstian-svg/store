#!/usr/bin/env python3
"""
Generate matching homepage category banners for Holo Vault.
Run: python3 store/scripts/generate-category-images.py
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

W, H = 900, 600
ASSETS = Path(__file__).resolve().parent.parent / "assets"

# Holo Vault palette
BG_TOP = (27, 11, 53)
BG_BOT = (7, 3, 13)
ACCENT = (215, 61, 242)
ACCENT2 = (135, 69, 255)
GLOW = (215, 61, 242, 90)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def gradient_bg() -> Image.Image:
    img = Image.new("RGB", (W, H), BG_BOT)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        r = int(BG_TOP[0] * (1 - t) + BG_BOT[0] * t)
        g = int(BG_TOP[1] * (1 - t) + BG_BOT[1] * t)
        b = int(BG_TOP[2] * (1 - t) + BG_BOT[2] * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([W // 2 - 280, 40, W // 2 + 280, 420], fill=GLOW)
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    return Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")


def paste_card(base: Image.Image, card: Image.Image, box: tuple[int, int, int, int], angle: float) -> None:
    card = ImageOps.fit(card.convert("RGBA"), (box[2] - box[0], box[3] - box[1]), Image.LANCZOS)
    card = card.rotate(angle, expand=True, resample=Image.BICUBIC)
    shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rectangle([8, 8, card.width - 8, card.height - 8], fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    cx = (box[0] + box[2]) // 2
    cy = (box[1] + box[3]) // 2
    base.paste(shadow, (cx - shadow.width // 2 + 6, cy - shadow.height // 2 + 10), shadow)
    base.paste(card, (cx - card.width // 2, cy - card.height // 2), card)


def draw_pill(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], text: str, fill: tuple, outline: tuple | None = None) -> None:
    draw.rounded_rectangle(xy, radius=20, fill=fill, outline=outline or fill, width=2)
    font = load_font(22, bold=True)
    tw, th = draw.textbbox((0, 0), text, font=font)[2:]
    tx = xy[0] + (xy[2] - xy[0] - tw) // 2
    ty = xy[1] + (xy[3] - xy[1] - th) // 2 - 2
    draw.text((tx, ty), text, fill=(255, 255, 255), font=font)


def finish_banner(img: Image.Image) -> Image.Image:
    """Bottom vignette so theme tile labels stay readable."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(H - 140, H):
        t = (y - (H - 140)) / 140
        od.line([(0, y), (W, y)], fill=(7, 3, 13, int(210 * t)))
    img = Image.alpha_composite(img.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(img)
    draw.line([(0, H - 3), (W, H - 3)], fill=ACCENT + (255,), width=3)
    return img


def load_cards() -> list[Image.Image]:
    paths = [
        ASSETS / "hero-card-1.webp",
        ASSETS / "hero-card-2.webp",
        ASSETS / "hero-card-3.webp",
    ]
    cards = []
    for p in paths:
        if p.exists():
            cards.append(Image.open(p))
    return cards


def banner_singles(cards: list[Image.Image]) -> Image.Image:
    img = gradient_bg().convert("RGBA")
    draw = ImageDraw.Draw(img)
    draw_pill(draw, (24, 24, 168, 68), "SINGLES", (135, 69, 255, 230))
    draw_pill(draw, (180, 28, 290, 64), "TCG", (255, 255, 255, 35), outline=(255, 255, 255, 80))
    if len(cards) >= 3:
        paste_card(img, cards[0], (80, 100, 280, 380), -14)
        paste_card(img, cards[1], (310, 70, 520, 400), 4)
        paste_card(img, cards[2], (540, 110, 740, 390), 12)
    img = finish_banner(img)
    return img.convert("RGB")


def banner_new(cards: list[Image.Image]) -> Image.Image:
    img = gradient_bg().convert("RGBA")
    draw = ImageDraw.Draw(img)
    draw_pill(draw, (24, 24, 120, 68), "NEW", (255, 93, 167, 240))
    draw_pill(draw, (132, 28, 310, 64), "JUST LISTED", (255, 255, 255, 35), outline=(255, 255, 255, 80))
    # sparkle dots
    for x, y, s in [(720, 50, 8), (760, 90, 5), (680, 120, 6), (800, 70, 4)]:
        draw.ellipse([x, y, x + s * 2, y + s * 2], fill=(255, 220, 120, 200))
    card = cards[1] if len(cards) > 1 else cards[0]
    paste_card(img, card, (280, 60, 620, 420), -2)
    img = finish_banner(img)
    return img.convert("RGB")


def banner_english(cards: list[Image.Image]) -> Image.Image:
    img = gradient_bg().convert("RGBA")
    draw = ImageDraw.Draw(img)
    draw_pill(draw, (24, 24, 88, 68), "EN", (59, 130, 246, 240))
    draw_pill(draw, (96, 28, 248, 64), "ENGLISH", (255, 255, 255, 35), outline=(255, 255, 255, 80))
    paste_card(img, cards[1] if cards else Image.new("RGBA", (10, 10)), (100, 90, 340, 400), -10)
    paste_card(img, cards[0] if cards else Image.new("RGBA", (10, 10)), (380, 80, 620, 410), 8)
    # UK/US hint — small flag stripes abstract
    draw.rounded_rectangle([720, 36, 860, 100], radius=12, fill=(30, 58, 138, 180))
    draw.text((742, 52), "EN", fill=(255, 255, 255), font=load_font(28, bold=True))
    img = finish_banner(img)
    return img.convert("RGB")


def banner_japanese(cards: list[Image.Image]) -> Image.Image:
    img = gradient_bg().convert("RGBA")
    draw = ImageDraw.Draw(img)
    draw_pill(draw, (24, 24, 88, 68), "JP", (220, 38, 38, 240))
    draw_pill(draw, (96, 28, 268, 64), "JAPANESE", (255, 255, 255, 35), outline=(255, 255, 255, 80))
    paste_card(img, cards[2] if len(cards) > 2 else cards[0], (90, 85, 330, 405), -12)
    paste_card(img, cards[0], (360, 75, 600, 415), 6)
    # hiragana accent
    draw.rounded_rectangle([700, 30, 872, 108], radius=12, fill=(180, 20, 40, 200))
    draw.text((722, 48), "日本語", fill=(255, 255, 255), font=load_font(26, bold=True))
    img = finish_banner(img)
    return img.convert("RGB")


def banner_chinese(cards: list[Image.Image]) -> Image.Image:
    img = gradient_bg().convert("RGBA")
    draw = ImageDraw.Draw(img)
    draw_pill(draw, (24, 24, 92, 68), "CN", (220, 38, 38, 240))
    draw_pill(draw, (100, 28, 248, 64), "CHINESE", (255, 255, 255, 35), outline=(255, 255, 255, 80))
    paste_card(img, cards[0], (110, 88, 350, 402), -8)
    paste_card(img, cards[2] if len(cards) > 2 else cards[1], (370, 82, 610, 408), 10)
    draw.rounded_rectangle([688, 30, 872, 108], radius=12, fill=(200, 30, 30, 210))
    draw.text((712, 48), "中文", fill=(255, 215, 0), font=load_font(28, bold=True))
    img = finish_banner(img)
    return img.convert("RGB")


def save_webp(img: Image.Image, name: str) -> None:
    out = ASSETS / name
    img.save(out, "WEBP", quality=86, method=6)
    print(f"  ✓ {out.name} ({img.size[0]}×{img.size[1]}, {out.stat().st_size // 1024} KB)")


def main() -> None:
    print("\nGenerating category banners…\n")
    cards = load_cards()
    if not cards:
        raise SystemExit("Need hero-card-*.webp in store/assets/")

    save_webp(banner_singles(cards), "cat-singles.webp")
    save_webp(banner_new(cards), "cat-new-arrivals.webp")
    save_webp(banner_english(cards), "cat-english.webp")
    save_webp(banner_japanese(cards), "cat-japanese.webp")
    save_webp(banner_chinese(cards), "cat-chinese.webp")
    print("\nDone.\n")


if __name__ == "__main__":
    main()
