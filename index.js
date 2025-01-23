const express = require('express');
const cors = require('cors');
const collector = require('./services/collector');
const analyzer = require('./services/analyzer');
const rewriter = require('./services/rewriter');
const config = require('./config');

const app = express();

const corsOptions = {
 origin: 'https://content-generator-omega.vercel.app',
 methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
 preflightContinue: false,
 optionsSuccessStatus: 204,
 credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// 기본 라우트 추가 [START]
app.get('/', (req, res) => {
res.send('Content Generator Server is running');
});
// 기본 라우트 추가 [END]

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

 // 1. 자료 수집
 console.log('Starting data collection...');
 const collectedData = await collector.collectData(topic, searchRange);
 // 키워드와 필수 내용 추가
 collectedData.keywords = keywords;
 collectedData.requiredContent = requiredContent;

 // 2. 내용 분석
 console.log('Starting content analysis...');
 const { originalContent } = await analyzer.analyzeContent(collectedData);

 // 3. 컨텐츠 재작성
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