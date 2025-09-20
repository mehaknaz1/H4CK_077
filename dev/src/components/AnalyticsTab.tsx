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
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'Decreasing':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Increasing':
        return 'text-green-600 bg-green-50';
      case 'Decreasing':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            📊 Advanced Business Intelligence
          </h2>
          
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Performance Analysis Table */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            ⚡ Product Performance Analysis
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Daily Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Turn Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnalysis.slice(0, 20).map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.Product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.Category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(item.Total_Sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Avg_Daily_Sales.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(item.Current_Stock)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(item.Sales_Trend)}`}>
                        {getTrendIcon(item.Sales_Trend)}
                        <span className="ml-1">{item.Sales_Trend}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Stock_Turn_Days > 100 ? '100+' : Math.round(item.Stock_Turn_Days)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Stock vs Sales Scatter Plot */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📈 Stock vs Sales Performance
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Current Stock"
                label={{ value: 'Current Stock', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Avg Daily Sales"
                label={{ value: 'Avg Daily Sales', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded shadow">
                        <p className="font-semibold">{data.product}</p>
                        <p className="text-sm text-gray-600">{data.category}</p>
                        <p>Stock: {data.x}</p>
                        <p>Daily Sales: {data.y.toFixed(2)}</p>
                        <p>Total Sales: {data.totalSales}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="y" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Total Sales by Category
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryAvgPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSales" fill="#8884d8" name="Total Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          🎯 Category Performance Insights
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryAvgPerformance.slice(0, 6).map((category, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{category.category}</h4>
                <BarChart3 className="h-5 w-5 text-gray-500" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sales:</span>
                  <span className="font-medium">{Math.round(category.totalSales).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Products:</span>
                  <span className="font-medium">{category.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Performance:</span>
                  <span className="font-medium">{category.avgPerformance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          📈 Performance Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {filteredAnalysis.filter(item => item.Sales_Trend === 'Increasing').length}
            </div>
            <div className="text-sm text-blue-700">Growing Products</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {Math.round(filteredAnalysis.reduce((sum, item) => sum + item.Performance_Score, 0) / filteredAnalysis.length)}
            </div>
            <div className="text-sm text-green-700">Avg Performance</div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
            <Activity className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round(filteredAnalysis.reduce((sum, item) => sum + item.Stock_Turn_Days, 0) / filteredAnalysis.length)}
            </div>
            <div className="text-sm text-yellow-700">Avg Turn Days</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {filteredAnalysis.length}
            </div>
            <div className="text-sm text-purple-700">Products Analyzed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;