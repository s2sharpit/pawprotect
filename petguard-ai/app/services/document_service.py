import io
import pypdf

def get_mime_type(filename: str) -> str:
    """Determine MIME type from filename"""
    if filename.lower().endswith('.pdf'):
        return 'application/pdf'
    else:
        return 'application/octet-stream'

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF using pypdf"""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = pypdf.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def extract_text_from_file(file_content: bytes, mime_type: str) -> str:
    """Extract text from file based on mime type"""
    if mime_type == 'application/pdf':
        return extract_text_from_pdf(file_content)
    else:
        raise Exception(f"Unsupported file type: {mime_type}")
