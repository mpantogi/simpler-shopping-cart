const API_BASE_URL = "/api"; // Next.js rewrites => http://localhost:3001

/**
 * Safely parse the response body as JSON if it's not empty.
 * If there's no body or JSON parse fails, return an empty object (or array).
 */
async function parseJSONSafe(response) {
  const rawText = await response.text(); // must await the text
  if (!rawText) {
    // No body
    return {};
  }
  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.warn("Failed to parse JSON body:", err);
    return {};
  }
}

/**
 * We do fetch, then return { response, body } => body is the parsed JSON
 */
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

/**
 * Create cart: POST /carts => 201 + Location: /carts/{id}, no body
 * Then do GET /carts/{id} => {id, items:[]}
 */
export async function createCartOnServer() {
  // 1) POST /carts => 201 + Location
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

  // 2) GET /carts/{cartId} => { id, items: [...] }
  const cart = await getServerCart(cartId);
  return cart;
}

/**
 * Retrieve a cart: GET /carts/{id} => 200 => { "id": "...", "items": [...] }
 */
export async function getServerCart(cartId) {
  const { response, body } = await fetchAPI(`/carts/${cartId}`, {
    method: "GET",
  });
  // body => { id, items: [ { product_id, quantity }, ... ] }
  return body;
}

/**
 * Update a cart: PUT /carts/{id}.
 * The Docker code expects an array: [ { "product_id":"...", "quantity":N }, ...]
 * We'll omit "id: cartId" because it's not recognized by the server.
 */
export async function updateServerCart(cartId, itemsArray) {
  const { response, body } = await fetchAPI(`/carts/${cartId}`, {
    method: "PUT",
    body: JSON.stringify(itemsArray), // e.g. [ { product_id, quantity } ]
  });
  if (response.status !== 200) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  // body => updated cart => { "id": "...", "items": [...] }
  return body;
}

/**
 * GET /products => [ {id, name, price, stock}, ... ]
 */
export async function getProducts() {
  const { response, body } = await fetchAPI("/products", { method: "GET" });
  // body => array of products
  return body;
}

/**
 * GET /discounts => [ { code, type, amount? }, ... ]
 */
export async function getDiscounts() {
  const { response, body } = await fetchAPI("/discounts", { method: "GET" });
  // body => array of discounts
  return body;
}

/**
 * Create an order: POST /orders => 201 + Location: /orders/{id}
 * Body => { cart_id: "...", discount_code?: "..." }
 */
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
