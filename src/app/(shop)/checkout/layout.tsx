import { auth } from "@/auth-config";
import { redirect } from "next/navigation";

const CheckoutLayout = async({children}: {
  children: React.ReactNode;
}) => {
  const session = await auth();

  if (!session?.user) {
    redirect("/payment/withoutsession?redirectTo=/checkout/address")
  };

  return (
    <>
      {children}
    </>
  );
};

export default CheckoutLayout;