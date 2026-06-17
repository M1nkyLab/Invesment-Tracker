-- 1. Historical market data and calculated technical indicators
CREATE TABLE daily_prices (
    id BIGSERIAL PRIMARY KEY,
    ticker VARCHAR(12) NOT NULL DEFAULT 'VOO',
    price_date DATE UNIQUE NOT NULL,
    closing_price DECIMAL(10, 4) NOT NULL,
    sma_30 DECIMAL(10, 4),
    sma_100 DECIMAL(10, 4),
    rsi_14 DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Single-row state manager tracking user's cash reserves and unit assets
CREATE TABLE user_wallet (
    id BIGSERIAL PRIMARY KEY,
    available_myr DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_units_owned DECIMAL(16, 6) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Audit trail tracking manual user transaction records
CREATE TABLE portfolio_ledger (
    id BIGSERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'DEPOSIT', 'BUY_EXECUTION'
    amount_myr DECIMAL(10, 2) NOT NULL,
    price_per_unit DECIMAL(10, 4), -- NULL on deposits
    units_transacted DECIMAL(16, 6),          -- NULL on deposits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Audit trail logging the system decisions and core mathematical reasoning
CREATE TABLE ai_signals (
    id BIGSERIAL PRIMARY KEY,
    evaluation_date DATE UNIQUE REFERENCES daily_prices(price_date),
    signal_status VARCHAR(30) NOT NULL, -- 'ACCUMULATING', 'WARNING_OVERBOUGHT', 'BUY_DIP', 'STANDARD_HOLD'
    reasoning_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
