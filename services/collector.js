const axios = require('axios');

class DataCollector {
async collectData(topic, searchRange) {
  try {
    console.log('Collecting data for:', { topic, searchRange });
    let collectedData = [];

    switch (searchRange) {
      case 'academic':
        collectedData = await this.collectAcademicData(topic);
        break;
      case 'government':
        collectedData = await this.collectGovernmentData(topic);
        break;
      case 'news':
        collectedData = await this.collectNewsData(topic);
        break;
      case 'blog':
        collectedData = await this.collectBlogData(topic);
        break;
      case 'expert':
        collectedData = await this.collectExpertData(topic);
        break;  
      case 'sns':
        collectedData = await this.collectSNSData(topic);
        break;
      case 'all':
        const [academic, government, news, blog, expert, sns] = await Promise.all([
          this.collectAcademicData(topic),
          this.collectGovernmentData(topic),
          this.collectNewsData(topic),
          this.collectBlogData(topic),
          this.collectExpertData(topic),
          this.collectSNSData(topic)
        ]);
        collectedData = [...academic, ...government, ...news, ...blog, ...expert, ...sns];
        break;
    }

    const formattedData = this.formatCollectedData(collectedData);
    console.log('Collected and formatted data:', JSON.stringify(formattedData, null, 2));
    return formattedData;
  } catch (error) {
    console.error('Data collection error:', error);
    throw new Error('자료 수집 중 오류가 발생했습니다.');
  }
}

formatCollectedData(data) {
  return {
    count: data.length,
    sources: data.map(item => item.source),
    content: data.map(item => ({
      title: item.title,
      content: item.content,
      source: item.source,
      date: item.date
    })),
    images: []
  };
}

async collectAcademicData(topic) {
  return [{
    title: `${topic} 관련 학술 연구`,
    content: `${topic}에 대한 학술적 분석...`,
    source: '학술DB',
    date: new Date().toISOString()
  }];
}

async collectGovernmentData(topic) {
  return [{
    title: `${topic} 정부 자료`,
    content: `${topic}에 대한 정부 분석...`,
    source: '공공데이터포털',
    date: new Date().toISOString()
  }];
}

async collectNewsData(topic) {
  return [{
    title: `${topic} 관련 뉴스`,
    content: `${topic}에 대한 최신 뉴스...`,
    source: '뉴스API',
    date: new Date().toISOString()
  }];
}

async collectBlogData(topic) {
  return [{
    title: `${topic} 관련 블로그`,
    content: `${topic}에 대한 블로그 트렌드...`,
    source: '블로그/커뮤니티',
    date: new Date().toISOString()
  }];
}

async collectExpertData(topic) {
  return [{
    title: `${topic} 전문가 리뷰`,
    content: `${topic}에 대한 전문가 의견...`,
    source: '전문가/리뷰',
    date: new Date().toISOString()
  }];
}

async collectSNSData(topic) {
  return [{
    title: `${topic} SNS 트렌드`,
    content: `${topic}에 대한 SNS 반응...`,
    source: 'SNS/트렌드',
    date: new Date().toISOString()
  }];
}
}

module.exports = new DataCollector();