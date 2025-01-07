from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pythonBackend.mono_scraper import scraper_router
from app.pythonBackend.compare_all_lookbacks_prices import router as lookbacks_router

app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scraper_router, prefix="/scraper", tags=["Scraper"])

app.include_router(lookbacks_router, prefix="/compare-lookbacks", tags=["Lookbacks"])

# Run the app on port 8001
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
