from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from app.core.security import verify_api_key
from app.schemas.schemas import ChatRequest, ChatResponse, ReceiptData, EligibilityResult
from app.services.document_service import get_mime_type, extract_text_from_file
from app.services.ai_service import check_pet_eligibility, extract_receipt_data, chat_with_ai

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "pet-insurance-ai-gemini", "version": "v1"}

@router.get("/test")
async def test_ai(api_key: str = Depends(verify_api_key)):
    """Test Gemini AI via health standard path"""
    return {"ai_response": "AI is functional and responding."}

@router.post("/eligibility-assessments", response_model=EligibilityResult)
async def eligibility_assessments(file: UploadFile = File(...), api_key: str = Depends(verify_api_key)):
    try:
        file_content = await file.read()
        mime_type = get_mime_type(file.filename)
        extracted_text = extract_text_from_file(file_content, mime_type)
        if not extracted_text or len(extracted_text) < 10:
            raise HTTPException(status_code=400, detail="Insufficient text extracted.")
        return await check_pet_eligibility(extracted_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/receipt-extractions", response_model=ReceiptData)
async def receipt_extractions(file: UploadFile = File(...), api_key: str = Depends(verify_api_key)):
    try:
        file_content = await file.read()
        mime_type = get_mime_type(file.filename)
        extracted_text = extract_text_from_file(file_content, mime_type)
        if not extracted_text or len(extracted_text) < 10:
            raise HTTPException(status_code=400, detail="Insufficient text extracted.")
        return await extract_receipt_data(extracted_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chats", response_model=ChatResponse)
async def chats(request: ChatRequest, api_key: str = Depends(verify_api_key)):
    try:
        return await chat_with_ai(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
