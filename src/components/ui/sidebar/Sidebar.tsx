'use client';

import { useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { If } from "@/components";
import ViewRolUser from "./viewRoles/ViewRolUser";
import ViewRolAdmin from "./viewRoles/ViewRolAdmin";

import { useUIStore } from "@/store";
import { logout } from "@/actions";

import {
  IoCloseOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoSearchOutline
} from "react-icons/io5";

export const Sidebar = () => {
  const router = useRouter();
  const isSideMenuOpen = useUIStore(state => state.isSideMenuOpen);
  const closeSideMenu = useUIStore(state => state.closeSideMenu);

  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const rolUser = session?.user?.role as "user" | "admin" | undefined;

  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isSideMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSideMenu();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isSideMenuOpen, closeSideMenu]);

  const onLogout = async () => {
    closeSideMenu();
    await logout();
    router.refresh();
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    closeSideMenu();
    router.push(`/products?query=${encodeURIComponent(q)}`);
    setQuery("");
  };

  return (
    <>
      <If condition={isSideMenuOpen}>
        <div
          onClick={closeSideMenu}
          aria-hidden
          className="fade-in fixed inset-0 z-10 bg-white/30 backdrop-blur-sm"
        />
      </If>

      <nav
        aria-label="Menú lateral"
        aria-hidden={!isSideMenuOpen}
        className={clsx(
          "fixed right-0 top-0 z-20 flex h-dvh w-[85vw] max-w-sm flex-col overflow-y-auto bg-brand-white px-4 py-5 text-brand-black shadow-2xl transition-transform duration-300 sm:w-[350px] sm:max-w-none sm:px-5 md:w-[420px] lg:w-[500px]",
          { "translate-x-full": !isSideMenuOpen }
        )}
      >
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={closeSideMenu}
          className="absolute right-3 top-3 rounded-full p-1 text-brand-black transition-colors hover:text-brand-orange sm:right-5 sm:top-5"
        >
          <IoCloseOutline size={42} className="block sm:hidden" />
          <IoCloseOutline size={50} className="hidden sm:block" />
        </button>

        <form onSubmit={onSearch} className="relative mt-12 sm:mt-14">
          <IoSearchOutline
            size={18}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-smoke"
          />
          <input
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded border-b-2 border-brand-smoke/40 bg-brand-white py-2 pl-9 pr-4 text-base text-brand-black placeholder:text-brand-smoke focus:border-brand-orange focus:outline-none sm:text-xl"
          />
        </form>

        <div className="mt-2 flex flex-1 flex-col pb-4">
          <ViewRolUser rolUser={rolUser} closeSideMenu={closeSideMenu} />

          <If condition={isAuthenticated}>
            <button
              type="button"
              onClick={onLogout}
              className="mt-1 flex min-h-[48px] w-full items-center rounded-lg px-2 text-brand-black transition-colors hover:bg-brand-smoke/20 hover:text-brand-orange"
            >
              <IoLogOutOutline size={24} className="shrink-0 sm:size-[30px]" />
              <span className="ml-3 text-base sm:text-xl">Salir</span>
            </button>
          </If>

          <If condition={!isAuthenticated}>
            <Link
              href="/auth/login"
              onClick={closeSideMenu}
              className="mt-1 flex min-h-[48px] items-center rounded-lg px-2 text-brand-black transition-colors hover:bg-brand-smoke/20 hover:text-brand-orange"
            >
              <IoLogInOutline size={24} className="shrink-0 sm:size-[30px]" />
              <span className="ml-3 text-base sm:text-xl">Ingresar</span>
            </Link>
          </If>

          <If condition={rolUser === "admin"}>
            <div className="my-5 h-px w-full bg-brand-smoke/40 sm:my-8" />
            <ViewRolAdmin rolUser={rolUser} closeSideMenu={closeSideMenu} />
          </If>
        </div>
      </nav>
    </>
  );
};
