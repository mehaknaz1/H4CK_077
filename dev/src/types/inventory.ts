export interface InventoryData {
  Date: string;
  Product: string;
  Sold: number;
  Stock: number;
  Category?: string;
  Season?: string;
  Restock_Date?: string;
}

export interface ProcessedInventoryData extends InventoryData {
  parsedDate: Date;
  Category: string;
  Season: string;
}

export interface FestivalInfo {
  name: string;
  products: string[];
}

export interface Festival {
  date: Date;
  days_until: number;
  name: string;
  products: string[];
}

export interface WeatherInfo {
  condition: 'hot' | 'cold' | 'rainy';
  products: string[];
  forecast: string;
}

export interface RestockPrediction {
  Product: string;
  Category: string;
  Current_Stock: number;
  Avg_Daily_Sales: number;
  Restock_Date: Date | null;
  Reason: string;
  Days_Until_Restock?: number;
  Status?: string;
}

export interface Recommendation {
  type: 'Festival' | 'Weather' | 'Urgent' | 'Historical';
  title: string;
  reason: string;
  products: string[];
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  action_needed?: number;
}

export interface VelocityAnalysis {
  Product: string;
  Category: string;
  Total_Sales: number;
  Avg_Daily_Sales: number;
  Current_Stock: number;
  Sales_Trend: 'Increasing' | 'Decreasing' | 'Stable';
  Stock_Turn_Days: number;
  Performance_Score: number;
}

export interface KeyMetrics {
  totalSales: number;
  avgStock: number;
  uniqueProducts: number;
  outOfStock: number;
  deltaSales: number;
}

export type Season = 'Winter' | 'Spring' | 'Summer' | 'Autumn';
export type UrgencyLevel = 'Critical' | 'High' | 'Medium' | 'Low';