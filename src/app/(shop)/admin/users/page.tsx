export const revalidate = 0;

import { redirect } from "next/navigation";

import { getPaginatedUsers } from "@/actions";
import { If, Title } from "@/components";
import UsersTable from "./ui/UsersTable";

interface Props {
  searchParams?: Promise<{ page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = params?.page ? parseInt(params.page) : 1;

  const result = await getPaginatedUsers({ page });
  if (!result.ok) redirect("/auth/login");

  const users = result.users;

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
}
