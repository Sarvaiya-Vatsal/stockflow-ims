import { useState } from "react";
import api from "../services/api";

function OperationsPage() {
  const [activeTab, setActiveTab] = useState("receipts");
  const [supplier, setSupplier] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState("");
  const [deliveryWarehouseId, setDeliveryWarehouseId] = useState("");
  const [deliveryProductId, setDeliveryProductId] = useState("");
  const [deliveryQuantity, setDeliveryQuantity] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState("");
  const [deliveryError, setDeliveryError] = useState("");

  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!warehouseId || !productId || !quantity) {
      setError("Warehouse, Product, and Quantity are required");
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Quantity must be a positive number");
      return;
    }

    setLoading(true);

    try {
      await api.post("/stock/receipts", {
        supplier: supplier || null,
        warehouseId,
        lines: [{ productId, quantity: qty }],
      });

      setSuccess("Receipt created successfully");
      setSupplier("");
      setWarehouseId("");
      setProductId("");
      setQuantity("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    setDeliveryError("");
    setDeliverySuccess("");

    if (!deliveryWarehouseId || !deliveryProductId || !deliveryQuantity) {
      setDeliveryError("Warehouse, Product, and Quantity are required");
      return;
    }

    const qty = parseInt(deliveryQuantity);
    if (isNaN(qty) || qty <= 0) {
      setDeliveryError("Quantity must be a positive number");
      return;
    }

    setDeliveryLoading(true);

    try {
      await api.post("/stock/deliveries", {
        customer: customer || null,
        warehouseId: deliveryWarehouseId,
        lines: [{ productId: deliveryProductId, quantity: qty }],
      });

      setDeliverySuccess("Delivery created successfully");
      setCustomer("");
      setDeliveryWarehouseId("");
      setDeliveryProductId("");
      setDeliveryQuantity("");
    } catch (err) {
      setDeliveryError(
        err.response?.data?.error || "Failed to create delivery"
      );
    } finally {
      setDeliveryLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Operations</h2>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("receipts")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "receipts"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Receipts
          </button>
          <button
            onClick={() => setActiveTab("deliveries")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "deliveries"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Deliveries
          </button>
        </div>
      </div>

      {activeTab === "receipts" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Create Receipt
          </h3>
          <form onSubmit={handleReceiptSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier (Optional)
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                {success}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Receipt"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "deliveries" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Create Delivery
          </h3>
          <form onSubmit={handleDeliverySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer (Optional)
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={deliveryWarehouseId}
                onChange={(e) => setDeliveryWarehouseId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={deliveryProductId}
                onChange={(e) => setDeliveryProductId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={deliveryQuantity}
                onChange={(e) => setDeliveryQuantity(e.target.value)}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {deliveryError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {deliveryError}
              </div>
            )}
            {deliverySuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                {deliverySuccess}
              </div>
            )}
            <button
              type="submit"
              disabled={deliveryLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {deliveryLoading ? "Creating..." : "Create Delivery"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default OperationsPage;

