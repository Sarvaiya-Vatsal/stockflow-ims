# Frontend Setup Guide

## Quick Start

The frontend has been set up with Next.js, TypeScript, and Tailwind CSS. Due to disk space constraints, you'll need to install dependencies manually.

## Installation Steps

1. **Navigate to frontend directory:**
   ```bash
   cd stockflow-ims/frontend
   ```

2. **Install dependencies (in batches if needed):**
   ```bash
   # Core dependencies
   npm install axios @tanstack/react-query zustand
   
   # Form handling
   npm install react-hook-form @hookform/resolvers zod
   
   # Utilities
   npm install date-fns lucide-react clsx
   ```

   Or install all at once:
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Copy the example file
   # Note: .env.local is gitignored, create it manually if needed
   ```

   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3001`

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── dashboard/           # Dashboard with KPIs
│   ├── products/            # Products management
│   ├── receipts/            # Receipts (to be created)
│   ├── delivery-orders/      # Delivery orders (to be created)
│   ├── internal-transfers/  # Internal transfers (to be created)
│   ├── stock-adjustments/   # Stock adjustments (to be created)
│   ├── move-history/        # Move history (to be created)
│   ├── settings/            # Settings page
│   ├── profile/             # User profile
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (redirects to dashboard)
│   └── providers.tsx        # React Query provider
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   └── layout/              # Layout components
│       ├── sidebar.tsx       # Navigation sidebar
│       └── main-layout.tsx   # Main authenticated layout
├── lib/
│   ├── api/                 # API clients
│   │   ├── client.ts        # Axios instance with interceptors
│   │   ├── auth.ts          # Authentication API
│   │   ├── dashboard.ts     # Dashboard API
│   │   └── products.ts      # Products API
│   ├── store/               # State management
│   │   └── auth-store.ts    # Authentication state (Zustand)
│   └── utils.ts             # Utility functions
└── package.json
```

## Features Implemented

✅ **Authentication**
- Login page
- Register page
- JWT token management
- Automatic token refresh
- Protected routes

✅ **Dashboard**
- KPI cards (Total Products, Low Stock, Pending Receipts, etc.)
- Recent activity feed
- Real-time data fetching with React Query

✅ **Products**
- Product listing with search
- Pagination
- Stock levels display
- Delete functionality

✅ **Layout & Navigation**
- Sidebar navigation
- User profile display
- Logout functionality
- Responsive design

✅ **UI Components**
- Button component
- Input component
- Card component
- Tailwind CSS styling

## Features To Be Implemented

- [ ] Product create/edit forms
- [ ] Receipts management pages
- [ ] Delivery Orders pages
- [ ] Internal Transfers pages
- [ ] Stock Adjustments pages
- [ ] Move History with filters
- [ ] Settings page functionality
- [ ] Profile edit functionality

## API Integration

The frontend uses Axios with interceptors for:
- Automatic JWT token injection
- Token refresh on 401 errors
- Error handling

All API calls are defined in `lib/api/*.ts` files.

## State Management

- **Zustand** for authentication state
- **React Query** for server state (caching, refetching, etc.)

## Styling

- **Tailwind CSS** for utility-first styling
- Custom color scheme with primary colors
- Responsive design

## Troubleshooting

### Module not found errors

If you see errors about missing modules, install the dependencies:
```bash
npm install
```

### Zustand persist error

If you see an error about `zustand/middleware`, make sure you have zustand installed:
```bash
npm install zustand
```

### API connection errors

1. Ensure backend is running on `http://localhost:3000`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Verify CORS is enabled in backend

### Port already in use

If port 3001 is in use, Next.js will automatically use the next available port.

## Next Steps

1. Install all dependencies
2. Start the development server
3. Test login/register flow
4. Explore the dashboard
5. Continue building remaining pages

## Development Tips

- Use React Query DevTools for debugging queries
- Check browser console for API errors
- Use Next.js built-in error handling
- Leverage TypeScript for type safety

