"use client";

import Link from 'next/link';

// Icons
import { IoCardOutline } from 'react-icons/io5';

// Interfaces
import { User } from '@/interfaces';
import { changeUserRole } from '@/actions';

interface Props {
  users: User[]
};

const UsersTable = ({ users }: Props) => {
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
        {
          users.map(user => (
            <tr key={user.id} className="bg-palet-black border-b border-palet-found-black transition duration-300 ease-in-out hover:bg-palet-found-black">
              <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                {user.email}
              </td>
              <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                {user.name}
              </td>
              <td className="flex items-center text-sm  text-white font-light px-6 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={e => changeUserRole(user.id, e.target.value)}
                  className="text-sm text-white w-full p-2"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
};

export default UsersTable