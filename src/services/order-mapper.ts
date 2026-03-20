import { AppError } from "../lib/errors.js";
import type { ShoplineOrder } from "../types/shopline.js";
import type { SpxCreateOrderPayload } from "../types/spx.js";

type MapperOptions = {
  merchantCode: string;
};

const buildRecipientName = (order: ShoplineOrder) => {
  const address = order.shipping_address;
  const fullName = [address?.first_name, address?.last_name].filter(Boolean).join(" ").trim();
  return fullName || order.email || `order-${order.id}`;
};

export const mapShoplineOrderToSpx = (
  order: ShoplineOrder,
  options: MapperOptions
): SpxCreateOrderPayload => {
  const address = order.shipping_address;

  if (!address?.address1 || !address.phone) {
    throw new AppError("Shopline order is missing shipping address fields required by SPX", 422, {
      orderId: order.id
    });
  }

  return {
    externalOrderId: order.id,
    merchantCode: options.merchantCode,
    recipient: {
      name: buildRecipientName(order),
      phone: address.phone,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      province: address.province,
      postalCode: address.zip,
      country: address.country
    },
    parcels: order.line_items.map((item) => ({
      sku: item.sku,
      description: item.title,
      quantity: item.quantity,
      weightGrams: item.grams,
      unitPrice: item.price
    })),
    codAmount: order.total_price,
    currency: order.currency,
    notes: order.note
  };
};
