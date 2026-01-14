export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  image: string | null | { url: string; publicId: string };
  createdAt: string;
  updatedAt: string;
  __v: number;
  children?: Category[]; // For tree structure
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

export interface ProductImage {
  url: string;
  publicId?: string;
  _id?: string;
  id?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice: number | null;
  category: Category | null;
  brand: Brand;
  images: (string | ProductImage)[];
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
