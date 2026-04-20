'use client';

import cslx from "clsx";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Components
import { If } from "@/components";
import ViewRolUser from "./viewRoles/ViewRolUser";
import ViewRolAdmin from "./viewRoles/ViewRolAdmin";

// Store
import { useUIStore } from "@/store";

// Actions
import { logout } from "@/actions";

// Icons
import {
  IoCloseOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoSearchOutline
} from "react-icons/io5";

export const Sidebar = () => {
  const isSideMenuOpen = useUIStore(state => state.isSideMenuOpen);
  const closeSideMenu = useUIStore(state => state.closeSideMenu);

  const {data: session} = useSession();
  const isAuthenticated = !!session?.user;
  const rolUser = session?.user?.role;

  const onLogout = async () => {
    await logout();
    window.location.reload();
    closeSideMenu();
  };

  return (
    <div className="mt-[55px]">
      <If condition={isSideMenuOpen}>
        <div
          className="fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30"
          />
      </If>

      <If condition={isSideMenuOpen}>
        <div
          onClick={() => closeSideMenu()}
          className="fade-in fixed top-0 left-0 w-screen h-screen z-100 backdrop-filter backdrop-blur-sm"
        />
      </If>

      <nav
        className={
          cslx(
            "fixed p-5 right-0 top-0 z-100 w-[220px] sm:w-[350px] md:w-[420px] lg:w-[500px] h-screen bg-palet-black z-20 shadow-2xl transform transform-all duration-300",
            {
              "translate-x-full": !isSideMenuOpen
            }
          )
        }
      >
        <IoCloseOutline
          size={50}
          className="absolute top-5 right-5 cursor-pointer"
          onClick={() => closeSideMenu()}
        />

        {/* <div className="relative mt-14">
          <IoSearchOutline size={20} className="absolute top-2 left-2" />

          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full bg-palet-found-black rounded pl-10 py-1 pr-10 border-b-2 text-xl border-gray-200 focus:outline-none focus:border-palet-orange"
          />
        </div> */}

        <ViewRolUser
          rolUser={rolUser}
          closeSideMenu={closeSideMenu}
        />

        <If condition={isAuthenticated}>
          <button
            onClick={() => {
              onLogout();
            }}
            className="flex items-center mt-10 p-2 hover:bg-gray100 rounded transition-all"
          >
            <IoLogOutOutline size={30} />
            <span className="ml-3 text-xl">Salir</span>
          </button>
        </If>

        <If condition={!isAuthenticated}>
          <Link
            href="/auth/login"
            className="flex items-center mt-10 p-2 hover:bg-gray100 rounded transition-all"
          >
            <IoLogInOutline size={30} />
            <span className="ml-3 text-xl">Ingresar</span>
          </Link>
        </If>

        <div className="w-full h-px bg-gray-200 my-10" />

        <ViewRolAdmin
          rolUser={rolUser}
          closeSideMenu={closeSideMenu}
        />
      </nav>
    </div>
  );
};
