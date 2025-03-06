import React from 'react';

const TableRenderer = ({ data }) => {
  // Validate the data structure
  if (!data || !Array.isArray(data) || !data.length) {
    return <div className="text-red-500">Invalid table data</div>;
  }

  // Simple function to clean text coming from the API
  const cleanText = (text) => {
    if (text === null || text === undefined) return '';
    
    return String(text)
      // Replace <br> tags with line breaks
      .replace(/<br>/g, '\n')
      // Remove excessive asterisks (bold formatting)
      .replace(/\*\*/g, '')
      // Clean up bullet points
      .replace(/^\s*-\s*/gm, '• ');
  };

  // Format multi-line cell content
  const formatCellContent = (content) => {
    if (!content) return '';
    
    const lines = cleanText(content).split('\n');
    
    if (lines.length <= 1) return cleanText(content);
    
    return (
      <ul className="list-disc pl-5 space-y-1">
        {lines.map((line, index) => (
          line.trim() && <li key={index}>{line.trim()}</li>
        ))}
      </ul>
    );
  };

  // Check if data is an array of objects (rows with named columns)
  const hasHeaders = typeof data[0] === 'object' && !Array.isArray(data[0]);
  
  // Extract headers from the first object if available
  const headers = hasHeaders ? Object.keys(data[0]) : [];

  // For your specific comparison table, detect if any cells contain bullet points or line breaks
  const hasMultiLineContent = hasHeaders && 
    data.some(row => 
      headers.some(header => 
        String(row[header]).includes('<br>') || 
        String(row[header]).includes('\n') ||
        String(row[header]).includes('- ')
      )
    );

  return (
    <div className="overflow-x-auto w-full my-4">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        {hasHeaders && (
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left font-medium text-gray-700 border-b">
                  {cleanText(header)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {hasHeaders ? (
            // Render data as rows with named columns
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex} className={`px-4 py-2 border-t ${hasMultiLineContent ? 'align-top' : ''}`}>
                    {hasMultiLineContent 
                      ? formatCellContent(row[header])
                      : cleanText(row[header])}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            // Render data as a simple 2D array
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {Array.isArray(row) ? (
                  row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 border-t">
                      {formatCellContent(cell)}
                    </td>
                  ))
                ) : (
                  <td className="px-4 py-2 border-t">{formatCellContent(row)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableRenderer;