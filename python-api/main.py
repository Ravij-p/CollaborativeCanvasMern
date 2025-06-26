from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import shutil

from que_gen import run_pipeline as question_pipeline
from summary_module import run_pipeline as summarizer_pipeline
from scraper import router as scraper_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-questions")
async def generate_questions(syllabus: UploadFile = File(...), pyqs: List[UploadFile] = File(...)):
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)

    syllabus_path = os.path.join(temp_dir, syllabus.filename)
    with open(syllabus_path, "wb") as f:
        shutil.copyfileobj(syllabus.file, f)

    pyq_paths = []
    for pyq in pyqs:
        path = os.path.join(temp_dir, pyq.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(pyq.file, f)
        pyq_paths.append(path)

    results = question_pipeline(syllabus_path, pyq_paths)
    return {"generated_questions": results}

@app.post("/summarize-ppt")
async def summarize_ppt(file: UploadFile = File(...)):
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    summary = summarizer_pipeline(file_path, output_dir="output_images")
    return {"filename": file.filename, "summary": summary}

app.include_router(scraper_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
