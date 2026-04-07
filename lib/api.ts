const API_PREFIX = "/api/ravonak";

export type Lang = "ru" | "en" | "uz";

function q(o: Record<string, string | number | boolean | undefined | null>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "detail" in data
        ? JSON.stringify((data as { detail: unknown }).detail)
        : text || res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data as T;
}

export type AuthResponse = {
  success: boolean;
  message: string;
  is_registered?: boolean | null;
  display_name?: string | null;
  tg_id?: number | null;
  phone_number?: string | null;
  debug_sms_code?: string | null;
  role?: string | null;
};

export async function authCheck(body: { tg_id: number; lang?: Lang }) {
  return apiFetch<AuthResponse>("/auth/check", {
    method: "POST",
    body: JSON.stringify({ ...body, lang: body.lang ?? "ru" }),
  });
}

export async function authSendCode(body: {
  phone_number: string;
  lang?: Lang;
}) {
  return apiFetch<AuthResponse>("/auth/send-code", {
    method: "POST",
    body: JSON.stringify({ ...body, lang: body.lang ?? "ru" }),
  });
}

export async function authSendCodeDebug(body: {
  phone_number: string;
  lang?: Lang;
}) {
  return apiFetch<AuthResponse>("/auth/send-code-debug", {
    method: "POST",
    body: JSON.stringify({ ...body, lang: body.lang ?? "ru" }),
  });
}

export async function authVerifyCode(body: {
  phone_number: string;
  code: string;
  tg_id: number | null;
  name?: string | null;
  surname?: string | null;
  username?: string | null;
  lang?: Lang;
}) {
  return apiFetch<AuthResponse>("/auth/verify-code", {
    method: "POST",
    body: JSON.stringify({ ...body, lang: body.lang ?? "ru" }),
  });
}

export type SectionSchema = {
  id: number;
  name: string;
  icon_url: string | null;
};

export type BannerSchema = {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  link_url: string | null;
};

export type ProductSchema = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  discount_percentage: number;
  image_url: string | null;
  shelf_life: string | null;
  unit: string;
  stock_quantity: number;
};

export type MainScreenResponse = {
  balance_usd: number;
  user_name: string;
  sections: SectionSchema[];
  banners: BannerSchema[];
  promo_products: ProductSchema[];
  random_products: ProductSchema[];
};

export async function getMainScreen(tg_id: number, lang: Lang = "ru") {
  return apiFetch<MainScreenResponse>(
    `/products/main${q({ tg_id, lang })}`,
    { method: "GET" },
  );
}

export type ProductSearchItem = ProductSchema & {
  chapter_id: number;
  chapter_name: string;
  subcategory_id: number;
  subcategory_name: string;
};

export async function searchProductsApi(
  params: { q?: string; chapter_id?: number; limit?: number; lang?: Lang } = {},
) {
  return apiFetch<ProductSearchItem[]>(
    `/products/search${q({
      q: params.q ?? "",
      chapter_id: params.chapter_id,
      limit: params.limit ?? 50,
      lang: params.lang ?? "ru",
    })}`,
    { method: "GET" },
  );
}

export async function getProductById(id: number, lang: Lang = "ru") {
  return apiFetch<ProductSchema>(`/products/${id}${q({ lang })}`, {
    method: "GET",
  });
}

export type ChapterProductsResponse = {
  chapter_id: number;
  chapter_name: string;
  total_products: number;
  subcategories: {
    subcategory_id: number;
    subcategory_name: string;
    products: ProductSchema[];
  }[];
};

export async function getChapterProducts(
  chapterId: number,
  tg_id?: number | null,
  lang: Lang = "ru",
) {
  return apiFetch<ChapterProductsResponse>(
    `/products/chapter/${chapterId}${q({ tg_id: tg_id ?? undefined, lang })}`,
    { method: "GET" },
  );
}

export type CategoryTreeChapter = {
  id: number;
  name: string;
  categories: {
    id: number;
    name: string;
    subcategories: { id: number; name: string }[];
  }[];
};

export async function getCategoriesTree(lang: Lang = "ru") {
  return apiFetch<CategoryTreeChapter[]>(`/products/categories${q({ lang })}`, {
    method: "GET",
  });
}

export type CartItemResponse = {
  basket_item_id: number;
  product_id: number;
  product_name: string;
  unit: string;
  amount: number;
  price_sum: number;
  image_url?: string | null;
};

export type CartResponse = {
  success: boolean;
  tg_id: number;
  items: CartItemResponse[];
  total_sum: number;
  item_count: number;
};

export async function getCart(tg_id: number, lang: Lang = "ru") {
  return apiFetch<CartResponse>(`/cart${q({ tg_id, lang })}`, {
    method: "GET",
  });
}

export async function addCartItem(body: {
  tg_id: number;
  product_id: number;
  amount: number;
  lang?: Lang;
}) {
  return apiFetch<CartResponse>("/cart/items", {
    method: "POST",
    body: JSON.stringify({ ...body, lang: body.lang ?? "ru" }),
  });
}

export async function updateCartItem(
  itemId: number,
  tg_id: number,
  amount: number,
  lang: Lang = "ru",
) {
  return apiFetch<CartResponse>(
    `/cart/items/${itemId}${q({ tg_id, lang })}`,
    {
      method: "PATCH",
      body: JSON.stringify({ amount, lang }),
    },
  );
}

export async function deleteCartItem(
  itemId: number,
  tg_id: number,
  lang: Lang = "ru",
) {
  return apiFetch<CartResponse>(`/cart/items/${itemId}${q({ tg_id, lang })}`, {
    method: "DELETE",
  });
}

export type CheckoutPreviewResponse = {
  success: boolean;
  message: string;
  address_selected: boolean;
  recipient_selected: boolean;
  delivery_window: string;
  total_sum_uzs: number;
  usd_rate: number;
  usd_rate_date: string;
  total_usd: number;
  balance_usd: number;
  can_pay: boolean;
  disable_reason?: string | null;
};

export async function checkoutPreview(body: {
  tg_id: number;
  address_id?: number | null;
  recipient_id?: number | null;
  lang?: Lang;
}) {
  return apiFetch<CheckoutPreviewResponse>("/checkout/preview", {
    method: "POST",
    body: JSON.stringify({ ...body, lang: body.lang ?? "ru" }),
  });
}

export type AddressResponse = {
  id: number;
  city: string;
  street: string;
  house: string;
  entrance: string | null;
  flat: string | null;
  comment: string | null;
  is_default: boolean;
  full_text: string;
};

export async function getAddresses(tg_id: number, lang: Lang = "ru") {
  return apiFetch<AddressResponse[]>(
    `/checkout/addresses${q({ tg_id, lang })}`,
    { method: "GET" },
  );
}

export type RecipientResponse = {
  id: number;
  name: string;
  phone: string;
  is_default: boolean;
};

export async function getRecipients(tg_id: number, lang: Lang = "ru") {
  return apiFetch<RecipientResponse[]>(
    `/checkout/recipients${q({ tg_id, lang })}`,
    { method: "GET" },
  );
}

export async function createAddress(body: {
  tg_id: number;
  city: string;
  street: string;
  house?: string | null;
  entrance?: string | null;
  flat?: string | null;
  comment?: string | null;
  is_default?: boolean;
  lang?: Lang;
}) {
  return apiFetch<AddressResponse>("/checkout/addresses", {
    method: "POST",
    body: JSON.stringify({ ...body, lang: body.lang ?? "ru" }),
  });
}

export async function createRecipient(body: {
  tg_id: number;
  name: string;
  surname?: string | null;
  phone: string;
  is_default?: boolean;
  lang?: Lang;
}) {
  return apiFetch<RecipientResponse>("/checkout/recipients", {
    method: "POST",
    body: JSON.stringify({ ...body, lang: body.lang ?? "ru" }),
  });
}

export async function checkoutPay(body: {
  tg_id: number;
  address_id: number;
  recipient_id: number;
  lang?: Lang;
}) {
  return apiFetch<{
    success: boolean;
    message: string;
    order_number: string;
    status: string;
    total_sum_uzs: number;
    total_usd: number;
    usd_rate: number;
    remaining_balance_usd: number;
  }>("/checkout/pay", {
    method: "POST",
    body: JSON.stringify({ ...body, lang: body.lang ?? "ru" }),
  });
}

export type TransferUserInfo = {
  tg_id: number;
  name: string;
  phone: string;
};

export async function transferSearch(
  phone: string,
  sender_tg_id: number,
  lang: Lang = "ru",
) {
  return apiFetch<{
    success: boolean;
    message?: string | null;
    users: TransferUserInfo[];
  }>(`/transfers/search${q({ phone, sender_tg_id, lang })}`, {
    method: "GET",
  });
}

export async function transferPreview(
  sender_tg_id: number,
  receiver_tg_id: number,
  lang: Lang = "ru",
) {
  return apiFetch<{
    success: boolean;
    receiver_name?: string | null;
    receiver_phone?: string | null;
    sender_balance_usd: number;
  }>(
    `/transfers/preview${q({ sender_tg_id, receiver_tg_id, lang })}`,
    { method: "GET" },
  );
}

export async function transferSend(body: {
  sender_tg_id: number;
  receiver_tg_id: number;
  amount: number;
  lang?: Lang;
}) {
  return apiFetch<{
    success: boolean;
    message: string;
    sender_balance_usd?: number | null;
  }>("/transfers/send", {
    method: "POST",
    body: JSON.stringify({ ...body, lang: body.lang ?? "ru" }),
  });
}

export type TransferHistoryItem = {
  id: number;
  type: string;
  amount: number;
  date: string;
  partner_name: string;
  partner_phone: string;
};

export async function transferHistory(tg_id: number, limit = 50, lang: Lang = "ru") {
  return apiFetch<{ success: boolean; items: TransferHistoryItem[] }>(
    `/transfers/history${q({ tg_id, limit, lang })}`,
    { method: "GET" },
  );
}

export type ActiveOrderResponse = {
  success: boolean;
  order_number: string | null;
  status: string | null;
  total_sum_uzs: number | null;
};

export async function getActiveOrder(tg_id: number, lang: Lang = "ru") {
  return apiFetch<ActiveOrderResponse>(
    `/orders/active${q({ tg_id, lang })}`,
    { method: "GET" },
  );
}

export type CustomerOrderDetailsResponse = {
  success: boolean;
  order_number: string;
  status: string;
  delivery_address: string;
  recipient_name: string;
  recipient_phone: string;
  total_sum_uzs: number;
  items: {
    product_id: number;
    product_name: string;
    amount: number;
    unit: string;
    unit_price_sum: number;
  }[];
};

export async function getCustomerOrderDetails(
  orderNumber: string,
  tg_id: number,
  lang: Lang = "ru",
) {
  return apiFetch<CustomerOrderDetailsResponse>(
    `/orders/${encodeURIComponent(orderNumber)}${q({ tg_id, lang })}`,
    { method: "GET" },
  );
}

export type StaffOrderListItem = {
  order_number: string;
  status: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  delivery_address: string | null;
  item_count: number;
  total_sum_uzs: number;
};

export async function assemblerActiveOrders(tg_id: number, lang: Lang = "ru") {
  return apiFetch<{ success: boolean; items: StaffOrderListItem[] }>(
    `/staff/assembler/orders/active${q({ tg_id, lang })}`,
    { method: "GET" },
  );
}

export async function courierActiveOrders(tg_id: number, lang: Lang = "ru") {
  return apiFetch<{ success: boolean; items: StaffOrderListItem[] }>(
    `/staff/courier/orders/active${q({ tg_id, lang })}`,
    { method: "GET" },
  );
}

export async function courierMyOrders(tg_id: number, lang: Lang = "ru") {
  return apiFetch<{ success: boolean; items: StaffOrderListItem[] }>(
    `/staff/courier/orders/mine${q({ tg_id, lang })}`,
    { method: "GET" },
  );
}

export type StaffOrderDetailsResponse = {
  success: boolean;
  order_number: string;
  status: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  delivery_address: string | null;
  item_count: number;
  total_sum_uzs: number;
  items: {
    product_id: number;
    product_name: string;
    amount: number;
    unit: string;
    unit_price_sum: number;
  }[];
};

export async function staffOrderDetails(
  orderNumber: string,
  tg_id: number,
  lang: Lang = "ru",
) {
  return apiFetch<StaffOrderDetailsResponse>(
    `/staff/orders/${encodeURIComponent(orderNumber)}${q({ tg_id, lang })}`,
    { method: "GET" },
  );
}

export async function staffStartAssembly(
  orderNumber: string,
  tg_id: number,
  lang: Lang = "ru",
) {
  return apiFetch<{ success: boolean; message: string; order_number: string; status: string }>(
    `/staff/orders/${encodeURIComponent(orderNumber)}/start-assembly`,
    {
      method: "POST",
      body: JSON.stringify({ tg_id, confirm: false, lang }),
    },
  );
}

export async function staffAssembleOrder(
  orderNumber: string,
  tg_id: number,
  confirm: boolean,
  lang: Lang = "ru",
) {
  return apiFetch<{ success: boolean; message: string; order_number: string; status: string }>(
    `/staff/orders/${encodeURIComponent(orderNumber)}/assemble`,
    {
      method: "POST",
      body: JSON.stringify({ tg_id, confirm, lang }),
    },
  );
}

export async function staffCourierAccept(
  orderNumber: string,
  tg_id: number,
  lang: Lang = "ru",
) {
  return apiFetch<{ success: boolean; message: string; order_number: string; status: string }>(
    `/staff/orders/${encodeURIComponent(orderNumber)}/courier-accept`,
    {
      method: "POST",
      body: JSON.stringify({ tg_id, confirm: false, lang }),
    },
  );
}

export async function staffDeliverToClient(
  orderNumber: string,
  tg_id: number,
  confirm: boolean,
  lang: Lang = "ru",
) {
  return apiFetch<{ success: boolean; message: string; order_number: string; status: string }>(
    `/staff/orders/${encodeURIComponent(orderNumber)}/deliver-to-client`,
    {
      method: "POST",
      body: JSON.stringify({ tg_id, confirm, lang }),
    },
  );
}
