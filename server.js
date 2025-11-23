
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');
const DIST_PATH = path.join(__dirname, 'dist');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initial Data structure
const INITIAL_DATA = {
  students: [],
  teachers: ['Иванов И.И.', 'Петрова А.С.'],
  courses: ['Математика ЕГЭ', 'Английский B2'],
  sources: ['Avito', 'VK', 'Сайт', 'WhatsApp', 'Партнёр', 'Друзья']
};

// Ensure data.json exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2));
}

// Serve Static Files (Frontend)
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
}

// --- API ROUTES ---

// GET: Load data
app.get('/api/data', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      // If file error, return initial data but don't crash
      return res.json(INITIAL_DATA);
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error('JSON Parse error, returning initial:', parseError);
      res.json(INITIAL_DATA);
    }
  });
});

// POST: Save data
app.post('/api/data', (req, res) => {
  const newData = req.body;
  if (!newData) {
    return res.status(400).json({ error: 'No data provided' });
  }

  // Create backup of old data before overwriting
  // (Optional: Implement real rotation if needed, keeping simple for now)
  
  fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), (err) => {
    if (err) {
      console.error('Error writing data:', err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
    console.log(`[${new Date().toISOString()}] Data saved successfully. Size: ${JSON.stringify(newData).length} bytes`);
    res.json({ success: true });
  });
});

// Fallback for SPA (Single Page Application)
// If request doesn't match API or static file, serve index.html
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(DIST_PATH, 'index.html'))) {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  } else {
    res.status(404).send('Frontend not built. Please run "npm run build" and restart server.');
  }
});

app.listen(PORT, () => {
  console.log(`CRM Server running on port ${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
