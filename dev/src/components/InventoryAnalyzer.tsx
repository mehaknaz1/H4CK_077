'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, TrendingUp, Target, BarChart3, Download } from 'lucide-react';
import Papa from 'papaparse';
import { 
  InventoryData, 
  ProcessedInventoryData
} from '@/types/inventory';
import { 
  processInventoryData, 
  getUpcomingFestivals, 
  getWeatherRecommendations, 
  generateSmartRecommendations, 
  generateRestockPredictions,
  calculateKeyMetrics
} from '@/utils/inventoryAnalytics';
import DashboardTab from './DashboardTab';
import RecommendationsTab from './RecommendationsTab';
import PredictionsTab from './PredictionsTab';
import AnalyticsTab from './AnalyticsTab';
import ExportTab from './ExportTab';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface InventoryAnalyzerProps {
  // Currently no props, but maintaining interface for future extensibility
}

const InventoryAnalyzer: React.FC<InventoryAnalyzerProps> = () => {
  const [data, setData] = useState<ProcessedInventoryData[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed data
  const upcomingFestivals = getUpcomingFestivals(30);
  const weatherInfo = getWeatherRecommendations();
  
  const filteredData = data.filter(item => {
    if (selectedSeason !== 'All' && item.Season !== selectedSeason) return false;
    if (showDateFilter && dateRange.start && dateRange.end) {
      const itemDate = item.parsedDate.toISOString().split('T')[0];
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    }
    return true;
  });

  const recommendations = filteredData.length > 0 
    ? generateSmartRecommendations(filteredData, upcomingFestivals, weatherInfo)
    : [];
    
  const restockPredictions = data.length > 0 
    ? generateRestockPredictions(data)
    : [];
    
  const keyMetrics = filteredData.length > 0 
    ? calculateKeyMetrics(filteredData)
    : { totalSales: 0, avgStock: 0, uniqueProducts: 0, outOfStock: 0, deltaSales: 0 };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const rawData = results.data as InventoryData[];
          
          // Validate required columns
          const requiredCols = ['Date', 'Product', 'Sold', 'Stock'];
          const sampleRow = rawData[0];
          const missingCols = requiredCols.filter(col => !(col in sampleRow));
          
          if (missingCols.length > 0) {
            setError(`Missing required columns: ${missingCols.join(', ')}`);
            setIsLoading(false);
            return;
          }

          // Process and validate data
          const processedData = processInventoryData(rawData.filter(row => 
            row.Date && row.Product && 
            !isNaN(Number(row.Sold)) && 
            !isNaN(Number(row.Stock))
          ));

          if (processedData.length === 0) {
            setError('No valid data rows found in the uploaded file');
            setIsLoading(false);
            return;
          }

          setData(processedData);
          
          // Set date range based on data
          const dates = processedData.map(item => item.parsedDate.toISOString().split('T')[0]);
          setDateRange({
            start: Math.min(...dates.map(d => new Date(d).getTime())) 
              ? new Date(Math.min(...dates.map(d => new Date(d).getTime()))).toISOString().split('T')[0] 
              : '',
            end: Math.max(...dates.map(d => new Date(d).getTime())) 
              ? new Date(Math.max(...dates.map(d => new Date(d).getTime()))).toISOString().split('T')[0] 
              : ''
          });
          
          setIsLoading(false);
        } catch {
          setError('Error processing the uploaded file. Please check the format and try again.');
          setIsLoading(false);
        }
      },
      error: (error) => {
        setError(`File parsing error: ${error.message}`);
        setIsLoading(false);
      }
    });
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'recommendations', label: 'Smart Recommendations', icon: Target },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3 },
    { id: 'export', label: 'Export', icon: Download },
  ];

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎯 Smart Inventory Analyzer
            </h1>
            <p className="text-xl text-gray-600">AI-Powered Inventory Intelligence</p>
          </div>

          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center">
              <Upload className="mx-auto h-16 w-16 text-blue-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Upload Your Inventory Data
              </h2>
              <p className="text-gray-600 mb-6">
                Upload a CSV file with columns: Date, Product, Sold, Stock (Category optional)
              </p>
              
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                <FileText className="mr-2 h-5 w-5" />
                Choose CSV File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
              
              {isLoading && (
                <div className="mt-4">
                  <div className="inline-flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Processing file...
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Welcome Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Features */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Key Features</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  🎉 Festival Intelligence - Personalized alerts for Indian festivals
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  🌤 Weather-Based Recommendations - Smart seasonal suggestions
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  🤖 AI-Powered Insights - Realistic buying recommendations
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  📊 Interactive Dashboards - Real-time analytics
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  🔮 Predictive Analytics - Accurate restock predictions
                </li>
              </ul>
            </div>

            {/* Upcoming Festivals */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🎉 Upcoming Festivals</h3>
              {upcomingFestivals.length > 0 ? (
                <div className="space-y-3">
                  {upcomingFestivals.slice(0, 5).map((festival, index) => {
                    const urgencyColor = festival.days_until <= 7 ? 'text-red-500' : 
                                       festival.days_until <= 15 ? 'text-yellow-500' : 'text-green-500';
                    const urgencyIcon = festival.days_until <= 7 ? '🔴' : 
                                      festival.days_until <= 15 ? '🟡' : '🟢';
                    
                    return (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{urgencyIcon} {festival.name}</span>
                          <span className={`text-sm ${urgencyColor}`}>
                            {festival.days_until} days away
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          📦 Focus on: {festival.products.slice(0, 4).join(', ')}...
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No major festivals in the next 30 days</p>
              )}
            </div>
          </div>

          {/* Product Types */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📂 Works with ANY Product Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                '🥬 Vegetables & Fruits',
                '🥛 Dairy & Meat Products', 
                '📱 Electronics & Clothing',
                '🎊 Festival Items & Sweets',
                '🏠 Home & Personal Care',
                '🌾 Grains & Oils',
                '🧴 Cosmetics & Beauty',
                '🌸 Flowers & Decorations'
              ].map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🎯 Smart Inventory Analyzer
              </h1>
              <p className="text-sm text-gray-600">
                AI-Powered Inventory Intelligence with Predictions
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {data.length} records loaded
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar and Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">🎮 Interactive Controls</h3>
              
              {/* Season Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🌱 Season View
                </label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="All">All Seasons</option>
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Autumn">Autumn</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="mb-4">
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={showDateFilter}
                    onChange={(e) => setShowDateFilter(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">📅 Enable Date Filter</span>
                </label>
                
                {showDateFilter && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Festivals */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-4">🎉 Upcoming Festivals</h3>
              {upcomingFestivals.length > 0 ? (
                <div className="space-y-2">
                  {upcomingFestivals.slice(0, 3).map((festival, index) => {
                    const urgencyColor = festival.days_until <= 7 ? 'bg-red-100 text-red-800' : 
                                       festival.days_until <= 15 ? 'bg-yellow-100 text-yellow-800' : 
                                       'bg-green-100 text-green-800';
                    const urgencyIcon = festival.days_until <= 7 ? '🔴' : 
                                      festival.days_until <= 15 ? '🟡' : '🟢';
                    
                    return (
                      <div key={index} className={`p-2 rounded text-xs ${urgencyColor}`}>
                        <div className="font-medium">
                          {urgencyIcon} {festival.name}
                        </div>
                        <div>in {festival.days_until} days</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No festivals in next 30 days</p>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <DashboardTab 
                data={filteredData} 
                keyMetrics={keyMetrics}
                restockPredictions={restockPredictions}
              />
            )}
            {activeTab === 'recommendations' && (
              <RecommendationsTab 
                recommendations={recommendations}
                weatherInfo={weatherInfo}
                data={data}
              />
            )}
            {activeTab === 'predictions' && (
              <PredictionsTab 
                restockPredictions={restockPredictions}
                data={filteredData}
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab 
                data={filteredData}
              />
            )}
            {activeTab === 'export' && (
              <ExportTab 
                data={data}
                recommendations={recommendations}
                restockPredictions={restockPredictions}
                keyMetrics={keyMetrics}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalyzer;