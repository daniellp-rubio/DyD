// Components
import LoginForm from "./ui/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bienvenido de vuelta</h1>
        <p className="text-slate-500 text-sm">Ingresa a tu cuenta para continuar</p>
      </div>

      <LoginForm />
    </div>
  );
}