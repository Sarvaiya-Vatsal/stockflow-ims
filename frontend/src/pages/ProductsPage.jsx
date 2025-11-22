function ProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Products</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add Product
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600">No products yet</p>
      </div>
    </div>
  );
}

export default ProductsPage;

