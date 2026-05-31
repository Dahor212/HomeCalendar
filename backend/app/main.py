import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .database import Base, engine
from .routers import events, tasks, push, categories, shopping
from .services.scheduler import start_scheduler, stop_scheduler

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Add url column to shopping_items if it doesn't exist yet
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE shopping_items ADD COLUMN IF NOT EXISTS url TEXT DEFAULT ''"))
        conn.commit()
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="HomeCalendar API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(tasks.router)
app.include_router(push.router)
app.include_router(categories.router)
app.include_router(shopping.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
