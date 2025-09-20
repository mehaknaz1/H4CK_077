import { 
  InventoryData, 
  ProcessedInventoryData, 
  FestivalInfo, 
  Festival, 
  WeatherInfo, 
  RestockPrediction, 
  Recommendation, 
  Season 
} from '@/types/inventory';
import { addDays, differenceInDays } from 'date-fns';

// Festival and Weather Data
export const INDIAN_FESTIVALS_2024_2025: Record<string, FestivalInfo> = {
  '2024-10-31': { name: 'Diwali', products: ['sweet', 'laddu', 'jamun', 'diya', 'lamp', 'light', 'decoration', 'rangoli', 'candle'] },
  '2024-11-15': { name: 'Bhai Dooj', products: ['sweet', 'gift', 'flower', 'tilak', 'dry fruit', 'laddu'] },
  '2024-12-25': { name: 'Christmas', products: ['cake', 'wine', 'gift', 'decoration', 'tree', 'star', 'wrapping'] },
  '2025-01-14': { name: 'Makar Sankranti', products: ['sesame', 'til', 'jaggery', 'kite', 'sweet', 'laddu'] },
  '2025-02-26': { name: 'Maha Shivratri', products: ['milk', 'honey', 'fruit', 'flower', 'bel', 'leaves'] },
  '2025-03-13': { name: 'Holi', products: ['color', 'gulal', 'sweet', 'gujiya', 'thandai', 'water', 'gun', 'balloon'] },
  '2025-08-30': { name: 'Janmashtami', products: ['butter', 'milk', 'sweet', 'flower', 'krishna', 'idol', 'flute'] },
  '2025-09-05': { name: 'Ganesh Chaturthi', products: ['modak', 'flower', 'decoration', 'sweet', 'fruit', 'ganesh', 'idol', 'coconut'] },
  '2025-10-10': { name: 'Dussehra', products: ['sweet', 'flower', 'decoration', 'traditional', 'clothes'] },
};

export const WEATHER_PRODUCT_MAP: Record<string, string[]> = {
  hot: ['ice', 'cream', 'cold', 'drink', 'fan', 'cooler', 'cotton', 'sunscreen', 'water'],
  cold: ['heater', 'warm', 'blanket', 'hot', 'coffee', 'tea', 'winter', 'jacket', 'coat'],
  rainy: ['umbrella', 'raincoat', 'boot', 'hot', 'warm', 'waterproof']
};

export const CATEGORIES = [
  'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Seafood', 
  'Oils', 'Sweets', 'Festival Items', 'Clothing', 'Electronics', 
  'Home', 'Beverages', 'Frozen', 'Cosmetics', 'Flowers'
];

export function getSeasonFromDate(date: Date): Season {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  if (month === 12 || month <= 2) return 'Winter';
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  return 'Autumn';
}

export function processInventoryData(data: InventoryData[]): ProcessedInventoryData[] {
  return data.map((item) => {
    const parsedDate = new Date(item.Date);
    const category = item.Category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const season = getSeasonFromDate(parsedDate);
    
    return {
      ...item,
      parsedDate,
      Category: category,
      Season: season
    };
  });
}

export function predictRestockDateImproved(productData: ProcessedInventoryData[]): {
  restockDate: Date | null;
  reason: string;
} {
  if (productData.length < 3) {
    return { restockDate: null, reason: "Insufficient data" };
  }

  const sortedData = [...productData].sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
  
  // Get recent sales trend (last 5 entries or available data)
  const recentWindow = Math.min(5, sortedData.length);
  const recentSales = sortedData.slice(-recentWindow);
  const avgDailySales = recentSales.reduce((sum, item) => sum + item.Sold, 0) / recentSales.length;
  
  // Get current stock
  const currentStock = sortedData[sortedData.length - 1].Stock;
  const currentDate = sortedData[sortedData.length - 1].parsedDate;
  
  if (avgDailySales <= 0 || currentStock <= 0) {
    if (currentStock <= 0) {
      return { restockDate: currentDate, reason: "OUT OF STOCK - Restock immediately!" };
    } else {
      return { restockDate: null, reason: "No sales trend available" };
    }
  }
  
  // Calculate days until stock runs out
  const daysUntilEmpty = currentStock / avgDailySales;
  
  // Add safety buffer based on stock level
  let safetyBuffer = 7;
  if (currentStock < avgDailySales * 3) {
    safetyBuffer = 1; // Less than 3 days stock
  } else if (currentStock < avgDailySales * 7) {
    safetyBuffer = 3; // Less than week stock
  }
  
  const restockDays = Math.max(0, daysUntilEmpty - safetyBuffer);
  const restockDate = addDays(currentDate, restockDays);
  
  return { 
    restockDate, 
    reason: `Based on ${avgDailySales.toFixed(1)} daily sales avg` 
  };
}

export function getUpcomingFestivals(days: number = 10): Festival[] {
  const today = new Date();
  const upcoming: Festival[] = [];
  
  Object.entries(INDIAN_FESTIVALS_2024_2025).forEach(([dateStr, festivalInfo]) => {
    const festivalDate = new Date(dateStr);
    const daysUntil = differenceInDays(festivalDate, today);
    
    if (daysUntil >= 0 && daysUntil <= days) {
      upcoming.push({
        date: festivalDate,
        days_until: daysUntil,
        name: festivalInfo.name,
        products: festivalInfo.products
      });
    }
  });
  
  return upcoming.sort((a, b) => a.days_until - b.days_until);
}

export function getWeatherRecommendations(): WeatherInfo {
  const currentSeason = getSeasonFromDate(new Date());
  
  let weatherCondition: 'hot' | 'cold' | 'rainy';
  let forecast: string;
  
  switch (currentSeason) {
    case 'Summer':
      weatherCondition = 'hot';
      forecast = "Summer season - Hot weather expected";
      break;
    case 'Winter':
      weatherCondition = 'cold';
      forecast = "Winter season - Cold weather expected";
      break;
    default:
      weatherCondition = 'rainy';
      forecast = `${currentSeason} season - Variable weather expected`;
  }
  
  return {
    condition: weatherCondition,
    products: WEATHER_PRODUCT_MAP[weatherCondition] || [],
    forecast
  };
}

export function findMatchingProducts(productList: string[], keywordList: string[]): string[] {
  const matches: string[] = [];
  
  productList.forEach(product => {
    const productLower = product.toLowerCase();
    const hasMatch = keywordList.some(keyword => 
      productLower.includes(keyword.toLowerCase())
    );
    
    if (hasMatch) {
      matches.push(product);
    }
  });
  
  return [...new Set(matches)]; // Remove duplicates
}

export function generateRestockPredictions(data: ProcessedInventoryData[]): RestockPrediction[] {
  const productGroups = data.reduce((groups, item) => {
    if (!groups[item.Product]) {
      groups[item.Product] = [];
    }
    groups[item.Product].push(item);
    return groups;
  }, {} as Record<string, ProcessedInventoryData[]>);

  return Object.entries(productGroups).map(([product, productData]) => {
    const { restockDate, reason } = predictRestockDateImproved(productData);
    const sortedData = [...productData].sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    const latestData = sortedData[sortedData.length - 1];
    
    const recentSales = sortedData.slice(-5);
    const avgDailySales = recentSales.reduce((sum, item) => sum + item.Sold, 0) / recentSales.length;
    
    let daysUntilRestock = 999;
    let status = '🟢 GOOD (>10 days)';
    
    if (latestData.Stock <= 0) {
      daysUntilRestock = 0;
      status = '🚨 OUT OF STOCK';
    } else if (avgDailySales > 0) {
      daysUntilRestock = latestData.Stock / avgDailySales;
      if (daysUntilRestock <= 2) status = '🔴 CRITICAL (≤2 days)';
      else if (daysUntilRestock <= 5) status = '🟠 LOW (≤5 days)';
      else if (daysUntilRestock <= 10) status = '🟡 MODERATE (≤10 days)';
    }
    
    return {
      Product: product,
      Category: latestData.Category,
      Current_Stock: latestData.Stock,
      Avg_Daily_Sales: avgDailySales,
      Restock_Date: restockDate,
      Reason: reason,
      Days_Until_Restock: daysUntilRestock,
      Status: status
    };
  });
}

export function generateSmartRecommendations(
  data: ProcessedInventoryData[], 
  upcomingFestivals: Festival[], 
  weatherInfo: WeatherInfo
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const uniqueProducts = [...new Set(data.map(item => item.Product))];
  
  // Festival-based recommendations
  upcomingFestivals.forEach(festival => {
    const matchingProducts = findMatchingProducts(uniqueProducts, festival.products);
    
    if (matchingProducts.length > 0) {
      const festivalAdvice: Array<{
        product: string;
        current_stock: number;
        recommended: number;
        shortage: number;
        avg_sales: number;
      }> = [];
      
      matchingProducts.forEach(product => {
        const productData = data.filter(item => item.Product === product)
          .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
        
        if (productData.length > 0) {
          const currentStock = productData[productData.length - 1].Stock;
          const recentSales = productData.slice(-5);
          const avgSales = recentSales.reduce((sum, item) => sum + item.Sold, 0) / recentSales.length;
          
          const festivalMultiplier = festival.days_until <= 3 ? 2.0 : 1.5;
          const recommendedStock = avgSales * festivalMultiplier * 7; // Week's worth
          
          if (currentStock < recommendedStock) {
            const shortage = recommendedStock - currentStock;
            festivalAdvice.push({
              product,
              current_stock: currentStock,
              recommended: recommendedStock,
              shortage,
              avg_sales: avgSales
            });
          }
        }
      });
      
      if (festivalAdvice.length > 0) {
        const urgency = festival.days_until <= 3 ? 'High' : festival.days_until <= 7 ? 'Medium' : 'Low';
        
        let recText = `🎉 **${festival.name}** is coming in **${festival.days_until} days**!\n\n`;
        
        festivalAdvice.forEach(advice => {
          recText += `• **${advice.product}**: Current stock ${Math.round(advice.current_stock)} units\n`;
          recText += `  - Average daily sales: ${advice.avg_sales.toFixed(1)} units\n`;
          recText += `  - Recommended stock: ${Math.round(advice.recommended)} units\n`;
          recText += `  - **BUY ${Math.round(advice.shortage)} more units** for festival demand!\n\n`;
        });
        
        recommendations.push({
          type: 'Festival',
          title: `${festival.name} Preparation`,
          reason: recText,
          products: festivalAdvice.map(a => a.product),
          urgency: urgency as 'High' | 'Medium' | 'Low',
          action_needed: festivalAdvice.reduce((sum, a) => sum + a.shortage, 0)
        });
      }
    }
  });
  
  // Weather-based recommendations
  const weatherMatches = findMatchingProducts(uniqueProducts, weatherInfo.products);
  
  if (weatherMatches.length > 0) {
    const weatherAdvice: Array<{
      product: string;
      current_stock: number;
      recommended: number;
      shortage: number;
      avg_sales: number;
    }> = [];
    
    weatherMatches.forEach(product => {
      const productData = data.filter(item => item.Product === product)
        .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
      
      if (productData.length > 0) {
        const currentStock = productData[productData.length - 1].Stock;
        const recentSales = productData.slice(-5);
        const avgSales = recentSales.reduce((sum, item) => sum + item.Sold, 0) / recentSales.length;
        
        const weatherMultiplier = 1.3;
        const recommendedStock = avgSales * weatherMultiplier * 10; // 10 days worth
        
        if (currentStock < recommendedStock) {
          weatherAdvice.push({
            product,
            current_stock: currentStock,
            recommended: recommendedStock,
            shortage: recommendedStock - currentStock,
            avg_sales: avgSales
          });
        }
      }
    });
    
    if (weatherAdvice.length > 0) {
      let recText = `🌤 **${weatherInfo.forecast}**\n\n`;
      
      weatherAdvice.forEach(advice => {
        recText += `• **${advice.product}**: Stock up for ${weatherInfo.condition} weather\n`;
        recText += `  - Current stock: ${Math.round(advice.current_stock)} units\n`;
        recText += `  - **Increase by ${Math.round(advice.shortage)} units** for weather demand\n\n`;
      });
      
      recommendations.push({
        type: 'Weather',
        title: `${weatherInfo.condition.charAt(0).toUpperCase() + weatherInfo.condition.slice(1)} Weather Preparation`,
        reason: recText,
        products: weatherAdvice.map(a => a.product),
        urgency: 'Medium'
      });
    }
  }
  
  // Stock shortage alerts
  const shortageAlerts: Array<{
    product: string;
    issue: string;
    action: string;
    current_stock: number;
    avg_sales: number;
  }> = [];
  
  uniqueProducts.forEach(product => {
    const productData = data.filter(item => item.Product === product)
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    
    if (productData.length > 0) {
      const currentStock = productData[productData.length - 1].Stock;
      const recentSales = productData.slice(-5);
      const avgSales = recentSales.reduce((sum, item) => sum + item.Sold, 0) / recentSales.length;
      
      if (currentStock <= 0) {
        shortageAlerts.push({
          product,
          issue: 'OUT OF STOCK',
          action: 'Restock immediately!',
          current_stock: currentStock,
          avg_sales: avgSales
        });
      } else if (currentStock < avgSales * 3 && avgSales > 0) {
        shortageAlerts.push({
          product,
          issue: 'LOW STOCK',
          action: `Only ${(currentStock / avgSales).toFixed(1)} days left`,
          current_stock: currentStock,
          avg_sales: avgSales
        });
      }
    }
  });
  
  if (shortageAlerts.length > 0) {
    let alertText = "🚨 **URGENT STOCK ALERTS**\n\n";
    
    shortageAlerts.forEach(alert => {
      alertText += `• **${alert.product}**: ${alert.issue}\n`;
      alertText += `  - ${alert.action}\n`;
      alertText += `  - Average daily sales: ${alert.avg_sales.toFixed(1)} units\n\n`;
    });
    
    recommendations.push({
      type: 'Urgent',
      title: 'Critical Stock Shortages',
      reason: alertText,
      products: shortageAlerts.map(a => a.product),
      urgency: 'Critical'
    });
  }
  
  return recommendations;
}

export function calculateKeyMetrics(data: ProcessedInventoryData[], previousData?: ProcessedInventoryData[]) {
  const totalSales = data.reduce((sum, item) => sum + item.Sold, 0);
  const avgStock = data.reduce((sum, item) => sum + item.Stock, 0) / data.length;
  const uniqueProducts = new Set(data.map(item => item.Product)).size;
  const outOfStock = data.filter(item => item.Stock <= 0).length;
  
  let deltaSales = 0;
  if (previousData) {
    const prevTotalSales = previousData.reduce((sum, item) => sum + item.Sold, 0);
    deltaSales = totalSales - prevTotalSales;
  }
  
  return {
    totalSales,
    avgStock,
    uniqueProducts,
    outOfStock,
    deltaSales
  };
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  const csvContent = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}