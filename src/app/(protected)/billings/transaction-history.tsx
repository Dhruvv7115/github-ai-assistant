import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { api } from "@/trpc/react";
import { CreditCard } from "lucide-react";
import React from "react";

const TransactionHistory = () => {
  const { data: transactions } = api.project.getUserTransactions.useQuery();
  return (
    <section className="my-2 flex flex-col items-start justify-center gap-4">
      <h1 className="text-xl font-semibold text-black/80">
        Transaction History
      </h1>
      <div className="flex w-full flex-col items-center justify-center gap-2">
        {transactions?.length === 0 && (
          <Empty className="w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CreditCard className="text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No Transactions Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t made any transactions yet. Get started by
                making your first transaction.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {transactions?.map((transaction, index) => (
          <div
            key={index}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-gray-200 bg-white p-4 shadow"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={transaction?.user?.imageUrl || ""}
                  alt="user avatar"
                  className="h-12 w-12 rounded-full"
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-black/80">
                    {transaction.user.firstName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-black/80">
                <span className="text-green-600">
                  + {transaction.creditsPurchased} credits
                </span>{" "}
                / ${transaction.amount}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TransactionHistory;
