
// Components
import RegisterForm from './ui/RegisterForm';

export default function NewAccountPage() {
  return (
    <div className="flex flex-col min-h-screen pt-32 sm:pt-35">
      <h1 className={`text-3xl mb-5`}>Nueva cuenta</h1>

      <RegisterForm />
    </div>
  );
}