import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/products", label: "Products" },
    { path: "/warehouses", label: "Warehouses" },
    { path: "/operations", label: "Operations" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">StockFlow IMS</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800">
            {navItems.find((item) => item.path === location.pathname)?.label ||
              "Dashboard"}
          </h2>
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;

