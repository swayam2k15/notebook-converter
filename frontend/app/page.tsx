'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type ConversionFormat = 'html' | 'pdf'
type ConversionStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<ConversionFormat>('html')
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile && uploadedFile.name.endsWith('.ipynb')) {
      setFile(uploadedFile)
      setError('')
      setStatus('idle')
    } else {
      setError('Please upload a valid .ipynb file')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-ipynb+json': ['.ipynb']
    },
    maxFiles: 1
  })

  const handleConvert = async () => {
    if (!file) return

    setStatus('uploading')
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/convert/${format}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Conversion failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch {
          // Response might not be JSON (e.g., CORS error or empty response)
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.ipynb', `.${format}`)
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const resetUpload = () => {
    setFile(null)
    setStatus('idle')
    setError('')
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notebook Converter
          </h1>
          <p className="text-gray-600">
            Convert your Jupyter notebooks to HTML or PDF format
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
              }
              ${file ? 'bg-green-50 border-green-300' : ''}
            `}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                <p className="text-gray-900 font-medium">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    resetUpload()
                  }}
                  className="mt-3 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-700 font-medium">
                  {isDragActive ? 'Drop your notebook here' : 'Drag & drop your .ipynb file'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse
                </p>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Output Format
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('html')}
                className={`
                  flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors
                  ${format === 'html'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                HTML
              </button>
              <button
                onClick={() => setFormat('pdf')}
                className={`
                  flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors
                  ${format === 'pdf'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                PDF
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">
                Conversion successful! Your download should start automatically.
              </p>
            </div>
          )}

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={!file || status === 'uploading'}
            className={`
              mt-6 w-full py-4 px-6 rounded-xl font-semibold text-white
              flex items-center justify-center gap-2 transition-colors
              ${!file || status === 'uploading'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
              }
            `}
          >
            {status === 'uploading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Convert to {format.toUpperCase()}
              </>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Your files are processed securely and not stored on our servers.
        </p>
      </div>
    </main>
  )
}
