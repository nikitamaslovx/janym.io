# Janym.io - Cloud Crypto Trading Automation Platform

<p align="center">
  <a href="https://janym.io"><img height="300" src="public/assets/images/nextjs-starter-banner.png?raw=true" alt="Janym.io Platform"></a>
</p>

🚀 **Janym.io** is a cutting-edge SaaS platform designed to automate your cryptocurrency trading strategies. deploy, manage, and monitor your trading bots in the cloud with ease, all from a unified and beautiful dashboard.

Built with **Next.js**, **Tailwind CSS**, and **Shadcn UI**, Janym.io offers a premium user experience for both individual traders and institutional clients.

## Key Features

*   **☁️ Cloud Trading:** Run your strategies 24/7 without maintaining your own infrastructure.
*   **📊 Real-time Analytics:** Monitor portfolio balance, performance metrics, and active orders in real-time.
*   **🤖 Strategy Management:** Easily configure, start, and stop trading bots. Supports Market Making, Arbitrage, and custom strategies.
*   **🔒 Enterprise-Grade Security:** Your API keys are encrypted and stored filled with industry best practices.
*   **👥 Multi-Tenancy:** Manage multiple organizations and teams under one account.
*   **🌍 Multi-Language Support:** Fully localized interface (English, Russian, and more).

## Technology Stack

We use modern, robust technologies to ensure speed, security, and scalability:

*   **Frontend:** [Next.js](https://nextjs.org) (App Router), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com)
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com)
*   **Authentication:** [Clerk](https://clerk.com)
*   **Database:** [PostgreSQL](https://www.postgresql.org) with [Drizzle ORM](https://orm.drizzle.team)
*   **Payments:** [Stripe](https://stripe.com)

## Getting Started

Follow these steps to set up the project locally for development:

### Prerequisites

*   Node.js 20+
*   npm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/nikitamaslovx/janym.io.git
    cd janym.io
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    Copy `.env.example` to `.env.local` and fill in your keys (Clerk, Database, Stripe).

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
.
├── src
│   ├── app             # Next.js App Router
│   ├── components      # Shared UI Components
│   ├── features        # Feature-based modules (Dashboard, Billing, etc.)
│   ├── locales         # Localization files
│   ├── models          # Database Schema
│   └── utils           # Helper functions
├── public              # Static assets
└── tests               # E2E and Unit tests
```

## License

Copyright © 2026 Janym.io. All rights reserved.
