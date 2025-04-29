// /**
//  * This utility provides detection and extraction of quantitative data 
//  * from response content for visualization with improved error handling
//  */

// // Function to detect if content has quantitative data that should be visualized
// export const hasQuantitativeContent = (content) => {
//   if (!content) return false;
  
//   // Check for special markers
//   if (content.includes('%%GRAPH_JSON%%') || content.includes('%%TABLE_JSON%%')) {
//     return true;
//   }
  
//   // Check for numeric patterns that might indicate quantitative data
//   const numericPatterns = [
//     /\d+%/g, // Percentages
//     /\$\d+(\.\d+)?/g, // Dollar amounts
//     /\b\d+(\.\d+)?\s*(vs|versus)\s*\d+(\.\d+)?\b/gi, // Comparison patterns
//     /\b(increases?|decreases?|growth|decline)\s+by\s+\d+(\.\d+)?%/gi, // Change patterns
//     /\b(metrics|statistics|data|numbers|figures|counts|totals|sums)\b/gi, // Keywords
//     /\b(graph|chart|plot|visualization|figure)\b/gi, // Visualization keywords
//     /\b(trend|trends|timeline|historical|forecast)\b/gi, // Time-related keywords
//     /\b(compare|comparison|versus|vs)\b/gi, // Comparison keywords
//     /\b(average|mean|median|mode|standard deviation|variance)\b/gi, // Statistical terms
//     /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi, // Months
//     /\b(Q[1-4]|quarter [1-4])\b/gi, // Quarters
//     /\b(\d{4})\b/gi, // Years
//   ];
  
//   return numericPatterns.some(pattern => pattern.test(content));
// };

// // Function to extract JSON data from content
// export const extractGraphData = (content, marker = '%%GRAPH_JSON%%') => {
//   const startMarker = marker;
//   const endMarker = marker === '%%TABLE_JSON%%' ? '%%END_TABLE%%' : '%%END_GRAPH%%';
  
//   const startIndex = content.indexOf(startMarker);
//   if (startIndex === -1) return null;
  
//   const endIndex = content.indexOf(endMarker, startIndex);
//   if (endIndex === -1) return null;
  
//   const jsonString = content.substring(startIndex + startMarker.length, endIndex).trim();
  
//   try {
//     const parsedData = JSON.parse(jsonString);
    
//     // Check if the data matches the new format and convert if needed
//     if (parsedData.chartTypes && parsedData.xAxis && parsedData.yAxis) {
//       return convertNewFormatToStandard(parsedData);
//     }
    
//     return parsedData;
//   } catch (e) {
//     console.error('Failed to parse JSON data:', e);
//     return null;
//   }
// };

// // Function to convert the new JSON format to the format expected by the visualization component
// const convertNewFormatToStandard = (newFormat) => {
//   try {
//     // Handle case where chartTypes is not an array or is empty
//     const chartType = Array.isArray(newFormat.chartTypes) && newFormat.chartTypes.length > 0 
//       ? newFormat.chartTypes[0] 
//       : "line";
    
//     // Extract axis data with error handling
//     const labels = newFormat.xAxis && Array.isArray(newFormat.xAxis.data) 
//       ? newFormat.xAxis.data 
//       : [];
    
//     const data = newFormat.yAxis && Array.isArray(newFormat.yAxis.data) 
//       ? newFormat.yAxis.data 
//       : [];
    
//     // Get axis labels with fallbacks
//     const xAxisLabel = newFormat.xAxis && typeof newFormat.xAxis.label === 'string' 
//       ? newFormat.xAxis.label 
//       : "Category";
    
//     const yAxisLabel = newFormat.yAxis && typeof newFormat.yAxis.label === 'string' 
//       ? newFormat.yAxis.label 
//       : "Value";
    
//     // Extract title if available
//     const title = newFormat.title || "Data Visualization";
    
//     // Calculate domain for the chart (min and max values for the y-axis)
//     const numericData = data.filter(val => !isNaN(parseFloat(val))).map(val => parseFloat(val));
//     const domain = numericData.length > 0 
//       ? [0, Math.ceil(Math.max(...numericData) * 1.1)] 
//       : [0, 100];
    
//     // Create the standard format expected by the visualization component
//     return {
//       chartType: chartType,
//       title: title,
//       xAxisLabel: xAxisLabel,
//       yAxisLabel: yAxisLabel,
//       labels: labels,
//       datasets: [
//         {
//           label: yAxisLabel,
//           data: data,
//           borderColor: "#4e73df",
//           backgroundColor: "rgba(78, 115, 223, 0.5)"
//         }
//       ],
//       options: {
//         barSize: 30,
//         innerRadius: 0,
//         shape: "rectangle",
//         domain: domain
//       }
//     };
//   } catch (e) {
//     console.error('Failed to convert new format to standard:', e);
    
//     // Return a minimal valid chart structure as fallback
//     return {
//       chartType: "line",
//       title: "Data Visualization",
//       xAxisLabel: "Category",
//       yAxisLabel: "Value",
//       labels: [],
//       datasets: [{
//         label: "Values",
//         data: [],
//         borderColor: "#4e73df",
//         backgroundColor: "rgba(78, 115, 223, 0.5)"
//       }],
//       options: {
//         domain: [0, 100]
//       }
//     };
//   }
// };

// // Function to clean content by removing JSON blocks
// export const cleanJsonBlocks = (content) => {
//   if (!content) return '';
  
//   return content
//     .replace(/%%GRAPH_JSON%%[\s\S]*?%%END_GRAPH%%/g, '')
//     .replace(/%%TABLE_JSON%%[\s\S]*?%%END_TABLE%%/g, '')
//     .trim();
// };

// // Function to generate visualization data from text content with numeric information
// export const generateVisualizationData = (content) => {
//   try {
//     // Check if content contains JSON string matching our expected format
//     const jsonRegex = /\{[\s\S]*?"chartTypes"[\s\S]*?"xAxis"[\s\S]*?"yAxis"[\s\S]*?\}/;
//     const jsonMatch = content.match(jsonRegex);
    
//     if (jsonMatch) {
//       try {
//         const jsonData = JSON.parse(jsonMatch[0]);
//         return convertNewFormatToStandard(jsonData);
//       } catch (e) {
//         console.error('Failed to parse embedded JSON:', e);
//         // Continue with regular extraction if JSON parsing fails
//       }
//     }
    
//     // Extract numeric data patterns
//     const numbers = content.match(/\d+(\.\d+)?/g) || [];
//     const uniqueNumbers = [...new Set(numbers.map(Number))].slice(0, 8);
    
//     // Try to extract time-related labels (months, years, quarters)
//     const timeLabels = [];
//     const monthRegex = /\b(January|February|March|April|May|June|July|August|September|October|November|December)( \d{4})?\b/gi;
//     const yearRegex = /\b(20\d{2}|19\d{2})\b/g;
//     const quarterRegex = /\b(Q[1-4]|quarter [1-4])( \d{4})?\b/gi;
    
//     let match;
//     while ((match = monthRegex.exec(content)) !== null && timeLabels.length < uniqueNumbers.length) {
//       timeLabels.push(match[0]);
//     }
    
//     if (timeLabels.length < uniqueNumbers.length) {
//       while ((match = yearRegex.exec(content)) !== null && timeLabels.length < uniqueNumbers.length) {
//         timeLabels.push(match[0]);
//       }
//     }
    
//     if (timeLabels.length < uniqueNumbers.length) {
//       while ((match = quarterRegex.exec(content)) !== null && timeLabels.length < uniqueNumbers.length) {
//         timeLabels.push(match[0]);
//       }
//     }
    
//     // Fill remaining labels if needed
//     while (timeLabels.length < uniqueNumbers.length) {
//       timeLabels.push(`Item ${timeLabels.length + 1}`);
//     }
    
//     // Try to determine chart type based on content
//     let chartType = "line"; // Default to line chart as requested
    
//     // Return visualization data in the format expected by GraphRenderer
//     return {
//       chartType: chartType,
//       title: extractTitle(content) || "Data Visualization",
//       xAxisLabel: chartType === "scatter" ? "X Value" : (chartType === "bar" || chartType === "line" ? "Category" : ""),
//       yAxisLabel: chartType === "scatter" ? "Y Value" : (chartType === "bar" || chartType === "line" ? "Value" : ""),
//       labels: timeLabels,
//       datasets: [
//         {
//           label: extractDatasetLabel(content) || "Values",
//           data: uniqueNumbers,
//           borderColor: "#4e73df",
//           backgroundColor: "rgba(78, 115, 223, 0.5)"
//         }
//       ],
//       options: {
//         barSize: 30,
//         innerRadius: 0,
//         shape: "rectangle",
//         domain: [0, Math.ceil(Math.max(...uniqueNumbers) * 1.1)]
//       }
//     };
//   } catch (e) {
//     console.error('Error generating visualization data:', e);
//     return null;
//   }
// };

// // Function to extract dataset label from content
// const extractDatasetLabel = (content) => {
//   try {
//     // Look for common patterns like "data shows [something]" or "[something] metrics"
//     const labelPatterns = [
//       /data\s+shows?\s+([a-z0-9\s]+)/i,
//       /statistics\s+(?:for|on)\s+([a-z0-9\s]+)/i,
//       /([a-z0-9\s]+)\s+metrics/i,
//       /([a-z0-9\s]+)\s+figures/i,
//       /([a-z0-9\s]+)\s+(?:rate|rates)/i,
//       /([a-z0-9\s]+)\s+(?:trend|trends)/i,
//       /tracking\s+([a-z0-9\s]+)/i,
//       /usage/i // Added for your specific example
//     ];
    
//     for (const pattern of labelPatterns) {
//       const match = content.match(pattern);
//       if (match && match[1]) {
//         // Limit length and clean up
//         return match[1].trim().slice(0, 30);
//       }
//     }
    
//     // Check if "Usage" is specifically mentioned anywhere
//     if (content.includes("Usage")) {
//       return "Usage";
//     }
    
//     return null;
//   } catch (e) {
//     console.error('Error extracting dataset label:', e);
//     return "Values";
//   }
// };

// // Function to extract chart title from content
// const extractTitle = (content) => {
//   try {
//     // Look for sentences that might indicate the topic
//     const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
    
//     if (sentences.length > 0) {
//       // Try to find a sentence containing key visualization terms
//       const vizTerms = ['chart', 'graph', 'data', 'statistic', 'figure', 'trend', 'analyze', 'compare', 'usage'];
      
//       const vizSentence = sentences.find(s => 
//         vizTerms.some(term => s.toLowerCase().includes(term))
//       );
      
//       if (vizSentence) {
//         return truncateTitle(vizSentence.trim());
//       }
      
//       // Otherwise just use the first sentence
//       return truncateTitle(sentences[0].trim());
//     }
    
//     return "Usage Over Time";
//   } catch (e) {
//     console.error('Error extracting title:', e);
//     return "Data Visualization";
//   }
// };

// // Function to truncate and clean up a title
// const truncateTitle = (title) => {
//   try {
//     // Remove common starting phrases
//     const cleanTitle = title
//       .replace(/^(here is|this is|the following|as you can see|looking at|based on|according to|the data shows)/i, '')
//       .trim();
    
//     // Limit length
//     return cleanTitle.length > 50 ? cleanTitle.slice(0, 47) + '...' : cleanTitle;
//   } catch (e) {
//     console.error('Error truncating title:', e);
//     return title;
//   }
// };

// // Function to create line chart JSON in the expected format
// export const createLineChartJson = (title, xLabels, yValues, xAxisLabel = "Month", yAxisLabel = "Usage") => {
//   try {
//     if (!Array.isArray(xLabels) || !Array.isArray(yValues)) {
//       throw new Error("Labels and values must be arrays");
//     }
    
//     if (xLabels.length !== yValues.length) {
//       throw new Error("Labels and values arrays must have the same length");
//     }
    
//     // Calculate bounds for y-axis with error handling
//     const validYValues = yValues.filter(v => !isNaN(parseFloat(v))).map(v => parseFloat(v));
//     const yMax = validYValues.length > 0 ? Math.ceil(Math.max(...validYValues) * 1.1) : 100;
    
//     return {
//       chartType: "line",
//       title: title || "Usage Over Time",
//       xAxisLabel: xAxisLabel,
//       yAxisLabel: yAxisLabel,
//       labels: xLabels,
//       datasets: [
//         {
//           label: yAxisLabel,
//           data: yValues,
//           borderColor: "#4e73df",
//           backgroundColor: "rgba(78, 115, 223, 0.5)"
//         }
//       ],
//       options: {
//         domain: [0, yMax]
//       }
//     };
//   } catch (e) {
//     console.error('Error creating line chart JSON:', e);
//     return null;
//   }
// };

// // Function to embed visualization JSON in markdown content
// export const embedVisualizationJson = (content, jsonData) => {
//   try {
//     if (!jsonData) return content;
    
//     const jsonStr = JSON.stringify(jsonData, null, 2);
//     return `${content}\n\n%%GRAPH_JSON%%${jsonStr}%%END_GRAPH%%`;
//   } catch (e) {
//     console.error('Error embedding visualization JSON:', e);
//     return content;
//   }
// };

// // Function to parse the specific JSON format from the example
// export const parseSpecificJsonFormat = (jsonString) => {
//   try {
//     const parsedData = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    
//     // Validate the expected structure
//     if (!parsedData.chartTypes || !Array.isArray(parsedData.chartTypes) ||
//         !parsedData.xAxis || !parsedData.xAxis.data || !Array.isArray(parsedData.xAxis.data) ||
//         !parsedData.yAxis || !parsedData.yAxis.data || !Array.isArray(parsedData.yAxis.data)) {
//       throw new Error("Invalid JSON structure");
//     }
    
//     // Convert to the format expected by visualization components
//     return createLineChartJson(
//       "Usage Over Time",
//       parsedData.xAxis.data,
//       parsedData.yAxis.data,
//       parsedData.xAxis.label,
//       parsedData.yAxis.label
//     );
//   } catch (e) {
//     console.error('Error parsing specific JSON format:', e);
//     return null;
//   }
// };

// // Function to extract and convert the specific JSON format from text content
// export const extractSpecificJsonFormat = (content) => {
//   try {
//     // Regular expression to find JSON-like structures in the content
//     const jsonRegex = /\{[\s\S]*?"chartTypes"[\s\S]*?"xAxis"[\s\S]*?"yAxis"[\s\S]*?\}/;
//     const match = content.match(jsonRegex);
    
//     if (match) {
//       const jsonString = match[0];
//       return parseSpecificJsonFormat(jsonString);
//     }
    
//     return null;
//   } catch (e) {
//     console.error('Error extracting specific JSON format:', e);
//     return null;
//   }
// };

// // Function to prepare JSON for visualization and remove from content
// export const prepareVisualizationData = (content) => {
//   try {
//     // Try to parse the specific JSON format first
//     const specificFormat = extractSpecificJsonFormat(content);
//     if (specificFormat) {
//       return {
//         cleanedContent: content,
//         visualizationData: specificFormat
//       };
//     }
    
//     // Check if content already has embedded JSON
//     const graphData = extractGraphData(content, '%%GRAPH_JSON%%');
//     if (graphData) {
//       return {
//         cleanedContent: cleanJsonBlocks(content),
//         visualizationData: graphData
//       };
//     }
    
//     // Generate visualization data if content is quantitative
//     if (hasQuantitativeContent(content)) {
//       return {
//         cleanedContent: content,
//         visualizationData: generateVisualizationData(content)
//       };
//     }
    
//     return {
//       cleanedContent: content,
//       visualizationData: null
//     };
//   } catch (e) {
//     console.error('Error preparing visualization data:', e);
//     return {
//       cleanedContent: content,
//       visualizationData: null
//     };
//   }
// };

// // Export a utility for handling intent detection for quantitative questions
// export const detectQuantitativeIntent = (text) => {
//   try {
//     if (!text) return false;
    
//     const quantitativePatterns = [
//       /\b(show|display|visualize|graph|chart|plot)\b.*\b(data|numbers|statistics|trends)\b/i,
//       /\b(how many|how much|statistics|metrics|trends|performance|usage)\b/i,
//       /\b(compare|analysis|analyze|measure|track|monitor)\b/i,
//       /\b(increase|decrease|growth|decline|change over time)\b/i,
//       /\b(forecast|predict|projection|outlook|future trend)\b/i
//     ];
    
//     return quantitativePatterns.some(pattern => pattern.test(text));
//   } catch (e) {
//     console.error('Error detecting quantitative intent:', e);
//     return false;
//   }
// };