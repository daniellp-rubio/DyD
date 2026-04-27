import Link from "next/link";

import { If } from "@/components/if/If";

import { IoPersonOutline, IoTicketOutline } from "react-icons/io5";

interface Props {
  rolUser: "user" | "admin" | undefined;
  closeSideMenu: () => void;
}

const LINKS = [
  { href: "/profile", label: "Perfil", Icon: IoPersonOutline },
  { href: "/orders", label: "Ordenes", Icon: IoTicketOutline },
] as const;

const ViewRolUser = ({ rolUser, closeSideMenu }: Props) => {
  return (
    <If condition={rolUser === "user" || rolUser === "admin"}>
      {LINKS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={closeSideMenu}
          className="mt-10 flex items-center rounded p-2 text-brand-black transition-colors hover:bg-brand-smoke/20 hover:text-brand-orange"
        >
          <Icon size={30} />
          <span className="ml-3 text-xl">{label}</span>
        </Link>
      ))}
    </If>
  );
};

export default ViewRolUser;
