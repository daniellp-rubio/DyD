"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { motion } from "framer-motion";

// Actions
import { authenticate } from "@/actions";
import { If } from "@/components";
import { IoInformationOutline, IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import clsx from "clsx";

const LoginForm = () => {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (errorMessage === "Sucess") {
      // router.replace("/");
      window.location.replace("/");
    };
  }, [errorMessage]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.form 
      action={formAction} 
      className="flex flex-col w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-5 relative group">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
          Correo electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-palet-orange transition-colors">
            <IoMailOutline className="h-5 w-5" />
          </div>
          <input
            id="email"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-palet-orange/20 focus:border-palet-orange transition-all shadow-sm"
            type="email"
            name="email"
            placeholder="tu@correo.com"
            required
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-5 relative group">
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-palet-orange transition-colors">
            <IoLockClosedOutline className="h-5 w-5" />
          </div>
          <input
            id="password"
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-palet-orange/20 focus:border-palet-orange transition-all shadow-sm"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            required
          />
          <button 
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <IoEyeOffOutline className="h-5 w-5" /> : <IoEyeOutline className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      <div
        className="flex mb-4 items-center gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        <If condition={errorMessage}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg w-full"
          >
            <IoInformationOutline className="h-5 w-5" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </motion.div>
        </If>
      </div>

      <motion.button
        variants={itemVariants}
        type="submit"
        className={
          clsx(
            "relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]",
            {
              "bg-palet-orange hover:bg-palet-hover-orange": !isPending,
              "bg-palet-orange/70 cursor-not-allowed": isPending
            }
          )
        }
        disabled={isPending}
        name="redirectTo"
      >
        {isPending ? (
          <>
            <CgSpinner className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
            Verificando...
          </>
        ) : (
          "Ingresar a mi cuenta"
        )}
      </motion.button>

      {/* divisor line */}
      <motion.div variants={itemVariants} className="flex items-center my-8">
        <div className="flex-1 border-t border-slate-200"></div>
        <div className="px-4 text-sm text-slate-400 font-medium">¿Nuevo en DYD Tech?</div>
        <div className="flex-1 border-t border-slate-200"></div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Link
          href="/auth/new-account"
          className="w-full flex justify-center py-3.5 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors shadow-sm"
        >
          Crear una nueva cuenta
        </Link>
      </motion.div>
    </motion.form>
  );
};

export default LoginForm;