import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME = "Pet Insurance AI Service"
    VERSION = "1.0.0"
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    API_SECRET_KEY = os.getenv("API_SECRET_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL")

    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is required")
    if not API_SECRET_KEY:
        raise ValueError("API_SECRET_KEY environment variable is required")

settings = Settings()
