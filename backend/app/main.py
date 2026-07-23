from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinanceOS API")

app.include_router(auth_router.router)


@app.get("/")
def root():
    return {"status": "FinanceOS API is running"}