const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function getProducts() {
  return fetchAPI("/products");
}

export async function getDiscounts() {
  return fetchAPI("/discounts");
}

export async function postOrder(orderData) {
  return fetchAPI("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}
