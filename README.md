# FinSight

Monorepo for FinSight (web, api, landing, packages, infra).
See docs/ for architecture and setup guides.

## Database Migrations

To run the database migrations, run the following command from the root of the repository:

```bash
cd database && npx prisma migrate dev
```

### Test Database

To run the integration tests, you will need to create a separate test database.

1.  Create a new database called `finsight-test`.
2.  Create a `.env.test` file in the `apps/api` directory with the following content:

    ```
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finsight-test"
    ```

3.  Run the migrations on the test database:

    ```bash
    cd database && npx dotenv -e ../apps/api/.env.test -- npx prisma migrate deploy
    ```

4.  Run the integration tests:

    ```bash
    cd apps/api && npm run test:integration
    ```
