-- Remove crypto payment and wallet infrastructure
ALTER TABLE "orders" DROP COLUMN IF EXISTS "crypto_payment_id";

DROP TABLE IF EXISTS "crypto_payments" CASCADE;
DROP TABLE IF EXISTS "wallet_topups" CASCADE;
DROP TABLE IF EXISTS "wallet_transactions" CASCADE;
DROP TABLE IF EXISTS "user_wallets" CASCADE;
DROP TABLE IF EXISTS "system_wallet_indexes" CASCADE;
DROP TABLE IF EXISTS "crypto_exchange_rates" CASCADE;

DROP TYPE IF EXISTS "WalletTransactionType" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "CryptoCurrency" CASCADE;
