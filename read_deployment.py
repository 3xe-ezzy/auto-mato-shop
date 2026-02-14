import docx
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

try:
    doc = docx.Document("Deployment.docx")
    print("--- Deployment.docx Content ---")
    for para in doc.paragraphs:
        if para.text.strip():
            print(para.text)
    print("-------------------------------")
except Exception as e:
    print(f"Error reading file: {e}")
