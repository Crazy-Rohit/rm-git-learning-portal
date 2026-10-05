"""Copy the designed badges into the site at a size GitHub Pages can serve."""
from pathlib import Path
from PIL import Image

SRC = Path(r"C:\Rohit Files\Git_Github\Github Credentials")
OUT = Path(r"C:\Rohit Files\Git_Github\site\public\badges")

BADGES = [
    ("1-First Repository Achievement Badge.png", "first-repository.png"),
    ("2-Achievement badge.png", "branches-and-prs.png"),
    ("3-Merge Conflicts achievement badge.png", "merge-conflicts.png"),
    ("4-Undo and Tags Achievement Badge.png", "undo-and-tags.png"),
    ("5-Fork and PR achievement badge.png", "fork-and-pr.png"),
    ("6-Square GITHUB ACTIONS achievement badge.png", "github-actions.png"),
    ("7-Capstone practitioner achievement badge.png", "capstone-practitioner.png"),
]


def flatten(image):
    image = image.convert("RGBA")
    background = Image.new("RGB", image.size, image.getpixel((0, 0))[:3])
    background.paste(image, mask=image.split()[-1])
    return background


def save_badge(source, dest):
    image = flatten(Image.open(source))
    image.thumbnail((720, 720), Image.Resampling.LANCZOS)
    image.quantize(colors=96, method=Image.Quantize.MEDIANCUT).save(dest, "PNG", optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for source_name, dest_name in BADGES:
        dest = OUT / dest_name
        save_badge(SRC / source_name, dest)
        print(dest_name, dest.stat().st_size)

    certificate = Image.open(SRC / "Github Certificate.png").convert("RGB")
    side = certificate.crop((1560, 0, certificate.width, certificate.height))
    side.thumbnail((760, 1100), Image.Resampling.LANCZOS)
    side_path = OUT / "certificate-side.webp"
    side.save(side_path, "WEBP", quality=80, method=6)
    print("certificate-side.webp", side_path.stat().st_size)


if __name__ == "__main__":
    main()
