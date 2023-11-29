const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pdf = require('pdf-parse');
const multer = require('multer');
const { OpenAIAPI } = require('openai');

const app = express();
const PORT = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());

let pdfEmbeddings = {}; // Object to store PDF embeddings in memory

const openai = new OpenAIAPI('YOUR_OPENAI_API_KEY');

app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const pdfData = req.file.buffer.toString('utf8');
    const embedding = await generateEmbedding(pdfData);
    
    // Save the embedding to memory
    const fileId = Date.now().toString();
    pdfEmbeddings[fileId] = embedding;
    
    // Respond with the fileId
    res.json({ fileId });
  } catch (error) {
    console.error('Error:', error);
    res.sendStatus(500);
  }
});

app.post('/chat', async (req, res) => {
  try {
    const userQuery = req.body.query;
    const fileId = req.body.fileId;

    // Use OpenAI API for general queries
    let botResponse = await generateOpenAIResponse(userQuery);

    // Check if the query is domain-specific
    if (isDomainSpecificQuery(userQuery)) {
      // Generate response based on domain-specific knowledge from PDF
      botResponse = await generateDomainSpecificResponse(userQuery, fileId);
    }

    res.json({ response: botResponse });
  } catch (error) {
    console.error('Error:', error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Function to generate embeddings using OpenAI API
async function generateEmbedding(text) {
  const response = await openai.embedding.create({ model: 'text-embedding-ada-002', data: text });
  return response.data[0].embedding;
}

// Function to generate response based on domain-specific knowledge
async function generateDomainSpecificResponse(query, fileId) {
  const savedEmbedding = pdfEmbeddings[fileId];
  
  if (savedEmbedding) {
    // Implement logic to match the query with domain-specific knowledge
    // and return an appropriate response from the saved embeddings.
    // This could involve some form of similarity comparison.
    // Example:
    // const similarity = calculateSimilarity(queryEmbedding, savedEmbedding);
    // if (similarity > threshold) {
    //   return "Domain-specific response";
    // } else {
    //   return "Default response";
    // }
    return 'Domain-specific response'; // Placeholder for now
  } else {
    return 'No matching PDF found';
  }
}

// Function to check if the query is domain-specific
function isDomainSpecificQuery(query) {
  // Implement logic to determine if the query is related to the domain-specific knowledge.
  // This could involve keyword matching or other techniques.
  // Example:
  // return query.includes("domain-specific keyword");
  return true; // Placeholder for now
}
