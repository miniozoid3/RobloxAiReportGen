import fastapi
import requests
from fastapi.middleware.cors import CORSMiddleware
from geminiwrapper import AICreator
from dotenv import load_dotenv
import os

load_dotenv()

app = fastapi.FastAPI(title="AiReportAPI", redoc_url=None)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_roblox_user(identifier: str | int) -> dict | None:
    """
    Fetch Roblox user info by user ID or username.
    """
    try:
        user_id = int(identifier)
    except ValueError:
        # Identifier is a username, resolve to user ID
        username = str(identifier).strip()
        url = "https://users.roblox.com/v1/usernames/users"
        payload = {"usernames": [username], "excludeBannedUsers": False}
        resp = requests.post(url, json=payload)
        if resp.status_code != 200:
            return None
        data = resp.json().get("data", [])
        if not data:
            return None
        user_id = data[0].get("id")

    # Get user details by user_id
    url = f"https://users.roblox.com/v1/users/{user_id}"
    resp = requests.get(url)
    if resp.status_code != 200:
        return None
    user_info = resp.json()

    # Check ban status by profile redirect
    profile_url = f"https://www.roblox.com/users/{user_id}/profile"
    profile_resp = requests.get(profile_url, allow_redirects=False)
    user_info["banStatus"] = (profile_resp.status_code == 302)

    return user_info

@app.get("/")
async def read_root():
    return fastapi.responses.RedirectResponse(url="./docs")

@app.get("/robloxreport/{identifier}")
async def roblox_report(identifier: str):
    user_info = await get_roblox_user(identifier)
    if not user_info:
        raise fastapi.HTTPException(
            status_code=404,
            detail=f"Could not find Roblox user with identifier '{identifier}'."
        )

    # Extract user info fields
    name = user_info.get('name')
    display = user_info.get('displayName')
    desc = user_info.get('description')
    uid = user_info.get('id')

    report_ai = AICreator()

    # Load background data for AI report
    data = requests.get(os.getenv("GeminiPromptUrl")).text
    await report_ai.ApplyBackground(data)

    # Prepare report prompt
    prompt = f"""Roblox user info:
Username: {name}
DisplayName: {display}
Description: {desc}
UserId: {uid}"""

    response = await report_ai.Talk(prompt)
    return {"report": response}
