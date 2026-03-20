export type ShoplineAddress = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
};

export type ShoplineLineItem = {
  id: string;
  title: string;
  sku?: string;
  quantity: number;
  grams?: number;
  price?: string;
};

export type ShoplineOrder = {
  id: string;
  order_number?: string;
  email?: string;
  currency?: string;
  total_price?: string;
  note?: string;
  shipping_address?: ShoplineAddress;
  billing_address?: ShoplineAddress;
  line_items: ShoplineLineItem[];
};
