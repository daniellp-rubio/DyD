export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import clsx from "clsx";

import { auth } from "@/auth-config";
import { getUserAddress, getOrdersByUser } from "@/actions";
import { Title } from "@/components";

import {
  IoCardOutline,
  IoLocationOutline,
  IoMailOutline,
  IoPersonCircleOutline,
  IoShieldCheckmarkOutline,
  IoTicketOutline,
} from "react-icons/io5";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login?returnTo=/profile");

  const user = session.user;
  const [address, ordersRes] = await Promise.all([
    getUserAddress(user.id),
    getOrdersByUser(),
  ]);

  const orders = ordersRes.ok ? ordersRes.orders ?? [] : [];
  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.isPaid).length;
  const pendingOrders = totalOrders - paidOrders;
  const recentOrders = orders.slice(0, 5);

  const initials =
    user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="flex justify-center mb-32 px-4 sm:px-0">
      <div className="flex flex-col w-full max-w-[1100px]">
        <Title title="Mi Perfil" subtitle="Gestiona tu cuenta y revisa tu actividad" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-1">
            <div className="bg-palet-found-black rounded-xl shadow-xl p-7 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-brand-orange flex items-center justify-center text-3xl font-bold text-white">
                {initials}
              </div>
              <h2 className="text-2xl font-semibold text-white mt-4">{user.name}</h2>
              <span
                className={clsx(
                  "mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                  user.role === "admin" ? "bg-purple-700 text-white" : "bg-blue-700 text-white"
                )}
              >
                {user.role}
              </span>

              <div className="w-full h-0.5 rounded bg-gray-700 my-6" />

              <div className="w-full space-y-3 text-white">
                <div className="flex items-center gap-3">
                  <IoMailOutline size={22} />
                  <span className="text-sm break-all">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoShieldCheckmarkOutline
                    size={22}
                    className={user.emailVerified ? "text-green-500" : "text-red-500"}
                  />
                  <span className="text-sm">
                    {user.emailVerified ? "Email verificado" : "Email no verificado"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <IoPersonCircleOutline size={22} />
                  <span className="text-sm">ID: {user.id.split("-").at(-1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={IoTicketOutline} label="Órdenes" value={totalOrders} />
              <StatCard
                icon={IoCardOutline}
                label="Pagadas"
                value={paidOrders}
                className="text-green-400"
              />
              <StatCard
                icon={IoCardOutline}
                label="Pendientes"
                value={pendingOrders}
                className="text-red-400"
              />
            </div>

            <div className="bg-palet-found-black rounded-xl shadow-xl p-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <IoLocationOutline size={24} />
                  Dirección de envío
                </h3>
                <Link
                  href="/checkout/address"
                  className="text-sm text-brand-orange hover:underline"
                >
                  {address ? "Editar" : "Agregar"}
                </Link>
              </div>

              {address ? (
                <div className="text-white text-sm space-y-1">
                  <p className="text-base">
                    {address.firstName} {address.lastName}
                  </p>
                  <p>{address.address}</p>
                  {address.address2 && <p>{address.address2}</p>}
                  <p>
                    {address.city}, {address.postalCode}
                  </p>
                  <p>{address.phone}</p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Aún no tienes una dirección guardada.
                </p>
              )}
            </div>

            <div className="bg-palet-found-black rounded-xl shadow-xl p-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <IoTicketOutline size={24} />
                  Órdenes recientes
                </h3>
                <Link href="/orders" className="text-sm text-brand-orange hover:underline">
                  Ver todas
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="text-gray-400 text-sm">Todavía no has realizado órdenes.</p>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {recentOrders.map(order => (
                    <li key={order.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-white text-sm font-medium">
                          #{order.id.split("-").at(-1)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {order.OrderAddress?.firstName} {order.OrderAddress?.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={clsx(
                            "text-xs font-semibold px-2 py-1 rounded",
                            order.isPaid
                              ? "bg-green-800 text-green-200"
                              : "bg-red-800 text-red-200"
                          )}
                        >
                          {order.isPaid ? "Pagada" : "Pendiente"}
                        </span>
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-sm text-brand-orange hover:underline"
                        >
                          Ver
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  className?: string;
}

const StatCard = ({ icon: Icon, label, value, className }: StatCardProps) => (
  <div className="bg-palet-found-black rounded-xl shadow-xl p-5 flex items-center gap-4">
    <Icon size={32} className={className ?? "text-white"} />
    <div>
      <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
      <p className={clsx("text-2xl font-bold", className ?? "text-white")}>{value}</p>
    </div>
  </div>
);
