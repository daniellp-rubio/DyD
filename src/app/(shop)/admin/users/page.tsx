export const revalidate = 0;

import { redirect } from 'next/navigation';

// Actions
import { getPaginatedUsers } from '@/actions';

// Components
import { If, Title } from '@/components';
import UsersTable from './ui/UsersTable';

export default async function OrdersPage() {
  const { ok, users = [] } = await getPaginatedUsers();

  if (!ok) {
    redirect("auth/login");
  };

  return (
    <>
      <Title title="Mantenimiento de usuarios" />

      <If condition={users.length === 0}>
        <p>No hay usuarios</p>
      </If>

      <If condition={users.length !== 0}>
        <div className="mb-[32.8rem]">
          <UsersTable users={users} />
        </div>
      </If>
    </>
  );
};