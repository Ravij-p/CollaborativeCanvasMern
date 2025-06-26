import requests
from bs4 import BeautifulSoup
from newspaper import Article
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re

router = APIRouter()

class ScrapeRequest(BaseModel):
    url: str

def clean_html_text(html):
    # Remove unnecessary whitespace and characters
    text = re.sub(r'\s+', ' ', html)
    text = text.replace('\xa0', ' ').strip()
    return text

def extract_with_bs4(html):
    soup = BeautifulSoup(html, 'html.parser')

    # Prioritize semantic tags
    content = soup.find('article') or soup.find('main')

    if not content:
        paragraphs = soup.find_all('p')
        if not paragraphs:
            return ""
        content = "\n".join(p.get_text() for p in paragraphs)
    else:
        content = content.get_text()

    return clean_html_text(content)

def extract_with_newspaper(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        return article.text
    except Exception:
        return ""

@router.post("/scrape-link")
async def scrape_link(data: ScrapeRequest):
    url = data.url

    try:
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; WebScraperBot/1.0)'
        })

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch page content")

        # Try newspaper3k first
        text = extract_with_newspaper(url)
        if not text or len(text) < 100:
            text = extract_with_bs4(response.text)

        if not text or len(text) < 50:
            raise HTTPException(status_code=422, detail="Unable to extract meaningful content from page")

        return {
            "url": url,
            "length": len(text),
            "content": text[:1500] + "..." if len(text) > 1500 else text
        }

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")
