import Link from "next/link";

import { If } from "@/components/if/If";

import { HiOutlineDeviceMobile } from "react-icons/hi";
import { IoPeopleOutline, IoTicketOutline, IoShareSocialOutline } from "react-icons/io5";

interface Props {
  rolUser: "user" | "admin" | undefined;
  closeSideMenu: () => void;
}

const LINKS = [
  { href: "/admin/products", label: "Productos", Icon: HiOutlineDeviceMobile },
  { href: "/admin/orders", label: "Ordenes", Icon: IoTicketOutline },
  { href: "/admin/users", label: "Usuarios", Icon: IoPeopleOutline },
  { href: "/admin/content", label: "Contenido Social", Icon: IoShareSocialOutline },
] as const;

const ViewRolAdmin = ({ rolUser, closeSideMenu }: Props) => {
  return (
    <If condition={rolUser === "admin"}>
      {LINKS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={closeSideMenu}
          className="mt-6 flex items-center rounded p-2 text-brand-black transition-colors hover:bg-brand-smoke/20 hover:text-brand-orange sm:mt-10"
        >
          <Icon size={24} className="sm:hidden" />
          <Icon size={30} className="hidden sm:block" />
          <span className="ml-3 text-base sm:text-xl">{label}</span>
        </Link>
      ))}
    </If>
  );
};

export default ViewRolAdmin;
