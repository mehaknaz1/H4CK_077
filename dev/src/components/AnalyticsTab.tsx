'use client';

import { useState } from 'react';
import { TrendingUp, BarChart3, Activity, Target } from 'lucide-react';
import { ProcessedInventoryData, VelocityAnalysis } from '@/types/inventory';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface AnalyticsTabProps {
  data: ProcessedInventoryData[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ data }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Calculate velocity analysis
  const velocityAnalysis: VelocityAnalysis[] = [];
  const productGroups = data.reduce((groups, item) => {
    if (!groups[item.Product]) {
      groups[item.Product] = [];
    }
    groups[item.Product].push(item);
    return groups;
  }, {} as Record<string, ProcessedInventoryData[]>);

  Object.entries(productGroups).forEach(([product, productData]) => {
    if (productData.length >= 2) {
      const sortedData = [...productData].sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
      const totalSales = productData.reduce((sum, item) => sum + item.Sold, 0);
      const avgSales = totalSales / productData.length;
      const currentStock = sortedData[sortedData.length - 1].Stock;
      
      // Calculate sales trend
      const recentSales = sortedData.slice(-3);
      const oldSales = sortedData.slice(0, 3);
      const recentAvg = recentSales.reduce((sum, item) => sum + item.Sold, 0) / recentSales.length;
      const oldAvg = oldSales.reduce((sum, item) => sum + item.Sold, 0) / oldSales.length;
      const salesTrend = recentAvg > oldAvg ? 'Increasing' : recentAvg < oldAvg ? 'Decreasing' : 'Stable';
      
      const stockTurnDays = avgSales > 0 ? currentStock / avgSales : 999;
      const performanceScore = (totalSales * avgSales) / Math.max(currentStock, 1);
      
      velocityAnalysis.push({
        Product: product,
        Category: sortedData[sortedData.length - 1].Category,
        Total_Sales: totalSales,
        Avg_Daily_Sales: avgSales,
        Current_Stock: currentStock,
        Sales_Trend: salesTrend,
        Stock_Turn_Days: stockTurnDays,
        Performance_Score: performanceScore
      });
    }
  });

  // Sort by performance score
  const sortedVelocityAnalysis = velocityAnalysis.sort((a, b) => b.Performance_Score - a.Performance_Score);

  // Filter by category
  const filteredAnalysis = selectedCategory === 'All' 
    ? sortedVelocityAnalysis 
    : sortedVelocityAnalysis.filter(item => item.Category === selectedCategory);

  // Get unique categories
  const categories = ['All', ...new Set(data.map(item => item.Category))];

  // Prepare scatter plot data
  const scatterData = filteredAnalysis.map(item => ({
    x: item.Current_Stock,
    y: item.Avg_Daily_Sales,
    totalSales: item.Total_Sales,
    product: item.Product,
    category: item.Category
  }));

  // Category performance data
  const categoryPerformance = data.reduce((acc, item) => {
    const existing = acc.find(c => c.category === item.Category);
    
    if (existing) {
      existing.totalSales += item.Sold;
      existing.count += 1;
    } else {
      acc.push({
        category: item.Category,
        totalSales: item.Sold,
        count: 1
      });
    }
    
    return acc;
  }, [] as { category: string; totalSales: number; count: number }[]);

  // Calculate average performance score by category
  const categoryAvgPerformance = categoryPerformance.map(cat => {
    const categoryItems = sortedVelocityAnalysis.filter(item => item.Category === cat.category);
    const avgPerformance = categoryItems.length > 0 
      ? categoryItems.reduce((sum, item) => sum + item.Performance_Score, 0) / categoryItems.length
      : 0;
    
    return {
      ...cat,
      avgPerformance: avgPerformance
    };
  }).sort((a, b) => b.totalSales - a.totalSales);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Increasing':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'Decreasing':
        return <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Increasing':
        return 'text-green-200 bg-green-500/20 border-green-500/30';
      case 'Decreasing':
        return 'text-red-200 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-200 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center">
            <span className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mr-4 flex items-center justify-center text-lg">📊</span>
            Advanced Business Intelligence
          </h2>
          
          {/* Category Filter */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-200">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800/80 border border-gray-600 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800 text-white">{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Performance Analysis Table */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mr-3 flex items-center justify-center text-sm">⚡</span>
            Product Performance Analysis
          </h3>
          <div className="overflow-x-auto bg-gray-800/30 rounded-2xl border border-gray-700">
            <table className="min-w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Total Sales
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Avg Daily Sales
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Sales Trend
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Stock Turn Days
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Performance Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAnalysis.slice(0, 20).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      {item.Product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.Category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {Math.round(item.Total_Sales).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {item.Avg_Daily_Sales.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {Math.round(item.Current_Stock).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border ${getTrendColor(item.Sales_Trend)}`}>
                        {getTrendIcon(item.Sales_Trend)}
                        <span className="ml-1">{item.Sales_Trend}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {item.Stock_Turn_Days > 100 ? '100+' : Math.round(item.Stock_Turn_Days)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {item.Performance_Score.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Visualization */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Stock vs Sales Scatter Plot */}
        <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3 flex items-center justify-center text-xs">📈</span>
            Stock vs Sales Performance
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Current Stock"
                label={{ value: 'Current Stock', position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Avg Daily Sales"
                label={{ value: 'Avg Daily Sales', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-gray-800 p-4 border border-gray-600 rounded-xl shadow-xl backdrop-blur-sm">
                        <p className="font-semibold text-white">{data.product}</p>
                        <p className="text-sm text-gray-300">{data.category}</p>
                        <p className="text-cyan-300">Stock: {data.x.toLocaleString()}</p>
                        <p className="text-blue-300">Daily Sales: {data.y.toFixed(2)}</p>
                        <p className="text-green-300">Total Sales: {data.totalSales.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="y" fill="#06b6d4" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg mr-3 flex items-center justify-center text-xs">📊</span>
            Total Sales by Category
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryAvgPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#ffffff'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#9ca3af' }}
              />
              <Bar dataKey="totalSales" fill="#8b5cf6" name="Total Sales" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Insights */}
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl mr-3 flex items-center justify-center text-sm">🎯</span>
          Category Performance Insights
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryAvgPerformance.slice(0, 6).map((category, index) => (
            <div key={index} className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white text-lg">{category.category}</h4>
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Sales:</span>
                  <span className="font-semibold text-cyan-300">{Math.round(category.totalSales).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Products:</span>
                  <span className="font-semibold text-blue-300">{category.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Performance:</span>
                  <span className="font-semibold text-green-300">{category.avgPerformance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl mr-3 flex items-center justify-center text-sm">📈</span>
          Performance Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-blue-500/20 border border-blue-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <Target className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-blue-200 mb-2">
              {filteredAnalysis.filter(item => item.Sales_Trend === 'Increasing').length}
            </div>
            <div className="text-sm text-blue-100 font-medium">Growing Products</div>
          </div>
          
          <div className="bg-green-500/20 border border-green-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-200 mb-2">
              {Math.round(filteredAnalysis.reduce((sum, item) => sum + item.Performance_Score, 0) / filteredAnalysis.length)}
            </div>
            <div className="text-sm text-green-100 font-medium">Avg Performance</div>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <Activity className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-yellow-200 mb-2">
              {Math.round(filteredAnalysis.reduce((sum, item) => sum + item.Stock_Turn_Days, 0) / filteredAnalysis.length)}
            </div>
            <div className="text-sm text-yellow-100 font-medium">Avg Turn Days</div>
          </div>
          
          <div className="bg-purple-500/20 border border-purple-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-purple-200 mb-2">
              {filteredAnalysis.length}
            </div>
            <div className="text-sm text-purple-100 font-medium">Products Analyzed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;