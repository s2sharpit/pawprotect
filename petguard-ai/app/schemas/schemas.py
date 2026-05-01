from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    pet_context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str

class EligibilityResponse(BaseModel):
    is_eligible: bool
    reason: str
    medical_summary: str
    pre_existing_conditions: List[str]

class ReceiptData(BaseModel):
    treatment_date: str
    vet_clinic_name: str
    diagnosis: str
    treatment_type: str
    medications: str
    total_amount: str
    
class EligibilityResult(BaseModel):
    name: str
    species: str
    breed: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    medicalSummary: Optional[str] = None
    preExistingConditions: Optional[List[str]] = None
    eligibilityStatus: Optional[str] = None
    eligibilityReason: Optional[str] = None
