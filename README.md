# simpler-shopping-cart

A **Next.js** (Node 21) shopping cart application to demonstrate adding products to cart, applying discounts, and submitting an order to a provided Dockerized API.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Running the API](#running-the-api)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

`simpler-shopping-cart` is a take-home assignment demonstrating how to build a basic e-commerce cart with React (Next.js). It interacts with a Dockerized REST API that provides product, discount, and order endpoints.

**Key functionality**:

- Browse products
- Add products to a cart (respecting stock limits)
- Apply discount codes
- View real-time total cost
- Submit the cart to place an order
- See an order success screen

---

## Features

- **Real-time cart updates**: Using React state (Context) to manage items, quantities, and discounts.
- **Coupon/discount support**: Users can apply a coupon code validated against the API’s `/discounts`.
- **Simple checkout flow**: User sees a total cost, then POSTs the cart to `/orders`.
- **Banker’s rounding**: Handles rounding half-to-even for currency calculations.

---

## Tech Stack

- **Node.js 21**
- **Next.js 13** (App Router)
- **React** (built-in with Next.js)
- **Tailwind CSS** for styling
- **Dockerized API** (fetched from `registry.gitlab.com/saysimpler/hiring/fe-sample-api`)

---

## Prerequisites

1. **Node.js 21** (or higher)
2. **npm** or **yarn** for installing dependencies
3. **Docker** (to run the provided API)

---

## Setup & Installation

1. **Clone** the repository:
   ```bash
   git clone <your-repo-url> simpler-shopping-cart
   cd simpler-shopping-cart
   ```
