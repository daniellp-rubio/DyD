import { auth } from '@/auth-config';
import { redirect } from 'next/navigation';

// Components
import { Title } from '@/components';
import FormWithoutSession from './ui/FormWithoutSession';

// Actions
import { getUserAddress } from '@/actions';

export default async function FormNoSessionPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/checkout?redirectTo=/checkout/formnosession")
  };

  return (
    <div className="flex flex-col sm:justify-center sm:items-center mb-72 px-10 sm:px-0">
      <div className="w-full  xl:w-[1000px] flex flex-col justify-center text-left">
        <Title title="Dirección" subtitle="Dirección de entrega" />

        <FormWithoutSession />
      </div>
    </div>
  );
};