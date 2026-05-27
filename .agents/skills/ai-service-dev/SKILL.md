---
name: pawprotect-ai-service-dev
description: Playbook for developing and maintaining the Python/FastAPI AI microservice of PawProtect. Activate this when adding/modifying AI endpoints, editing prompts, updating Pydantic schemas, or integrating new Gemini model features using the Google Gen AI SDK.
---
# PawProtect AI Service Development Skill

This skill outlines the codebase structure, coding guidelines, and SDK integration for the Python 3.11+ FastAPI and Google Gen AI service.

## 🐍 AI Service Tech Stack
- **Framework:** FastAPI, Uvicorn
- **AI SDK:** `google-genai` (standard Python SDK: `from google import genai`)
- **Validation/Schemas:** Pydantic v2
- **Document Processing:** `pypdf` for parsing PDF documents (medical records, receipts)
- **Environment:** `python-dotenv` for configuration injection

---

## 📁 Codebase Structure
All code is located in the [app](file:///D:/Coding/projects/pawprotect/petguard-ai/app) directory:
- `main.py`: Application entry point. Configures CORS and hooks up the routers.
- `core/`: Global settings loader mapping `.env` configuration (e.g., `GEMINI_API_KEY`, `AI_API_KEY`, `GEMINI_MODEL`).
- `api/`: API controllers (e.g., endpoints for `/chat`, `/check-eligibility`, and `/receipt-extractions`).
- `schemas/`: Pydantic request and response schemas (e.g., `ChatRequest`, `EligibilityResult`, `ReceiptData`).
- `services/`: Implementation logic:
  - **`ai_service.py`**: Interacts with Google's Gemini Flash model using `genai.Client`.
  - **`document_service.py`**: Parses PDF and image files into plain text for the AI service.

---

## 🤖 Google Gen AI Integration Playbook

### Client Initialization
Always initialize the Gen AI Client with the config key:
```python
from google import genai
from google.genai import types

client = genai.Client(api_key=settings.GEMINI_API_KEY)
```

### Generation Config
For structured response extraction, pass a low temperature (e.g., `0.2` or `0.0`) to avoid creative hallucinations:
```python
response = client.models.generate_content(
    model=settings.GEMINI_MODEL,
    contents=prompt,
    config=types.GenerateContentConfig(
        temperature=0.2,
        max_output_tokens=1000
    )
)
```

### Prompt Engineering Guidelines
1. **Response Formats:** Instruct the model explicitly to return JSON format. Remove formatting artifacts like markdown block ticks via `_clean_json_response(response.text)` before deserializing with `json.loads()`.
2. **System Instruction:** Use `system_instruction` in the config for conversational endpoints like `/chat` to define the AI’s persona.

---

## 🧪 Development Commands
Run these commands in the `petguard-ai/` directory:
- **Activate Virtual Environment:**
  - PowerShell:
    ```powershell
    ./myenv/Scripts/Activate.ps1
    ```
- **Install Dependencies:**
  ```powershell
  pip install -r requirements.txt
  ```
- **Run FastAPI server locally:**
  ```powershell
  uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
  ```
