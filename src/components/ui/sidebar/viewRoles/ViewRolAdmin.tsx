import Link from "next/link";

import { If } from "@/components/if/If";

import { HiOutlineDeviceMobile } from "react-icons/hi";
import { IoPeopleOutline, IoTicketOutline, IoShareSocialOutline } from "react-icons/io5";

interface Props {
  rolUser: "user" | "admin" | undefined;
  closeSideMenu: () => void;
}

const LINKS = [
  { href: "/admin/products", label: "Productos",        Icon: HiOutlineDeviceMobile },
  { href: "/admin/orders",   label: "Ordenes",          Icon: IoTicketOutline },
  { href: "/admin/users",    label: "Usuarios",         Icon: IoPeopleOutline },
  { href: "/admin/content",  label: "Contenido Social", Icon: IoShareSocialOutline },
] as const;

const ViewRolAdmin = ({ rolUser, closeSideMenu }: Props) => {
  return (
    <If condition={rolUser === "admin"}>
      {LINKS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={closeSideMenu}
          className="mt-1 flex min-h-[48px] items-center rounded-lg px-2 text-brand-black transition-colors hover:bg-brand-smoke/20 hover:text-brand-orange"
        >
          <Icon size={24} className="shrink-0 sm:size-[30px]" />
          <span className="ml-3 text-base sm:text-xl">{label}</span>
        </Link>
      ))}
    </If>
  );
};

export default ViewRolAdmin;
