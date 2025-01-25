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

let progressData = null;

app.get('/', (req, res) => {
 res.send('Content Generator Server is running');
});

app.post('/api/analyze', upload.array('images', 10), async (req, res) => {
 const { topic, searchRange, keywords, requiredContent, additionalPrompt } = req.body;
 const images = req.files;

 if (!topic) {
   return res.status(400).json({
     error: true,
     message: '주제가 입력되지 않았습니다.'
   });
 }

 try {
   progressData = {
     stage: 'collecting',
     progress: 20
   };

   console.log('Received request:', { 
     topic, 
     searchRange, 
     keywords: JSON.parse(keywords), 
     requiredContent,
     additionalPrompt,
     imageCount: images?.length 
   });

   const collectedData = await collector.collectData(topic, searchRange);
   collectedData.keywords = JSON.parse(keywords);
   collectedData.requiredContent = requiredContent;
   collectedData.additionalPrompt = additionalPrompt;
   collectedData.images = images;

   progressData = {
     stage: 'analyzing',
     progress: 40
   };

   console.log('Starting content analysis...');
   const { originalContent } = await analyzer.analyzeContent(collectedData);

   progressData = {
     stage: 'rewriting',
     progress: 60
   };

   console.log('Starting content rewriting...');
   const rewrittenContents = await rewriter.rewriteContent(originalContent, {
     keywords: JSON.parse(keywords),
     requiredContent,
     additionalPrompt,
     topic,
     images
   });

   progressData = {
     stage: 'complete',
     progress: 100,
     result: {
       originalContent,
       rewrittenContents
     }
   };

   res.json({
     originalContent,
     rewrittenContents
   });

 } catch (error) {
   console.error('API Error:', error);
   progressData = {
     error: true,
     message: error.message
   };
   res.status(500).json({
     error: true,
     message: error.message
   });
 }
});

app.get('/api/progress', (req, res) => {
 res.setHeader('Content-Type', 'text/event-stream');
 res.setHeader('Cache-Control', 'no-cache');
 res.setHeader('Connection', 'keep-alive');

 const sendProgress = () => {
   if (progressData) {
     res.write(`data: ${JSON.stringify(progressData)}\n\n`);
     if (progressData.stage === 'complete' || progressData.error) {
       res.end();
       progressData = null;
       return;
     }
   }
   setTimeout(sendProgress, 1000);
 };

 sendProgress();
});

const PORT = config.port || 3001;
app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});