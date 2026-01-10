export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice: number | null;
  category: Category;
  brand: Brand;
  images: string[];
  characteristics?: Record<string, string>;
  inStock: boolean;
  quantity: number;
  isNew?: boolean;
  isSale?: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  total: number;
}
