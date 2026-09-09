-- Better Auth identifies an account by provider and provider-specific account ID.
DROP INDEX "Account_issuer_accountId_key";

ALTER TABLE "Account" DROP COLUMN "issuer";

CREATE UNIQUE INDEX "Account_providerId_accountId_key"
ON "Account"("providerId", "accountId");
