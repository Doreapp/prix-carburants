"""
Script to send files under `data/` directory to `gh-pages` branch
"""

import base64
import json
import os

import requests

# GitHub token
TOKEN = os.environ["GITHUB_TOKEN"]

# Location
REPO = "Doreapp/prix-carburants"
BRANCH = "gh-pages"


def update_file(path):
    """
    Update the file at `path`
    """
    print("Updating", f"https://api.github.com/repos/{REPO}/contents/assets/{path}?ref={BRANCH}")
    previous = requests.get(
        f"https://api.github.com/repos/{REPO}/contents/assets/{path}?ref={BRANCH}"
    ).json()

    with open(path, "r") as fis:
        content = json.load(fis)
    content_b64 = base64.b64encode(json.dumps(content).encode("ascii")).decode("ascii")

    body = {
        "message": "Update data",
        "branch": BRANCH,
        "sha": previous["sha"],
        "content": content_b64,
    }
    headers = {"Authorization": f"Bearer {TOKEN}", "X-GitHub-Api-Version": "2022-11-28"}

    response = requests.put(
        f"https://api.github.com/repos/{REPO}/contents/assets/{path}",
        headers=headers,
        data=json.dumps(body),
    )
    response.raise_for_status()


def main():
    """Main entrypoint"""
    for path in os.listdir("data"):
        update_file(f"data/{path}")


if __name__ == "__main__":
    main()
