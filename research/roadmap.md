# FinSight Project Roadmap Synthesis 🗺️

This document synthesizes the phased development plan, mapping technical requirements to business value.

## Vision: AI-Driven Personal Finance Assistant

FinSight will be an AI-first tool that moves users from simple tracking to proactive financial control, targeting the digitally-savvy Gen Z/Millennial market in a booming industry.

## Development Phases Overview

| Phase | Primary Goal | Key Deliverables | Focus Area |
| :--- | :--- | :--- | :--- |
| **Phase 1 (MVP Foundation)** | End-to-end working system with mock data. | Auth, CSV Upload, Basic Analytics Dashboard, Deployed Infrastructure (Docker/Render). | Stability, Data Pipeline, Basic UX. |
| **Phase 2 (Advanced Growth)** | Integrate predictive models and core financial features. | AI Categorization, Basic Forecasting & Alerts, Budgeting Logic. | Backend Intelligence, Core Value Proposition. |
| **Phase 3 (Production Readiness)**| Replace mocks with live data connections and polish UX. | Plaid/RazorpayX Integration, Investment Tracking, Full CI/CD to AWS. | Security, Scalability, Real-World Data. |
| **Phase 4 (Intelligence & Monetization)** | Introduce premium features and advanced AI. | FinSight Pro Tier, Credit Health Score, Conversational Coach. | Revenue Generation, Deep Personalization. |

## Key Technology Decoupling Strategy

The plan utilizes **Service Separation** to ensure modularity:
* **`backend-api` (Node.js/Go):** Handles Auth, CRUD, orchestration.
* **`ai-ml-service` (Python/FastAPI):** Handles all ML model serving (Categorization, Forecasting).
* **Messaging Layer (Kafka/RabbitMQ):** Used to queue tasks between the API and ML service asynchronously.

## Phase 1 Success Metrics (Completion Criteria)

The project is successful at the end of Phase 1 when:
1.  **Functionality:** A user can sign up, upload a CSV, and see category pie charts updated live.
2.  **Deployment:** The system is live and accessible via a URL.
3.  **Code Quality:** Repository is clean, documented (`README.md`, Postman docs), and uses linting/hooks.

---
**Next Review:** Focus on defining the exact data schema required for **Investment Tracking** (Phase 3 prerequisite).