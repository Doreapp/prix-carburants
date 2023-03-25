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


def get_remote_file(path: str) -> dict:
    """Fetch remote file and return the content as a JSON dict"""
    REMOTE_URL = f"https://api.github.com/repos/{REPO}/contents/assets/{path}?ref={BRANCH}"
    print("Updating", REMOTE_URL)
    response = requests.get(REMOTE_URL)
    try:
        response.raise_for_status()
    except requests.HTTPError as error:
        raise Exception(f"Unable to fetch current file at {REMOTE_URL}") from error
    return response.json()


def get_local_file(path: str) -> dict:
    """Load local file and return its content as a JSON dict"""
    if not os.path.isfile(path):
        raise FileNotFoundError(f"'{path}' doesn't point to a file")
    with open(path, "r") as fis:
        content = json.load(fis)
    content_b64 = base64.b64encode(json.dumps(content).encode("ascii")).decode("ascii")
    return content_b64


def update_file(path):
    """
    Update the file at `path`
    """
    print(f"Updating file at {path}...")
    previous = get_remote_file(path)
    current = get_local_file(path)

    if "sha" not in previous:
        print("-" * 10, "PREVIOUS", "-" * 10, "\n", previous, "\n", "-" * 30)
        raise KeyError(
            f"'sha' key missing in remote file response, see above message for complete object"
        )

    body = {
        "message": "Update data",
        "branch": BRANCH,
        "sha": previous["sha"],
        "content": current,
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
