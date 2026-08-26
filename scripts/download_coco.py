"""
COCO Dataset Downloader Script.
Downloads COCO 2017 annotations and validation images into the data/coco/ directory.
Supports --limit (default 500 images) for quick-start development.
"""

import argparse
import json
import os
from pathlib import Path
import urllib.request
import zipfile
from tqdm import tqdm


COCO_ANNOTATIONS_URL = "http://images.cocodataset.org/annotations/annotations_trainval2017.zip"
COCO_VAL_IMAGES_URL = "http://images.cocodataset.org/zips/val2017.zip"


class DownloadProgressBar(tqdm):
    def update_to(self, b=1, bsize=1, tsize=None):
        if tsize is not None:
            self.total = tsize
        self.update(b * bsize - self.n)


def download_file(url: str, output_path: Path):
    """Download a file with a live progress bar."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.exists() and output_path.stat().st_size > 0:
        print(f"[Download] File already exists: {output_path.name}")
        return

    print(f"[Download] Downloading {url} -> {output_path}...")
    with DownloadProgressBar(unit="B", unit_scale=True, miniters=1, desc=output_path.name) as t:
        urllib.request.urlretrieve(url, filename=output_path, reporthook=t.update_to)


def download_coco(data_dir: Path, limit: int = 500, full_zip: bool = False):
    """Download annotations and val2017 images."""
    data_dir.mkdir(parents=True, exist_ok=True)
    annotations_dir = data_dir / "annotations"
    images_dir = data_dir / "val2017"

    annotations_dir.mkdir(parents=True, exist_ok=True)
    images_dir.mkdir(parents=True, exist_ok=True)

    # 1. Download and extract captions annotations
    ann_zip_path = data_dir / "annotations_trainval2017.zip"
    captions_json_path = annotations_dir / "captions_val2017.json"
    instances_json_path = annotations_dir / "instances_val2017.json"

    if not captions_json_path.exists() or not instances_json_path.exists():
        download_file(COCO_ANNOTATIONS_URL, ann_zip_path)
        print(f"[Extract] Extracting annotations...")
        with zipfile.ZipFile(ann_zip_path, "r") as zip_ref:
            for member in zip_ref.namelist():
                if "val2017" in member and member.endswith(".json"):
                    zip_ref.extract(member, data_dir)
        print("[Extract] Annotations extracted successfully.")

    # 2. Download Images
    if full_zip:
        # Download the complete 5,000 images val2017.zip (~1GB)
        val_zip_path = data_dir / "val2017.zip"
        download_file(COCO_VAL_IMAGES_URL, val_zip_path)
        print(f"[Extract] Extracting all val2017 images...")
        with zipfile.ZipFile(val_zip_path, "r") as zip_ref:
            zip_ref.extractall(data_dir)
        print("[Extract] All images extracted.")
    else:
        # Fast direct download for the specified --limit (e.g. 500 images) directly from COCO CDN
        print(f"[Download] Fetching first {limit} images directly from COCO CDN...")
        with open(captions_json_path, "r", encoding="utf-8") as f:
            coco_data = json.load(f)

        images = coco_data.get("images", [])[:limit]
        downloaded = 0
        skipped = 0

        for img in tqdm(images, desc="Downloading COCO images"):
            file_name = img["file_name"]
            coco_url = img.get("coco_url") or f"http://images.cocodataset.org/val2017/{file_name}"
            dest_file = images_dir / file_name

            if dest_file.exists() and dest_file.stat().st_size > 0:
                skipped += 1
                continue

            try:
                urllib.request.urlretrieve(coco_url, dest_file)
                downloaded += 1
            except Exception as e:
                print(f"\n[Warning] Failed to download {file_name}: {e}")

        print(f"\n[Done] Processed {len(images)} images: {downloaded} downloaded, {skipped} already existed.")
        print(f"[Location] Images stored at: {images_dir.resolve()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download COCO 2017 validation dataset")
    parser.add_argument("--limit", type=int, default=500, help="Number of images to download for quick-start (default: 500)")
    parser.add_argument("--full-zip", action="store_true", help="Download the complete 1GB val2017.zip containing all 5,000 images")
    parser.add_argument("--output-dir", type=str, default=None, help="Custom data output directory (defaults to ../data/coco)")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    target_dir = Path(args.output_dir) if args.output_dir else (project_root / "data" / "coco")

    download_coco(data_dir=target_dir, limit=args.limit, full_zip=args.full_zip)
