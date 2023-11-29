import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const onDrop = (acceptedFiles) => {
    setPdfFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.pdf' });

  const handleChat = async () => {
    try {
      if (pdfFile) {
        const pdfData = new FormData();
        pdfData.append('pdf', pdfFile);

        // Upload PDF to the server
        const uploadResponse = await axios.post('http://localhost:3000/upload-pdf', pdfData);

        // Make a request to the OpenAI API using the uploaded PDF
        const result = await axios.post('http://localhost:3000/chat', { query, fileId: uploadResponse.data.fileId });
        setResponse(result.data.response);
      } else {
        alert('Please upload a PDF file first.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Chatbot Web App</h1>
      <div>
        <div {...getRootProps()} style={{ border: '1px solid black', padding: '20px', margin: '20px' }}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop a PDF file here, or click to select one</p>
        </div>
        <input
          type="text"
          placeholder="Type your query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleChat}>Chat</button>
      </div>
      {response && <p>Chatbot: {response}</p>}
    </div>
  );
}

export default App;
