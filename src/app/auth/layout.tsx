import { auth } from "@/auth-config";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function NewAccount({ children }: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Visual / Brand Side - Hidden on small screens */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative flex-col justify-between p-12 bg-slate-50 border-r border-slate-100 overflow-hidden">
        {/* Abstract Geometric CSS Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-orange-50 opacity-80"></div>
          {/* Decorative circles */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-palet-orange/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -right-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3 font-bold text-2xl text-slate-800">
          <div className="relative w-12 h-12">
            <Image 
              src="/logo_compact_background_transparent_(640x640).png" 
              alt="DYD Tech Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <span>DYD <span className="font-light text-slate-500">Tech</span></span>
        </div>

        <div className="relative z-10 max-w-lg mt-auto mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Descubre una nueva forma de comprar.
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Accede a la mejor colección de productos premium diseñados especialmente para ti. 
            Calidad, rapidez y seguridad garantizada.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} DYD Tech. Todos los derechos reservados.
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex items-center justify-center p-6 sm:p-12 md:p-20 bg-white">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </main>
  );
};