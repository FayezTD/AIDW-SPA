import React, { useState, useEffect } from 'react';
import { 
  LineChart, BarChart, PieChart, AreaChart, ScatterChart,
  Line, Bar, Pie, Area, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Treemap, Sector
} from 'recharts';

const GraphRenderer = ({ data, height = 400, width = '100%', className = '' }) => {
  const [chartType, setChartType] = useState('bar');
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    // Set initial chart type from data if provided
    if (data && data.chartType) {
      setChartType(data.chartType);
    }
  }, [data]);

  // Error handling for invalid data
  if (!data) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-md">No chart data provided</div>;
  }
  
  if (!data.datasets || !Array.isArray(data.datasets) || !data.datasets.length) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-md">Invalid chart data structure</div>;
  }

  const { datasets, labels, title, xAxisLabel, yAxisLabel, options } = data;
  
  // Format data for Recharts
  const formattedData = labels ? 
    labels.map((label, index) => {
      const dataPoint = { name: label };
      datasets.forEach(dataset => {
        if (dataset.data && dataset.data[index] !== undefined) {
          dataPoint[dataset.label || `Series ${index + 1}`] = dataset.data[index];
        }
      });
      return dataPoint;
    }) : 
    chartType === 'scatter' ? 
      datasets.flatMap((dataset, i) => 
        dataset.data.map(point => ({ 
          ...point, 
          series: dataset.label || `Series ${i + 1}` 
        }))
      ) : 
      datasets;

  // Generate colors for datasets
  const defaultColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', 
    '#00C49F', '#FFBB28', '#FF8042', '#6b486b', '#a05d56',
    '#d0743c', '#ff8c00', '#8a89a6', '#7b6888', '#6b486b'
  ];
  
  // Animated button style classes
  const buttonBaseClass = "px-3 py-2 mx-1 my-2 rounded-md text-sm font-medium transition-all duration-200";
  const buttonActiveClass = "bg-blue-600 text-white shadow-md";
  const buttonInactiveClass = "bg-gray-200 text-gray-700 hover:bg-gray-300";
  
  // Chart type selector buttons
  const renderChartSelector = () => (
    <div className="chart-controls flex flex-wrap justify-center mb-4">
      {['bar', 'line', 'pie', 'area', 'scatter', 'radar', 'composed', 'treemap'].map(type => (
        <button 
          key={type}
          className={`${buttonBaseClass} ${chartType === type ? buttonActiveClass : buttonInactiveClass}`}
          onClick={() => setChartType(type)}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  );

  // Handle pie chart interaction
  const handlePieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Custom tooltip for better display
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-md">
        <p className="label font-medium">{`${label || ''}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  };
  
  // Active shape for pie chart
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="#333" fontSize={16}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#999" fontSize={14}>
          {`${value} (${(percent * 100).toFixed(1)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  // Render different chart types
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width={width} height={height}>
            <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                label={{ value: xAxisLabel || '', position: 'bottom', offset: 10 }}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              {datasets.map((dataset, index) => (
                <Line 
                  key={index}
                  type="monotone"
                  dataKey={dataset.label || `Series ${index + 1}`}
                  stroke={dataset.borderColor || defaultColors[index % defaultColors.length]}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width={width} height={height}>
            <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                label={{ value: xAxisLabel || '', position: 'bottom', offset: 10 }}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              {datasets.map((dataset, index) => (
                <Bar 
                  key={index}
                  dataKey={dataset.label || `Series ${index + 1}`}
                  fill={dataset.backgroundColor || defaultColors[index % defaultColors.length]}
                  radius={[4, 4, 0, 0]}
                  barSize={options?.barSize || 20}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        // For pie charts, data structure is different
        const pieData = labels ? 
          labels.map((label, index) => ({
            name: label,
            value: datasets[0].data[index],
            color: datasets[0].backgroundColor?.[index] || defaultColors[index % defaultColors.length]
          })) : formattedData;
        
        return (
          <ResponsiveContainer width={width} height={height}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={height / 3}
                innerRadius={options?.innerRadius || 0}
                dataKey="value"
                onMouseEnter={handlePieEnter}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || defaultColors[index % defaultColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width={width} height={height}>
            <AreaChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <defs>
                {datasets.map((dataset, index) => {
                  const color = dataset.backgroundColor || defaultColors[index % defaultColors.length];
                  return (
                    <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                label={{ value: xAxisLabel || '', position: 'bottom', offset: 10 }}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              {datasets.map((dataset, index) => (
                <Area 
                  key={index}
                  type="monotone"
                  dataKey={dataset.label || `Series ${index + 1}`}
                  fill={`url(#color${index})`}
                  stroke={dataset.borderColor || defaultColors[index % defaultColors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        // Format data for scatter plot
        const scatterData = datasets.map((dataset, datasetIndex) => {
          const color = dataset.backgroundColor || defaultColors[datasetIndex % defaultColors.length];
          return {
            name: dataset.label || `Series ${datasetIndex + 1}`,
            color,
            data: Array.isArray(dataset.data) ? dataset.data.map(item => ({
              x: item.x !== undefined ? item.x : item[0],
              y: item.y !== undefined ? item.y : item[1],
            })) : []
          };
        });
        
        return (
          <ResponsiveContainer width={width} height={height}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={xAxisLabel || 'X'} 
                label={{ value: xAxisLabel || 'X', position: 'bottom', offset: 10 }}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={yAxisLabel || 'Y'} 
                label={{ value: yAxisLabel || 'Y', angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              {scatterData.map((dataset, index) => (
                <Scatter 
                  key={index}
                  name={dataset.name}
                  data={dataset.data}
                  fill={dataset.color}
                  shape={options?.shape || "circle"}
                >
                  {dataset.data.map((entry, pointIndex) => (
                    <Cell key={`cell-${pointIndex}`} fill={dataset.color} />
                  ))}
                </Scatter>
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer width={width} height={height}>
            <RadarChart outerRadius={height / 3} data={formattedData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={options?.domain || [0, 'auto']} />
              {datasets.map((dataset, index) => (
                <Radar
                  key={index}
                  name={dataset.label || `Series ${index + 1}`}
                  dataKey={dataset.label || `Series ${index + 1}`}
                  stroke={dataset.borderColor || defaultColors[index % defaultColors.length]}
                  fill={dataset.backgroundColor || defaultColors[index % defaultColors.length]}
                  fillOpacity={0.5}
                />
              ))}
              <Legend verticalAlign="bottom" height={36} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        );
        
      case 'composed':
        return (
          <ResponsiveContainer width={width} height={height}>
            <ComposedChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis 
                dataKey="name" 
                label={{ value: xAxisLabel || '', position: 'bottom', offset: 10 }}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              {datasets.map((dataset, index) => {
                const type = dataset.type || (index === 0 ? 'bar' : 'line');
                const color = dataset.backgroundColor || defaultColors[index % defaultColors.length];
                const borderColor = dataset.borderColor || color;
                
                switch (type) {
                  case 'bar':
                    return (
                      <Bar 
                        key={index}
                        dataKey={dataset.label || `Series ${index + 1}`}
                        fill={color}
                        radius={[4, 4, 0, 0]}
                        barSize={options?.barSize || 20}
                      />
                    );
                  case 'line':
                    return (
                      <Line 
                        key={index}
                        type="monotone"
                        dataKey={dataset.label || `Series ${index + 1}`}
                        stroke={borderColor}
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    );
                  case 'area':
                    return (
                      <Area 
                        key={index}
                        type="monotone"
                        dataKey={dataset.label || `Series ${index + 1}`}
                        fill={color}
                        stroke={borderColor}
                        fillOpacity={0.3}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      case 'treemap':
        // Format data for treemap
        const treeMapData = {
          name: 'Root',
          children: labels ? 
            labels.map((label, index) => ({
              name: label,
              size: datasets[0].data[index],
              color: datasets[0].backgroundColor?.[index] || defaultColors[index % defaultColors.length]
            })) : 
            datasets[0].data.map((value, index) => ({
              name: `Item ${index + 1}`,
              size: value,
              color: datasets[0].backgroundColor?.[index] || defaultColors[index % defaultColors.length]
            }))
        };
        
        return (
          <ResponsiveContainer width={width} height={height}>
            <Treemap
              data={treeMapData}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#8884d8"
            >
              {treeMapData.children.map((item, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={item.color || defaultColors[index % defaultColors.length]} 
                />
              ))}
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="text-red-500">Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <div className={`graph-renderer bg-white rounded-lg shadow-md p-4 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-center mb-4">{title}</h3>}
      {renderChartSelector()}
      <div className="chart-container">{renderChart()}</div>
    </div>
  );
};

export default GraphRenderer;