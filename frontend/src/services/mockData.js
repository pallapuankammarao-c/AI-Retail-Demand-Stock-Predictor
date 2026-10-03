// Static Fallback & Demo Data for RetailPulse AI (Used on GitHub Pages and Offline Demo)

export const MOCK_PRODUCTS = [
  { product_id: 'P-101', name: 'Wireless Noise-Canceling Headphones', category: 'Electronics', price: 4999, cost_price: 3200, supplier: 'AudioTech Ltd', lead_time_days: 4, description: 'Premium active noise cancellation Bluetooth 5.2 headphones with 30-hour battery life.' },
  { product_id: 'P-102', name: '4K Smart LED TV 55"', category: 'Electronics', price: 34999, cost_price: 26000, supplier: 'VisionMax Corp', lead_time_days: 7, description: 'Ultra-HD Smart TV with HDR10+, Dolby Audio, and voice-assisted smart remote.' },
  { product_id: 'P-103', name: 'Organic Basmati Rice 5kg', category: 'Groceries', price: 650, cost_price: 480, supplier: 'NatureHarvest Agro', lead_time_days: 3, description: 'Aged long-grain aromatic organic basmati rice grown in the Himalayan foothills.' },
  { product_id: 'P-104', name: 'Premium Cotton Polo Shirt', category: 'Apparel', price: 1299, cost_price: 750, supplier: 'VogueWear Mills', lead_time_days: 5, description: 'Breathable 100% combed cotton pique knit polo shirt available in multiple colors.' },
  { product_id: 'P-105', name: 'Instant Roasted Coffee 200g', category: 'Groceries', price: 420, cost_price: 290, supplier: 'BeanCraft Roasters', lead_time_days: 2, description: 'Freeze-dried dark roast Arabica coffee granules with intense aroma and velvety crema.' },
  { product_id: 'P-106', name: 'Stainless Steel Water Bottle 1L', category: 'Home & Kitchen', price: 799, cost_price: 450, supplier: 'HydroSteel Goods', lead_time_days: 4, description: 'Vacuum-insulated double-wall thermal flask keeping drinks chilled for 24h or hot for 12h.' },
  { product_id: 'P-107', name: 'Bluetooth Fitness Smartwatch', category: 'Electronics', price: 2999, cost_price: 1850, supplier: 'SyncPulse Devices', lead_time_days: 6, description: 'AMOLED display fitness tracker with heart-rate sensor, SpO2 monitoring, and 5ATM water resistance.' },
  { product_id: 'P-108', name: 'Almond & Honey Body Lotion 400ml', category: 'Personal Care', price: 380, cost_price: 240, supplier: 'GlowOrganics Herbals', lead_time_days: 3, description: 'Deep nourishing moisture repair lotion enriched with cold-pressed sweet almond oil.' },
  { product_id: 'P-109', name: 'Cold-Pressed Extra Virgin Olive Oil 1L', category: 'Groceries', price: 950, cost_price: 720, supplier: 'Mediterranean Groves', lead_time_days: 8, description: 'First cold-pressed unrefined culinary olive oil with high polyphenols and low acidity.' },
  { product_id: 'P-110', name: 'Slim Fit Denim Jeans', category: 'Apparel', price: 2199, cost_price: 1300, supplier: 'IndigoForge Apparel', lead_time_days: 6, description: 'Stretch denim five-pocket jeans with faded wash detailing and reinforced stitching.' }
];

export const MOCK_INVENTORY = [
  { product_id: 'P-101', name: 'Wireless Noise-Canceling Headphones', category: 'Electronics', current_stock: 42, daily_demand: 14.8, days_remaining: 2.8, reorder_point: 85, safety_stock: 30, reorder_quantity: 160, status: 'critical', unit_price: 4999 },
  { product_id: 'P-102', name: '4K Smart LED TV 55"', category: 'Electronics', current_stock: 18, daily_demand: 3.2, days_remaining: 5.6, reorder_point: 25, safety_stock: 8, reorder_quantity: 40, status: 'low_stock', unit_price: 34999 },
  { product_id: 'P-103', name: 'Organic Basmati Rice 5kg', category: 'Groceries', current_stock: 120, daily_demand: 7.1, days_remaining: 16.9, reorder_point: 50, safety_stock: 20, reorder_quantity: 100, status: 'healthy', unit_price: 650 },
  { product_id: 'P-104', name: 'Premium Cotton Polo Shirt', category: 'Apparel', current_stock: 580, daily_demand: 8.4, days_remaining: 69.0, reorder_point: 60, safety_stock: 25, reorder_quantity: 50, status: 'overstock', unit_price: 1299 },
  { product_id: 'P-105', name: 'Instant Roasted Coffee 200g', category: 'Groceries', current_stock: 15, daily_demand: 6.5, days_remaining: 2.3, reorder_point: 40, safety_stock: 15, reorder_quantity: 80, status: 'critical', unit_price: 420 },
  { product_id: 'P-106', name: 'Stainless Steel Water Bottle 1L', category: 'Home & Kitchen', current_stock: 85, daily_demand: 4.8, days_remaining: 17.7, reorder_point: 35, safety_stock: 14, reorder_quantity: 60, status: 'healthy', unit_price: 799 },
  { product_id: 'P-107', name: 'Bluetooth Fitness Smartwatch', category: 'Electronics', current_stock: 22, daily_demand: 4.1, days_remaining: 5.4, reorder_point: 32, safety_stock: 12, reorder_quantity: 50, status: 'low_stock', unit_price: 2999 },
  { product_id: 'P-108', name: 'Almond & Honey Body Lotion 400ml', category: 'Personal Care', current_stock: 94, daily_demand: 5.2, days_remaining: 18.1, reorder_point: 42, safety_stock: 16, reorder_quantity: 70, status: 'healthy', unit_price: 380 },
  { product_id: 'P-109', name: 'Cold-Pressed Extra Virgin Olive Oil 1L', category: 'Groceries', current_stock: 12, daily_demand: 4.3, days_remaining: 2.8, reorder_point: 38, safety_stock: 15, reorder_quantity: 60, status: 'critical', unit_price: 950 },
  { product_id: 'P-110', name: 'Slim Fit Denim Jeans', category: 'Apparel', current_stock: 450, daily_demand: 7.2, days_remaining: 62.5, reorder_point: 55, safety_stock: 22, reorder_quantity: 40, status: 'overstock', unit_price: 2199 }
];

export const MOCK_STORES = [
  { store_id: 'ST-01', name: 'Metro Flagship - Indiranagar', city: 'Bangalore', manager: 'Rahul Verma', revenue: 4820000, transactions: 12450, inventory_count: 3200, status: 'Top Performer' },
  { store_id: 'ST-02', name: 'Bandra Retail Hub', city: 'Mumbai', manager: 'Priya Mehta', revenue: 4250000, transactions: 11200, inventory_count: 2850, status: 'High Growth' },
  { store_id: 'ST-03', name: 'Connaught Place Central', city: 'Delhi', manager: 'Amitabh Sharma', revenue: 3980000, transactions: 10400, inventory_count: 2540, status: 'Consistent' },
  { store_id: 'ST-04', name: 'Hitec City Galleria', city: 'Hyderabad', manager: 'Kavita Reddy', revenue: 3460000, transactions: 9100, inventory_count: 2210, status: 'High Tech Volume' },
  { store_id: 'ST-05', name: 'Anna Nagar Mall', city: 'Chennai', manager: 'Suresh Raman', revenue: 2890000, transactions: 7800, inventory_count: 1950, status: 'Stable' },
  { store_id: 'ST-06', name: 'Koregaon Park Outlets', city: 'Pune', manager: 'Neha Deshmukh', revenue: 2420000, transactions: 6500, inventory_count: 1720, status: 'Growing' },
  { store_id: 'ST-07', name: 'Salt Lake City Center', city: 'Kolkata', manager: 'Subhashish Das', revenue: 2100000, transactions: 5900, inventory_count: 1530, status: 'Moderate' },
  { store_id: 'ST-08', name: 'SG Highway Hypermarket', city: 'Ahmedabad', manager: 'Chirag Patel', revenue: 1950000, transactions: 5200, inventory_count: 1410, status: 'Expansion Zone' }
];

export const MOCK_ALERTS = [
  { id: 1, type: 'stockout_risk', severity: 'critical', title: 'Imminent Stockout Risk', message: 'Wireless Noise-Canceling Headphones has 42 units left (~2.8 days of cover). Reorder 160 units immediately.', product_id: 'P-101', product_name: 'Wireless Noise-Canceling Headphones', status: 'active', created_at: '2026-10-03T10:15:00Z' },
  { id: 2, type: 'stockout_risk', severity: 'critical', title: 'Critical Depletion Alert', message: 'Instant Roasted Coffee 200g has 15 units remaining (~2.3 days). Reorder 80 units.', product_id: 'P-105', product_name: 'Instant Roasted Coffee 200g', status: 'active', created_at: '2026-10-03T10:45:00Z' },
  { id: 3, type: 'stockout_risk', severity: 'critical', title: 'Stockout Risk Alert', message: 'Extra Virgin Olive Oil has 12 units remaining (~2.8 days). Lead time is 8 days.', product_id: 'P-109', product_name: 'Cold-Pressed Extra Virgin Olive Oil 1L', status: 'active', created_at: '2026-10-03T11:00:00Z' },
  { id: 4, type: 'low_stock', severity: 'warning', title: 'Low Stock Threshold Reached', message: '4K Smart LED TV 55" has 18 units remaining (~5.6 days). Reorder point is 25.', product_id: 'P-102', product_name: '4K Smart LED TV 55"', status: 'active', created_at: '2026-10-03T09:20:00Z' },
  { id: 5, type: 'low_stock', severity: 'warning', title: 'Reorder Point Approaching', message: 'Bluetooth Fitness Smartwatch has 22 units remaining (~5.4 days). Lead time is 6 days.', product_id: 'P-107', product_name: 'Bluetooth Fitness Smartwatch', status: 'active', created_at: '2026-10-03T08:15:00Z' },
  { id: 6, type: 'overstock', severity: 'info', title: 'Excess Working Capital Lockup', message: 'Premium Cotton Polo Shirt has 580 units (69 days of cover). ₹753,420 tied up.', product_id: 'P-104', product_name: 'Premium Cotton Polo Shirt', status: 'active', created_at: '2026-10-02T14:30:00Z' },
  { id: 7, type: 'overstock', severity: 'info', title: 'Overstock Capital Alert', message: 'Slim Fit Denim Jeans has 450 units (62.5 days of cover). ₹989,550 tied up.', product_id: 'P-110', product_name: 'Slim Fit Denim Jeans', status: 'active', created_at: '2026-10-02T16:00:00Z' },
  { id: 8, type: 'demand_spike', severity: 'info', title: 'Weekend Surge Predicted', message: 'Electronics demand forecast to increase by +35% this weekend. Prepare logistics.', product_id: 'P-101', product_name: 'Electronics Category', status: 'active', created_at: '2026-10-03T07:00:00Z' },
  { id: 9, type: 'margin_alert', severity: 'warning', title: 'Margin Dilution Detected', message: 'Promotions with discounts > 25% are reducing net profit margins on Groceries by 8.4%.', product_id: 'P-103', product_name: 'Groceries Category', status: 'active', created_at: '2026-10-01T12:00:00Z' },
  { id: 10, type: 'lead_time', severity: 'warning', title: 'Supplier Transit Delay Alert', message: 'VisionMax Corp shipment delayed by 2 days due to regional port congestion.', product_id: 'P-102', product_name: '4K Smart LED TV 55"', status: 'active', created_at: '2026-10-02T11:20:00Z' },
  { id: 11, type: 'reorder_suggested', severity: 'info', title: 'Auto-Replenishment Planned', message: 'Optimal batch order recommended for ST-01 Metro Flagship.', product_id: 'P-106', product_name: 'Stainless Steel Water Bottle 1L', status: 'active', created_at: '2026-10-03T06:45:00Z' }
];

export const MOCK_DASHBOARD = {
  kpis: {
    total_revenue: 24850210,
    revenue_growth_pct: 18.4,
    total_units_sold: 142890,
    units_growth_pct: 12.2,
    profit_margin_pct: 22.4,
    stockout_risk_items: 3,
    overstock_capital: 1420000,
    forecast_accuracy_pct: 94.2
  },
  sales_trend: [
    { date: '2024-01', revenue: 1420000, units: 8200, profit: 310000 },
    { date: '2024-02', revenue: 1610000, units: 9100, profit: 360000 },
    { date: '2024-03', revenue: 1790000, units: 10200, profit: 402000 },
    { date: '2024-04', revenue: 1720000, units: 9800, profit: 385000 },
    { date: '2024-05', revenue: 1940000, units: 11100, profit: 435000 },
    { date: '2024-06', revenue: 2120000, units: 12300, profit: 475000 },
    { date: '2024-07', revenue: 2310000, units: 13400, profit: 518000 },
    { date: '2024-08', revenue: 2240000, units: 12900, profit: 502000 },
    { date: '2024-09', revenue: 2430000, units: 14100, profit: 544000 },
    { date: '2024-10', revenue: 2710000, units: 15600, profit: 607000 },
    { date: '2024-11', revenue: 3120000, units: 17800, profit: 699000 },
    { date: '2024-12', revenue: 3840000, units: 21500, profit: 860000 }
  ],
  inventory_summary: {
    healthy: 12,
    low_stock: 3,
    critical: 3,
    overstock: 2
  },
  recent_alerts: MOCK_ALERTS.slice(0, 5),
  fast_moving: MOCK_INVENTORY.slice(0, 5)
};

export const MOCK_SALES_ANALYTICS = {
  summary: {
    total_revenue: 24850210,
    total_units: 142890,
    avg_order_value: 1740,
    total_orders: 14280
  },
  category_performance: [
    { category: 'Electronics', revenue: 11420000, units: 38400, profit: 2620000, margin_pct: 22.9 },
    { category: 'Groceries', revenue: 6840000, units: 62100, profit: 1430000, margin_pct: 20.9 },
    { category: 'Apparel', revenue: 4210000, units: 24800, profit: 980000, margin_pct: 23.3 },
    { category: 'Home & Kitchen', revenue: 1520000, units: 11200, profit: 340000, margin_pct: 22.4 },
    { category: 'Personal Care', revenue: 860000, units: 6390, profit: 198000, margin_pct: 23.0 }
  ],
  day_of_week: [
    { day: 'Mon', revenue: 2850000, units: 16400 },
    { day: 'Tue', revenue: 2920000, units: 16800 },
    { day: 'Wed', revenue: 3050000, units: 17500 },
    { day: 'Thu', revenue: 3180000, units: 18200 },
    { day: 'Fri', revenue: 3950000, units: 22800 },
    { day: 'Sat', revenue: 4650000, units: 26800 },
    { day: 'Sun', revenue: 4250000, units: 24390 }
  ],
  discount_impact: [
    { discount_range: '0% (Full Price)', margin_pct: 28.4, volume_pct: 35 },
    { discount_range: '5% - 15%', margin_pct: 22.1, volume_pct: 42 },
    { discount_range: '15% - 25%', margin_pct: 14.8, volume_pct: 18 },
    { discount_range: '25%+', margin_pct: 4.2, volume_pct: 5 }
  ]
};

export const MOCK_AI_INSIGHTS = {
  executive_summary: "RetailPulse AI analyzed 66,000+ sales transactions across 8 store locations. Total annualized turnover reached ₹24.8M with a healthy 22.4% operating profit margin. However, 3 high-velocity products face critical stockout risk within 3 days, while 2 apparel SKUs tie up ₹1.42M in stagnant working capital.",
  stockout_risks: [
    { product_name: "Wireless Noise-Canceling Headphones", days_remaining: 2.8, daily_demand: 14.8, current_stock: 42, recommendation: "Issue purchase order for 160 units immediately to AudioTech Ltd (4-day lead time)." },
    { product_name: "Instant Roasted Coffee 200g", days_remaining: 2.3, daily_demand: 6.5, current_stock: 15, recommendation: "Issue purchase order for 80 units to BeanCraft Roasters (2-day lead time)." },
    { product_name: "Extra Virgin Olive Oil 1L", days_remaining: 2.8, daily_demand: 4.3, current_stock: 12, recommendation: "Expedite shipment of 60 units from Mediterranean Groves (8-day transit window)." }
  ],
  overstock_recommendations: [
    { product_name: "Premium Cotton Polo Shirt", days_cover: 69.0, current_stock: 580, locked_capital: 753420, action: "Implement a 20% bundle discount across ST-01 and ST-02 to accelerate turnover before season transition." },
    { product_name: "Slim Fit Denim Jeans", days_cover: 62.5, current_stock: 450, locked_capital: 989550, action: "Trigger inter-store stock balancing from Bangalore to Pune branch where denim demand is outperforming." }
  ],
  pricing_strategies: [
    { category: "Electronics", insight: "Demand elasticity is low during weekend peaks (+35% volume). Maintain price integrity and avoid discounts exceeding 10% on flagship audio and smart devices." },
    { category: "Groceries", insight: "Mid-week bulk discounts (5-10%) increase basket size by 24% without sacrificing profitability." }
  ]
};
