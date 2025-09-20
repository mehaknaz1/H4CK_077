'use client';

import { Calendar, AlertTriangle, TrendingDown } from 'lucide-react';
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

  // Get critical items
  const criticalItems = sortedPredictions.filter(item => 
    item.Status?.includes('🚨') || item.Status?.includes('🔴')
  );

  // Prepare chart data for days of stock remaining
  const chartData = sortedPredictions
    .slice(0, 10)
    .map(item => ({
      product: item.Product.length > 15 ? item.Product.substring(0, 15) + '...' : item.Product,
      daysOfStock: Math.min(item.Days_Until_Restock || 0, 30), // Cap at 30 for visualization
      status: item.Status || ''
    }));

  // Urgency distribution data
  const urgencyStats = {
    'Out of Stock': sortedPredictions.filter(p => p.Status?.includes('🚨')).length,
    'Critical': sortedPredictions.filter(p => p.Status?.includes('🔴')).length,
    'Low': sortedPredictions.filter(p => p.Status?.includes('🟠')).length,
    'Moderate': sortedPredictions.filter(p => p.Status?.includes('🟡')).length,
    'Good': sortedPredictions.filter(p => p.Status?.includes('🟢')).length,
  };

  const urgencyDistribution = Object.entries(urgencyStats).map(([key, value]) => ({
    name: key,
    value
  })).filter(item => item.value > 0);

  const getStatusColor = (status: string) => {
    if (status.includes('🚨')) return 'bg-red-100 text-red-800 border-red-200';
    if (status.includes('🔴')) return 'bg-red-100 text-red-800 border-red-200';
    if (status.includes('🟠')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (status.includes('🟡')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status.includes('🟢')) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🔮 Advanced Predictive Analytics
        </h2>

        {/* Critical Items Alert */}
        {criticalItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">
                ⚠ IMMEDIATE ATTENTION REQUIRED
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-red-200">
                    <th className="text-left py-2 text-sm font-semibold text-red-800">Status</th>
                    <th className="text-left py-2 text-sm font-semibold text-red-800">Product</th>
                    <th className="text-left py-2 text-sm font-semibold text-red-800">Category</th>
                    <th className="text-left py-2 text-sm font-semibold text-red-800">Current Stock</th>
                    <th className="text-left py-2 text-sm font-semibold text-red-800">Daily Sales</th>
                    <th className="text-left py-2 text-sm font-semibold text-red-800">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalItems.map((item, index) => (
                    <tr key={index} className="border-b border-red-100">
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.Status || '')}`}>
                          {item.Status}
                        </span>
                      </td>
                      <td className="py-2 font-medium text-red-900">{item.Product}</td>
                      <td className="py-2 text-red-700">{item.Category}</td>
                      <td className="py-2 text-red-900">{item.Current_Stock}</td>
                      <td className="py-2 text-red-900">{item.Avg_Daily_Sales.toFixed(1)}</td>
                      <td className="py-2 text-red-700 text-sm">{item.Reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Complete Restock Analysis */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Complete Restock Analysis
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daily Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days of Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restock Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPredictions.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.Status || '')}`}>
                        {item.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.Product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.Category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Current_Stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Avg_Daily_Sales.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Days_Until_Restock !== undefined ? 
                        item.Days_Until_Restock > 30 ? '30+' : Math.round(item.Days_Until_Restock) : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Days of Stock Remaining */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Days of Stock Remaining (Top 10 Products)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 30]} />
              <YAxis 
                type="category" 
                dataKey="product" 
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} days`, 'Days of Stock']}
                labelFormatter={(label) => `Product: ${label}`}
              />
              <Bar 
                dataKey="daysOfStock" 
                fill="#8884d8"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🥧 Stock Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={urgencyDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {urgencyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Tips */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          💡 Predictive Insights & Tips
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-900">Restock Planning</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Plan restocks 3-7 days before predicted depletion</li>
              <li>• Consider supplier lead times in calculations</li>
              <li>• Monitor high-velocity items more frequently</li>
              <li>• Account for seasonal demand fluctuations</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <TrendingDown className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-900">Optimization Tips</h4>
            </div>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Maintain safety stock for critical items</li>
              <li>• Review slow-moving inventory regularly</li>
              <li>• Implement just-in-time for fast movers</li>
              <li>• Use historical data for better forecasting</li>
            </ul>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {urgencyStats['Out of Stock'] + urgencyStats['Critical']}
            </div>
            <div className="text-sm text-red-700">Urgent Action</div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {urgencyStats['Low'] + urgencyStats['Moderate']}
            </div>
            <div className="text-sm text-yellow-700">Monitor Closely</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {urgencyStats['Good']}
            </div>
            <div className="text-sm text-green-700">Well Stocked</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {restockPredictions.length}
            </div>
            <div className="text-sm text-blue-700">Total Products</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsTab;