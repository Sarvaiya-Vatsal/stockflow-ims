function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Total Products</p>
          <p className="text-3xl font-semibold text-gray-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Low Stock Items</p>
          <p className="text-3xl font-semibold text-gray-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Recent Operations</p>
          <p className="text-3xl font-semibold text-gray-800">0</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

