import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_path
from sentence_transformers import SentenceTransformer, util
import numpy as np
import torch
import re
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import sys
import json

# === CONFIGURATION ===
MODEL_NAME = "google/flan-t5-base"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# === INITIALIZATION ===
embed_model = SentenceTransformer("all-MiniLM-L6-v2", device=DEVICE)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(DEVICE)

generator = pipeline(
    "text2text-generation",
    model=model,
    tokenizer=tokenizer,
    device=0 if DEVICE == "cuda" else -1,
    max_new_tokens=128,
    do_sample=True,
    temperature=0.7,
    top_k=50,
    top_p=0.9,
    repetition_penalty=1.2
)

# === HELPERS ===

def embed_texts(texts):
    return embed_model.encode(texts, convert_to_tensor=True)

def extract_text_from_pdf(filepath):
    doc = fitz.open(filepath)
    text = "".join(page.get_text() for page in doc)
    if not text.strip():
        images = convert_from_path(filepath)
        text = "".join(pytesseract.image_to_string(img) for img in images)
    return text

def extract_syllabus_topics(text):
    pattern = r"Syllabus[:\n]+(.*?)(?:Text Book|Reference|C\. Text Book)"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if not match:
        return []
    body = match.group(1)
    parts = re.split(r"(Unit\s*-?\s*[IVX0-9]+)", body, flags=re.IGNORECASE)
    topics = []
    for idx in range(1, len(parts), 2):
        title = parts[idx].strip()
        desc = re.sub(r"\s+", " ", parts[idx + 1]).strip()
        topics.append(f"{title}: {desc}")
    return topics

def extract_questions_from_pyq(text):
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    questions = []
    for ln in lines:
        if ln.endswith('?') or ln.lower().startswith(('what', 'why', 'how', 'define', 'explain', 'describe', 'write')):
            if 10 < len(ln) < 200:
                questions.append(ln)
    seen = set()
    unique = []
    for q in questions:
        if q not in seen:
            unique.append(q)
            seen.add(q)
    return unique

def match_pyqs_to_topics(pyqs, topics, top_k=3):
    topic_emb = embed_texts(topics)
    pyq_emb = embed_texts(pyqs)
    sims = util.pytorch_cos_sim(topic_emb, pyq_emb)
    results = []
    for i, topic in enumerate(topics):
        top_idxs = sims[i].topk(k=min(top_k, len(pyqs))).indices.cpu().tolist()
        matched = [pyqs[j] for j in top_idxs]
        results.append((topic, matched))
    return results

def generate_questions(topic, examples, count=3):
    prompt = (
        f"Generate exam questions that are highly probable for the topic '{topic}'. "
        "Use the following previous year questions as reference:\n" +
        "\n".join(f"- {q}" for q in examples)
    )
    out = generator(prompt)
    text = out[0]['generated_text']
    cand = re.split(r"\n|- ", text)
    cleaned = [c.strip(' -\n') for c in cand if len(c.strip()) > 5]
    seen = set()
    final = []
    for q in cleaned:
        if q not in seen:
            final.append(q)
            seen.add(q)
    return final[:count]

# === MAIN ENTRY (for child_process integration) ===

def run_pipeline(syllabus_pdf, pyq_pdfs, num_questions_per_topic=3):
    syllabus_text = extract_text_from_pdf(syllabus_pdf)
    topics = extract_syllabus_topics(syllabus_text)
    pyqs = []

    for p in pyq_pdfs:
        text = extract_text_from_pdf(p)
        pyqs.extend(extract_questions_from_pyq(text))

    matches = match_pyqs_to_topics(pyqs, topics)

    results = []
    for topic, related in matches:
        generated = generate_questions(topic, related, count=num_questions_per_topic)
        results.append({
            "topic": topic,
            "examples": related,
            "generated_questions": generated
        })

    return results

# === CLI ENTRYPOINT ===
if __name__ == "__main__":
    syllabus_path = sys.argv[1]
    pyq_paths = sys.argv[2:]  # support multiple pyq files
    try:
        output = run_pipeline(syllabus_path, pyq_paths)
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
