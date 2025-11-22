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
      icon: "📦",
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
    },
    {
      title: "Total Warehouses",
      value: totalWarehouses,
      icon: "🏭",
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      icon: "⚠️",
      color: "from-red-500 to-red-600",
      textColor: "text-red-600",
    },
    {
      title: "Pending Receipts",
      value: pendingReceipts,
      icon: "📥",
      color: "from-yellow-500 to-yellow-600",
      textColor: "text-yellow-600",
    },
    {
      title: "Pending Deliveries",
      value: pendingDeliveries,
      icon: "📤",
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Overview of your inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100"
          >
            <div className={`bg-gradient-to-br ${card.color} p-4`}>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{card.icon}</span>
                <div className="text-right">
                  <p className="text-white text-3xl font-bold">{card.value}</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className={`text-sm font-semibold ${card.textColor} uppercase tracking-wide`}>
                {card.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <span>📋</span>
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
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Date/Time
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Warehouse
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentActivity.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">
                        {entry.product?.name || entry.productId}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {entry.warehouse?.name || entry.warehouseId}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            entry.change > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {formatChange(entry.change)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 font-mono">
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
