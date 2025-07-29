import React, { useMemo } from 'react';
import { Tag } from 'lucide-react';

const TagManager = ({ memos, activeTag, setActiveTag }) => {
  // 计算标签频率
  const tagFrequency = useMemo(() => {
    const frequency = {};
    
    memos.forEach(memo => {
      memo.tags.forEach(tag => {
        frequency[tag] = (frequency[tag] || 0) + 1;
      });
    });
    
    return frequency;
  }, [memos]);

  // 获取排序后的标签
  const sortedTags = useMemo(() => {
    return Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [tagFrequency]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <Tag className="h-5 w-5 mr-2 text-indigo-600" />
        <h2 className="text-lg font-semibold">标签管理</h2>
      </div>
      
      <div className="space-y-2">
        {sortedTags.length > 0 ? (
          sortedTags.map(tag => (
            <div 
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-colors ${
                tag === activeTag
                  ? 'bg-indigo-100 border border-indigo-300'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="font-medium">#{tag}</span>
              <span className="text-xs bg-gray-200 rounded-full px-2 py-1">
                {tagFrequency[tag]}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">暂无标签</p>
        )}
        
        {activeTag && (
          <button 
            onClick={() => setActiveTag(null)}
            className="mt-4 w-full text-sm text-indigo-600 hover:text-indigo-800"
          >
            清除筛选
          </button>
        )}
      </div>
    </div>
  );
};

export default TagManager;
