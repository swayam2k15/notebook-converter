# Jupyter Notebook Converter

A web application to convert Jupyter notebooks (`.ipynb`) to HTML and PDF formats. Built with a modern tech stack featuring a Next.js frontend and FastAPI backend.

**Live Demo:** [https://notebook-converter.vercel.app/](https://notebook-converter.vercel.app/)

## Features

- Drag-and-drop file upload
- Convert `.ipynb` files to HTML format
- Convert `.ipynb` files to PDF format
- Clean, responsive UI with Tailwind CSS
- Backend warm-up indicator for cold start awareness

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, nbconvert, xhtml2pdf |
| Deployment | Vercel (frontend), Render (backend) |

## Local Development

### Prerequisites

- Python 3.9+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` in your browser.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info and status |
| `GET` | `/health` | Health check |
| `POST` | `/convert/html` | Convert notebook to HTML |
| `POST` | `/convert/pdf` | Convert notebook to PDF |

### Example Usage

```bash
# Convert to HTML
curl -X POST "http://localhost:8000/convert/html" \
  -F "file=@your-notebook.ipynb" \
  --output converted.html

# Convert to PDF
curl -X POST "http://localhost:8000/convert/pdf" \
  -F "file=@your-notebook.ipynb" \
  --output converted.pdf
```

## License

MIT License

## Author

Built by Sam
