-- CreateTable
CREATE TABLE "GroceryBill" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroceryBill_pkey" PRIMARY KEY ("id")
);
