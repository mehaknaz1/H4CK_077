'use client';

import { AlertTriangle, Lightbulb, Sun, Calendar, TrendingUp } from 'lucide-react';
import { Recommendation, WeatherInfo, ProcessedInventoryData } from '@/types/inventory';
import { findMatchingProducts } from '@/utils/inventoryAnalytics';

interface RecommendationsTabProps {
  recommendations: Recommendation[];
  weatherInfo: WeatherInfo;
  data: ProcessedInventoryData[];
}

const RecommendationsTab: React.FC<RecommendationsTabProps> = ({ 
  recommendations, 
  weatherInfo, 
  data 
}) => {
  const urgencyColors = {
    Critical: 'bg-red-50 border-red-200 text-red-800',
    High: 'bg-orange-50 border-orange-200 text-orange-800',
    Medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    Low: 'bg-green-50 border-green-200 text-green-800'
  };

  const urgencyIcons = {
    Critical: '🚨',
    High: '🔴',
    Medium: '🟡',
    Low: '🟢'
  };

  const weatherMatches = findMatchingProducts(
    [...new Set(data.map(item => item.Product))], 
    weatherInfo.products
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🎯 AI-Powered Smart Recommendations
        </h2>

        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className={`border rounded-lg p-4 ${urgencyColors[rec.urgency]}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{urgencyIcons[rec.urgency]}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{rec.title}</h3>
                      <span className="text-sm font-medium">{rec.urgency} Priority</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    {rec.type === 'Festival' && <Calendar className="h-4 w-4 mr-1" />}
                    {rec.type === 'Weather' && <Sun className="h-4 w-4 mr-1" />}
                    {rec.type === 'Urgent' && <AlertTriangle className="h-4 w-4 mr-1" />}
                    {rec.type === 'Historical' && <TrendingUp className="h-4 w-4 mr-1" />}
                    {rec.type}
                  </div>
                </div>

                <div className="mb-3">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: rec.reason.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }}
                  />
                </div>

                {rec.type === 'Festival' && (
                  <div className="bg-blue-50 p-3 rounded border">
                    <div className="flex items-center text-blue-800">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Pro Tip:</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Festival periods typically see 50-100% increase in demand for related products!
                    </p>
                  </div>
                )}

                {rec.type === 'Weather' && (
                  <div className="bg-blue-50 p-3 rounded border">
                    <div className="flex items-center text-blue-800">
                      <Sun className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Weather Insight:</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Stock weather-appropriate products 1-2 weeks before seasonal changes.
                    </p>
                  </div>
                )}

                {rec.type === 'Historical' && (
                  <div className="bg-blue-50 p-3 rounded border">
                    <div className="flex items-center text-blue-800">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Historical Pattern:</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Past performance is a good indicator of future demand.
                    </p>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Affected Products:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.products.slice(0, 5).map((product, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-white rounded text-xs font-medium border"
                      >
                        {product}
                      </span>
                    ))}
                    {rec.products.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                        +{rec.products.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Great news! Your inventory levels look well-balanced.
            </h3>
            <p className="text-gray-600 mb-4">
              All products appear to have adequate stock levels across categories.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
              <div className="flex items-center text-blue-800 mb-2">
                <Lightbulb className="h-4 w-4 mr-2" />
                <span className="font-medium">Pro Tip:</span>
              </div>
              <p className="text-sm text-blue-700">
                Keep monitoring daily sales trends and upcoming festivals for proactive planning.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Weather Impact Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          🌤 Current Weather Impact Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-blue-900 mb-2">Current Season Forecast</h4>
            <p className="text-blue-800">{weatherInfo.forecast}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-green-900 mb-2">
              Weather-suitable products in inventory
            </h4>
            {weatherMatches.length > 0 ? (
              <div className="space-y-2">
                {weatherMatches.slice(0, 5).map((product, index) => {
                  const productData = data.filter(item => item.Product === product);
                  const currentStock = productData.length > 0 
                    ? productData[productData.length - 1].Stock 
                    : 0;
                  
                  return (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-green-800">☀ <strong>{product}</strong></span>
                      <span className="text-green-700">Stock: {currentStock}</span>
                    </div>
                  );
                })}
                {weatherMatches.length > 5 && (
                  <p className="text-sm text-green-700 pt-2 border-t border-green-200">
                    +{weatherMatches.length - 5} more weather-suitable products
                  </p>
                )}
              </div>
            ) : (
              <p className="text-green-700 text-sm">
                No weather-specific products identified in current inventory
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recommendation Summary */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Recommendation Summary
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(urgencyColors).map(([urgency, colorClass]) => {
              const count = recommendations.filter(r => r.urgency === urgency).length;
              return (
                <div key={urgency} className={`p-4 rounded-lg border ${colorClass}`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm font-medium">{urgency} Priority</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {['Festival', 'Weather', 'Urgent'].map(type => {
              const count = recommendations.filter(r => r.type === type).length;
              return (
                <div key={type} className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{type} Recommendations</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsTab;