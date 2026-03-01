"use client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { createCheckoutSession } from "@/lib/stripe";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";
import React from "react";

const BillingPage = () => {
  const { data: user } = api.project.getMyCredits.useQuery();
  const [creditsToBuy, setCreditsToBuy] = React.useState<number[]>([100]);
  const creditsToBuyAmount = creditsToBuy[0]!;

  const price = (creditsToBuyAmount / 50).toFixed(2);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">Billing</h1>
      <p className="text-sm text-neutral-500">
        You currently have {user?.credits} credits.
      </p>
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700">
        <div className="flex items-center gap-2">
          <Info className="size-4" />
          <p className="text-sm">
            Each credits allows you to index one file per repository.
          </p>
        </div>
        <p className="text-sm">
          for eg. If your project has 100 files, you will need 100 credits to
          index it
        </p>
      </div>
      <Slider
        value={creditsToBuy}
        defaultValue={[100]}
        max={1000}
        step={10}
        onValueChange={(value) => setCreditsToBuy(value)}
        className="mt-4"
      />
      <Button
        onClick={() => {
          createCheckoutSession(creditsToBuyAmount);
        }}
        className="mt-4 w-fit"
      >
        Buy {creditsToBuyAmount} credits for ${price}
      </Button>
    </div>
  );
};

export default BillingPage;

