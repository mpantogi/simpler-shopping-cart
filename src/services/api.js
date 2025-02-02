const API_BASE_URL = "/api"; // Next.js rewrites => http://localhost:3001

async function parseJSONSafe(response) {
  const rawText = await response.text();
  if (!rawText) {
    return {};
  }
  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.warn("Failed to parse JSON body:", err);
    return {};
  }
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const body = await parseJSONSafe(res);
  return { response: res, body };
}

export async function createCartOnServer() {
  const { response } = await fetchAPI("/carts", { method: "POST" });
  if (response.status !== 201) {
    throw new Error(`Expected 201, got ${response.status}`);
  }
  const loc = response.headers.get("Location");
  if (!loc) {
    throw new Error("No Location header from POST /carts");
  }
  const cartId = loc.split("/")[2]; // e.g. /carts/123 => "123"
  if (!cartId) {
    throw new Error("Failed to parse cart ID from Location header");
  }

  const cart = await getServerCart(cartId);
  return cart;
}

export async function getServerCart(cartId) {
  const { response, body } = await fetchAPI(`/carts/${cartId}`, {
    method: "GET",
  });
  return body;
}

export async function updateServerCart(cartId, itemsArray) {
  const { response, body } = await fetchAPI(`/carts/${cartId}`, {
    method: "PUT",
    body: JSON.stringify(itemsArray), // e.g. [ { product_id, quantity } ]
  });
  if (response.status !== 200) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return body;
}

export async function getProducts() {
  const { response, body } = await fetchAPI("/products", { method: "GET" });
  return body;
}

export async function getDiscounts() {
  const { response, body } = await fetchAPI("/discounts", { method: "GET" });
  return body;
}

export async function postOrder({ cartId, discountCode }) {
  const payload = { cart_id: cartId };
  if (discountCode) {
    payload.discount_code = discountCode;
  }

  const { response } = await fetchAPI("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (response.status !== 201) {
    throw new Error(`Order creation failed. status=${response.status}`);
  }
  const loc = response.headers.get("Location");
  if (!loc) {
    throw new Error("No Location header from POST /orders");
  }
  const orderId = loc.split("/")[2]; // e.g. /orders/abcd => "abcd"
  return orderId;
}
