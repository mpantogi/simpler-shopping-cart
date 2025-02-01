const API_BASE_URL = "/api"; // Points to the rewrite, which proxies to Docker

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log("Fetching via rewrite URL:", url);

  const res = await fetch(url, {
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
