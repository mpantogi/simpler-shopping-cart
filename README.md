# simpler-shopping-cart

A **Next.js** shopping cart application that interacts with a Dockerized REST API. Users can browse products, add items to a cart, apply discounts, and place orders with real-time totals.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Running the API](#running-the-api)
- [Running the App](#running-the-app)
- [Testing](#testing)
- [Environment Variables](#environment-variables)

---

## Overview

`simpler-shopping-cart` is a task demonstrating a basic e-commerce flow:

- Viewing products (fetched from a remote API)
- Managing a local cart in React
- Applying discount codes
- Submitting an order to the server
- Displaying an order success screen

The project uses **Next.js 13** (App Router) and **Tailwind CSS** for styling, with a **Node.js 21** environment.

---

## Features

1. **Add to Cart**: Dynamically add items, respecting stock limits.
2. **Remove/Update Items**: Quickly modify quantities or remove products.
3. **Apply Coupon**: Discounts validated against the API’s `/discounts` endpoint.
4. **Real-time Totals**: Displays updated cart totals after each change.
5. **Checkout**: Submits the cart to the `/orders` endpoint and shows a success screen.

---

## Tech Stack

- **Node.js** (v21+)
- **Next.js** (13, using the App Router)
- **React** (built-in with Next.js)
- **Tailwind CSS** (for utility-first styling)
- **Docker** (for the external API)

---

## Prerequisites

1. **Node.js 21** (or higher).
2. **npm** (comes with Node).
3. **Docker** (to run the provided API container).

---

## Setup & Installation

1. **Clone** or download the repository:
   ```bash
   git clone <YOUR-REPO-URL> simpler-shopping-cart
   cd simpler-shopping-cart
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
   This installs Next.js, Tailwind, and other required packages.

---

## Running the API

An API has been provided as a Docker image:

```bash
registry.gitlab.com/saysimpler/hiring/fe-sample-api:latest
```

### Apple Silicon (M1/M2)

If you are on Apple Silicon, add the `--platform=linux/amd64` flag to avoid architecture mismatch:

```bash
docker pull registry.gitlab.com/saysimpler/hiring/fe-sample-api:latest

docker run --rm -p 3001:8080 --platform=linux/amd64 \
  registry.gitlab.com/saysimpler/hiring/fe-sample-api:latest
```

### x86 / Intel

If not on Apple Silicon, simply:

```bash
docker pull registry.gitlab.com/saysimpler/hiring/fe-sample-api:latest

docker run --rm -p 3001:8080 \
  registry.gitlab.com/saysimpler/hiring/fe-sample-api:latest
```

The API should now be running at `http://localhost:3001`.

You can visit `http://localhost:3001/blueprint` to see all available routes (e.g., `/products`, `/discounts`, `/orders`, etc.).

---

## Running the App

Create `.env.local` in the project root if not already present:

```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Adjust this port/URL if you run Docker on a different port.

Start the development server:

```bash
npm run dev
```

This serves the app at `http://localhost:3000`.

Open `http://localhost:3000` in your browser. You should now see the product listing page. From there, you can test adding products to the cart, applying coupons, and checking out.

---

## Testing

Run tests with:

```bash
npm test
```

---

## Environment Variables

Run tests with:

```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

That’s it! You should now have a complete overview of how to run the Dockerized API and the Next.js application locally. If you are on Apple Silicon, remember to include the `--platform=linux/amd64` flag when running the Docker image to avoid the architecture mismatch. Happy coding!
