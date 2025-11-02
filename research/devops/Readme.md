# DevOps & Infrastructure Learning Path ☁️

This details the technologies and concepts required to deploy, scale, and monitor FinSight reliably.

## Containerization & Orchestration

1.  **Docker:**
    * **Focus:** Creating lean, multi-stage **Dockerfiles** for Node.js and Python services to minimize image size.
    * **Tool:** Master `docker-compose.yml` for the local development stack (**Postgres, Redis, Backend, Frontend**).

2.  **Kubernetes (Future State):**
    * Understand basic concepts: **Pods, Deployments, Services, Ingress**.
    * Plan for migrating from simpler hosting (Render/Fly.io) to managed **AWS EKS** or **GKE**.

## Cloud Provider (AWS Focus)

* **Compute:** **Amazon ECS (Elastic Container Service)** is the recommended starting point for containerized backend services. Understand the difference between **EC2** and **Fargate** launch types.
* **Database:** **Amazon RDS (PostgreSQL)** for managed, scalable primary database.
* **Caching:** **Amazon ElastiCache (Redis)** for session management and frequent query results.
* **Storage:** **Amazon S3** for static assets, reports, and potential document uploads (Phase 3).
* **Monitoring:** **CloudWatch** for logs, metrics, and creating alarms (e.g., high latency on the forecasting service).

## CI/CD Pipeline

* **Tool:** **GitHub Actions** (as per blueprint).
* **Workflow Stages:**
    1.  **Lint/Test:** Run static analysis (`ESLint`, TypeScript checks) and unit/integration tests on every push.
    2.  **Build:** Build Docker images.
    3.  **Deploy (Staging):** Deploy to a staging environment (e.g., Render or a non-prod AWS cluster).
    4.  **Manual Gate:** Wait for approval.
    5.  **Deploy (Production):** Push images to ECR and update ECS service.

## Messaging & Scalability

* **Kafka/RabbitMQ:** Study the need for a message broker to decouple high-latency processes (like ML inference or bulk report generation) from the main API thread. Focus on **Exactly-Once Processing** principles for critical financial updates.

---
**Checklist:** Set up a basic GitHub Actions workflow that runs `npm test` on every pull request to the `dev` branch.