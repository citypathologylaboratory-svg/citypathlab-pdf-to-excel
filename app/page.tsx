'use client';

import { useState } from 'react';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [message, setMessage] = useState('');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pdf'));
    setFiles(prev => [...prev, ...newFiles]);
    setMessage('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).filter(f => f.name.endsWith('.pdf'));
    setFiles(prev => [...prev, ...newFiles]);
    setMessage('');
  };

  const convert = async () => {
    if (files.length === 0) {
      setMessage('Please select at least one PDF file');
      return;
    }
    setConverting(true);
    setMessage('Converting...');

    const formData = new FormData();
    files.forEach(file => formData.append('pdfs', file));

    try {
      const res = await fetch('/api/convert', { method: 'POST', body: formData });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted_files.zip';
        a.click();
        setMessage('Conversion successful!');
        setFiles([]);
      } else {
        setMessage('Conversion failed');
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    }
    setConverting(false);
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <h1>City Pathology PDF to Excel</h1>
      <div style={{ border: '2px dashed #ccc', padding: '40px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px', minWidth: '300px' }} onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
        <p>Drag and drop PDFs here or click to select</p>
        <input type="file" multiple accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} id="file-input" />
        <label htmlFor="file-input" style={{ cursor: 'pointer', color: '#0070f3' }}>Select Files</label>
      </div>
      {files.length > 0 && (<p>Selected: {files.length} file(s)</p>)}
      <button onClick={convert} disabled={converting} style={{ padding: '10px 20px', fontSize: '16px', cursor: converting ? 'not-allowed' : 'pointer' }}>{converting ? 'Converting...' : 'Convert to Excel'}</button>
      {message && <p style={{ marginTop: '20px', color: message.includes('successful') ? 'green' : message.includes('Error') ? 'red' : 'blue' }}>{message}</p>}
    </main>
  );
}
