import React, { useState, useEffect } from 'react';
import { format, subDays, eachDayOfInterval, isSameDay, getYear, getMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const GitHubStyleHeatmap = ({ data = [] }) => {
  const [events, setEvents] = useState({});
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

  // 处理事件数据
  useEffect(() => {
    const formattedEvents = {};
    data.forEach(item => {
      formattedEvents[item.date] = Array(item.count).fill('想法记录');
    });
    setEvents(formattedEvents);
  }, [data]);

  // 获取当前季度
  const getCurrentQuarter = () => {
    const month = new Date().getMonth();
    return Math.floor(month / 3) + 1;
  };

  // 获取当前年份
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  // 生成日历网格
  const generateCalendar = () => {
    const grid = [];
    const currentYear = getCurrentYear();
    const currentQuarter = getCurrentQuarter();
    
    // 计算当前季度的起始和结束月份
    const startMonth = (currentQuarter - 1) * 3;
    const endMonth = startMonth + 2;
    
    const startDate = new Date(currentYear, startMonth, 1);
    const endDate = new Date(currentYear, endMonth + 1, 0); // 月末

    // 计算第一周的开始日期（周日开始）
    const firstWeekStart = new Date(startDate);
    firstWeekStart.setDate(startDate.getDate() - startDate.getDay());

    // 计算最后一周的结束日期
    const lastWeekEnd = new Date(endDate);
    lastWeekEnd.setDate(endDate.getDate() + (6 - endDate.getDay()));

    // 按周生成日历
    for (let weekStart = new Date(firstWeekStart); weekStart <= lastWeekEnd; weekStart.setDate(weekStart.getDate() + 7)) {
      const weekColumn = [];
      
      // 为每周的7天创建单元格
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + dayOffset);
        
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const isCurrentYear = getYear(currentDate) === currentYear;
        const eventCount = events[dateStr] ? events[dateStr].length : 0;
        const level = Math.min(eventCount, 4);
        
        weekColumn.push(
          <div 
            key={dateStr}
            className={`rounded-sm cursor-pointer transition-all ${!isCurrentYear ? 'opacity-30' : ''}`}
            style={{ 
              backgroundColor: getLevelColor(level),
              width: '100%',
              height: '100%',
              aspectRatio: '1/1', // 保持正方形
              borderRadius: '2px' // 圆角正方形
            }}
            onMouseEnter={(e) => showTooltip(e, dateStr, eventCount)}
            onMouseLeave={hideTooltip}
          />
        );
      }
      
      grid.push(
        <div key={weekStart.toString()} className="flex flex-col gap-1 flex-1">
          {weekColumn}
        </div>
      );
    }
    
    return grid;
  };

  // 根据等级获取颜色
  const getLevelColor = (level) => {
    const colors = {
      0: '#ebedf0', // 无活动
      1: '#9be9a8', // 1-3条
      2: '#40c463', // 4-6条
      3: '#30a14e', // 7-9条
      4: '#216e39'  // 10+条
    };
    return colors[level];
  };

  // 显示提示
  const showTooltip = (e, date, count) => {
    let content = `${date}\n`;

    if (count === 0) {
      content += '无想法';
    } else {
      content += `${count}条想法`;
    }

    setTooltip({
      show: true,
      content,
      x: e.pageX + 10,
      y: e.pageY - 10
    });
  };

  // 隐藏提示
  const hideTooltip = () => {
    setTooltip({ ...tooltip, show: false });
  };

  // 获取季度显示文本
  const getQuarterText = () => {
    const quarterMonths = {
      1: '1-3月',
      2: '4-6月',
      3: '7-9月',
      4: '10-12月'
    };
    return `${getCurrentYear()}年${quarterMonths[getCurrentQuarter()]}`;
  };

  return (
    <div className="mt-4 font-sans">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-semibold text-gray-800">
          {getQuarterText()}
        </div>
        
        <div className="flex items-center text-xs text-gray-500">
          <span>少</span>
          <div className="flex mx-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div 
                key={level}
                className="w-2 h-2 mx-0.5 rounded-sm"
                style={{ backgroundColor: getLevelColor(level) }}
                title={`${level === 0 ? '无想法' : level === 4 ? '4+条想法' : `${level}条想法`}`}
              />
            ))}
          </div>
          <span>多</span>
        </div>
      </div>

      <div className="px-2 bg-gray-50 rounded overflow-hidden">
        <div className="flex gap-1" style={{ minHeight: '110px' }}>
          {generateCalendar()}
        </div>
      </div>

      <div 
        className={`tooltip absolute bg-gray-900 text-white p-2 rounded text-xs pointer-events-none z-50 transition-opacity ${
          tooltip.show ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
      >
        {tooltip.content}
      </div>
    </div>
  );
};

export default GitHubStyleHeatmap;