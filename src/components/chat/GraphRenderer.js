import React, { useState, useRef, useEffect } from 'react';
import { 
  LineChart, BarChart, PieChart, Pie, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const GraphRenderer = ({ mapData, height = 400, width = '100%', className = '' }) => {
  const [chartType, setChartType] = useState('bar');
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  // New state for tracking active filters
  const [activeFilters, setActiveFilters] = useState({});
  // New state for tracking if all filters are disabled (show all data)
  const [showAllData, setShowAllData] = useState(true);
  
  // Debug the incoming data
  useEffect(() => {
    console.log('GraphRenderer received mapData:', mapData);
  }, [mapData]);
  
  // Initialize filters when mapData changes
  useEffect(() => {
    if (mapData && mapData.series && Array.isArray(mapData.series)) {
      const initialFilters = {};
      mapData.series.forEach(series => {
        if (series.name) {
          initialFilters[series.name] = true;
        }
      });
      setActiveFilters(initialFilters);
      setShowAllData(true);
    }
  }, [mapData]);
  
  // Process data for recharts from map_data format
  const processedData = React.useMemo(() => {
    // Bail early if no data
    if (!mapData) {
      console.warn('No mapData provided to GraphRenderer');
      return null;
    }
    
    try {
      let formattedData = [];
      let multiSeriesData = [];
      let isMultiSeries = false;
      
      // Debug what's coming in
      console.log('Processing map data:', JSON.stringify(mapData));
      
      // Check if we have series data (multi-series format)
      if (mapData.series && Array.isArray(mapData.series) && mapData.series.length > 0) {
        isMultiSeries = true;
        
        // For bar and line charts with multiple series
        if (mapData.xAxis && Array.isArray(mapData.xAxis.data)) {
          // Create data points for each x-axis label
          mapData.xAxis.data.forEach((xValue, idx) => {
            const dataPoint = { name: xValue };
            
            // Add values from each series
            mapData.series.forEach(series => {
              if (series.name && Array.isArray(series.data)) {
                // Only add series that are currently active based on filters
                if (showAllData || activeFilters[series.name]) {
                  dataPoint[series.name] = series.data[idx] || 0;
                }
              }
            });
            
            multiSeriesData.push(dataPoint);
          });
        }
        
        // For pie chart - transform series data into pie format
        mapData.series.forEach(series => {
          if (series.name && Array.isArray(series.data)) {
            // Only include series that are active in the filter
            if (showAllData || activeFilters[series.name]) {
              const total = series.data.reduce((sum, val) => sum + (val || 0), 0);
              
              // Only include if there's actual data
              if (total > 0) {
                formattedData.push({
                  name: series.name,
                  value: total
                });
              }
            }
          }
        });
      }
      // Process legacy format with single series
      else if (
        mapData.xAxis && 
        mapData.yAxis && 
        Array.isArray(mapData.xAxis.data) && 
        Array.isArray(mapData.yAxis.data)
      ) {
        // Format data for recharts with x and y values
        const length = Math.min(mapData.xAxis.data.length, mapData.yAxis.data.length);
        for (let i = 0; i < length; i++) {
          const dataPoint = {
            name: mapData.xAxis.data[i],
            value: mapData.yAxis.data[i] || 0
          };
          formattedData.push(dataPoint);
        }
      } else if (mapData.datasets && mapData.labels) {
        // Handle direct chart data format
        const { datasets, labels } = mapData;
        if (Array.isArray(labels) && Array.isArray(datasets) && datasets.length > 0) {
          labels.forEach((label, index) => {
            const dataPoint = {
              name: label,
              value: datasets[0].data[index] || 0
            };
            formattedData.push(dataPoint);
          });
        }
      }
      
      // Set default chart type from mapData
      if (
        mapData.chartTypes && 
        Array.isArray(mapData.chartTypes) && 
        mapData.chartTypes.length > 0
      ) {
        const preferredType = mapData.chartTypes[0].toLowerCase();
        if (['bar', 'line', 'pie'].includes(preferredType)) {
          setChartType(preferredType);
        }
      } else if (mapData.chartType) {
        // Also check for direct chartType specification
        if (['bar', 'line', 'pie'].includes(mapData.chartType.toLowerCase())) {
          setChartType(mapData.chartType.toLowerCase());
        }
      }
      
      // Log the formatted data
      console.log('Formatted data for chart:', isMultiSeries ? multiSeriesData : formattedData);
      
      return {
        formattedData: isMultiSeries ? multiSeriesData : formattedData,
        isMultiSeries,
        series: mapData.series || [],
        xAxisLabel: mapData.xAxis?.label || mapData.xLabel || '',
        yAxisLabel: mapData.yAxis?.label || mapData.yLabel || ''
      };
    } catch (err) {
      console.error('Error processing chart data:', err);
      setError('Failed to process chart data: ' + err.message);
      return null;
    }
  }, [mapData, activeFilters, showAllData]);

  // Function to handle filter toggle
  const toggleFilter = (seriesName) => {
    const newActiveFilters = { ...activeFilters };
    
    // If all filters are on (showing all data), turn all off except the clicked one
    if (showAllData) {
      Object.keys(newActiveFilters).forEach(key => {
        newActiveFilters[key] = key === seriesName;
      });
      setShowAllData(false);
    } 
    // If we're in filtered mode
    else {
      // Check if we're toggling the only active filter
      const currentlyActive = Object.values(newActiveFilters).filter(Boolean).length;
      
      if (currentlyActive === 1 && newActiveFilters[seriesName]) {
        // If this is the only active filter and we're clicking it, show all
        Object.keys(newActiveFilters).forEach(key => {
          newActiveFilters[key] = true;
        });
        setShowAllData(true);
      } else {
        // Otherwise toggle just this filter
        newActiveFilters[seriesName] = !newActiveFilters[seriesName];
        setShowAllData(false);
      }
    }
    
    setActiveFilters(newActiveFilters);
  };

  // Responsive button styles
  const buttonBaseClass = "px-3 py-2 mx-1 my-2 rounded-md text-sm font-medium transition-all duration-200";
  const buttonActiveClass = "bg-blue-600 text-white shadow-md";
  const buttonInactiveClass = "bg-gray-200 text-gray-700 hover:bg-gray-300";
  
  // Generate colors for chart
  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', 
    '#00C49F', '#FFBB28', '#FF8042', '#6C8EBF', '#B85450',
    '#D79B00', '#6A00FF', '#008B8B', '#DC143C', '#2F4F4F'
  ];
  
  // Get filter button color by index
  const getFilterButtonColor = (index) => {
    return COLORS[index % COLORS.length];
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-md">
        <p className="label font-medium">{`${label || ''}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
            {`${entry.name || entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  };

  // Pie chart custom label renderer - positioned outside the chart with connecting lines
  const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    const RADIAN = Math.PI / 180;
    // Position labels 1.5x away from the outer radius
    const radius = outerRadius * 1.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Calculate intermediate point for the connecting line
    const lineStart = {
      x: cx + outerRadius * Math.cos(-midAngle * RADIAN),
      y: cy + outerRadius * Math.sin(-midAngle * RADIAN)
    };
    
    return (
      <g>
        {/* Connecting line from pie slice to label */}
        <line 
          x1={lineStart.x}
          y1={lineStart.y}
          x2={x}
          y2={y}
          stroke="#999"
          strokeWidth={1}
          strokeDasharray="2,2" // Dotted line
        />
        
        {/* Label text */}
        <text 
          x={x}
          y={y}
          fill="#999" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={12}
          fontFamily="monospace"
          letterSpacing="0.5px"
          style={{ fontWeight: 300, opacity: 0.8 }}
          dx={x > cx ? 5 : -5} // Add a small offset to prevent text touching the line
        >
          {`${name}: ${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  // Empty state component
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-md border border-gray-200">
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <p className="mt-2 text-gray-500">No data available for visualization</p>
      <div className="mt-4 text-sm text-gray-400">
        Received data structure: {mapData ? JSON.stringify(Object.keys(mapData)) : 'none'}
      </div>
    </div>
  );

  // Display available chart types based on data
  const renderChartSelector = () => {
    // Determine available chart types
    let availableChartTypes = ['bar', 'line'];
    
    // Add pie chart if proper data exists
    if (mapData && mapData.chartTypes && mapData.chartTypes.includes('pie')) {
      availableChartTypes.push('pie');
    }
    
    return (
      <div className="chart-controls flex flex-wrap justify-center mb-4">
        {availableChartTypes.map(type => (
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
  };

  // New component for series filters
  const renderSeriesFilters = () => {
    if (!processedData || !processedData.series || processedData.series.length <= 1) {
      return null;
    }
    
    return (
      <div className="series-filters mt-2 mb-4">
        <div className="flex flex-wrap justify-center gap-2">
          {processedData.series.map((series, index) => (
            <button
              key={series.name}
              onClick={() => toggleFilter(series.name)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${showAllData || activeFilters[series.name] ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={{ 
                backgroundColor: (showAllData || activeFilters[series.name]) ? getFilterButtonColor(index) : undefined,
                opacity: (showAllData || activeFilters[series.name]) ? 1 : 0.7,
                border: `1px solid ${getFilterButtonColor(index)}`
              }}
            >
              <span className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: getFilterButtonColor(index) }}></span>
              {series.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render function for different chart types
  const renderChart = () => {
    if (!processedData || !processedData.formattedData || processedData.formattedData.length === 0) {
      return renderEmptyState();
    }

    try {
      const { formattedData, isMultiSeries, series, xAxisLabel, yAxisLabel } = processedData;
      
      // Filter series by active filters
      const filteredSeries = series.filter(s => showAllData || activeFilters[s.name]);
      
      switch (chartType) {
        case 'pie':
          return (
            <ResponsiveContainer width={width} height={height} ref={chartRef}>
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderCustomizedPieLabel}
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
                {/* Hide the default legend since we have filter buttons */}
              </PieChart>
            </ResponsiveContainer>
          );
        
        case 'line':
          if (isMultiSeries) {
            return (
              <ResponsiveContainer width={width} height={height} ref={chartRef}>
                <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    label={{ value: xAxisLabel || '', position: 'insideBottom', offset: -5 }}
                    tick={{ fill: '#666', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  {/* Hide the default legend since we have filter buttons */}
                  {filteredSeries.map((s, index) => (
                    <Line
                      key={s.name}
                      type="monotone"
                      dataKey={s.name}
                      stroke={COLORS[series.findIndex(seriesItem => seriesItem.name === s.name) % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name={s.name}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            );
          } else {
            return (
              <ResponsiveContainer width={width} height={height} ref={chartRef}>
                <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    label={{ value: xAxisLabel || '', position: 'insideBottom', offset: -5 }}
                    tick={{ fill: '#666', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  {/* Hide the default legend since we have filter buttons */}
                  <Line 
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS[0]}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name={yAxisLabel || 'Value'}
                  />
                </LineChart>
              </ResponsiveContainer>
            );
          }
        
        case 'bar':
        default:
          if (isMultiSeries) {
            return (
              <ResponsiveContainer width={width} height={height} ref={chartRef}>
                <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    label={{ value: xAxisLabel || '', position: 'insideBottom', offset: -5 }}
                    tick={{ fill: '#666', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  {/* Hide the default legend since we have filter buttons */}
                  {filteredSeries.map((s, index) => (
                    <Bar
                      key={s.name}
                      dataKey={s.name}
                      fill={COLORS[series.findIndex(seriesItem => seriesItem.name === s.name) % COLORS.length]}
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                      name={s.name}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            );
          } else {
            return (
              <ResponsiveContainer width={width} height={height} ref={chartRef}>
                <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    label={{ value: xAxisLabel || '', position: 'insideBottom', offset: -5 }}
                    tick={{ fill: '#666', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    label={{ value: yAxisLabel || '', angle: -90, position: 'insideLeft' }}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  {/* Hide the default legend since we have filter buttons */}
                  <Bar 
                    dataKey="value"
                    fill={COLORS[0]}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                    name={yAxisLabel || 'Value'}
                  />
                </BarChart>
              </ResponsiveContainer>
            );
          }
      }
    } catch (err) {
      console.error(`Error rendering ${chartType} chart:`, err);
      return (
        <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-200">
          Failed to render chart: {err.message}
        </div>
      );
    }
  };

  return (
    <div className={`graph-renderer bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="chart-controls-container">
        {renderChartSelector()}
        {renderSeriesFilters()}
      </div>
      
      {error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      ) : (
        <div className="chart-container">{renderChart()}</div>
      )}
    </div>
  );
};

export default GraphRenderer;