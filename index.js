const express = require('express');
const cors = require('cors');
const collector = require('./services/collector');
const analyzer = require('./services/analyzer');
const rewriter = require('./services/rewriter');
const config = require('./config');

const app = express();

app.use(cors({
 origin: 'https://content-generator-omega.vercel.app',
 methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
 allowedHeaders: ['Content-Type'],
 credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
 res.send('Content Generator Server is running');
});

app.post('/api/analyze', async (req, res) => {
try {
 const { topic, searchRange, keywords, requiredContent } = req.body;
 
 if (!topic) {
   return res.status(400).json({
     error: true,
     message: '주제가 입력되지 않았습니다.'
   });
 }

 console.log('Received request:', { topic, searchRange, keywords, requiredContent });

 const collectedData = await collector.collectData(topic, searchRange);
 collectedData.keywords = keywords;
 collectedData.requiredContent = requiredContent;

 console.log('Starting content analysis...');
 const { originalContent } = await analyzer.analyzeContent(collectedData);

 console.log('Starting content rewriting...');
 const rewrittenContents = await rewriter.rewriteContent(originalContent, {
   keywords,
   requiredContent,
   topic
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