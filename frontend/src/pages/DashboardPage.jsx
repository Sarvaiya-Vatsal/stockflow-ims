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
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h2>
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-700">Filter by Warehouse:</label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Total Products</p>
          <p className="text-3xl font-semibold text-gray-800">{totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Total Warehouses</p>
          <p className="text-3xl font-semibold text-gray-800">{totalWarehouses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Low Stock Items</p>
          <p className="text-3xl font-semibold text-red-600">{lowStockCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Pending Receipts</p>
          <p className="text-3xl font-semibold text-yellow-600">{pendingReceipts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Pending Deliveries</p>
          <p className="text-3xl font-semibold text-orange-600">{pendingDeliveries}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-600">No recent activity</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date/Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Warehouse
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Change
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {entry.product?.name || entry.productId}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {entry.warehouse?.name || entry.warehouseId}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm font-medium ${
                        entry.change > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatChange(entry.change)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.type}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
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
  );
}

export default DashboardPage;
