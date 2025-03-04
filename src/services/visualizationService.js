// Service for processing visualization elements in markdown content
// import Chart from 'chart.js/auto';

class VisualizationService {
  /**
   * Process all visualizations in the response
   * @param {string} answer - The response text
   * @return {string} - Processed response with visualization tags
   */
  static processAllVisualizations(answer) {
    if (!answer) return '';
    
    // Log the raw answer for debugging
    console.log('Processing visualizations for answer:', answer);
    
    try {
      let processedAnswer = answer;
      // Process in order: charts first, then tables, then general markdown
      processedAnswer = this.processCharts(processedAnswer);
      processedAnswer = this.processTables(processedAnswer);
      processedAnswer = this.processMarkdown(processedAnswer);
      return processedAnswer;
    } catch (error) {
      console.error('Error processing visualizations:', error);
      return answer; // Return original answer if processing fails
    }
  }

  /**
   * Process chart markup and convert to Chart.js components
   * @param {string} text - Input text with chart placeholders
   * @return {string} - Processed text with chart components
   */
  static processCharts(text) {
    if (!text) return '';
    
    // Match different chart types with different patterns
    const chartPatterns = [
      { type: 'bar', pattern: /{barchart:(.*?)}/gs },
      { type: 'line', pattern: /{linechart:(.*?)}/gs },
      { type: 'pie', pattern: /{piechart:(.*?)}/gs },
      { type: 'doughnut', pattern: /{doughnutchart:(.*?)}/gs },
      { type: 'radar', pattern: /{radarchart:(.*?)}/gs },
      { type: 'polar', pattern: /{polarchart:(.*?)}/gs },
      { type: 'scatter', pattern: /{scatterchart:(.*?)}/gs },
      { type: 'bubble', pattern: /{bubblechart:(.*?)}/gs },
      // Generic chart pattern for any other type
      { type: 'generic', pattern: /{chart:(.*?)}/gs }
    ];
    
    let processedText = text;
    
    // Process each chart type
    chartPatterns.forEach(({ type, pattern }) => {
      let matches = [...text.matchAll(pattern)];
      
      if (matches.length > 0) {
        console.log(`Found ${matches.length} ${type} chart patterns to process`);
      }
      
      matches.forEach((match, index) => {
        try {
          console.log(`Processing ${type} chart ${index + 1}:`, match[1]);
          const chartData = JSON.parse(match[1]);
          
          // For generic charts, use the type specified in the data
          const chartType = type === 'generic' ? (chartData.type || 'bar') : type;
          
          // Generate a unique ID for the chart
          const chartId = `chart-${chartType}-${Date.now()}-${index}`;
          
          // Create chart component
          const chartComponent = this.generateChartComponent(chartId, chartType, chartData);
          
          // Replace the match with the chart component
          processedText = processedText.replace(match[0], chartComponent);
        } catch (error) {
          console.error(`Error processing ${type} chart ${index + 1}:`, error);
          processedText = processedText.replace(match[0], '');
        }
      });
    });
    
    return processedText;
  }

  /**
   * Process table markup and convert to markdown tables
   * @param {string} text - Input text with table placeholders
   * @return {string} - Processed text with markdown tables
   */
  static processTables(text) {
    if (!text) return '';
    
    const tablePattern = /{table:(.*?)}/gs;
    let processedText = text;
    let matches = [...text.matchAll(tablePattern)];
    
    if (matches.length > 0) {
      console.log(`Found ${matches.length} table patterns to process`);
    }
    
    matches.forEach((match, index) => {
      try {
        console.log(`Processing table ${index + 1}:`, match[1]);
        const tableData = JSON.parse(match[1]);
        const markdownTable = this.generateMarkdownTable(tableData);
        processedText = processedText.replace(match[0], markdownTable);
      } catch (error) {
        console.error(`Error processing table ${index + 1}:`, error);
        processedText = processedText.replace(match[0], '');
      }
    });
    
    return processedText;
  }

  /**
   * Process general markdown formatting
   * @param {string} text - Input text
   * @return {string} - Processed text with proper markdown
   */
  static processMarkdown(text) {
    if (!text) return '';
    
    let processedText = text;
    
    // Handle citations if they're in the text but not properly formatted
    if (text.includes('**Citations:**')) {
      const citationsSection = text.split('**Citations:**')[1];
      if (citationsSection && !citationsSection.trim().startsWith('\n')) {
        processedText = processedText.replace('**Citations:**', '**Citations:**\n');
      }
    }
    
    return processedText;
  }

  /**
   * Convert table JSON data to markdown format
   * @param {Object} tableData - Table data object
   * @return {string} - Markdown table
   */
  static generateMarkdownTable(tableData) {
    const headers = tableData.headers || [];
    const rows = tableData.rows || [];
    
    if (headers.length === 0) {
      console.warn('Table has no headers');
      return '';
    }
    
    let markdownTable = '| ' + headers.join(' | ') + ' |\n';
    markdownTable += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    
    rows.forEach(row => {
      markdownTable += '| ' + row.map(cell => String(cell || '')).join(' | ') + ' |\n';
    });
    
    return markdownTable;
  }

  /**
   * Generate a chart component with Chart.js
   * @param {string} chartId - Unique ID for the chart
   * @param {string} chartType - Type of chart (bar, line, pie, etc.)
   * @param {Object} chartData - Chart data and configuration
   * @return {string} - HTML and JavaScript for the chart
   */
  static generateChartComponent(chartId, chartType, chartData) {
    // Sanitize and prepare chart data
    const labels = chartData.labels || [];
    const datasets = chartData.datasets || [];
    const title = chartData.title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`;
    const options = chartData.options || {};
    
    // Create a div for the chart with a canvas inside
    const chartContainer = `
<div class="chart-container" style="position: relative; height: ${chartData.height || '400px'}; width: ${chartData.width || '100%'}; margin: 20px 0;">
  <canvas id="${chartId}"></canvas>
</div>
<script>
  (function() {
    // Wait for the DOM to be ready
    const renderChart = function() {
      const ctx = document.getElementById('${chartId}');
      if (!ctx) {
        console.error('Cannot find canvas element with id: ${chartId}');
        return;
      }
      
      try {
        // Chart configuration
        const config = {
          type: '${chartType}',
          data: {
            labels: ${JSON.stringify(labels)},
            datasets: ${JSON.stringify(datasets)}
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: '${title.replace(/'/g, "\\'")}',
                font: {
                  size: 16
                }
              },
              legend: {
                position: '${options.legendPosition || 'top'}'
              },
              tooltip: {
                enabled: true
              }
            },
            ${chartType === 'pie' || chartType === 'doughnut' ? '' : `
            scales: {
              x: {
                display: true,
                title: {
                  display: ${Boolean(options.xTitle)},
                  text: '${(options.xTitle || '').replace(/'/g, "\\'")}'
                }
              },
              y: {
                display: true,
                title: {
                  display: ${Boolean(options.yTitle)},
                  text: '${(options.yTitle || '').replace(/'/g, "\\'")}'
                },
                ${options.beginAtZero === false ? '' : 'beginAtZero: true,'}
                ${options.suggestedMax ? `suggestedMax: ${options.suggestedMax},` : ''}
                ${options.suggestedMin ? `suggestedMin: ${options.suggestedMin}` : ''}
              }
            }
            `}
          }
        };
        
        // Create the chart
        new Chart(ctx, config);
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    };
    
    // Check if document is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(renderChart, 100);
    } else {
      document.addEventListener('DOMContentLoaded', renderChart);
    }
  })();
</script>
`;

    return chartContainer;
  }

  /**
   * Utility function to create a bar chart JSON configuration
   * @param {Object} data - The data for the bar chart
   * @return {Object} - Formatted chart data
   */
  static createBarChartData(data) {
    return JSON.stringify({
      labels: data.labels,
      datasets: [
        {
          label: data.label || 'Data',
          data: data.values,
          backgroundColor: data.colors || [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: data.borderColors || [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: data.borderWidth || 1
        }
      ],
      title: data.title || 'Bar Chart',
      options: {
        xTitle: data.xAxisLabel || '',
        yTitle: data.yAxisLabel || '',
        legendPosition: data.legendPosition || 'top',
        beginAtZero: data.beginAtZero !== false
      },
      height: data.height || '400px',
      width: data.width || '100%'
    });
  }

  /**
   * Utility function to create a line chart JSON configuration
   * @param {Object} data - The data for the line chart
   * @return {Object} - Formatted chart data
   */
  static createLineChartData(data) {
    return JSON.stringify({
      labels: data.labels,
      datasets: data.series ? data.series.map((series, index) => ({
        label: series.label || `Series ${index + 1}`,
        data: series.values,
        fill: series.fill !== undefined ? series.fill : false,
        borderColor: series.color || this.getDefaultColor(index),
        tension: series.tension || 0.1
      })) : [
        {
          label: data.label || 'Data',
          data: data.values,
          fill: data.fill !== undefined ? data.fill : false,
          borderColor: data.color || 'rgba(75, 192, 192, 1)',
          tension: data.tension || 0.1
        }
      ],
      title: data.title || 'Line Chart',
      options: {
        xTitle: data.xAxisLabel || '',
        yTitle: data.yAxisLabel || '',
        legendPosition: data.legendPosition || 'top',
        beginAtZero: data.beginAtZero !== false
      },
      height: data.height || '400px',
      width: data.width || '100%'
    });
  }

  /**
   * Utility function to create a pie chart JSON configuration
   * @param {Object} data - The data for the pie chart
   * @return {Object} - Formatted chart data
   */
  static createPieChartData(data) {
    return JSON.stringify({
      labels: data.labels,
      datasets: [
        {
          label: data.label || 'Data',
          data: data.values,
          backgroundColor: data.colors || [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: data.borderColors || [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: data.borderWidth || 1
        }
      ],
      title: data.title || 'Pie Chart',
      options: {
        legendPosition: data.legendPosition || 'right'
      },
      height: data.height || '400px',
      width: data.width || '100%'
    });
  }

  /**
   * Get a default color for a dataset based on index
   * @param {number} index - The index of the dataset
   * @return {string} - Color in rgba format
   */
  static getDefaultColor(index) {
    const colors = [
      'rgba(75, 192, 192, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)'
    ];
    return colors[index % colors.length];
  }
}

export default VisualizationService;