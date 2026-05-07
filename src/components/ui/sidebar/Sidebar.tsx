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
          "fixed right-0 top-0 z-20 h-screen w-[85vw] max-w-[320px] bg-brand-white p-4 text-brand-black shadow-2xl transition-transform duration-300 sm:max-w-none sm:w-[350px] sm:p-5 md:w-[420px] lg:w-[500px]",
          { "translate-x-full": !isSideMenuOpen }
        )}
      >
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={closeSideMenu}
          className="absolute right-5 top-5 text-brand-black transition-colors hover:text-brand-orange"
        >
          <IoCloseOutline size={50} />
        </button>

        <form onSubmit={onSearch} className="relative mt-12 sm:mt-14">
          <IoSearchOutline size={20} className="absolute left-2 top-2 text-brand-smoke" />
          <input
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded border-b-2 border-brand-smoke/40 bg-brand-white py-1 pl-10 pr-10 text-base text-brand-black placeholder:text-brand-smoke focus:border-brand-orange focus:outline-none sm:text-xl"
          />
        </form>

        <ViewRolUser rolUser={rolUser} closeSideMenu={closeSideMenu} />

        <If condition={isAuthenticated}>
          <button
            type="button"
            onClick={onLogout}
            className="mt-6 flex w-full items-center rounded p-2 text-brand-black transition-colors hover:bg-brand-smoke/20 hover:text-brand-orange sm:mt-10"
          >
            <IoLogOutOutline size={24} className="sm:hidden" />
            <IoLogOutOutline size={30} className="hidden sm:block" />
            <span className="ml-3 text-base sm:text-xl">Salir</span>
          </button>
        </If>

        <If condition={!isAuthenticated}>
          <Link
            href="/auth/login"
            onClick={closeSideMenu}
            className="mt-6 flex items-center rounded p-2 text-brand-black transition-colors hover:bg-brand-smoke/20 hover:text-brand-orange sm:mt-10"
          >
            <IoLogInOutline size={24} className="sm:hidden" />
            <IoLogInOutline size={30} className="hidden sm:block" />
            <span className="ml-3 text-base sm:text-xl">Ingresar</span>
          </Link>
        </If>

        <If condition={rolUser === "admin"}>
          <div className="my-10 h-px w-full bg-brand-smoke/40" />
          <ViewRolAdmin rolUser={rolUser} closeSideMenu={closeSideMenu} />
        </If>
      </nav>
    </>
  );
};
