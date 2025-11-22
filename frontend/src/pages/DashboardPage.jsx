import { useState, useEffect } from "react";
import api from "../services/api";

function DashboardPage() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalWarehouses, setTotalWarehouses] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingReceipts, setPendingReceipts] = useState(0);
  const [pendingDeliveries, setPendingDeliveries] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchRecentActivity();
  }, [selectedWarehouse]);

  const fetchWarehouses = async () => {
    try {
      const response = await api.get("/warehouses");
      setWarehouses(response.data);
    } catch (err) {
      console.error("Failed to fetch warehouses:", err);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");
      const params = selectedWarehouse ? { warehouseId: selectedWarehouse } : {};
      const response = await api.get("/dashboard/summary", { params });
      setTotalProducts(response.data.totalProducts);
      setTotalWarehouses(response.data.totalWarehouses);
      setLowStockCount(response.data.lowStockCount);
      setPendingReceipts(response.data.pendingReceipts || 0);
      setPendingDeliveries(response.data.pendingDeliveries || 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const params = selectedWarehouse
        ? { warehouseId: selectedWarehouse, limit: 10 }
        : { limit: 10 };
      const response = await api.get("/dashboard/recent-activity", { params });
      setRecentActivity(response.data);
    } catch (err) {
      console.error("Failed to fetch recent activity:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatChange = (change) => {
    return change > 0 ? `+${change}` : `${change}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
    },
    {
      title: "Total Warehouses",
      value: totalWarehouses,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      textColor: "text-red-700",
    },
    {
      title: "Pending Receipts",
      value: pendingReceipts,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      textColor: "text-yellow-700",
    },
    {
      title: "Pending Deliveries",
      value: pendingDeliveries,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      textColor: "text-orange-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1 text-sm">Overview of your inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 ${card.bgColor} rounded-lg`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
            </div>
            <div>
              <p className={`text-2xl font-semibold ${card.textColor} mb-1`}>{card.value}</p>
              <p className="text-sm text-gray-600 font-medium">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Recent Activity</span>
          </h3>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No recent activity</p>
              <p className="text-gray-400 text-sm mt-1">Stock movements will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date/Time
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Warehouse
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentActivity.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {entry.product?.name || entry.productId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.warehouse?.name || entry.warehouseId}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            entry.change > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {formatChange(entry.change)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono text-xs">
                        {entry.reference || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
