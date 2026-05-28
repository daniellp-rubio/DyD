import { auth } from "@/auth-config";
import { redirect } from "next/navigation";
import { CheckoutProgress } from "@/components/ui/checkout-progress/CheckoutProgress";

const CheckoutLayout = async({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session?.user) {
    redirect("/payment/withoutsession?redirectTo=/checkout/address");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8">
      <CheckoutProgress />
      {children}
    </div>
  );
};

export default CheckoutLayout;