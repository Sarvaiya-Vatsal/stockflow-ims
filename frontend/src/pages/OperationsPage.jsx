import { useState, useEffect } from "react";
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

  const [adjustmentWarehouseId, setAdjustmentWarehouseId] = useState("");
  const [adjustmentProductId, setAdjustmentProductId] = useState("");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);
  const [adjustmentSuccess, setAdjustmentSuccess] = useState("");
  const [adjustmentError, setAdjustmentError] = useState("");

  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const [receipts, setReceipts] = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);

  const [adjustments, setAdjustments] = useState([]);
  const [adjustmentsLoading, setAdjustmentsLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, warehousesRes] = await Promise.all([
          api.get("/products"),
          api.get("/warehouses"),
        ]);
        setProducts(productsRes.data);
        setWarehouses(warehousesRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "receipts") {
      fetchReceipts();
    } else if (activeTab === "deliveries") {
      fetchDeliveries();
    } else if (activeTab === "adjustments") {
      fetchAdjustments();
    } else if (activeTab === "history") {
      fetchLedger();
    }
  }, [activeTab]);

  const fetchReceipts = async () => {
    setReceiptsLoading(true);
    try {
      const response = await api.get("/stock/receipts");
      setReceipts(response.data);
    } catch (err) {
      console.error("Failed to fetch receipts:", err);
    } finally {
      setReceiptsLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    setDeliveriesLoading(true);
    try {
      const response = await api.get("/stock/deliveries");
      setDeliveries(response.data);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
    } finally {
      setDeliveriesLoading(false);
    }
  };

  const fetchAdjustments = async () => {
    setAdjustmentsLoading(true);
    try {
      const response = await api.get("/stock/adjustments");
      setAdjustments(response.data);
    } catch (err) {
      console.error("Failed to fetch adjustments:", err);
    } finally {
      setAdjustmentsLoading(false);
    }
  };

  const fetchLedger = async () => {
    setLedgerLoading(true);
    try {
      const response = await api.get("/stock/ledger");
      setLedgerEntries(response.data);
    } catch (err) {
      console.error("Failed to fetch ledger:", err);
      setLedgerEntries([]);
    } finally {
      setLedgerLoading(false);
    }
  };

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
      fetchReceipts();
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
      fetchDeliveries();
    } catch (err) {
      setDeliveryError(
        err.response?.data?.error || "Failed to create delivery"
      );
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    setAdjustmentError("");
    setAdjustmentSuccess("");

    if (!adjustmentWarehouseId || !adjustmentProductId || adjustmentQuantity === "") {
      setAdjustmentError("Warehouse, Product, and New Quantity are required");
      return;
    }

    const qty = parseFloat(adjustmentQuantity);
    if (isNaN(qty) || qty < 0) {
      setAdjustmentError("New quantity must be a non-negative number");
      return;
    }

    setAdjustmentLoading(true);

    try {
      await api.post("/stock/adjustments", {
        warehouseId: adjustmentWarehouseId,
        productId: adjustmentProductId,
        newQuantity: qty,
        reason: adjustmentReason || null,
      });

      setAdjustmentSuccess("Adjustment created successfully");
      setAdjustmentWarehouseId("");
      setAdjustmentProductId("");
      setAdjustmentQuantity("");
      setAdjustmentReason("");
      fetchAdjustments();
    } catch (err) {
      setAdjustmentError(
        err.response?.data?.error || "Failed to create adjustment"
      );
    } finally {
      setAdjustmentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatChange = (change) => {
    return change > 0 ? `+${change}` : `${change}`;
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Operations</h2>
        <p className="text-gray-600 mt-1 text-sm">Manage stock movements and transactions</p>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("receipts")}
            className={`px-4 py-2.5 font-medium text-sm transition-colors rounded-t-lg ${
              activeTab === "receipts"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Receipts
          </button>
          <button
            onClick={() => setActiveTab("deliveries")}
            className={`px-4 py-2.5 font-medium text-sm transition-colors rounded-t-lg ${
              activeTab === "deliveries"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Deliveries
          </button>
          <button
            onClick={() => setActiveTab("adjustments")}
            className={`px-4 py-2.5 font-medium text-sm transition-colors rounded-t-lg ${
              activeTab === "adjustments"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Adjustments
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 font-medium text-sm transition-colors rounded-t-lg ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Move History
          </button>
        </div>
      </div>

      {activeTab === "receipts" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
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
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium text-sm shadow-sm"
              >
                {loading ? "Creating..." : "Create Receipt"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Receipts List
            </h3>
            {receiptsLoading ? (
              <div className="text-gray-600">Loading...</div>
            ) : receipts.length === 0 ? (
              <div className="text-gray-600">No receipts found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Warehouse
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receipts.map((receipt) => (
                      <tr key={receipt.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-3 px-4 text-sm text-gray-900 font-mono text-xs">
                          {receipt.reference}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {receipt.warehouse?.name || receipt.warehouseId}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {receipt.supplier || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              receipt.status === "CONFIRMED"
                                ? "bg-green-100 text-green-700"
                                : receipt.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {receipt.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(receipt.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "deliveries" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <select
                  value={deliveryWarehouseId}
                  onChange={(e) => setDeliveryWarehouseId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={deliveryProductId}
                  onChange={(e) => setDeliveryProductId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
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
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium text-sm shadow-sm"
              >
                {deliveryLoading ? "Creating..." : "Create Delivery"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Deliveries List
            </h3>
            {deliveriesLoading ? (
              <div className="text-gray-600">Loading...</div>
            ) : deliveries.length === 0 ? (
              <div className="text-gray-600">No deliveries found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Reference
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Warehouse
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((delivery) => (
                      <tr key={delivery.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {delivery.reference}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {delivery.warehouse?.name || delivery.warehouseId}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {delivery.customer || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              delivery.status === "CONFIRMED"
                                ? "bg-green-100 text-green-800"
                                : delivery.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {delivery.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {formatDate(delivery.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "adjustments" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Adjustment
            </h3>
            <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <select
                  value={adjustmentWarehouseId}
                  onChange={(e) => setAdjustmentWarehouseId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={adjustmentProductId}
                  onChange={(e) => setAdjustmentProductId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the actual counted quantity
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g., Damaged items, counting error"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {adjustmentError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {adjustmentError}
                </div>
              )}
              {adjustmentSuccess && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                  {adjustmentSuccess}
                </div>
              )}
              <button
                type="submit"
                disabled={adjustmentLoading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium text-sm shadow-sm"
              >
                {adjustmentLoading ? "Creating..." : "Create Adjustment"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Adjustments List
            </h3>
            {adjustmentsLoading ? (
              <div className="text-gray-600">Loading...</div>
            ) : adjustments.length === 0 ? (
              <div className="text-gray-600">No adjustments found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Reference
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Warehouse
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Reason
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.map((adjustment) => (
                      <tr key={adjustment.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {adjustment.reference}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {adjustment.warehouse?.name || adjustment.warehouseId}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {adjustment.reason || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {formatDate(adjustment.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Move History
          </h3>
          {ledgerLoading ? (
            <div className="text-gray-600">Loading...</div>
          ) : ledgerEntries.length === 0 ? (
            <div className="text-gray-600">No entries found</div>
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
                  {ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {entry.product?.name || entry.productId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {entry.warehouse?.name || entry.warehouse?.code || entry.warehouseId}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm font-medium ${
                          entry.change > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatChange(entry.change)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {entry.type}
                      </td>
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
      )}
    </div>
  );
}

export default OperationsPage;
