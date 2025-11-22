# StockMaster Frontend

Modern React/Next.js frontend for the StockMaster Inventory Management System.

## Features

- 🚀 Next.js 14+ with App Router
- ⚛️ React 19 with TypeScript
- 🎨 Tailwind CSS for styling
- 🔐 JWT Authentication
- 📊 Dashboard with KPIs
- 📦 Product Management
- 📝 Receipts Management
- 🚚 Delivery Orders
- 🔄 Internal Transfers
- 📊 Stock Adjustments
- 📈 Move History Tracking

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3000/api`

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

   If you encounter disk space issues, install dependencies in smaller batches:
   ```bash
   npm install axios @tanstack/react-query
   npm install zustand react-hook-form @hookform/resolvers zod
   npm install date-fns lucide-react clsx
   ```

2. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication pages
│   ├── register/
│   ├── dashboard/         # Dashboard page
│   ├── products/          # Product management
│   ├── receipts/          # Receipts management
│   ├── delivery-orders/   # Delivery orders
│   ├── internal-transfers/ # Internal transfers
│   ├── stock-adjustments/  # Stock adjustments
│   ├── move-history/      # Move history
│   ├── settings/          # Settings page
│   └── profile/           # User profile
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components
├── lib/                  # Utilities and helpers
│   ├── api/             # API client and endpoints
│   ├── store/           # State management (Zustand)
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

## Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Data fetching and caching
- **Zustand**: Lightweight state management
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Axios**: HTTP client
- **Lucide React**: Icon library

## API Integration

The frontend communicates with the backend API through:

- `lib/api/client.ts` - Axios instance with interceptors
- `lib/api/*.ts` - API endpoint functions

### Authentication Flow

1. User logs in via `/login`
2. JWT tokens stored in localStorage and Zustand store
3. Axios interceptor adds token to all requests
4. Token refresh handled automatically on 401 errors

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:3000/api`)

## Troubleshooting

### Disk Space Issues

If you encounter `ENOSPC` errors:
1. Clear npm cache: `npm cache clean --force`
2. Free up disk space
3. Install dependencies in smaller batches

### API Connection Issues

1. Ensure backend is running on port 3000
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS is enabled in backend

### Authentication Issues

1. Clear localStorage: `localStorage.clear()`
2. Check token expiration in backend
3. Verify JWT_SECRET is set in backend `.env`

## Next Steps

- [ ] Add product creation/edit forms
- [ ] Implement receipts workflow
- [ ] Add delivery order management
- [ ] Create internal transfer forms
- [ ] Add stock adjustment interface
- [ ] Implement move history filters
- [ ] Add user settings page
- [ ] Create profile management

## License

ISC

