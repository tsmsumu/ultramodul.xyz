"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

interface LogAnalyticsProps {
  logs: any[];
  targets: any[];
  type: "chat" | "wag" | "status" | "tgGroup" | "tgChannel" | "tgChat";
}

export default function LogAnalytics({ logs, targets, type }: LogAnalyticsProps) {
  const chartData = useMemo(() => {
    // Volume Tracking (by hour)
    const volumeByHour: Record<string, number> = {};
    const mediaVsText = { media: 0, text: 0 };
    const targetActivity: Record<string, number> = {};

    logs.forEach(l => {
      // Time grouping (truncate to hour)
      const d = new Date(l.timestamp);
      const hourKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:00`;
      volumeByHour[hourKey] = (volumeByHour[hourKey] || 0) + 1;

      // Media vs Text
      if (l.mediaUrl) mediaVsText.media++;
      else mediaVsText.text++;

      // Target Activity
      const tId = l.targetId;
      targetActivity[tId] = (targetActivity[tId] || 0) + 1;
    });

    // Sort time series
    const timeKeys = Object.keys(volumeByHour).sort();
    const timeValues = timeKeys.map(k => volumeByHour[k]);

    // Top 5 Targets
    const topTargets = Object.entries(targetActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tId, count]) => {
        const t = targets.find(t => t.id === tId);
        let name = tId;
        if (t) {
          name = type === 'chat' || type === 'status' ? t.targetName || t.phoneNumber : t.groupName || t.groupId;
        }
        return { name, value: count };
      });

    return {
      timeKeys,
      timeValues,
      mediaVsText: [
        { name: 'Text Only', value: mediaVsText.text },
        { name: 'With Media', value: mediaVsText.media }
      ],
      topTargets
    };
  }, [logs, targets, type]);

  const timeSeriesOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { 
      type: 'category', 
      data: chartData.timeKeys,
      axisLabel: { color: '#a1a1aa' },
      axisLine: { lineStyle: { color: '#3f3f46' } }
    },
    yAxis: { 
      type: 'value',
      axisLabel: { color: '#a1a1aa' },
      splitLine: { lineStyle: { color: '#27272a' } }
    },
    series: [{
      data: chartData.timeValues,
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
          ]
        }
      },
      itemStyle: { color: '#3b82f6' },
      lineStyle: { color: '#3b82f6', width: 3 }
    }],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
  };

  const pieOption = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#18181b',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' }
        },
        labelLine: { show: false },
        data: chartData.mediaVsText
      }
    ],
    color: ['#3b82f6', '#f59e0b']
  };

  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { 
      type: 'value',
      axisLabel: { color: '#a1a1aa' },
      splitLine: { lineStyle: { color: '#27272a' } }
    },
    yAxis: { 
      type: 'category', 
      data: chartData.topTargets.map(t => t.name).reverse(),
      axisLabel: { color: '#a1a1aa' },
      axisLine: { lineStyle: { color: '#3f3f46' } }
    },
    series: [
      {
        type: 'bar',
        data: chartData.topTargets.map(t => t.value).reverse(),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' }
            ]
          },
          borderRadius: [0, 4, 4, 0]
        }
      }
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-black/40 border border-white/5 p-4 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div> Traffic Volume (Timeline)
        </h3>
        <ReactECharts option={timeSeriesOption} style={{ height: '300px' }} theme="dark" opts={{ renderer: 'svg' }} />
      </div>
      
      <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div> Content Distribution
        </h3>
        <ReactECharts option={pieOption} style={{ height: '300px' }} theme="dark" opts={{ renderer: 'svg' }} />
      </div>

      <div className="lg:col-span-3 bg-black/40 border border-white/5 p-4 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div> Top 5 Most Active Targets
        </h3>
        <ReactECharts option={barOption} style={{ height: '300px' }} theme="dark" opts={{ renderer: 'svg' }} />
      </div>
    </div>
  );
}
