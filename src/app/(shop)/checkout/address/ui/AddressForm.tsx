"use client";

import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Components
import { If } from "@/components";

// Icons
import { IoInformationOutline } from "react-icons/io5";

// Hook Form
import { zodResolver } from "@hookform/resolvers/zod";

// Actions
import { deleteUserAddress, setUserAddress } from "@/actions";

// Interfaces
import { Address } from "@/interfaces";

// Store
import { useAddressStore } from "@/store";

interface FormInputs {
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  postalCode: string;
  city: string;
  phone: string;
  rememberAddress: boolean;
};

interface Props {
  userStoredAddress?: Partial<Address>
};

const schema = z.object({
  firstName: z.string().min(1, "El nombre es requerido."),
  lastName: z.string().min(1, "El apellido es requerido."),
  address: z.string().min(1, "La dirección es requerido."),
  address2: z.string().max(50, "La dirección 2 es requerido.").optional(),
  postalCode: z.string().min(1, "El código postal es requerido."),
  city: z.string().min(1, "La cuidad es requerido."),
  phone: z.string().min(1, "El telefono es requerido."),
  rememberAddress: z.boolean()
});

const AddressForm = ({ userStoredAddress = {} }: Props) => {
  const [errorMessage, setErrorMessage] = useState("");
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    reset
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...userStoredAddress,
      rememberAddress: false
    }
  });
  const router = useRouter();

  const { data: session } = useSession({
    required: true,
  });

  const setAddress = useAddressStore(state => state.setAddress);
  const address = useAddressStore(state => state.address);

  useEffect(() => {
    if (address.firstName.length > 1) {
      reset(address);
    }
  }, [address]);

  const onSubmit = async(data: FormInputs) => {
    setErrorMessage("");
    const { rememberAddress, ...restAddress } = data;
    setAddress(data);

    if (rememberAddress) {
      await setUserAddress(restAddress, session!.user.id);
    } else {
      await deleteUserAddress(session!.user.id);
    };

    router.push("/checkout");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-2 sm:gap-5 sm:grid-cols-2">
      <div className="flex flex-col mb-2">
        <span>Nombres</span>
        <input
          type="text"
          className={
            clsx(
              "p-2 border rounded-md bg-gray-200 text-black",
              {
                "border-red-500": errors.firstName
              }
            )
          }
          {...register("firstName")}
        />

        <p className="text-red-500">{errors.firstName?.message}</p>
      </div>


      <div className="flex flex-col mb-2">
        <span>Apellidos</span>
        <input
          type="text"
          className={
            clsx(
              "p-2 border rounded-md bg-gray-200 text-black",
              {
                "border-red-500": errors.lastName
              }
            )
          }
          {...register("lastName")}
        />

        <p className="text-red-500">{errors.lastName?.message}</p>
      </div>

      <div className="flex flex-col mb-2">
        <span>Dirección</span>
        <input
          type="text"
          className={
            clsx(
              "p-2 border rounded-md bg-gray-200 text-black",
              {
                "border-red-500": errors.address
              }
            )
          }
          {...register("address")}
        />

        <p className="text-red-500">{errors.address?.message}</p>
      </div>

      <div className="flex flex-col mb-2">
        <span>Dirección 2 (opcional)</span>
        <input
          type="text"
          className="p-2 border rounded-md bg-gray-200 text-black"
          {...register("address2")}
        />
      </div>


      <div className="flex flex-col mb-2">
        <span>Código postal</span>
        <input
          type="text"
          className={
            clsx(
              "p-2 border rounded-md bg-gray-200 text-black",
              {
                "border-red-500": errors.postalCode
              }
            )
          }
          {...register("postalCode")}
        />

        <p className="text-red-500">{errors.postalCode?.message}</p>
      </div>

      <div className="flex flex-col mb-2">
        <span>Ciudad</span>
        <input
          type="text"
          className={
            clsx(
              "p-2 border rounded-md bg-gray-200 text-black",
              {
                "border-red-500": errors.city
              }
            )
          }
          {...register("city")}
        />

        <p className="text-red-500">{errors.city?.message}</p>
      </div>

      <div className="flex flex-col mb-2">
        <span>Teléfono</span>
        <input
          type="text"
          className={
            clsx(
              "p-2 border rounded-md bg-gray-200 text-black",
              {
                "border-red-500": errors.phone
              }
            )
          }
          {...register("phone")}
        />

        <p className="text-red-500">{errors.phone?.message}</p>
      </div>

      <div className="flex flex-col mb-2 sm:mt-1">
        <div className="inline-flex items-center mb-10">
          <label
            className="relative flex cursor-pointer items-center rounded-full p-3"
            htmlFor="checkbox"
            data-ripple-dark="true"
          >
            <input
              type="checkbox"
              className="border-gray-500 before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-palet-orange checked:before:border-palet-orange hover:before:opacity-10"
              id="checkbox"
              {...register("rememberAddress")}
            />
            <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </label>

          <span>Recordar dirección</span>
        </div>

        {/* <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          <If condition={errorMessage}>
            <IoInformationOutline className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">{errorMessage}</p>
          </If>
        </div> */}

        <button
          // href='/checkout'
          // className="btn-primary flex w-full sm:w-1/2 justify-center"
          className={
            clsx({
              "btn-primary": isValid,
              "btn-disabled": !isValid
            })
          }
          type="submit"
        >
          Siguiente
        </button>
      </div>
    </form>
  );
};

export default AddressForm;