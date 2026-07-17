#!/usr/bin/env python3
"""Generate an MP4 via Seedance (volc-native task API behind a new-api gateway)."""
import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

CONFIG_PATH = Path.home() / ".config" / "video-gen" / "seedance.json"
TASKS_PATH = "/api/v3/contents/generations/tasks"
POLL_INTERVAL = 5  # 外部 HTTP API 无事件接口，轮询是唯一等待手段


def fail(message: str):
    print(json.dumps({"ok": False, "error": message}, ensure_ascii=False))
    sys.exit(1)


def load_config() -> tuple[str, str]:
    if not CONFIG_PATH.is_file():
        fail(f'missing config: {CONFIG_PATH} (expected {{"url": ..., "key": ...}})')
    config = json.loads(CONFIG_PATH.read_text())
    return config["url"].rstrip("/"), config["key"]


def api(base: str, key: str, path: str, payload: dict | None = None) -> bytes:
    request = urllib.request.Request(
        base + path,
        data=json.dumps(payload).encode() if payload else None,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST" if payload else "GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return response.read()
    except urllib.error.HTTPError as error:
        fail(f"HTTP {error.code} on {path}: {error.read().decode()[:500]}")
    except urllib.error.URLError as error:
        fail(f"network error on {path}: {error.reason}")


def wait_for_task(base: str, key: str, task_id: str, deadline: float) -> dict:
    while time.time() < deadline:
        status = json.loads(api(base, key, f"{TASKS_PATH}/{task_id}"))
        state = status.get("status")
        if state == "succeeded":
            return status
        if state in ("failed", "expired", "cancelled"):
            fail(f"generation {state}: {json.dumps(status, ensure_ascii=False)[:500]}")
        time.sleep(POLL_INTERVAL)
    fail(f"timed out waiting for task {task_id}")


def download(url: str, out: Path):
    with urllib.request.urlopen(url, timeout=300) as response:
        out.write_bytes(response.read())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("prompt", nargs="?", help="video description; omit to read stdin")
    parser.add_argument("--out", required=True, help="absolute output .mp4 path")
    parser.add_argument("--model", default="seedance-2.0-mini")
    parser.add_argument("--duration", type=int, default=5, help="4-15 seconds")
    parser.add_argument("--resolution", default="480p", choices=["480p", "720p", "1080p"])
    parser.add_argument("--ratio", default="16:9",
                        help="16:9 | 9:16 | 1:1 | 4:3 | 3:4 | 21:9 | adaptive")
    parser.add_argument("--no-audio", action="store_true")
    parser.add_argument("--timeout", type=int, default=600, help="seconds (default 600)")
    args = parser.parse_args()

    prompt = args.prompt or sys.stdin.read().strip()
    if not prompt:
        fail("empty prompt")
    out = Path(args.out).expanduser().resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    base, key = load_config()
    created = json.loads(api(base, key, TASKS_PATH, {
        "model": args.model,
        # 网关校验要求 prompt 字段，火山原生格式用 input 数组，双发保兼容
        "prompt": prompt,
        "input": [{"type": "text", "text": prompt}],
        "resolution": args.resolution,
        "ratio": args.ratio,
        "duration": args.duration,
        "generate_audio": not args.no_audio,
        "watermark": False,
    }))
    task_id = created.get("id")
    if not task_id:
        fail(f"no task id in response: {json.dumps(created, ensure_ascii=False)[:500]}")

    status = wait_for_task(base, key, task_id, time.time() + args.timeout)
    video_url = (status.get("content") or {}).get("video_url")
    if not video_url:
        fail(f"no video_url in result: {json.dumps(status, ensure_ascii=False)[:500]}")
    download(video_url, out)
    print(json.dumps(
        {"ok": True, "paths": [str(out)], "task_id": task_id, "model": args.model,
         "resolution": args.resolution, "duration": args.duration},
        ensure_ascii=False,
    ))


if __name__ == "__main__":
    main()
