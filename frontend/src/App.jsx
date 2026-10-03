import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AlertNotificationBanner from './components/AlertNotificationBanner';
import Dashboard from './pages/Dashboard';
import SalesAnalytics from './pages/SalesAnalytics';
import DemandForecast from './pages/DemandForecast';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import ProductDetailModal from './pages/ProductDetailModal';
import Stores from './pages/Stores';
import AIInsights from './pages/AIInsights';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProductIdForForecast, setSelectedProductIdForForecast] = useState('P-101');
  const [inspectProductId, setInspectProductId] = useState(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState(null);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  // Fetch initial top critical alert for banner
  const checkAlerts = async () => {
    try {
      const res = await api.getAlerts({ status: 'active' });
      setActiveAlertCount(res.total_active || 0);
      const crit = res.alerts.find((a) => a.severity === 'critical' && a.status === 'active');
      setCriticalAlert(crit || null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkAlerts();
  }, [activeTab]);

  const handleLaunchDemo = async () => {
    try {
      setIsDemoLoading(true);
      await api.launchDemo();
      await checkAlerts();
      // Reload current tab
      setActiveTab('dashboard');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to launch demo mode');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSelectProductForForecast = (productId) => {
    setSelectedProductIdForForecast(productId);
    setActiveTab('forecast');
  };

  const handleInspectProduct = (productId) => {
    setInspectProductId(productId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        onLaunchDemo={handleLaunchDemo}
        isDemoLoading={isDemoLoading}
        activeAlertCount={activeAlertCount}
        onOpenAlerts={() => setActiveTab('alerts')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alertCount={activeAlertCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* Critical Alert Banner (if any active critical stockout exists and not currently on alerts tab) */}
          {activeTab !== 'alerts' && (
            <AlertNotificationBanner
              criticalAlert={criticalAlert}
              onViewForecast={handleSelectProductForForecast}
              onDismiss={() => setCriticalAlert(null)}
            />
          )}

          {/* Dynamic Views */}
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={setActiveTab}
              onSelectProductForForecast={handleSelectProductForForecast}
            />
          )}

          {activeTab === 'sales' && <SalesAnalytics />}

          {activeTab === 'forecast' && (
            <DemandForecast
              preselectedProductId={selectedProductIdForForecast}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              onSelectProductForForecast={handleSelectProductForForecast}
              onSelectProductDetails={handleInspectProduct}
            />
          )}

          {activeTab === 'products' && (
            <Products
              onSelectProductDetails={handleInspectProduct}
              onSelectProductForForecast={handleSelectProductForForecast}
            />
          )}

          {activeTab === 'stores' && <Stores />}

          {activeTab === 'insights' && (
            <AIInsights
              onSelectProductForForecast={handleSelectProductForForecast}
            />
          )}

          {activeTab === 'alerts' && (
            <Alerts
              onSelectProductForForecast={handleSelectProductForForecast}
            />
          )}

          {activeTab === 'reports' && <Reports />}

          {activeTab === 'settings' && (
            <Settings
              onLaunchDemo={handleLaunchDemo}
              isDemoLoading={isDemoLoading}
            />
          )}

        </main>
      </div>

      {/* Product Detail Modal */}
      {inspectProductId && (
        <ProductDetailModal
          productId={inspectProductId}
          onClose={() => setInspectProductId(null)}
          onOpenForecast={handleSelectProductForForecast}
        />
      )}

    </div>
  );
}
