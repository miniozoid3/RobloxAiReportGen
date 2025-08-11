import uvicorn
from api import app

def run_fastapi():
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")

if __name__ == "__main__":
    run_fastapi()
