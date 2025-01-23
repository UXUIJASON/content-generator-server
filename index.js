const express = require('express');
const cors = require('cors');
const multer = require('multer');
const collector = require('./services/collector');
const analyzer = require('./services/analyzer');
const rewriter = require('./services/rewriter');
const config = require('./config');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
 origin: 'http://localhost:3000',
 methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
 allowedHeaders: ['Content-Type'],
 credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
 res.send('Content Generator Server is running');
});

app.post('/api/analyze', upload.array('images', 10), async (req, res) => {
try {
 const { topic, searchRange, keywords, requiredContent } = req.body;
 const images = req.files;
 
 if (!topic) {
   return res.status(400).json({
     error: true,
     message: '주제가 입력되지 않았습니다.'
   });
 }

 console.log('Received request:', { 
   topic, 
   searchRange, 
   keywords: JSON.parse(keywords), 
   requiredContent,
   imageCount: images?.length 
 });

 const collectedData = await collector.collectData(topic, searchRange);
 collectedData.keywords = JSON.parse(keywords);
 collectedData.requiredContent = requiredContent;
 collectedData.images = images;

 console.log('Starting content analysis...');
 const { originalContent } = await analyzer.analyzeContent(collectedData);

 console.log('Starting content rewriting...');
 const rewrittenContents = await rewriter.rewriteContent(originalContent, {
   keywords: JSON.parse(keywords),
   requiredContent,
   topic,
   images
 });

 res.json({
   originalContent,
   rewrittenContents
 });

} catch (error) {
 console.error('API Error:', error);
 res.status(500).json({
   error: true,
   message: error.message
 });
}
});

const PORT = config.port || 3001;
app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});