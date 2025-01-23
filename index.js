const express = require('express');
const cors = require('cors');
const collector = require('./services/collector');
const analyzer = require('./services/analyzer');
const rewriter = require('./services/rewriter');
const config = require('./config');

const app = express();

// CORS 설정 수정 부분 [START]
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // preflight request 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// CORS 설정 수정 부분 [END]

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