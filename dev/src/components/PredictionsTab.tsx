'use client';

import { Calendar, AlertTriangle, TrendingDown, TrendingUp, Activity, BarChart3, PieChart as PieChartIcon, Lightbulb } from 'lucide-react';
import { RestockPrediction, ProcessedInventoryData } from '@/types/inventory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PredictionsTabProps {
  restockPredictions: RestockPrediction[];
  data: ProcessedInventoryData[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

const PredictionsTab: React.FC<PredictionsTabProps> = ({ restockPredictions }) => {
  // Sort predictions by urgency
  const sortedPredictions = [...restockPredictions].sort((a, b) => {
    if (a.Current_Stock <= 0 && b.Current_Stock > 0) return -1;
    if (a.Current_Stock > 0 && b.Current_Stock <= 0) return 1;
    return (a.Days_Until_Restock || 999) - (b.Days_Until_Restock || 999);
  });

  // Get critical items (using current stock as primary indicator)
  const criticalItems = sortedPredictions.filter(item => 
    item.Current_Stock <= 0 || (item.Status?.includes('🚨') || item.Status?.includes('🔴'))
  );

  // Prepare chart data for days of stock remaining
  const chartData = sortedPredictions
    .slice(0, 10)
    .map(item => ({
      product: item.Product.length > 15 ? item.Product.substring(0, 15) + '...' : item.Product,
      daysOfStock: Math.min(item.Days_Until_Restock || 0, 30), // Cap at 30 for visualization
      status: item.Status || ''
    }));

  // Urgency distribution data - using more robust classification
  const urgencyStats = {
    'Out of Stock': sortedPredictions.filter(p => p.Current_Stock <= 0).length,
    'Critical': sortedPredictions.filter(p => p.Current_Stock > 0 && p.Current_Stock <= p.Avg_Daily_Sales * 2).length,
    'Low': sortedPredictions.filter(p => p.Current_Stock > p.Avg_Daily_Sales * 2 && p.Current_Stock <= p.Avg_Daily_Sales * 5).length,
    'Moderate': sortedPredictions.filter(p => p.Current_Stock > p.Avg_Daily_Sales * 5 && p.Current_Stock <= p.Avg_Daily_Sales * 10).length,
    'Good': sortedPredictions.filter(p => p.Current_Stock > p.Avg_Daily_Sales * 10).length,
  };

  const urgencyDistribution = Object.entries(urgencyStats).map(([key, value]) => ({
    name: key,
    value
  })).filter(item => item.value > 0);

  const getStatusColor = (status: string, currentStock: number, avgDailySales: number) => {
    // Priority: use current stock levels over emoji status
    if (currentStock <= 0) return 'bg-red-500/20 text-red-200 border-red-500/30';
    if (currentStock <= avgDailySales * 2) return 'bg-red-500/20 text-red-200 border-red-500/30';
    if (currentStock <= avgDailySales * 5) return 'bg-orange-500/20 text-orange-200 border-orange-500/30';
    if (currentStock <= avgDailySales * 10) return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
    
    // Fallback to emoji checking for compatibility
    if (status.includes('🚨') || status.includes('🔴')) return 'bg-red-500/20 text-red-200 border-red-500/30';
    if (status.includes('🟠')) return 'bg-orange-500/20 text-orange-200 border-orange-500/30';
    if (status.includes('🟡')) return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
    if (status.includes('🟢')) return 'bg-green-500/20 text-green-200 border-green-500/30';
    
    return 'bg-green-500/20 text-green-200 border-green-500/30';
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
          <span className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mr-4 flex items-center justify-center text-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </span>
          Advanced Predictive Analytics
        </h2>

        {/* Critical Items Alert */}
        {criticalItems.length > 0 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
              <h3 className="text-xl font-bold text-red-200">
                ⚠ IMMEDIATE ATTENTION REQUIRED
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-red-400/30">
                    <th className="text-left py-3 text-sm font-bold text-red-200">Status</th>
                    <th className="text-left py-3 text-sm font-bold text-red-200">Product</th>
                    <th className="text-left py-3 text-sm font-bold text-red-200">Category</th>
                    <th className="text-left py-3 text-sm font-bold text-red-200">Current Stock</th>
                    <th className="text-left py-3 text-sm font-bold text-red-200">Daily Sales</th>
                    <th className="text-left py-3 text-sm font-bold text-red-200">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalItems.map((item, index) => (
                    <tr key={index} className="border-b border-red-400/20">
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-xl text-xs font-semibold border ${getStatusColor(item.Status || '', item.Current_Stock, item.Avg_Daily_Sales)}`}>
                          {item.Status}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-red-100">{item.Product}</td>
                      <td className="py-3 text-red-200">{item.Category}</td>
                      <td className="py-3 text-red-100 font-medium">{item.Current_Stock}</td>
                      <td className="py-3 text-red-100 font-medium">{item.Avg_Daily_Sales.toFixed(1)}</td>
                      <td className="py-3 text-red-200 text-sm">{item.Reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Complete Restock Analysis */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mr-3 flex items-center justify-center text-sm">
              <Activity className="h-4 w-4 text-white" />
            </span>
            Complete Restock Analysis
          </h3>
          <div className="overflow-x-auto bg-gray-800/30 rounded-2xl border border-gray-700">
            <table className="min-w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Daily Sales
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Days of Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Restock Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedPredictions.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-xl text-xs font-semibold border ${getStatusColor(item.Status || '', item.Current_Stock, item.Avg_Daily_Sales)}`}>
                        {item.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      {item.Product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.Category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {item.Current_Stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {item.Avg_Daily_Sales.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {item.Days_Until_Restock !== undefined ? 
                        item.Days_Until_Restock > 30 ? '30+' : Math.round(item.Days_Until_Restock) : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.Restock_Date ? item.Restock_Date.toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Predictive Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Days of Stock Remaining */}
        <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg mr-3 flex items-center justify-center text-xs">
              <BarChart3 className="h-3 w-3 text-white" />
            </span>
            Days of Stock Remaining (Top 10 Products)
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                domain={[0, 30]} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                type="category" 
                dataKey="product" 
                width={120}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="#6b7280"
              />
              <Tooltip 
                formatter={(value: number) => [`${value} days`, 'Days of Stock']}
                labelFormatter={(label) => `Product: ${label}`}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#ffffff'
                }}
              />
              <Bar 
                dataKey="daysOfStock" 
                fill="#3b82f6"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Status Distribution */}
        <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg mr-3 flex items-center justify-center text-xs">
              <PieChartIcon className="h-3 w-3 text-white" />
            </span>
            Stock Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={urgencyDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {urgencyDistribution.map((entry, index) => (
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
      </div>

      {/* Insights and Tips */}
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mr-3 flex items-center justify-center text-sm">
            <Lightbulb className="h-4 w-4 text-white" />
          </span>
          Predictive Insights & Tips
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-blue-500/20 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-blue-400 mr-3" />
              <h4 className="font-bold text-blue-200 text-lg">Restock Planning</h4>
            </div>
            <ul className="text-sm text-blue-100 space-y-2">
              <li>• Plan restocks 3-7 days before predicted depletion</li>
              <li>• Consider supplier lead times in calculations</li>
              <li>• Monitor high-velocity items more frequently</li>
              <li>• Account for seasonal demand fluctuations</li>
            </ul>
          </div>

          <div className="bg-green-500/20 border border-green-500/30 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <TrendingDown className="h-6 w-6 text-green-400 mr-3" />
              <h4 className="font-bold text-green-200 text-lg">Optimization Tips</h4>
            </div>
            <ul className="text-sm text-green-100 space-y-2">
              <li>• Maintain safety stock for critical items</li>
              <li>• Review slow-moving inventory regularly</li>
              <li>• Implement just-in-time for fast movers</li>
              <li>• Use historical data for better forecasting</li>
            </ul>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-red-500/20 border border-red-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-red-200 mb-2">
              {urgencyStats['Out of Stock'] + urgencyStats['Critical']}
            </div>
            <div className="text-sm text-red-100 font-medium">Urgent Action</div>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-yellow-200 mb-2">
              {urgencyStats['Low'] + urgencyStats['Moderate']}
            </div>
            <div className="text-sm text-yellow-100 font-medium">Monitor Closely</div>
          </div>
          
          <div className="bg-green-500/20 border border-green-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-green-200 mb-2">
              {urgencyStats['Good']}
            </div>
            <div className="text-sm text-green-100 font-medium">Well Stocked</div>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-blue-200 mb-2">
              {restockPredictions.length}
            </div>
            <div className="text-sm text-blue-100 font-medium">Total Products</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsTab;