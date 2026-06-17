# Product Requirements Document (PRD)

## Project Aurum: Smart DCA+ VOO Portfolio Tracker & Automated Advisor

---

### 1. Executive Summary & Objectives

Project Aurum is a highly responsive, web-based financial command center designed to optimize long-term, systematic investment into the **Vanguard S&P 500 ETF** (ticker: `VOO`).

Instead of tracking market movements blindly or executing transactions manually, the system employs an **Opportunistic Dollar-Cost Averaging (DCA+)** strategy paired with a **Capital Accumulation logic gate**. The platform tracks real-time portfolio valuations against live market rates, implements automated data pipelines, and displays protective "Do Not Buy" warnings to insulate retail capital from market peaks.

#### Core Objectives

* **Security & Auth:** Secure user authentication via Supabase Auth, protecting individual portfolio data.
* **Capital Protection:** Use 14-day RSI and moving averages to alert users against buying at short-term overbought peaks.
* **Enhanced Yield via DCA+:** Identify sub-month market corrections ($\ge3\%$ below the 30-day moving average) to optimize unit entry pricing.
* **Capital Accumulation:** Build a logic gate to buffer deposits until the minimum purchase threshold (micro-buys as low as $1) is met.
* **Live Valuation Tracking:** Provide an instantaneous view of net asset values, absolute profits/losses, and historical performance charts with trend visualization.
* **Minimalist Control:** Deliver a sleek, 5-second glanceable dashboard built using a modern layout optimized for desktop and mobile web views.

---

### 2. Core Features & Business Logic

#### 2.1 User Authentication
*   **Sign In / Sign Up:** Users can create accounts and log in securely via Supabase.
*   **Protected Dashboard:** The dashboard is only accessible to authenticated users using Next.js Middleware/Server Components.
*   **Session Persistence:** Managed via cookies for secure Server-Side Rendering (SSR).

#### 2.2 Live Portfolio Valuation Ledger
*   **Real-time Metrics:** Calculates Total Invested, Current Portfolio Value, and absolute Profit/Loss.
*   **ROI Tracking:** Displays percentage-based returns to evaluate performance against the cost basis.
*   **Transaction History:** Logs all deposits and buy executions for a transparent audit trail.

#### 2.3 Fractional Quantity Support
*   **Precision Tracking:** Supports buying fractional quantities (up to 6 decimal places) to reflect bit-by-bit investment strategies.

#### 2.4 AI Decision Engine (DCA+ Logic)
*   **Technical Indicators:** Automatically calculates 30-day SMA, 100-day SMA, and 14-day RSI.
*   **Signal Matrix:**
    *   `ACCUMULATING`: Balance < $1.00. Buffering capital.
    *   `WARNING_OVERBOUGHT`: RSI > 70. High risk of local peak; buy operations discouraged.
    *   `BUY_DIP`: Price $\ge$ 3% below 30-day SMA AND above 100-day SMA. High-probability entry point.
    *   `TRIM_PROFIT`: RSI > 75 (15% trim) or RSI > 80 (30% trim). Locking in gains.
    *   `STANDARD_HOLD`: Neutral technicals. Routine DCA recommended.

---

### 3. Technical Stack

*   **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS.
*   **Backend/Database:** Supabase (PostgreSQL, Auth, Edge Functions).
*   **Charts:** Recharts for trend visualization.
*   **Icons:** Lucide React.
*   **Deployment:** Vercel.

---

### 4. System Architecture

1.  **Data Ingestion (Cron Job):** A scheduled task fetches the latest VOO closing price daily.
2.  **Indicator Processing:** The system calculates SMA and RSI values and updates the `daily_prices` table.
3.  **Signal Generation:** The AI Engine evaluates technicals against the latest price and user wallet state to generate a daily signal.
4.  **User Dashboard:** A Server-Side Rendered (SSR) dashboard fetches the latest wallet, price, and signal data to provide immediate feedback.

---

### 5. UI/UX Strategy & Key Interface Sections

The application follows a **Modern Dark/Light Mode** aesthetic (system preference) with a focus on responsiveness.

* **Top Navigation:** Responsive header with logo, theme toggle, and "Sign Out" functionality.
* **Master System Banner:** Displays the current active state (e.g., "BUY DIP") with dynamic colors and pulsed animations for urgent actions.
* **Core Valuation Cards:** Large numeric metrics mapping total capital deposited versus active portfolio values.
* **Trend Visualization Card:** A responsive chart displaying the 30-day price trend of VOO along with technical indicators.
* **Transaction Portal:** Responsive forms for logging capital deposits and manual buy executions.
* **Responsive Layout:** Uses Tailwind's grid and flexbox to ensure a seamless experience on all devices.
