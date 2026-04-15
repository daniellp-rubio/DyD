// Components
import RegisterForm from "./ui/RegisterForm";

export default function NewAccountPage() {
  return (
    <div className="flex flex-col w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Crea tu cuenta</h1>
        <p className="text-slate-500 text-sm">Completa tus datos para comenzar</p>
      </div>

      <RegisterForm />
    </div>
  );
}
