'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, TrendingUp, Target, BarChart3, Download, Calendar } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Smart Inventory Analyzer
            </h1>
            <p className="text-xl text-gray-300 font-medium">AI-Powered Inventory Intelligence</p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full text-sm text-gray-300 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Industry-Grade Analytics Platform
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 mb-8 shadow-2xl animate-fade-in">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Upload Your Inventory Data
              </h2>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
                Upload a CSV file with columns: <span className="text-blue-400 font-medium">Date, Product, Sold, Stock</span> 
                <span className="text-gray-400"> (Category optional)</span>
              </p>
              
              <label className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-lg">
                <FileText className="mr-3 h-6 w-6" />
                Choose CSV File
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
              
              {isLoading && (
                <div className="mt-6 animate-fade-in">
                  <div className="inline-flex items-center text-blue-400 bg-blue-400/10 px-6 py-3 rounded-xl border border-blue-400/20">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-3"></div>
                    <span className="font-medium">Processing your data...</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl backdrop-blur-sm animate-fade-in">
                  <div className="flex items-center justify-center">
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Welcome Content */}
          <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
            {/* Features */}
            <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mr-3 flex items-center justify-center text-sm">
                  <Target className="h-4 w-4 text-white" />
                </span>
                Key Features
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: "🎉", title: "Festival Intelligence", desc: "Personalized alerts for Indian festivals" },
                  { icon: "🌤", title: "Weather Recommendations", desc: "Smart seasonal suggestions" },
                  { icon: "🤖", title: "AI-Powered Insights", desc: "Realistic buying recommendations" },
                  { icon: <BarChart3 className="h-4 w-4" />, title: "Interactive Dashboards", desc: "Real-time analytics" },
                  { icon: <TrendingUp className="h-4 w-4" />, title: "Predictive Analytics", desc: "Accurate restock predictions" }
                ].map((feature, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                      <span className="text-blue-400">{feature.icon}</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </div>
                      <div className="text-gray-400 text-sm">{feature.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Upcoming Festivals */}
            <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg mr-3 flex items-center justify-center text-sm">
                  <Calendar className="h-4 w-4 text-white" />
                </span>
                Upcoming Festivals
              </h3>
              {upcomingFestivals.length > 0 ? (
                <div className="space-y-4">
                  {upcomingFestivals.slice(0, 5).map((festival, index) => {
                    const urgencyColor = festival.days_until <= 7 ? 'from-red-500 to-red-600' : 
                                       festival.days_until <= 15 ? 'from-yellow-500 to-orange-500' : 'from-green-500 to-green-600';
                    const urgencyClass = festival.days_until <= 7 ? 'bg-red-500/20 border-red-500/30' : 
                                      festival.days_until <= 15 ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-green-500/20 border-green-500/30';
                    
                    return (
                      <div key={index} className="group p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-3 ${
                              festival.days_until <= 7 ? 'bg-red-500' : 
                              festival.days_until <= 15 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></span>
                            {festival.name}
                          </span>
                          <span className={`px-3 py-1 bg-gradient-to-r ${urgencyColor} text-white text-sm font-medium rounded-full`}>
                            {festival.days_until} days
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          Focus on: <span className="text-gray-300">{festival.products.slice(0, 4).join(', ')}...</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center opacity-50">
                    <Calendar className="h-6 w-6 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No major festivals in the next 30 days</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Types */}
          <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 mt-8 shadow-xl animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
              <span className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg mr-3 flex items-center justify-center text-sm">📂</span>
              Works with ANY Product Type
            </h3>
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
                <div key={index} className="group p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:scale-105">
                  <div className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 animate-fade-in">
            <div className="inline-flex items-center px-6 py-3 bg-gray-800/30 border border-gray-700 rounded-full text-gray-400 backdrop-blur-sm">
              <span className="text-xs">Powered by Advanced AI Analytics</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="animate-slide-in">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Smart Inventory Analyzer
              </h1>
              <p className="text-gray-300 mt-1 font-medium">
                AI-Powered Inventory Intelligence with Predictions
              </p>
            </div>
            <div className="text-right animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-300 backdrop-blur-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span className="font-semibold text-white">{data.length.toLocaleString()}</span>
                <span className="ml-1">records loaded</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar and Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 animate-slide-in">
            {/* Controls */}
            <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 mb-6 shadow-xl">
              <h3 className="font-bold text-white mb-6 flex items-center text-lg">
                <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3 flex items-center justify-center text-xs">🎮</span>
                Interactive Controls
              </h3>
              
              {/* Season Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  🌱 Season View
                </label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-500"
                >
                  <option value="All">All Seasons</option>
                  <option value="Winter">❄️ Winter</option>
                  <option value="Spring">🌸 Spring</option>
                  <option value="Summer">☀️ Summer</option>
                  <option value="Autumn">🍂 Autumn</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="mb-6">
                <label className="flex items-center mb-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDateFilter}
                    onChange={(e) => setShowDateFilter(e.target.checked)}
                    className="mr-3 w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">📅 Enable Date Filter</span>
                </label>
                
                {showDateFilter && (
                  <div className="space-y-3 animate-fade-in">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Festivals */}
            <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-white mb-6 flex items-center text-lg">
                <span className="w-6 h-6 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg mr-3 flex items-center justify-center text-xs">🎉</span>
                Upcoming Festivals
              </h3>
              {upcomingFestivals.length > 0 ? (
                <div className="space-y-3">
                  {upcomingFestivals.slice(0, 3).map((festival, index) => {
                    const urgencyColor = festival.days_until <= 7 ? 'from-red-500 to-red-600' : 
                                       festival.days_until <= 15 ? 'from-yellow-500 to-orange-500' : 
                                       'from-green-500 to-green-600';
                    const urgencyIcon = festival.days_until <= 7 ? '🔴' : 
                                      festival.days_until <= 15 ? '🟡' : '🟢';
                    
                    return (
                      <div key={index} className="group p-3 bg-gray-800/50 hover:bg-gray-800/70 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-white text-sm flex items-center">
                            <span className="mr-2">{urgencyIcon}</span>
                            {festival.name}
                          </div>
                          <span className={`px-2 py-1 bg-gradient-to-r ${urgencyColor} text-white text-xs font-medium rounded-full`}>
                            {festival.days_until}d
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Focus on key items
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-2xl mb-2 opacity-50">🗓️</div>
                  <p className="text-sm text-gray-400">No festivals in next 30 days</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 animate-fade-in">
            {/* Tabs */}
            <div className="mb-8">
              <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-2">
                <nav className="flex space-x-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
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
    </div>
  );
};

export default InventoryAnalyzer;