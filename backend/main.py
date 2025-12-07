from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import nbformat
from nbconvert import HTMLExporter
import os
import io
import re
from xhtml2pdf import pisa


def create_simple_html_for_pdf(notebook):
    """Create a simple HTML document from notebook cells for PDF conversion"""
    html_parts = ['''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .cell { margin-bottom: 20px; padding: 10px; }
        .code-cell { background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; }
        .code-cell pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: monospace; font-size: 12px; }
        .markdown-cell { }
        .output { background-color: #fafafa; border-left: 3px solid #ccc; padding: 10px; margin-top: 10px; }
        .output pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; }
        h1, h2, h3, h4, h5, h6 { color: #333; }
        code { background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
''']

    for cell in notebook.cells:
        if cell.cell_type == 'markdown':
            # Simple markdown to HTML conversion
            content = cell.source
            # Convert headers
            content = re.sub(r'^######\s+(.+)$', r'<h6>\1</h6>', content, flags=re.MULTILINE)
            content = re.sub(r'^#####\s+(.+)$', r'<h5>\1</h5>', content, flags=re.MULTILINE)
            content = re.sub(r'^####\s+(.+)$', r'<h4>\1</h4>', content, flags=re.MULTILINE)
            content = re.sub(r'^###\s+(.+)$', r'<h3>\1</h3>', content, flags=re.MULTILINE)
            content = re.sub(r'^##\s+(.+)$', r'<h2>\1</h2>', content, flags=re.MULTILINE)
            content = re.sub(r'^#\s+(.+)$', r'<h1>\1</h1>', content, flags=re.MULTILINE)
            # Convert bold and italic
            content = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', content)
            content = re.sub(r'\*(.+?)\*', r'<em>\1</em>', content)
            # Convert inline code
            content = re.sub(r'`(.+?)`', r'<code>\1</code>', content)
            # Convert line breaks
            content = content.replace('\n\n', '</p><p>')
            content = f'<p>{content}</p>'
            html_parts.append(f'<div class="cell markdown-cell">{content}</div>')

        elif cell.cell_type == 'code':
            # Escape HTML in code
            code_content = cell.source.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            html_parts.append(f'<div class="cell code-cell"><pre>{code_content}</pre>')

            # Add outputs
            if hasattr(cell, 'outputs') and cell.outputs:
                for output in cell.outputs:
                    if output.output_type == 'stream':
                        text = output.text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        html_parts.append(f'<div class="output"><pre>{text}</pre></div>')
                    elif output.output_type == 'execute_result' or output.output_type == 'display_data':
                        if 'text/plain' in output.data:
                            text = output.data['text/plain'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                            html_parts.append(f'<div class="output"><pre>{text}</pre></div>')

            html_parts.append('</div>')

    html_parts.append('</body></html>')
    return ''.join(html_parts)

app = FastAPI(
    title="Notebook Converter API",
    description="Convert Jupyter notebooks to HTML and PDF formats",
    version="1.0.0"
)

# CORS configuration for frontend
frontend_url = os.getenv("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:3000",
    "https://notebook-converter.vercel.app",
]
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Notebook Converter API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/convert/html")
async def convert_to_html(file: UploadFile = File(...)):
    """Convert a Jupyter notebook to HTML format"""
    if not file.filename.endswith('.ipynb'):
        raise HTTPException(status_code=400, detail="File must be a .ipynb notebook")

    try:
        content = await file.read()
        notebook = nbformat.reads(content.decode('utf-8'), as_version=4)

        html_exporter = HTMLExporter()
        html_exporter.template_name = 'classic'

        (body, resources) = html_exporter.from_notebook_node(notebook)

        return Response(
            content=body,
            media_type="text/html",
            headers={
                "Content-Disposition": f"attachment; filename={file.filename.replace('.ipynb', '.html')}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


@app.post("/convert/pdf")
async def convert_to_pdf(file: UploadFile = File(...)):
    """Convert a Jupyter notebook to PDF format"""
    if not file.filename.endswith('.ipynb'):
        raise HTTPException(status_code=400, detail="File must be a .ipynb notebook")

    try:
        content = await file.read()
        notebook = nbformat.reads(content.decode('utf-8'), as_version=4)

        # Create simple HTML for PDF (avoids complex CSS issues)
        html_body = create_simple_html_for_pdf(notebook)

        # Convert HTML to PDF using xhtml2pdf
        pdf_buffer = io.BytesIO()
        pisa_status = pisa.CreatePDF(io.StringIO(html_body), dest=pdf_buffer)
        if pisa_status.err:
            raise Exception("PDF generation failed")
        pdf_content = pdf_buffer.getvalue()

        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={file.filename.replace('.ipynb', '.pdf')}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
