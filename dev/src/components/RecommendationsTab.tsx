'use client';

import { AlertTriangle, Lightbulb, Sun, Calendar, TrendingUp, AlertCircle, Info, CheckCircle, Target } from 'lucide-react';
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
    Critical: 'bg-red-500/20 border-red-500/30 text-red-200',
    High: 'bg-orange-500/20 border-orange-500/30 text-orange-200',
    Medium: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
    Low: 'bg-green-500/20 border-green-500/30 text-green-200'
  };

  const urgencyIcons = {
    Critical: <AlertTriangle className="h-5 w-5" />,
    High: <AlertCircle className="h-5 w-5" />,
    Medium: <Info className="h-5 w-5" />,
    Low: <CheckCircle className="h-5 w-5" />
  };

  const weatherMatches = findMatchingProducts(
    [...new Set(data.map(item => item.Product))], 
    weatherInfo.products
  );

  return (
    <div className="space-y-8">
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
          <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mr-4 flex items-center justify-center text-lg">
            <Target className="h-5 w-5 text-white" />
          </span>
          AI-Powered Smart Recommendations
        </h2>

        {recommendations.length > 0 ? (
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div key={index} className={`border rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${urgencyColors[rec.urgency]}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full mr-4 flex items-center justify-center ${
                      rec.urgency === 'Critical' ? 'bg-red-500/30' :
                      rec.urgency === 'High' ? 'bg-orange-500/30' :
                      rec.urgency === 'Medium' ? 'bg-yellow-500/30' : 'bg-green-500/30'
                    }`}>
                      <span className={`${
                        rec.urgency === 'Critical' ? 'text-red-300' :
                        rec.urgency === 'High' ? 'text-orange-300' :
                        rec.urgency === 'Medium' ? 'text-yellow-300' : 'text-green-300'
                      }`}>
                        {urgencyIcons[rec.urgency]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{rec.title}</h3>
                      <span className="text-sm font-semibold px-3 py-1 bg-white/20 rounded-full mt-2 inline-block">
                        {rec.urgency} Priority
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                    {rec.type === 'Festival' && <Calendar className="h-4 w-4 mr-2" />}
                    {rec.type === 'Weather' && <Sun className="h-4 w-4 mr-2" />}
                    {rec.type === 'Urgent' && <AlertTriangle className="h-4 w-4 mr-2" />}
                    {rec.type === 'Historical' && <TrendingUp className="h-4 w-4 mr-2" />}
                    <span className="font-medium">{rec.type}</span>
                  </div>
                </div>

                <div className="mb-4">
                  {rec.type === 'Urgent' && rec.reason.includes('URGENT STOCK ALERTS') ? (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Critical Stock Alerts</h4>
                      <div className="space-y-3">
                        {rec.reason
                          .split('•')
                          .filter(alert => alert.trim() && !alert.includes('🚨 URGENT STOCK ALERTS'))
                          .map((alert, idx) => {
                            const trimmedAlert = alert.trim();
                            const isOutOfStock = trimmedAlert.includes('OUT OF STOCK');
                            
                            // Extract product name (everything before the first colon)
                            const productMatch = trimmedAlert.match(/^([^:]+):/);
                            const productName = productMatch ? productMatch[1].trim() : trimmedAlert;
                            
                            // Extract days left info
                            const daysMatch = trimmedAlert.match(/Only ([\d.]+) days left/);
                            const daysLeft = daysMatch ? parseFloat(daysMatch[1]) : null;
                            
                            // Extract daily sales info
                            const salesMatch = trimmedAlert.match(/Average daily sales: ([\d.,]+) units/);
                            const dailySales = salesMatch ? salesMatch[1] : null;
                            
                            return (
                              <div 
                                key={idx}
                                className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                                  isOutOfStock 
                                    ? 'bg-red-500/20 border-red-500/40 text-red-100' 
                                    : 'bg-orange-500/20 border-orange-500/40 text-orange-100'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                      {isOutOfStock ? (
                                        <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                                      ) : (
                                        <AlertCircle className="h-5 w-5 text-orange-400 mr-2" />
                                      )}
                                      <h5 className="font-bold text-white text-lg">{productName}</h5>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                        isOutOfStock 
                                          ? 'bg-red-600/30 text-red-200' 
                                          : 'bg-orange-600/30 text-orange-200'
                                      }`}>
                                        {isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK'}
                                      </div>
                                      
                                      {daysLeft !== null && !isOutOfStock && (
                                        <div className="text-sm">
                                          <span className="font-medium">Days remaining: </span>
                                          <span className={`font-bold ${daysLeft <= 1 ? 'text-red-300' : 'text-orange-300'}`}>
                                            {daysLeft} days
                                          </span>
                                        </div>
                                      )}
                                      
                                      {dailySales && (
                                        <div className="text-sm">
                                          <span className="font-medium">Daily sales: </span>
                                          <span className="font-bold text-white">{dailySales} units</span>
                                        </div>
                                      )}
                                      
                                      {isOutOfStock && (
                                        <div className="text-sm font-medium text-red-300">
                                          ⚠️ Restock immediately!
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="prose prose-sm max-w-none text-gray-200 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: rec.reason.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') 
                      }}
                    />
                  )}
                </div>

                {rec.type === 'Festival' && (
                  <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center text-blue-200 mb-2">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Pro Tip:</span>
                    </div>
                    <p className="text-sm text-blue-100">
                      Festival periods typically see 50-100% increase in demand for related products!
                    </p>
                  </div>
                )}

                {rec.type === 'Weather' && (
                  <div className="bg-cyan-500/20 border border-cyan-500/30 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center text-cyan-200 mb-2">
                      <Sun className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Weather Insight:</span>
                    </div>
                    <p className="text-sm text-cyan-100">
                      Stock weather-appropriate products 1-2 weeks before seasonal changes.
                    </p>
                  </div>
                )}

                {rec.type === 'Historical' && (
                  <div className="bg-purple-500/20 border border-purple-500/30 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center text-purple-200 mb-2">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Historical Pattern:</span>
                    </div>
                    <p className="text-sm text-purple-100">
                      Past performance is a good indicator of future demand.
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm font-semibold text-gray-300 mb-3">Affected Products:</p>
                  {rec.type === 'Urgent' && rec.products.length > 10 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {rec.products.slice(0, 12).map((product, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-xs font-medium border border-white/20 hover:bg-white/20 transition-colors truncate"
                          title={product}
                        >
                          {product}
                        </span>
                      ))}
                      {rec.products.length > 12 && (
                        <span className="px-3 py-2 bg-gray-700/50 rounded-xl text-xs text-gray-300 border border-gray-600 text-center">
                          +{rec.products.length - 12} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {rec.products.slice(0, 5).map((product, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-xs font-medium border border-white/20 hover:bg-white/20 transition-colors"
                        >
                          {product}
                        </span>
                      ))}
                      {rec.products.length > 5 && (
                        <span className="px-3 py-2 bg-gray-700/50 rounded-xl text-xs text-gray-300 border border-gray-600">
                          +{rec.products.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Great news! Your inventory levels look well-balanced.
            </h3>
            <p className="text-gray-300 mb-6 text-lg max-w-2xl mx-auto">
              All products appear to have adequate stock levels across categories.
            </p>
            <div className="bg-blue-500/20 border border-blue-500/30 p-6 rounded-2xl max-w-md mx-auto backdrop-blur-sm">
              <div className="flex items-center text-blue-200 mb-3">
                <Lightbulb className="h-5 w-5 mr-2" />
                <span className="font-semibold">Pro Tip:</span>
              </div>
              <p className="text-sm text-blue-100">
                Keep monitoring daily sales trends and upcoming festivals for proactive planning.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Weather Impact Analysis */}
      <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl mr-3 flex items-center justify-center text-sm">🌤</span>
          Current Weather Impact Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-blue-500/20 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-sm">
            <h4 className="font-bold text-blue-200 mb-3 text-lg">Current Season Forecast</h4>
            <p className="text-blue-100 text-lg">{weatherInfo.forecast}</p>
          </div>

          <div className="bg-green-500/20 border border-green-500/30 p-6 rounded-2xl backdrop-blur-sm">
            <h4 className="font-bold text-green-200 mb-3 text-lg">
              Weather-suitable products in inventory
            </h4>
            {weatherMatches.length > 0 ? (
              <div className="space-y-3">
                {weatherMatches.slice(0, 5).map((product, index) => {
                  const productData = data.filter(item => item.Product === product);
                  const currentStock = productData.length > 0 
                    ? productData[productData.length - 1].Stock 
                    : 0;
                  
                  return (
                    <div key={index} className="flex justify-between items-center text-sm bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                      <span className="text-green-100 font-semibold flex items-center">
                        <span className="mr-2">☀</span> 
                        {product}
                      </span>
                      <span className="text-green-200 bg-green-400/20 px-3 py-1 rounded-full font-medium">
                        Stock: {currentStock}
                      </span>
                    </div>
                  );
                })}
                {weatherMatches.length > 5 && (
                  <p className="text-sm text-green-100 pt-3 border-t border-green-400/30">
                    +{weatherMatches.length - 5} more weather-suitable products
                  </p>
                )}
              </div>
            ) : (
              <p className="text-green-100 text-sm">
                No weather-specific products identified in current inventory
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recommendation Summary */}
      {recommendations.length > 0 && (
        <div className="bg-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl mr-3 flex items-center justify-center text-sm">📊</span>
            Recommendation Summary
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {Object.entries(urgencyColors).map(([urgency, colorClass]) => {
              const count = recommendations.filter(r => r.urgency === urgency).length;
              return (
                <div key={urgency} className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${colorClass}`}>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{count}</div>
                    <div className="text-sm font-semibold">{urgency} Priority</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {['Festival', 'Weather', 'Urgent'].map(type => {
              const count = recommendations.filter(r => r.type === type).length;
              const bgColor = type === 'Festival' ? 'bg-orange-500/20 border-orange-500/30' :
                             type === 'Weather' ? 'bg-cyan-500/20 border-cyan-500/30' :
                             'bg-red-500/20 border-red-500/30';
              return (
                <div key={type} className={`${bgColor} border p-6 rounded-2xl text-center backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                  <div className="text-2xl font-bold text-white mb-2">{count}</div>
                  <div className="text-sm text-gray-200 font-medium">{type} Recommendations</div>
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