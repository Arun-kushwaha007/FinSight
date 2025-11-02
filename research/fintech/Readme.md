# FinTech Domain Knowledge & Compliance 🏦

This section covers the specific knowledge required for building a secure and compliant personal finance application like FinSight.

## Key Financial APIs

1.  **Account Aggregation (Crucial for Production):**
    * **Plaid:** Global standard. Focus on the **Plaid Link** flow for secure credential exchange and **Token Exchange** process.
    * **RazorpayX (India Focus):** Research its specific APIs for transaction fetching and compliance needs within the Indian market.
    * **Abstraction:** **MUST** adhere to the `TransactionSource` interface design pattern to allow swapping providers easily.

2.  **Market Data / Crypto:**
    * For future investment tracking, research reliable, low-latency APIs for stock and crypto price feeds (e.g., Alpha Vantage, CoinGecko).

## Security & Compliance

* **Authentication:** Deep dive into **OAuth 2.0** specifications and **JWT** best practices (token rotation, secure storage).
* **Data in Transit:** **TLS 1.2+** is non-negotiable. Understand certificate pinning for mobile apps.
* **Data at Rest:** Encryption standards (**AES-256**) for sensitive PII and financial aggregates stored in PostgreSQL.
* **Compliance:**
    * **PCI DSS:** Only required if *handling* cardholder data directly (less likely with Plaid, but important to understand the scope).
    * **GDPR/CCPA:** Essential for user data privacy rights (Right to be forgotten, data portability). Ensure clear consent mechanisms.

## Core Financial Concepts

* **Net Worth Calculation:** Asset tracking (bank + investments) minus Liabilities (loans, credit card debt).
* **Time-Value of Money:** Basic understanding for goal forecasting and interest rate concepts.

---
**Action Item:** Document the exact required scopes/permissions for the Plaid integration during the initial setup.