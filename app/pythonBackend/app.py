from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mono_scraper import router as scraper_router
from compare_all_lookbacks_prices import router as lookbacks_router
from hash_password import router as hash_password_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scraper_router, tags=["Scraper"])

app.include_router(lookbacks_router, tags=["Lookbacks"])

app.include_router(hash_password_router, tags=["Authentication"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
