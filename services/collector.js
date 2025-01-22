const axios = require('axios');

class DataCollector {
  async collectData(topic, searchRange) {
    try {
      // 데이터 수집 전 로그
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
        case 'all':
          const [academic, government, news] = await Promise.all([
            this.collectAcademicData(topic),
            this.collectGovernmentData(topic),
            this.collectNewsData(topic)
          ]);
          collectedData = [...academic, ...government, ...news];
          break;
      }

      const formattedData = this.formatCollectedData(collectedData);
      
      // 반환되는 데이터 구조 확인
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
      }))
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
}

module.exports = new DataCollector();