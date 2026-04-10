"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import * as z from "zod";

// Hook Form
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Components
import { If } from "@/components";

// Actions
import { login, registerUser } from "@/actions";

// Icons
import { IoInformationOutline } from "react-icons/io5";

interface FormInputs {
  name: string;
  email: string;
  password: string;
};

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("El email es invalido."),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres. ")
    .max(32, "La contraseña no debe superar los 32 caracteres.")
});

const RegisterForm = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<FormInputs>({
    resolver: zodResolver(schema)
  });

  const onSubmit: SubmitHandler<FormInputs> = async(data) => {
    setErrorMessage("");
    const {name, email, password} = data;

    const resp = await registerUser(name, email, password);

    if (!resp.ok) {
      setErrorMessage(resp.message);
      return;
    };

    await login(email.toLowerCase(), password);
    window.location.replace("/");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <label htmlFor="name">Nombre completo</label>
      <input
        className={
          clsx(
            "px-5 py-2 border bg-gray-200 rounded text-palet-black",
            {
              "border-red-500": errors.name
            }
          )
        }
        type="text"
        id="name"
        autoFocus
        {...register("name")}
      />

      <p className="mb-5 text-red-500">{errors.name?.message}</p>

      <label htmlFor="email">Correo electronico</label>
      <input
        className={
          clsx(
            "px-5 py-2 border bg-gray-200 rounded text-palet-black",
            {
              "border-red-500": errors.email
            }
          )
        }
        type="email"
        id="email"
        {...register("email")}
      />

      <p className="mb-5 text-red-500">{errors.email?.message}</p>

      <label htmlFor="password">Contraseña</label>
      <input
        className={
          clsx(
            "px-5 py-2 border bg-gray-200 rounded text-palet-black",
            {
              "border-red-500": errors.password
            }
          )
        }
        type="password"
        id="password"
        {...register("password")}
      />

      <p className="mb-5 text-red-500">{errors.password?.message}</p>

      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        <If condition={errorMessage}>
          <IoInformationOutline className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-500">{errorMessage}</p>
        </If>
      </div>

      <button
        className="btn-primary"
      >
        Crear cuenta
      </button>

      {/* divisor l ine */ }
      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-gray-500"></div>
        <div className="px-2 text-gray-800">O</div>
        <div className="flex-1 border-t border-gray-500"></div>
      </div>

      <Link
        href="/auth/login"
        className="btn-secondary text-center">
        Ingresar
      </Link>
    </form>
  );
};

export default RegisterForm;