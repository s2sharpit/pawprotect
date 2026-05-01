# Pet Insurance AI Service

AI microservice for pet insurance eligibility checks, receipt OCR, and health chatbot.

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env`:
```bash
   cp .env.example .env
```

3. Fill in your API keys in `.env`:
```bash
   GEMINI_API_KEY=your-actual-key
   API_SECRET_KEY=generate-random-key
```

4. Install dependencies:
```bash
   pip install -r requirements.txt
```

5. Run the service:
```bash
   python main.py
```

## API Documentation

Access Swagger docs at: http://localhost:8001/docs