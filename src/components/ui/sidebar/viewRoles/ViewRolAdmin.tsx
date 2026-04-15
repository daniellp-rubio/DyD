import Link from "next/link";

// Components
import { If } from "@/components/if/If";

// Icons
import { HiOutlineDeviceMobile } from "react-icons/hi";
import { IoPeopleOutline, IoTicketOutline } from "react-icons/io5";

interface Props {
  rolUser: "user" | "admin";
  closeSideMenu: () => void;
};

const ViewRolAdmin = ({ rolUser, closeSideMenu }: Props) => {
  return (
    <If condition={rolUser === "admin"}>
      <Link
        href="/admin/products"
        className="flex items-center mt-10 p-2 hover:bg-gray100 rounded transition-all"
        onClick={() => closeSideMenu()}
      >
        <HiOutlineDeviceMobile size={30} />
        <span className="ml-3 text-xl">Productos</span>
      </Link>

      <Link
        href="/admin/orders"
        className="flex items-center mt-10 p-2 hover:bg-gray100 rounded transition-all"
        onClick={() => closeSideMenu()}
      >
        <IoTicketOutline size={30} />
        <span className="ml-3 text-xl">Ordenes</span>
      </Link>

      <Link
        href="/admin/users"
        className="flex items-center mt-10 p-2 hover:bg-gray100 rounded transition-all"
        onClick={() => closeSideMenu()}
      >
        <IoPeopleOutline size={30} />
        <span className="ml-3 text-xl">Usuarios</span>
      </Link>
    </If>
  );
};

export default ViewRolAdmin;