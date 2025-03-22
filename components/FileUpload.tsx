"use client"

import type React from "react"

import { useState } from "react"
import { uploadFile } from "@/lib/firebase"

type FileUploadProps = {
  onUploadComplete: (url: string) => void
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    const { url, error } = await uploadFile(file, `uploads/${file.name}`)

    if (error) {
      setError(error)
    } else if (url) {
      onUploadComplete(url)
    }

    setUploading(false)
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  )
}

