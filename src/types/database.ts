import { Timestamp } from "firebase/firestore";

export interface Category{
  id: string;
  name: string;
  description?: string;
  created_at: Timestamp;
}

export interface Product {
  id: string;
  category_id:  {
    path: string;
  };
  title: string;
  description?: string;
  image_url?: string;
  price?: string;
  created_at: Timestamp;
}

export interface Order {
  id: string;
  user_id: {
    path: string;
  };
  product_id: {
    path: string;
  };
  amount: number;
  currency: string;
  status: string;
  payment_id?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Profile{
  id: string;
  full_name?: string;
  phone?: string;
  created_at: Timestamp;
}

export interface Banner {
  id: string;
  type: 'image' | 'text';
  title?: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: Timestamp;
}

export interface StoreSettings {
  id: string;
  store_name?: string;
  store_description?: string;
  logo_url?: string;
  favicon_url?: string;
  og_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  snapchat_url?: string;
  tiktok_url?: string;
  updated_at: Timestamp;
}