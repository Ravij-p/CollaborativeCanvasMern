import sys
import requests
from bs4 import BeautifulSoup
from newspaper import Article
import re
sys.stdout.reconfigure(encoding='utf-8')
def clean_html_text(html):
    text = re.sub(r'\s+', ' ', html)
    text = text.replace('\xa0', ' ').strip()
    return text

def extract_with_bs4(html):
    soup = BeautifulSoup(html, 'html.parser')
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

def main():
    if len(sys.argv) < 2:
        print("Error: Missing URL")
        sys.exit(1)

    url = sys.argv[1]
    try:
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; WebScraperBot/1.0)'
        })

        if response.status_code != 200:
            print("Failed to fetch page content")
            sys.exit(1)

        text = extract_with_newspaper(url)
        if not text or len(text) < 100:
            text = extract_with_bs4(response.text)

        if not text or len(text) < 50:
            print("Unable to extract meaningful content from page")
            sys.exit(1)

        print(text)

    except requests.RequestException as e:
        print(f"Request failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
