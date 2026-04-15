"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";

// Actions
import { createUpdateProduct } from "@/actions";

// Interfaces
import { Category, Product, ProductImage } from "@/interfaces";
import { useRouter } from "next/navigation";

interface Props {
  product: Partial<Product> & { ProductImage?: ProductImage[] };
  categories: Category[];
};

interface FormInputs {
  title: string;
  slug: string;
  description: string;
  price: number;
  inStock: number;
  position: number;
  tags: string;
  categoryId: string;

  images?: FileList;
};

export const ProductForm = ({ product, categories }: Props) => {
  const router = useRouter();

  const { handleSubmit, register, formState: { isValid } } = useForm<FormInputs>({
    defaultValues: {
      ...product,
      tags: product.tags?.join(", "),

      images: undefined
    }
  });

  const onSubmit = async(data: FormInputs) => {
    const formData = new FormData();

    const { images, ...productToSave } = data;

    if (product.id) formData.append("id", product.id ?? "");
    formData.append("title", productToSave.title);
    formData.append("slug", productToSave.slug);
    formData.append("description", productToSave.description);
    formData.append("price", productToSave.price.toString());
    formData.append("inStock", productToSave.inStock?.toString() ?? "0");
    formData.append("position", productToSave.position?.toString() ?? "0");
    formData.append("tags", productToSave.tags);
    formData.append("categoryId", productToSave.categoryId);

    if (images) {
      for(let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      };
    };

    const { ok, product: updatedProduct } = await createUpdateProduct(formData);

    if(!ok) {
      alert("Produicto no se pudo actualizar");
      return;
    };

    router.replace(`/admin/product/${updatedProduct?.slug}`)
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid px-5 mb-16 grid-cols-1 sm:px-0 sm:grid-cols-2 gap-3">
      {/* Textos */}
      <div className="w-full">
        <div className="flex flex-col mb-2">
          <span>Título</span>
          <input type="text" className="p-2 border rounded-md" {...register("title", { required: true })}/>
        </div>

        <div className="flex flex-col mb-2">
          <span>Slug</span>
          <input type="text" className="p-2 border rounded-md" {...register("slug", { required: true })} />
        </div>

        <div className="flex flex-col mb-2">
          <span>Descripción</span>
          <textarea
            rows={5}
            className="p-2 border rounded-md"
            {...register("description", { required: true })}
          ></textarea>
        </div>

        <div className="flex flex-col mb-2">
          <span>Price</span>
          <input type="number" className="p-2 border rounded-md" {...register("price", { required: true, min: 0 })} />
        </div>

        <div className="flex flex-col mb-2">
          <span>Tags</span>
          <input type="text" className="p-2 border rounded-md" {...register("tags", { required: true })} />
        </div>

        <div className="flex flex-col mb-2">
          <span>Categoria</span>
          <select className="p-2 border rounded-md" {...register("categoryId", { required: true })}>
            <option value="">[Seleccione]</option>
            {
              categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))
            }
          </select>
        </div>

        <button className="btn-primary w-full">
          Guardar
        </button>
      </div>

      <div className="w-full">
        <div className="flex flex-col mb-2">
          <span>Inventario</span>
          <input type="number" className="p-2 border rounded-md" {...register("inStock", { required: true, min: 0 })} />
        </div>

        <div className="flex flex-col mb-2">
          <span>Posición</span>
          <input type="number" className="p-2 border rounded-md" {...register("position", { required: true, min: 0 })} />
        </div>

        <div className="flex flex-col mb-2">
          <span>Fotos</span>
          <input
            type="file"
            {...register("images")}
            multiple
            className="p-2 border rounded-md "
            accept="image/png, image/jpeg, image/webp"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {
            product.ProductImage?.map(image => (
              <div key={image.id}>
                <Image
                  alt={product.title ?? ""}
                  src={`${image.url}`}
                  width={2000}
                  height={2000}
                  className="rounded-top shadow-md"
                />

                <button
                  type="button"
                  onClick={() => console.log(image.id, image.url)}
                  className="btn-danger w-full rounded-b-xl"
                >
                  Eliminar
                </button>
              </div>
            ))
          }
        </div>
      </div>
    </form>
  );
};