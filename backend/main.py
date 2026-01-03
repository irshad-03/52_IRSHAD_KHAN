from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from typing import Optional
import os
from dotenv import load_dotenv

from services.financial_analyzer import FinancialAnalyzer
from services.report_generator import ReportGenerator

load_dotenv()

app = FastAPI(title="Financial Report API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Financial Report API is running"}

@app.post("/api/analyze")
async def analyze_financial_data(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Read the file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Initialize services
        analyzer = FinancialAnalyzer(df)
        report_gen = ReportGenerator(analyzer)
        
        # Perform analysis
        analysis_results = analyzer.analyze()
        
        # Generate report
        report_data = await report_gen.generate_mda_report()
        
        # Clean up temp file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Combine results
        response = {
            **analysis_results,
            "markdown_report": report_data["report"],
            "chart_data": report_data["chart_data"],
            "citations": report_data["citations"],
        }
        
        return JSONResponse(content=response)
    
    except Exception as e:
        # Clean up temp file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

