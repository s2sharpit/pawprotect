import json
from google import genai
from google.genai import types
from fastapi import HTTPException
from app.core.config import settings
from app.schemas.schemas import ChatRequest, ChatResponse, ReceiptData, EligibilityResult

# Initialize the new Google Gen AI Client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Use the latest flash model
MODEL_NAME = settings.GEMINI_MODEL

async def check_pet_eligibility(extracted_text: str) -> EligibilityResult:
    prompt = f"""You are a veterinary medical records analyzer for a pet insurance company.

Analyze the following medical records text and extract the following fields:

- name (string): Pet's name
- species (string): dog, cat, bird, etc.
- medicalSummary (string): Concise 2-3 sentence summary of the pet's medical history
- eligibilityStatus (string): Must be either 'ELIGIBLE' or 'NOT_ELIGIBLE' (no other values allowed)
- eligibilityReason (string): Clear explanation of eligibility decision
- breed (string or null): Pet's breed if mentioned
- age (integer or null): Pet's age in years (must be positive)
- gender (string or null): Male, Female, or null
- preExistingConditions (array): List of pre-existing medical conditions

**Eligibility Criteria:**
- **ELIGIBLE** if:
    - Minor or manageable conditions
    - Routine care history
    - No severe chronic diseases
    - Age under 10 years (if known)

- **NOT_ELIGIBLE** if:
    - Severe chronic diseases (advanced cancer, severe heart disease, kidney failure)
    - Recent major surgeries for serious conditions
    - Terminal illnesses
    - Age over 12 years

**CRITICAL**: Return ONLY valid JSON with no additional text, no markdown, no code blocks.

JSON Format:
{{
    "name": "Pet name here",
    "species": "dog",
    "breed": "Golden Retriever",
    "age": 5,
    "gender": "Male",
    "medicalSummary": "Brief summary of medical history here",
    "preExistingConditions": ["condition1", "condition2"],
    "eligibilityStatus": "ELIGIBLE",
    "eligibilityReason": "Clear explanation here"
}}

Medical Records Text:
{extracted_text}
"""
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2, 
            max_output_tokens=1000
        )
    )
    
    response_text = _clean_json_response(response.text)
    
    try:
        result = json.loads(response_text)
        if not result.get('name') or not result.get('species'):
            raise HTTPException(status_code=400, detail="Could not extract core pet details from medical records.")
        if 'preExistingConditions' not in result:
            result['preExistingConditions'] = []
        return EligibilityResult(**result)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")


async def extract_receipt_data(extracted_text: str) -> ReceiptData:
    prompt = f"""You are a veterinary receipt data extractor for an insurance claim system.

Receipt Text:
{extracted_text}

Analyze the provided veterinary receipt text and extract the following information:

1. **Treatment Date**: Date when treatment was provided (format: YYYY-MM-DD)
2. **Vet Clinic Name**: Name of the veterinary clinic
3. **Diagnosis**: Primary diagnosis or reason for visit
4. **Treatment Type**: Type of treatment provided (e.g., Surgery, Examination, Medication, Emergency Care)
5. **Medications**: List of medications prescribed or administered
6. **Total Amount**: Total cost/amount on the receipt (numeric value only, e.g., "250.00")

If any information is not clearly visible or available, use "Not specified" for text fields and "0.00" for amount.

Return your response in the following JSON format ONLY (no additional text):
{{
    "treatment_date": "YYYY-MM-DD",
    "vet_clinic_name": "Clinic name",
    "diagnosis": "Diagnosis text",
    "treatment_type": "Treatment type",
    "medications": "Medication list",
    "total_amount": "0.00"
}}"""
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2, 
            max_output_tokens=1000
        )
    )
    
    response_text = _clean_json_response(response.text)
    
    try:
        result = json.loads(response_text)
        return ReceiptData(**result)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")


async def chat_with_ai(request: ChatRequest) -> ChatResponse:
    system_instruction = """You are a knowledgeable and caring pet health assistant for a pet insurance company. 

Your role is to:
1. Provide helpful information about pet symptoms and health concerns
2. Suggest appropriate first-aid measures when applicable
3. Assess severity and recommend whether to monitor at home, schedule a vet visit, or seek emergency care
4. Be empathetic and reassuring while being medically responsible

Important guidelines:
- Always prioritize pet safety - when in doubt, recommend veterinary care
- Never diagnose specific conditions - instead describe possibilities
- Provide actionable advice for immediate care
- Be clear about when professional veterinary care is needed
- Keep responses concise but informative (3-5 sentences)

If pet context is provided, use it to give more personalized advice."""

    user_message = request.message
    if request.pet_context:
        user_message = f"Context: {request.pet_context}\n\nQuestion: {request.message}"
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7
        )
    )
    
    return ChatResponse(response=response.text)


def _clean_json_response(response_text: str) -> str:
    if not response_text:
        return "{}"
    response_text = response_text.strip()
    if response_text.startswith('```'):
        response_text = response_text.split('```')[1]
        if response_text.startswith('json'):
            response_text = response_text[4:]
        response_text = response_text.strip()
    if response_text.endswith('```'):
        response_text = response_text.rsplit('```', 1)[0].strip()
    return response_text
