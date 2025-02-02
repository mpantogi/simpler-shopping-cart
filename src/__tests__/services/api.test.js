import {
  createCartOnServer,
  getDiscounts,
  getProducts,
  getServerCart,
  postOrder,
  updateServerCart,
} from "@/services/api";

describe("API service tests", () => {
  beforeEach(() => {
    // Reset fetch mocks before each test
    global.fetch = jest.fn();
  });

  test("createCartOnServer() should parse the Location header and do a GET for the new cart", async () => {
    // Mock the first fetch => POST /carts => returns 201 + location header
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: {
          get: (header) => {
            if (header === "Location") return "/carts/12345";
            return null;
          },
        },
        text: async () => "",
      })
      // Second fetch => GET /carts/12345 => returns cart JSON
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => null,
        },
        text: async () => JSON.stringify({ id: "12345", items: [] }),
      });

    const cart = await createCartOnServer();
    expect(cart).toEqual({ id: "12345", items: [] });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "/api/carts",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "/api/carts/12345",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  test("getServerCart() should return the parsed cart data", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => null,
      },
      text: async () =>
        JSON.stringify({
          id: "abc",
          items: [{ product_id: "p1", quantity: 2 }],
        }),
    });

    const cart = await getServerCart("abc");
    expect(cart).toEqual({
      id: "abc",
      items: [{ product_id: "p1", quantity: 2 }],
    });
  });

  test("updateServerCart() should PUT items array and return updated cart", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => null,
      },
      text: async () =>
        JSON.stringify({
          id: "abc",
          items: [{ product_id: "p1", quantity: 3 }],
        }),
    });

    const updated = await updateServerCart("abc", [
      { product_id: "p1", quantity: 3 },
    ]);
    expect(updated).toEqual({
      id: "abc",
      items: [{ product_id: "p1", quantity: 3 }],
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/carts/abc",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify([{ product_id: "p1", quantity: 3 }]),
      })
    );
  });

  test("getProducts() should parse the products array", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () =>
        JSON.stringify([{ id: "p1", name: "Beanie", price: 12.99, stock: 5 }]),
    });

    const products = await getProducts();
    expect(products).toEqual([
      { id: "p1", name: "Beanie", price: 12.99, stock: 5 },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/products",
      expect.any(Object)
    );
  });

  test("getDiscounts() should parse discounts array", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () =>
        JSON.stringify([{ code: "FLAT10", type: "FLAT", amount: 10 }]),
    });

    const disc = await getDiscounts();
    expect(disc).toEqual([{ code: "FLAT10", type: "FLAT", amount: 10 }]);
  });

  test("postOrder() should parse the Location header for order ID", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: {
        get: (header) => (header === "Location" ? "/orders/ORDER123" : null),
      },
      text: async () => "",
    });

    const orderId = await postOrder({ cartId: "abc", discountCode: "FLAT10" });
    expect(orderId).toBe("ORDER123");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/orders",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ cart_id: "abc", discount_code: "FLAT10" }),
      })
    );
  });
});
