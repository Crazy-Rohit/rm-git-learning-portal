"""Copy the official empty badges into the site. Filled art stays as local reference."""
from pathlib import Path
from PIL import Image, ImageDraw

SRC = Path(r"C:\Rohit Files\Git_Github\Github Credentials")
OUT = Path(r"C:\Rohit Files\Git_Github\site\public\badges")

# Empty files are numbered by export order, not by stage.
EMPTY = [
    ("Empty/3.png", "first-repository.png"),
    ("Empty/2.png", "branches-and-prs.png"),
    ("Empty/6.png", "merge-conflicts.png"),
    ("Empty/1.png", "undo-and-tags.png"),
    ("Empty/5.png", "fork-and-pr.png"),
    ("Empty/7.png", "github-actions.png"),
    ("Empty/4.png", "capstone-practitioner.png"),
]


def flatten(image):
    image = image.convert("RGBA")
    background = Image.new("RGB", image.size, image.getpixel((0, 0))[:3])
    background.paste(image, mask=image.split()[-1])
    return background


def clear_undo_ghost(image):
    """Empty/1 still has a faint XYZ in the plaque. Fill that plate only."""
    w, h = image.size
    sample = image.getpixel((int(w * 0.34), int(h * 0.812)))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(
        [w * 0.318, h * 0.768, w * 0.682, h * 0.868],
        radius=int(w * 0.02),
        fill=sample,
    )
    return image


def save_badge(source, dest, clean=None):
    image = flatten(Image.open(source))
    image.thumbnail((720, 720), Image.Resampling.LANCZOS)
    if clean:
        image = clean(image)
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest, "PNG", optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for source_name, dest_name in EMPTY:
        dest = OUT / dest_name
        clean = clear_undo_ghost if dest_name == "undo-and-tags.png" else None
        save_badge(SRC / source_name, dest, clean)
        print("empty", dest_name, dest.stat().st_size)

    empty_cert = flatten(Image.open(SRC / "Empty" / "Certificate.png"))
    empty_cert.thumbnail((1600, 1000), Image.Resampling.LANCZOS)
    cert_path = OUT / "certificate-empty.webp"
    empty_cert.save(cert_path, "WEBP", quality=86, method=6)
    print("certificate-empty.webp", cert_path.stat().st_size)

    certificate = flatten(Image.open(SRC / "Filled" / "Github Certificate.png"))
    side = certificate.crop((int(certificate.width * 0.62), 0, certificate.width, certificate.height))
    side.thumbnail((760, 1100), Image.Resampling.LANCZOS)
    side_path = OUT / "certificate-side.webp"
    side.save(side_path, "WEBP", quality=80, method=6)
    print("certificate-side.webp", side_path.stat().st_size)


if __name__ == "__main__":
    main()
