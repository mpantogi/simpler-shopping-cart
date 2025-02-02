import { CartProvider, useCart } from "@/context/CartContext";
import {
  createCartOnServer,
  getServerCart,
  updateServerCart,
} from "@/services/api";
import { act, renderHook } from "@testing-library/react";

jest.mock("@/services/api");

class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = value.toString();
  }
  removeItem(key) {
    delete this.store[key];
  }
}

describe("CartContext", () => {
  let localStorageMock;

  beforeEach(() => {
    // Clear and reset all mocks before each test
    jest.clearAllMocks();

    // Provide a fresh mock localStorage for each test
    localStorageMock = new LocalStorageMock();
    global.localStorage = localStorageMock;

    // Set up default mock responses
    createCartOnServer.mockResolvedValue({ id: "test-cart", items: [] });
    getServerCart
      .mockResolvedValueOnce({ id: "test-cart", items: [] })
      .mockResolvedValue({
        id: "test-cart",
        items: [{ product_id: "p1", quantity: 1 }],
      });
    updateServerCart.mockImplementation((cartId, itemsArray) => {
      return Promise.resolve({
        id: cartId,
        items: itemsArray,
      });
    });
  });

  afterEach(() => {
    // Clean up
    delete global.localStorage;
  });

  function setup() {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    return renderHook(() => useCart(), { wrapper }).result;
  }

  test("initial cart is empty", () => {
    const cart = setup();
    expect(cart.current.cartItems).toEqual([]);
    expect(cart.current.discountCode).toBe(null);
  });

  test("addItem() adds a product to the cart", async () => {
    const cart = setup();

    await act(async () => {
      cart.current.addItem({
        id: "p1",
        name: "Beanie",
        price: 12.99,
        stock: 5,
      });
    });

    expect(cart.current.cartItems.length).toBe(1);
    expect(cart.current.cartItems[0]).toMatchObject({
      product_id: "p1",
      quantity: 1,
    });
  });

  test("updateQuantity() updates an item quantity", async () => {
    const cart = setup();

    await act(async () => {
      cart.current.addItem({ id: "p1", price: 10, stock: 5 });
    });
    await act(async () => {
      cart.current.updateQuantity("p1", 3);
    });

    expect(cart.current.cartItems[0].quantity).toBe(3);
  });

  test("removeItem() removes item from cart", async () => {
    const cart = setup();

    await act(async () => {
      cart.current.addItem({ id: "p1", price: 10, stock: 5 });
      cart.current.addItem({ id: "p2", price: 20, stock: 2 });
    });

    expect(cart.current.cartItems.length).toBe(2);

    await act(async () => {
      cart.current.removeItem("p1");
    });

    expect(cart.current.cartItems.length).toBe(1);
    expect(cart.current.cartItems[0].product_id).toBe("p2");
  });
});
