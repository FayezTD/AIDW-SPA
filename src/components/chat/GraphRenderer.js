import React, { useState } from 'react';
import { 
  LineChart, BarChart, PieChart, AreaChart, ScatterChart,
  Line, Bar, Pie, Area, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const GraphRenderer = ({ data }) => {
  const [chartType, setChartType] = useState(data.chartType || 'bar');
  
  // Validate the data structure
  if (!data || !data.datasets || !Array.isArray(data.datasets) || !data.datasets.length) {
    return <div className="text-red-500">Invalid chart data</div>;
  }

  const { datasets, labels, title, xAxisLabel, yAxisLabel } = data;
  
  // Format data for Recharts if needed
  const formattedData = labels ? 
    labels.map((label, index) => {
      const dataPoint = { name: label };
      datasets.forEach(dataset => {
        if (dataset.data && dataset.data[index] !== undefined) {
          dataPoint[dataset.label || `Series ${index}`] = dataset.data[index];
        }
      });
      return dataPoint;
    }) : datasets;

  // Generate colors for datasets if not provided
  const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Simple toggle between chart types
  const renderChartSelector = () => (
    <div className="chart-controls">
      <button 
        className={`chart-control-button ${chartType === 'bar' ? 'active' : ''}`}
        onClick={() => setChartType('bar')}
      >
        Bar
      </button>
      <button 
        className={`chart-control-button ${chartType === 'line' ? 'active' : ''}`}
        onClick={() => setChartType('line')}
      >
        Line
      </button>
      <button 
        className={`chart-control-button ${chartType === 'pie' ? 'active' : ''}`}
        onClick={() => setChartType('pie')}
      >
        Pie
      </button>
      <button 
        className={`chart-control-button ${chartType === 'area' ? 'active' : ''}`}
        onClick={() => setChartType('area')}
      >
        Area
      </button>
      <button 
        className={`chart-control-button ${chartType === 'scatter' ? 'active' : ''}`}
        onClick={() => setChartType('scatter')}
      >
        Scatter
      </button>
    </div>
  );

  // Render different chart types
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" label={{ value: xAxisLabel || '', position: 'bottom', offset: 0 }} />
              <YAxis label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" />
              {datasets.map((dataset, index) => (
                <Line 
                  key={index}
                  type="monotone"
                  dataKey={dataset.label || `Series ${index}`}
                  stroke={dataset.borderColor || defaultColors[index % defaultColors.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" label={{ value: xAxisLabel || '', position: 'bottom', offset: 0 }} />
              <YAxis label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" />
              {datasets.map((dataset, index) => (
                <Bar 
                  key={index}
                  dataKey={dataset.label || `Series ${index}`}
                  fill={dataset.backgroundColor || defaultColors[index % defaultColors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        // For pie charts, data structure is different
        const pieData = labels ? 
          labels.map((label, index) => {
            return {
              name: label,
              value: datasets[0].data[index]
            };
          }) : formattedData;
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" label={{ value: xAxisLabel || '', position: 'bottom', offset: 0 }} />
              <YAxis label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" />
              {datasets.map((dataset, index) => (
                <Area 
                  key={index}
                  type="monotone"
                  dataKey={dataset.label || `Series ${index}`}
                  fill={dataset.backgroundColor || defaultColors[index % defaultColors.length]}
                  stroke={dataset.borderColor || defaultColors[index % defaultColors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name={xAxisLabel || 'X'} />
              <YAxis type="number" dataKey="y" name={yAxisLabel || 'Y'} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend verticalAlign="top" />
              {datasets.map((dataset, index) => (
                <Scatter 
                  key={index}
                  name={dataset.label || `Series ${index}`}
                  data={dataset.data || []}
                  fill={dataset.backgroundColor || defaultColors[index % defaultColors.length]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div>Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <div className="graph-renderer">
      {title && <h3 className="title">{title}</h3>}
      {renderChartSelector()}
      {renderChart()}
    </div>
  );
};

export default GraphRenderer;