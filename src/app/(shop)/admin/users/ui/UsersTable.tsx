"use client";

import { useTransition } from "react";
import type { Role } from "@prisma/client";

import { changeUserRole } from "@/actions";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface Props {
  users: UserRow[];
}

const UsersTable = ({ users }: Props) => {
  const [isPending, startTransition] = useTransition();

  const onChange = (userId: string, role: string) => {
    startTransition(async () => {
      await changeUserRole(userId, role);
    });
  };

  return (
    <table className="min-w-full">
      <thead className="bg-palet-found-black border-b border-palet-found-black">
        <tr>
          <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
            Email
          </th>
          <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
            Nombre completo
          </th>
          <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
            Rol
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr
            key={user.id}
            className="bg-palet-black border-b border-palet-found-black transition duration-300 ease-in-out hover:bg-palet-found-black"
          >
            <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
              {user.email}
            </td>
            <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
              {user.name}
            </td>
            <td className="flex items-center text-sm text-white font-light px-6 py-4 whitespace-nowrap">
              <select
                value={user.role}
                disabled={isPending}
                onChange={(e) => onChange(user.id, e.target.value)}
                className="text-sm text-white w-full p-2"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsersTable;
