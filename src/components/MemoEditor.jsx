import React, { useState, useRef, useEffect } from 'react';
import ContentEditable from 'react-contenteditable';

const MemoEditor = ({ value, onChange, placeholder }) => {
  const [html, setHtml] = useState('');
  const contentEditableRef = useRef(null);
  
  // 高亮标签 - 支持中文
  const highlightTags = (text) => {
    return text.replace(/#([\u4e00-\u9fa5a-zA-Z0-9_]+)/g, '<span class="bg-indigo-100 text-indigo-800 px-1 rounded">#$1</span>');
  };
  
  // 处理输入变化
  const handleChange = (e) => {
    const text = e.target.value;
    const highlighted = highlightTags(text);
    setHtml(highlighted);
    onChange(text.replace(/<[^>]*>?/gm, ''));
  };
  
  // 初始化
  useEffect(() => {
    if (value) {
      setHtml(highlightTags(value));
    } else {
      setHtml('');
    }
  }, [value]);

  return (
    <div className="border rounded-lg p-3 bg-white min-h-[120px] relative">
      <ContentEditable
        innerRef={contentEditableRef}
        html={html}
        onChange={handleChange}
        className="outline-none min-h-[100px]"
      />
      
      {!value && (
        <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default MemoEditor;
