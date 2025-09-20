'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { ProcessedInventoryData, KeyMetrics, RestockPrediction } from '@/types/inventory';

interface DashboardTabProps {
  data: ProcessedInventoryData[];
  keyMetrics: KeyMetrics;
  restockPredictions: RestockPrediction[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const DashboardTab: React.FC<DashboardTabProps> = ({ data, keyMetrics, restockPredictions }) => {
  // Prepare chart data
  const salesOverTime = data
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
    .reduce((acc, item) => {
      const dateStr = item.parsedDate.toISOString().split('T')[0];
      const existing = acc.find(d => d.date === dateStr);
      
      if (existing) {
        existing.sales += item.Sold;
      } else {
        acc.push({ date: dateStr, sales: item.Sold });
      }
      
      return acc;
    }, [] as { date: string; sales: number }[]);

  const categorySales = data.reduce((acc, item) => {
    const existing = acc.find(c => c.category === item.Category);
    
    if (existing) {
      existing.sales += item.Sold;
      existing.stock += item.Stock;
    } else {
      acc.push({ 
        category: item.Category, 
        sales: item.Sold, 
        stock: item.Stock 
      });
    }
    
    return acc;
  }, [] as { category: string; sales: number; stock: number }[]);

  const categoryPieData = categorySales.map(item => ({
    name: item.category,
    value: item.sales
  }));

  // Stock status counts
  const criticalCount = restockPredictions.filter(p => p.Current_Stock <= 0).length;
  const lowStockCount = restockPredictions.filter(p => 
    p.Current_Stock > 0 && p.Current_Stock < p.Avg_Daily_Sales * 3
  ).length;
  const goodStockCount = restockPredictions.filter(p => 
    p.Current_Stock >= p.Avg_Daily_Sales * 7
  ).length;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-700 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Sales</p>
              <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                {keyMetrics.totalSales.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center text-green-400 bg-green-400/10 px-3 py-2 rounded-xl">
              <TrendingUp className="h-5 w-5 mr-1" />
              <span className="text-sm font-semibold">+{keyMetrics.deltaSales || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-700 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Avg Stock</p>
              <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                {keyMetrics.avgStock.toFixed(1)}
              </p>
            </div>
            <div className="flex items-center text-blue-400 bg-blue-400/10 px-3 py-2 rounded-xl">
              <TrendingDown className="h-5 w-5 mr-1" />
              <span className="text-sm font-semibold">-2.5</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-700 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Active Products</p>
              <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                {keyMetrics.uniqueProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-700 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Out of Stock</p>
              <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                {keyMetrics.outOfStock}
              </p>
            </div>
            <div className="flex items-center text-red-400 bg-red-400/10 px-3 py-2 rounded-xl">
              <AlertTriangle className="h-5 w-5 mr-1" />
              <span className="text-sm font-semibold">+{keyMetrics.outOfStock}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status Overview */}
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mr-3 flex items-center justify-center text-sm">⚡</span>
          Quick Status Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
              <span className="text-red-200 font-semibold text-lg">
                🚨 {criticalCount} products are OUT OF STOCK
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3" />
              <span className="text-yellow-200 font-semibold text-lg">
                ⚠ {lowStockCount} products have LOW STOCK
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
              <span className="text-green-200 font-semibold text-lg">
                ✅ {goodStockCount} products have GOOD STOCK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Over Time */}
        <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3 flex items-center justify-center text-xs">📈</span>
            Sales Trends Over Time
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={salesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                stroke="#6b7280"
              />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} stroke="#6b7280" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#ffffff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#60a5fa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Sales Distribution */}
        <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3 flex items-center justify-center text-xs">🥧</span>
            Sales Distribution by Category
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stock vs Sales by Category */}
        <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl lg:col-span-2">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg mr-3 flex items-center justify-center text-xs">📊</span>
            Stock vs Sales by Category
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categorySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#6b7280"
              />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} stroke="#6b7280" />
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
              <Bar dataKey="stock" fill="#3b82f6" name="Stock" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sales" fill="#10b981" name="Sales" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Data Preview */}
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg mr-3 flex items-center justify-center text-xs">📋</span>
          Recent Data Preview
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Sold
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-10).map((item, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.parsedDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                    {item.Product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.Category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {item.Sold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {item.Stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;