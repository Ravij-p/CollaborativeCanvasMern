# 🧑‍🏫 Collaborative Canvas – Real-Time Multi-User Whiteboard with Smart Tools

A full-stack MERN-based real-time collaborative annotation platform where users can draw, annotate PDFs and PPTs, upload documents, and use AI-powered tools for question generation, PPT summarization, and web scraping — all in a shared session.

---

## 🚀 Features

### 🖍️ Real-Time Annotation
- Collaborative whiteboard with multi-user support via `Socket.IO`
- Draw with Pen, Highlighter, or Eraser tools
- Insert Text, Rectangles, and Lines
- Adjustable pen and eraser thickness
- Smooth and responsive canvas with scroll-aware annotations

### 📄 Document Upload & Annotation
- Upload and annotate over PDFs (page-aware, scroll-aligned)
- Upload and summarize `.pptx` files with slide-wise breakdown
- Infinite canvas extension for longer sessions
- Export annotated canvas as **PNG** or **PDF**

### ⚙️ Built-in Smart Tools (Collaborative)
Accessible via the **Toolbox Panel**, all results are visible and editable by all users:
- **Question Generator**: Upload syllabus and PYQs (as PDFs) to generate questions using NLP
- **PPT Summarizer**: Upload `.pptx` files and get slide-wise summarized output with images
- **Web Scraper**: Input a URL to extract cleaned textual content using `newspaper3k` & `BeautifulSoup`

### 🔐 Authentication and Room Management
- JWT-based user authentication
- Create or join rooms via unique IDs
- Room owner exits trigger redirection for all users
- Local undo/redo/clear actions (not synced across users)

---

## 🧱 Tech Stack

| Layer           | Tech Used                           |
|----------------|-------------------------------------|
| Frontend       | React.js, Tailwind CSS              |
| Backend        | Node.js, Express.js, Socket.IO      |
| Python Tools   | PyPDF2, python-pptx, transformers, newspaper3k, BeautifulSoup |
| Storage        | Cloudinary (PDF/PPT storage)        |
| Realtime       | Socket.IO                           |
| Authentication | JWT, bcrypt                         |
| Dev Tools      | dotenv, multer, uuid, nodemon       |

---

## 📁 Project Structure

```
collaborative-canvas/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── config/
│   
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/
│   │   │   ├── Auth/
│   │   │   └── Tools/
│   │   ├── context/
│   │   └── App.js
│   └── public/
├──  python-api/        # Contains que_gen.py, scraper.py, summary_module.py
├── .env
└── README.md
```

---

## 🛠️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/CollaborativeCanvas.git
cd CollaborativeCanvas
```

### 2. Install Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Install Backend

```bash
cd ../backend
npm install
```

### 4. Set Up Python Environment

```bash
cd python-api
python -m venv venv
venv\Scripts\activate     # On Windows
pip install -r requirements.txt
```

> Ensure you are using **Python 64-bit** for packages like `transformers` and `torch`.

---

## 🔐 .env Configuration (Backend)

Create a `.env` file in `/backend`:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🧪 Key API Routes

| Route                         | Description                       |
|------------------------------|-----------------------------------|
| `POST /api/tools/questions`  | Upload syllabus and pyqs PDFs     |
| `POST /api/tools/summarize`  | Upload PPT file                   |
| `POST /api/tools/scrape`     | Scrape content from a URL         |
| `POST /api/upload-pdf`       | Upload PDF for shared canvas use  |

---

## ✨ How It Works

- Users **create or join rooms** with authentication
- **Canvas syncs annotations** using `socket.emit`/`socket.on` events
- PDFs/PPTs are uploaded to **Cloudinary**, links are shared across users via socket
- **Python scripts are executed** through `child_process.execFile` in the backend
- Outputs are displayed in a **ToolboxPanel** and **emitted to all room participants**

---


## 📦 Deployment Tips

- Host the frontend on **Vercel** or **Netlify**
- Use **Render**, **Railway**, or **Heroku** for the backend (ensure Python environment compatibility)
- Store PDFs on **Cloudinary**
- If deploying Python API separately, set up a **FastAPI server** or containerize with Docker

---

## 📥 Save Canvas as PNG/PDF

Click the respective button in the toolbar to:
- **Save as PNG**: Captures current canvas view
- **Save as PDF**: Renders entire scrollable canvas area into PDF

---

## 🤝 Contribution Guide

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a pull request 🎉

---

## 📄 License

This project is licensed under the MIT License.

---

## 📬 Contact

**Author:** Ravij  , Diya
**GitHub:** [@Ravij-p](https://github.com/Ravij-p)
            [@Diyashah2904](https://github.com/Diyashah2904)
---

## 🙌 Acknowledgments

- OpenAI (for question generation models)
- Hugging Face Transformers
- Cloudinary for free media storage
- socket.io community for real-time patterns

---
