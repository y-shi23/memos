import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Tag, Clock } from 'lucide-react';
import GitHubStyleHeatmap from '@/components/GitHubStyleHeatmap';
import TagManager from '@/components/TagManager';
import MemoEditor from '@/components/MemoEditor';

const Index = () => {
  const [memos, setMemos] = useState([]);
  const [newMemo, setNewMemo] = useState('');
  const [filteredMemos, setFilteredMemos] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  // 添加新memo - 支持中文标签
  const addMemo = () => {
    if (newMemo.trim() === '') return;
    
    // 从内容中提取标签 - 支持中文
    const extractedTags = [...newMemo.matchAll(/#([\u4e00-\u9fa5a-zA-Z0-9_]+)/g)]
      .map(match => match[1])
      .filter((tag, index, self) => self.indexOf(tag) === index);
    
    const newMemoObj = {
      id: Date.now(),
      content: newMemo,
      tags: extractedTags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setMemos([newMemoObj, ...memos]);
    setNewMemo('');
  };

  // 更新热力图数据
  useEffect(() => {
    const generateHeatmapData = () => {
      const data = [];
      const today = new Date();
      const memoCountByDate = {};
      
      // 统计每天的memo数量
      memos.forEach(memo => {
        const date = memo.createdAt.split('T')[0];
        memoCountByDate[date] = (memoCountByDate[date] || 0) + 1;
      });
      
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        data.push({
          date: dateStr,
          count: memoCountByDate[dateStr] || 0
        });
      }
      
      return data;
    };
    
    setHeatmapData(generateHeatmapData());
    setFilteredMemos(memos);
  }, [memos]);

  // 按标签过滤
  useEffect(() => {
    if (!activeTag) {
      setFilteredMemos(memos);
    } else {
      setFilteredMemos(
        memos.filter(memo => memo.tags.includes(activeTag))
      );
    }
  }, [activeTag, memos]);

  // 高亮标签 - 支持中文
  const highlightTags = (text) => {
    return text.replace(/#([\u4e00-\u9fa5a-zA-Z0-9_]+)/g, '<span class="bg-indigo-100 text-indigo-800 px-1 rounded">#$1</span>');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* 左侧热力图区域 */}
      <div className="w-full md:w-1/5 p-4 border-r">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
          <h2 className="text-lg font-semibold">记忆热力图</h2>
        </div>
        <GitHubStyleHeatmap data={heatmapData} />
      </div>

      {/* 中央主内容区 */}
      <div className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
        {/* 编辑区域 */}
        <Card className="mb-6 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-indigo-600" />
              记录新想法
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <MemoEditor
                  value={newMemo}
                  onChange={setNewMemo}
                  placeholder="记录你的想法（使用 # 添加标签）"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={addMemo} 
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md"
                >
                  保存想法
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memos列表 */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-600" />
            近期想法
          </h2>
          
          {filteredMemos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>还没有记录任何想法</p>
              <p className="text-sm mt-2">在顶部输入框写下你的第一个想法吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMemos.map(memo => (
                <Card 
                  key={memo.id} 
                  className="hover:shadow-md transition-shadow rounded-xl shadow-sm"
                >
                  <CardContent className="p-4">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightTags(memo.content).replace(/\n/g, '<br>') 
                      }} 
                    />
                    
                    <div className="mt-3 flex flex-wrap items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {memo.tags.map((tag, index) => (
                          <span 
                            key={index}
                            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                            className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-colors ${
                              tag === activeTag 
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2 sm:mt-0">
                        {new Date(memo.updatedAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧标签管理区 */}
      <div className="w-full lg:w-1/5 p-4 border-l">
        <TagManager 
          memos={memos} 
          activeTag={activeTag}
          setActiveTag={setActiveTag}
        />
      </div>
    </div>
  );
};

export default Index;
