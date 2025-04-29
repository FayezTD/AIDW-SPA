/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/heading-has-content */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * MarkdownRenderer - A simple component for rendering Markdown content
 * with GitHub Flavored Markdown support.
 * 
 * @param {Object} props
 * @param {string} props.content - The markdown content to render
 * @param {Object} props.customStyles - Optional custom styles for elements
 * @returns {JSX.Element}
 */
const MarkdownRenderer = ({ content, customStyles = {} }) => {
  // Clean up the content by removing unnecessary markdown
  const cleanedContent = content
    // Replace <br> tags with newlines
    .replace(/<br>/g, '\n')
    // Clean up any consecutive newlines to a maximum of two
    .replace(/\n{3,}/g, '\n\n')
    // Remove custom markdown markers if present
    .replace(/%%TABLE_JSON%%[\s\S]*?%%END_TABLE%%/g, '')
    .replace(/%%GRAPH_JSON%%[\s\S]*?%%END_GRAPH%%/g, '');

  // Default styling for markdown elements
  const defaultStyles = {
    paragraph: "my-2 text-gray-800",
    heading: "font-bold mt-4 mb-2 text-gray-900",
    list: "my-2 ml-4 list-disc",
    listItem: "my-1",
    link: "text-blue-600 hover:underline",
    code: "bg-gray-100 px-1 py-0.5 rounded font-mono text-sm",
    codeBlock: "bg-gray-100 p-3 rounded font-mono text-sm my-3 overflow-auto",
    blockquote: "border-l-4 border-gray-300 pl-4 italic my-3 text-gray-700",
    table: "border-collapse w-full my-4",
    tableHeader: "border border-gray-300 px-4 py-2 bg-gray-100 font-semibold",
    tableCell: "border border-gray-300 px-4 py-2",
    ...customStyles
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({node, ...props}) => <h1 className={`text-2xl ${defaultStyles.heading}`} {...props} />,
        h2: ({node, ...props}) => <h2 className={`text-xl ${defaultStyles.heading}`} {...props} />,
        h3: ({node, ...props}) => <h3 className={`text-lg ${defaultStyles.heading}`} {...props} />,
        h4: ({node, ...props}) => <h4 className={`text-base ${defaultStyles.heading}`} {...props} />,
        h5: ({node, ...props}) => <h5 className={`text-sm ${defaultStyles.heading}`} {...props} />,
        h6: ({node, ...props}) => <h6 className={`text-xs ${defaultStyles.heading}`} {...props} />,
        
        // Block elements
        p: ({node, ...props}) => <p className={defaultStyles.paragraph} {...props} />,
        blockquote: ({node, ...props}) => <blockquote className={defaultStyles.blockquote} {...props} />,
        ul: ({node, ...props}) => <ul className={defaultStyles.list} {...props} />,
        ol: ({node, ...props}) => <ol className={`${defaultStyles.list} list-decimal`} {...props} />,
        li: ({node, ...props}) => <li className={defaultStyles.listItem} {...props} />,
        
        // Inline elements
        a: ({node, ...props}) => <a className={defaultStyles.link} target="_blank" rel="noopener noreferrer" {...props} />,
        em: ({node, ...props}) => <em className="italic" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
        code: ({node, inline, ...props}) => 
          inline ? 
            <code className={defaultStyles.code} {...props} /> : 
            <pre className={defaultStyles.codeBlock}><code {...props} /></pre>,
        
        // Table elements
        table: ({node, ...props}) => <table className={defaultStyles.table} {...props} />,
        th: ({node, ...props}) => <th className={defaultStyles.tableHeader} {...props} />,
        td: ({node, ...props}) => <td className={defaultStyles.tableCell} {...props} />,
        
        // Handle image responsively
        img: ({node, alt, ...props}) => (
          <img 
            className="max-w-full h-auto my-4 rounded" 
            alt={alt || 'Image'} 
            loading="lazy"
            {...props} 
          />
        ),
      }}
    >
      {cleanedContent}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;