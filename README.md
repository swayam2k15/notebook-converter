# Jupyter Notebook Converter

A web application to convert Jupyter notebooks (`.ipynb`) to HTML and PDF formats. Built with a modern tech stack featuring a Next.js frontend and FastAPI backend.

**Live Demo:** [https://notebook-converter.vercel.app/](https://notebook-converter.vercel.app/)

## Features

- Drag-and-drop file upload
- Convert `.ipynb` files to HTML format
- Convert `.ipynb` files to PDF format
- Clean, responsive UI with Tailwind CSS
- Fast conversion using nbconvert and WeasyPrint

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, nbconvert, WeasyPrint |
| Deployment | Vercel (frontend), Render/Railway (backend) |

## Project Structure

```
notebook-converter/
├── backend/
│   ├── main.py              # FastAPI application with conversion endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Docker configuration for deployment
│   ├── render.yaml          # Render deployment config
│   ├── railway.json         # Railway deployment config
│   ├── .env.example         # Environment variables template
│   └── .gitignore
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main page with upload UI
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── package.json         # Node.js dependencies
│   ├── tailwind.config.ts   # Tailwind configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── next.config.js       # Next.js configuration
│   ├── vercel.json          # Vercel deployment config
│   ├── .env.example         # Environment variables template
│   └── .gitignore
├── .gitignore               # Root gitignore
└── README.md
```

---

## Local Development

### Prerequisites

- Python 3.9+ installed
- Node.js 18+ installed
- npm or yarn package manager

### Step 1: Clone/Navigate to the Project

```bash
cd notebook-converter
```

### Step 2: Start the Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate        # macOS/Linux
# OR
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Step 3: Start the Frontend (New Terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create local environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Step 4: Test the Application

1. Open `http://localhost:3000` in your browser
2. Drag and drop a `.ipynb` file
3. Select output format (HTML or PDF)
4. Click "Convert" to download the converted file

---

## Environment Variables

### Overview

| File | Purpose | Git Status |
|------|---------|------------|
| `.env.example` | Template showing required variables | Committed (safe) |
| `.env` | Actual values for production | **Never committed** |
| `.env.local` | Local development values | **Never committed** |

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-api.onrender.com` |

---

## Pushing to GitHub (Safely)

### Step 1: Verify Sensitive Files are Ignored

The `.gitignore` file already excludes:
- `.env`, `.env.local`, `.env.production`
- `venv/`, `node_modules/`
- `__pycache__/`, `.next/`

### Step 2: Initialize Git Repository

```bash
cd notebook-converter

# Initialize git
git init

# Add all files (env files are automatically ignored)
git add .

# Verify no sensitive files are staged
git status

# Commit
git commit -m "Initial commit: Jupyter Notebook Converter"
```

### Step 3: Create GitHub Repository

**Option A: Using GitHub Website**
1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `notebook-converter`
3. Do NOT initialize with README (we already have one)
4. Run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/notebook-converter.git
git branch -M main
git push -u origin main
```

**Option B: Using GitHub CLI**
```bash
# If you have GitHub CLI installed
gh repo create notebook-converter --public --source=. --push
```

### Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] No API keys or secrets in code
- [ ] `.env.example` files only contain placeholder values
- [ ] Run `git status` before committing to verify

---

## Deployment

### Backend Deployment

#### Option 1: Render (Recommended)

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `notebook-converter-api`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: Free (or paid for better performance)
5. Add environment variable:
   - `FRONTEND_URL` = `https://your-app.vercel.app`
6. Click **Create Web Service**
7. Copy the deployed URL (e.g., `https://notebook-converter-api.onrender.com`)

#### Option 2: Railway

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
5. Add environment variable:
   - `FRONTEND_URL` = `https://your-app.vercel.app`
6. Deploy and copy the URL

### Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.onrender.com`
6. Click **Deploy**

### Post-Deployment

After both services are deployed:

1. **Update Backend CORS**: Add your Vercel URL to the backend's `FRONTEND_URL` environment variable
2. **Update Frontend API URL**: Ensure `NEXT_PUBLIC_API_URL` points to your backend
3. **Test**: Upload a notebook and verify conversion works

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info and status |
| `GET` | `/health` | Health check |
| `POST` | `/convert/html` | Convert notebook to HTML |
| `POST` | `/convert/pdf` | Convert notebook to PDF |

### Example: Convert to HTML

```bash
curl -X POST "http://localhost:8000/convert/html" \
  -F "file=@your-notebook.ipynb" \
  --output converted.html
```

### Example: Convert to PDF

```bash
curl -X POST "http://localhost:8000/convert/pdf" \
  -F "file=@your-notebook.ipynb" \
  --output converted.pdf
```

---

## Troubleshooting

### Backend Issues

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError` | Ensure venv is activated and run `pip install -r requirements.txt` |
| WeasyPrint errors on macOS | Run `brew install pango gdk-pixbuf libffi` |
| CORS errors | Check `FRONTEND_URL` matches your frontend domain |

### Frontend Issues

| Problem | Solution |
|---------|----------|
| API connection failed | Verify `NEXT_PUBLIC_API_URL` in `.env.local` |
| Build errors | Delete `node_modules` and `.next`, then run `npm install` |

---

## License

MIT License - Feel free to use this project for learning or commercial purposes.

---

## Author

Built by Sam as a portfolio project.
