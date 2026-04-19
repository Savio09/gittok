from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.api.router import router
from server.core.config import settings
from server.core.database import init_db


app = FastAPI(title="GitTok Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


app.include_router(router)
