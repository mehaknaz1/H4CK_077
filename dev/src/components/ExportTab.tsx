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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          💾 Enhanced Data Export & Reports
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Enhanced Inventory Report */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                📊 Enhanced Inventory Report
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Complete dataset with seasonal analysis, categorization, and enhanced metadata.
            </p>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Data Points:</span>
                <span className="font-medium">{data.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Products:</span>
                <span className="font-medium">{keyMetrics.uniqueProducts}</span>
              </div>
              <div className="flex justify-between">
                <span>Categories:</span>
                <span className="font-medium">{new Set(data.map(item => item.Category)).size}</span>
              </div>
            </div>
            
            <button
              onClick={handleExportInventoryAnalysis}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Complete Inventory Analysis
            </button>
          </div>

          {/* Smart Recommendations Report */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                🎯 Smart Recommendations Report
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              AI-generated recommendations with detailed insights and action plans.
            </p>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Total Recommendations:</span>
                <span className="font-medium">{recommendations.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Critical Priority:</span>
                <span className="font-medium text-red-600">
                  {recommendations.filter(r => r.urgency === 'Critical').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Festival Alerts:</span>
                <span className="font-medium text-orange-600">
                  {recommendations.filter(r => r.type === 'Festival').length}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleExportRecommendations}
              disabled={recommendations.length === 0}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                recommendations.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Recommendations Report
            </button>
          </div>

          {/* Restock Predictions Report */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                🔮 Restock Predictions Report
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Detailed restock calendar with predictions and stock status analysis.
            </p>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Products Analyzed:</span>
                <span className="font-medium">{restockPredictions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Out of Stock:</span>
                <span className="font-medium text-red-600">
                  {restockPredictions.filter(p => p.Current_Stock <= 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Low Stock:</span>
                <span className="font-medium text-yellow-600">
                  {restockPredictions.filter(p => 
                    p.Current_Stock > 0 && p.Current_Stock < p.Avg_Daily_Sales * 3
                  ).length}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleExportRestockPredictions}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Restock Predictions
            </button>
          </div>

          {/* Executive Summary Report */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                📋 Executive Summary Report
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              High-level summary with key metrics and insights for management reporting.
            </p>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Total Sales:</span>
                <span className="font-medium">{keyMetrics.totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Action Items:</span>
                <span className="font-medium">
                  {recommendations.filter(r => r.urgency === 'Critical' || r.urgency === 'High').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Report Date:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <button
              onClick={handleExportSummaryReport}
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Executive Summary
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          📈 Export Summary Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {keyMetrics.uniqueProducts}
            </div>
            <div className="text-sm text-blue-700">Total Products</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {keyMetrics.totalSales.toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Total Sales Volume</div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {keyMetrics.avgStock.toFixed(1)}
            </div>
            <div className="text-sm text-yellow-700">Avg Stock Value</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {data.length.toLocaleString()}
            </div>
            <div className="text-sm text-purple-700">Data Points</div>
          </div>
        </div>
      </div>

      {/* Export Instructions */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📖 Export Instructions
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• <strong>Inventory Analysis:</strong> Complete dataset with all calculations and predictions</p>
          <p>• <strong>Recommendations:</strong> AI insights formatted for easy review and action</p>
          <p>• <strong>Restock Predictions:</strong> Calendar-ready format with urgency indicators</p>
          <p>• <strong>Executive Summary:</strong> High-level metrics perfect for management reports</p>
          <p>• All exports include timestamps and are ready for further analysis in Excel or other tools</p>
        </div>
      </div>
    </div>
  );
};

export default ExportTab;