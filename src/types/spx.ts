export type SpxCreateOrderPayload = {
  externalOrderId: string;
  merchantCode: string;
  recipient: {
    name: string;
    phone: string;
    address1: string;
    address2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  parcels: Array<{
    sku?: string;
    description: string;
    quantity: number;
    weightGrams?: number;
    unitPrice?: string;
  }>;
  codAmount?: string;
  currency?: string;
  notes?: string;
};

export type SpxCreateOrderResponse = {
  orderId?: string;
  trackingNumber?: string;
  raw: unknown;
};
