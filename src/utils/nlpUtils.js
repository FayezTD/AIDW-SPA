export function extractEntities(content) {
    const entities = [];
  
    const companyRegex = /\b(Bajaj|Starbucks|AB InBev|PepsiCo|ABN AMRO|AIDW)\b/gi;
    let match;
    while ((match = companyRegex.exec(content)) !== null) {
      entities.push({ type: 'company', value: match[0], confidence: 1.0 });
    }
  
    const techRegex = /\b(Azure|OpenAI|AI|ConnectAI|PepGenX|ECM|integration)\b/gi;
    while ((match = techRegex.exec(content)) !== null) {
      entities.push({ type: 'technology', value: match[0], confidence: 1.0 });
    }
  
    return entities;
  }
  
  export function classifyQuestionIntent(content) {
    const lowerContent = content.toLowerCase();
  
    if (lowerContent.includes('compare') || lowerContent.includes('versus') || lowerContent.includes(' vs ')) {
      return 'comparison';
    } else if (lowerContent.match(/\bin\s+(points|table|list|bullet)/i)) {
      return 'formatting';
    } else if (lowerContent.startsWith('how') || lowerContent.includes('explain')) {
      return 'explanation';
    } else if (lowerContent.startsWith('what') || lowerContent.startsWith('who') || lowerContent.startsWith('when')) {
      return 'information';
    } else if (lowerContent.startsWith('can') || lowerContent.startsWith('could') || lowerContent.startsWith('would')) {
      return 'capability';
    } else {
      return 'general';
    }
  }
  