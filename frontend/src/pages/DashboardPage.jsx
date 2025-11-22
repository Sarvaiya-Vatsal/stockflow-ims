import { useState, useEffect } from "react";
import api from "../services/api";

function DashboardPage() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalWarehouses, setTotalWarehouses] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/dashboard/summary");
        setTotalProducts(response.data.totalProducts);
        setTotalWarehouses(response.data.totalWarehouses);
        setLowStockCount(response.data.lowStockCount);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

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
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <p className="text-3xl font-semibold text-gray-800">{lowStockCount}</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

