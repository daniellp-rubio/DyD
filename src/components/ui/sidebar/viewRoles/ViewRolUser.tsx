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
          className="mt-1 flex min-h-[48px] items-center rounded-lg px-2 text-brand-black transition-colors hover:bg-brand-smoke/20 hover:text-brand-orange"
        >
          <Icon size={24} className="shrink-0 sm:size-[30px]" />
          <span className="ml-3 text-base sm:text-xl">{label}</span>
        </Link>
      ))}
    </If>
  );
};

export default ViewRolUser;
