# 🤖 COOFIX Project - AI Assistant Prompt

## Project Overview

This is **COOFIX.RU**, a modern e-commerce platform built with Next.js 16.1.1 and React 19.2.0 for selling professional tools, electrical equipment, and construction materials. The project includes full order management, user authentication, product catalog with filtering, shopping cart, favorites, comparison features, and Telegram bot integration for order notifications.

## Tech Stack

### Core Framework & Libraries
- **Next.js 16.1.1** with App Router (not Pages Router)
- **React 19.2.0** with TypeScript 5.0
- **Tailwind CSS 4.1.17** with DaisyUI 5.5.5
- **Zustand 5.0.8** for client-side state management
- **TanStack Query 5.90.11** for server state and caching
- **React Hook Form 7.67.0** + **Zod 4.1.13** for form validation
- **Axios 1.13.2** for HTTP requests
- **Firebase 12.6.0** for Firebase services
- **Next Themes 0.4.6** for theme management (dark/light mode)

### Key Dependencies
- Material-UI 7.3.5 (for some UI components)
- Framer Motion 12.23.24 (animations)
- React Icons 5.5.0

## Project Structure

```
src/
├── api/                    # API client functions (Axios wrappers)
│   ├── auth.ts            # Authentication API
│   ├── products.ts        # Products API
│   ├── cart.ts            # Shopping cart API
│   ├── categories.ts      # Categories API
│   ├── orders.ts          # Orders API
│   ├── profile.ts         # User profile API
│   ├── news.ts            # News API
│   └── axios.ts           # Axios instances configuration
│
├── app/                    # Next.js App Router pages
│   ├── api/               # Next.js API Routes (serverless functions)
│   │   ├── auth/register/
│   │   ├── categories/
│   │   ├── orders/create/
│   │   ├── products/[slug]/
│   │   └── telegram/callback/
│   ├── cart/              # Shopping cart page
│   ├── catalog/           # Product catalog page
│   ├── product/[slug]/    # Individual product page
│   ├── profile/           # User profile pages
│   ├── favorites/         # Favorites/wishlist page
│   ├── compare/           # Product comparison page
│   └── ...
│
├── components/            # React components
│   ├── home/             # Home page components
│   ├── layout/           # Layout components (Header, Footer, etc.)
│   ├── ui/               # Reusable UI components
│   │   ├── Forms/        # Form components
│   │   ├── Modal/        # Modal components
│   │   ├── Card/         # Product card component
│   │   └── ...
│   └── profile/          # Profile-specific components
│
├── store/                 # Zustand stores
│   ├── useCart.ts        # Shopping cart state
│   ├── useFavorites.ts   # Favorites state
│   ├── useCompare.ts     # Product comparison state
│   ├── useUser.ts        # User authentication state
│   └── useProducts.ts    # Products state
│
├── hooks/                 # Custom React hooks
│   ├── useAuthGuard.ts   # Auth guard hook
│   ├── useDebounce.ts    # Debounce hook
│   ├── useModal.ts       # Modal management hook
│   └── useScrollDirection.ts
│
├── lib/                   # Utilities and helpers
│   ├── validations.ts    # Zod validation schemas
│   ├── utils.ts          # Utility functions
│   ├── constants.ts      # App constants
│   └── format.ts         # Formatting functions
│
├── types/                 # TypeScript type definitions
│   ├── product.ts        # Product types
│   ├── user.ts           # User types
│   ├── cart.ts           # Cart types
│   ├── order.ts          # Order types
│   └── ...
│
└── styles/
    └── globals.css       # Global styles
```

## Key Features & Implementation Details

### 1. Authentication System
- **Registration**: `/app/api/auth/register/route.ts` - combines firstName/lastName into `name` for backend
- **Login**: Uses React Hook Form with Zod validation
- **State Management**: `useUser` Zustand store
- **API Base**: `https://coofix.store/api`

### 2. Product Catalog
- **Catalog Page**: `/app/catalog/page.tsx` - filters by category, subcategory, search, pagination
- **Product Detail**: `/app/product/[slug]/page.tsx` - dynamic route with product details
- **API Route**: `/app/api/products/[slug]/route.ts` - proxy with fallback to direct API
- **Filtering**: Category, subcategory, search query, pagination
- **Images**: Robust error handling for missing/invalid images with placeholder SVG

### 3. Shopping Cart
- **State**: `useCart` Zustand store (persisted to localStorage)
- **Page**: `/app/cart/page.tsx`
- **Component**: `CartItems.tsx` - quantity management, order form integration

### 4. Order Management
- **Order Form**: `OrderForm.tsx` - validates with Zod schema
- **API Route**: `/app/api/orders/create/route.ts` - creates order and sends to Telegram
- **Telegram Integration**: Sends formatted HTML message to Telegram group

### 5. Telegram Bot Integration
- **Callback Form**: `/app/api/telegram/callback/route.ts` - sends callback requests to Telegram
- **Order Notifications**: `/app/api/orders/create/route.ts` - sends order details to Telegram
- **Environment Variables**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

### 6. Theme System
- **Provider**: `next-themes` in `app/providers.tsx`
- **Toggle**: `ThemeToggle.tsx` component
- **Implementation**: Uses CSS variables for theme colors

### 7. State Management Patterns
- **Client State**: Zustand stores for cart, favorites, compare, user
- **Server State**: TanStack Query for products, categories, news
- **Form State**: React Hook Form with Zod validation

## API Integration

### Backend API Base URL
```
https://coofix.store/api
```

### Key Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /products` - List products (supports query params: category, sub, filter, search, page, limit)
- `GET /products/slug/:slug` - Get product by slug (with fallback)
- `GET /categories` - List categories (supports parent filter)
- `POST /orders` - Create order
- `GET /cart` - Get cart items
- `POST /cart` - Add to cart

### Next.js API Routes (Proxies)
All Next.js API routes act as proxies to the backend API, handling:
- Data transformation (e.g., firstName/lastName → name)
- Error handling and user-friendly messages
- Telegram integration for notifications

## Common Patterns & Best Practices

### Error Handling
- API errors are caught and formatted with user-friendly messages
- Image loading errors show placeholder SVG
- Form validation uses Zod schemas with TypeScript

### Image Handling
- Use Next.js `Image` component for optimization
- Always validate image URLs before rendering
- Placeholder SVG for missing/broken images
- Check for empty strings and null values

### Type Safety
- All API responses have TypeScript interfaces
- Zod schemas for runtime validation
- Strict TypeScript configuration

### Component Structure
- Client components marked with `"use client"`
- Server components by default (App Router)
- Suspense boundaries for async operations
- Loading states and empty states handled consistently

## Important Notes for AI Assistants

1. **Next.js 15+ API Routes**: Route handlers receive `params` as a Promise
   ```typescript
   export async function GET(
     request: Request,
     { params }: { params: Promise<{ slug: string }> }
   ) {
     const { slug } = await params;
   }
   ```

2. **useSearchParams()**: Must be wrapped in Suspense boundary
   ```tsx
   <Suspense fallback={<Loader />}>
     <ComponentUsingSearchParams />
   </Suspense>
   ```

3. **Image Optimization**: Always validate image sources before using Next.js Image component

4. **Hydration Mismatch**: Avoid inline styles in client components; use Tailwind or global CSS

5. **Build Directory**: Configured to use `.next` (default) for Netlify compatibility

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://coofix.store/api
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## Development Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

- **Platform**: Netlify
- **Configuration**: `netlify.toml` with `@netlify/plugin-nextjs`
- **Build Command**: `npm run build`
- **Publish Directory**: `.next` (handled by plugin)

## Common Issues & Solutions

1. **Hydration Mismatch**: Move inline styles to global CSS
2. **Image Errors**: Validate URLs before rendering, use placeholder for errors
3. **API Route Errors**: Ensure proper async/await with Next.js 15+ route handlers
4. **SearchParams Errors**: Wrap components using `useSearchParams()` in Suspense
5. **Build Failures**: Check TypeScript errors and ensure all types are properly defined

## Code Style Guidelines

- Use TypeScript for all new files
- Prefer functional components with hooks
- Use Zod for validation schemas
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling (avoid inline styles)
- Maintain consistent file structure
- Add proper error handling to all API calls

## When Making Changes

1. **Adding New API Endpoint**: 
   - Add function in `src/api/` directory
   - Create Next.js API route if needed for proxy/transformation
   - Update types in `src/types/`

2. **Adding New Page**:
   - Create directory in `src/app/`
   - Use `page.tsx` for the page component
   - Consider client vs server component

3. **Adding New Component**:
   - Place in appropriate directory under `src/components/`
   - Export from `index.ts` if it's a UI component
   - Add proper TypeScript types

4. **Adding New State**:
   - Create Zustand store in `src/store/`
   - Use TanStack Query for server state
   - Persist to localStorage if needed (cart, favorites)

---

**Remember**: This project uses Next.js App Router, React 19, and TypeScript. Always consider server vs client components, proper error handling, and user experience when making changes.
