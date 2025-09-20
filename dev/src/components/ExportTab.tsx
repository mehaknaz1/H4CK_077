'use client';

import { Download, FileText, BarChart3, Calendar } from 'lucide-react';
import { ProcessedInventoryData, Recommendation, RestockPrediction, KeyMetrics } from '@/types/inventory';
import { exportToCSV } from '@/utils/inventoryAnalytics';

interface ExportTabProps {
  data: ProcessedInventoryData[];
  recommendations: Recommendation[];
  restockPredictions: RestockPrediction[];
  keyMetrics: KeyMetrics;
}

const ExportTab: React.FC<ExportTabProps> = ({ 
  data, 
  recommendations, 
  restockPredictions, 
  keyMetrics 
}) => {
  const handleExportInventoryAnalysis = () => {
    const enhancedData = data.map(item => ({
      Date: item.Date,
      Product: item.Product,
      Category: item.Category,
      Sold: item.Sold,
      Stock: item.Stock,
      Season: item.Season,
      Generated_Date: new Date().toISOString().split('T')[0]
    }));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    exportToCSV(enhancedData, `inventory_analysis_${timestamp}.csv`);
  };

  const handleExportRecommendations = () => {
    if (recommendations.length === 0) {
      alert('No recommendations available to export');
      return;
    }

    const recData = recommendations.map((rec, index) => ({
      ID: index + 1,
      Type: rec.type,
      Title: rec.title,
      Urgency: rec.urgency,
      Products_Count: rec.products.length,
      Products: rec.products.join(', '),
      Reason: rec.reason.replace(/\*\*(.*?)\*\*/g, '$1'), // Remove markdown formatting
      Generated_Date: new Date().toISOString().split('T')[0]
    }));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    exportToCSV(recData, `recommendations_${timestamp}.csv`);
  };

  const handleExportRestockPredictions = () => {
    const restockData = restockPredictions.map(item => ({
      Product: item.Product,
      Category: item.Category,
      Current_Stock: item.Current_Stock,
      Avg_Daily_Sales: Math.round(item.Avg_Daily_Sales * 100) / 100,
      Days_Until_Restock: item.Days_Until_Restock || 'N/A',
      Restock_Date: item.Restock_Date ? item.Restock_Date.toISOString().split('T')[0] : 'N/A',
      Status: item.Status || 'Unknown',
      Reason: item.Reason,
      Generated_Date: new Date().toISOString().split('T')[0]
    }));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    exportToCSV(restockData, `restock_predictions_${timestamp}.csv`);
  };

  const handleExportSummaryReport = () => {
    const summaryData = [{
      Report_Date: new Date().toISOString().split('T')[0],
      Total_Products: keyMetrics.uniqueProducts,
      Total_Sales: keyMetrics.totalSales,
      Average_Stock: Math.round(keyMetrics.avgStock * 100) / 100,
      Out_Of_Stock_Items: keyMetrics.outOfStock,
      Critical_Recommendations: recommendations.filter(r => r.urgency === 'Critical').length,
      High_Priority_Recommendations: recommendations.filter(r => r.urgency === 'High').length,
      Medium_Priority_Recommendations: recommendations.filter(r => r.urgency === 'Medium').length,
      Low_Priority_Recommendations: recommendations.filter(r => r.urgency === 'Low').length,
      Festival_Recommendations: recommendations.filter(r => r.type === 'Festival').length,
      Weather_Recommendations: recommendations.filter(r => r.type === 'Weather').length,
      Urgent_Stock_Alerts: recommendations.filter(r => r.type === 'Urgent').length,
      Products_Needing_Immediate_Restock: restockPredictions.filter(p => p.Current_Stock <= 0).length,
      Products_With_Low_Stock: restockPredictions.filter(p => 
        p.Current_Stock > 0 && p.Current_Stock < p.Avg_Daily_Sales * 3
      ).length,
      Data_Points_Analyzed: data.length
    }];

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    exportToCSV(summaryData, `inventory_summary_${timestamp}.csv`);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
          <span className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mr-4 flex items-center justify-center text-lg">💾</span>
          Enhanced Data Export & Reports
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Enhanced Inventory Report */}
          <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-blue-400 mr-3" />
              <h3 className="text-xl font-bold text-white">
                📊 Enhanced Inventory Report
              </h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Complete dataset with seasonal analysis, categorization, and enhanced metadata.
            </p>
            
            <div className="space-y-3 text-sm text-gray-300 mb-6">
              <div className="flex justify-between">
                <span>Data Points:</span>
                <span className="font-semibold text-cyan-300">{data.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Products:</span>
                <span className="font-semibold text-blue-300">{keyMetrics.uniqueProducts}</span>
              </div>
              <div className="flex justify-between">
                <span>Categories:</span>
                <span className="font-semibold text-green-300">{new Set(data.map(item => item.Category)).size}</span>
              </div>
            </div>
            
            <button
              onClick={handleExportInventoryAnalysis}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-semibold transform hover:scale-105"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Complete Inventory Analysis
            </button>
          </div>

          {/* Smart Recommendations Report */}
          <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-green-400 mr-3" />
              <h3 className="text-xl font-bold text-white">
                🎯 Smart Recommendations Report
              </h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              AI-generated recommendations with detailed insights and action plans.
            </p>
            
            <div className="space-y-3 text-sm text-gray-300 mb-6">
              <div className="flex justify-between">
                <span>Total Recommendations:</span>
                <span className="font-semibold text-cyan-300">{recommendations.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Critical Priority:</span>
                <span className="font-semibold text-red-300">
                  {recommendations.filter(r => r.urgency === 'Critical').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Festival Alerts:</span>
                <span className="font-semibold text-orange-300">
                  {recommendations.filter(r => r.type === 'Festival').length}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleExportRecommendations}
              disabled={recommendations.length === 0}
              className={`w-full flex items-center justify-center px-6 py-3 rounded-xl transition-all duration-300 font-semibold transform ${
                recommendations.length === 0
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:scale-105'
              }`}
            >
              <Download className="h-5 w-5 mr-2" />
              Download Recommendations Report
            </button>
          </div>

          {/* Restock Predictions Report */}
          <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-purple-400 mr-3" />
              <h3 className="text-xl font-bold text-white">
                🔮 Restock Predictions Report
              </h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Detailed restock calendar with predictions and stock status analysis.
            </p>
            
            <div className="space-y-3 text-sm text-gray-300 mb-6">
              <div className="flex justify-between">
                <span>Products Analyzed:</span>
                <span className="font-semibold text-cyan-300">{restockPredictions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Out of Stock:</span>
                <span className="font-semibold text-red-300">
                  {restockPredictions.filter(p => p.Current_Stock <= 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Low Stock:</span>
                <span className="font-semibold text-yellow-300">
                  {restockPredictions.filter(p => 
                    p.Current_Stock > 0 && p.Current_Stock < p.Avg_Daily_Sales * 3
                  ).length}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleExportRestockPredictions}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 font-semibold transform hover:scale-105"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Restock Predictions
            </button>
          </div>

          {/* Executive Summary Report */}
          <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-indigo-400 mr-3" />
              <h3 className="text-xl font-bold text-white">
                📋 Executive Summary Report
              </h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              High-level summary with key metrics and insights for management reporting.
            </p>
            
            <div className="space-y-3 text-sm text-gray-300 mb-6">
              <div className="flex justify-between">
                <span>Total Sales:</span>
                <span className="font-semibold text-cyan-300">{keyMetrics.totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Action Items:</span>
                <span className="font-semibold text-orange-300">
                  {recommendations.filter(r => r.urgency === 'Critical' || r.urgency === 'High').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Report Date:</span>
                <span className="font-semibold text-blue-300">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <button
              onClick={handleExportSummaryReport}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 font-semibold transform hover:scale-105"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Executive Summary
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl mr-3 flex items-center justify-center text-sm">📈</span>
          Export Summary Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-blue-500/20 border border-blue-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-blue-200 mb-2">
              {keyMetrics.uniqueProducts}
            </div>
            <div className="text-sm text-blue-100 font-medium">Total Products</div>
          </div>
          
          <div className="bg-green-500/20 border border-green-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-green-200 mb-2">
              {keyMetrics.totalSales.toLocaleString()}
            </div>
            <div className="text-sm text-green-100 font-medium">Total Sales Volume</div>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-yellow-200 mb-2">
              {keyMetrics.avgStock.toFixed(1)}
            </div>
            <div className="text-sm text-yellow-100 font-medium">Avg Stock Value</div>
          </div>
          
          <div className="bg-purple-500/20 border border-purple-500/30 p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-purple-200 mb-2">
              {data.length.toLocaleString()}
            </div>
            <div className="text-sm text-purple-100 font-medium">Data Points</div>
          </div>
        </div>
      </div>

      {/* Export Instructions */}
      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-blue-200 mb-6 flex items-center">
          <span className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg mr-3 flex items-center justify-center text-xs">📖</span>
          Export Instructions
        </h3>
        <div className="text-sm text-blue-100 space-y-3">
          <p>• <strong className="text-blue-200">Inventory Analysis:</strong> Complete dataset with all calculations and predictions</p>
          <p>• <strong className="text-blue-200">Recommendations:</strong> AI insights formatted for easy review and action</p>
          <p>• <strong className="text-blue-200">Restock Predictions:</strong> Calendar-ready format with urgency indicators</p>
          <p>• <strong className="text-blue-200">Executive Summary:</strong> High-level metrics perfect for management reports</p>
          <p>• <strong className="text-blue-200">All exports</strong> include timestamps and are ready for further analysis in Excel or other tools</p>
        </div>
      </div>
    </div>
  );
};

export default ExportTab;