import Image from "next/image";
import { redirect } from "next/navigation";

// Config
import { auth } from "@/auth-config";

// Components
import { Title } from "@/components";

const ProfilePage = async() => {
  const session = await auth();

  console.log(session);

  if (!session?.user) {
    redirect("/");
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Title title="Perfil" />

      <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg mt-6 flex flex-col sm:flex-row items-center gap-6">
        <Image
          src={session.user.image || "https://res.cloudinary.com/dtttwxbgr/image/upload/v1750722722/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector__1_-removebg-preview_1_rimifl.png"}
          alt="Avatar"
          width={170}
          height={170}
          className="rounded-full border"
        />

        <div className="flex flex-col text-white">
          <h2 className="text-2xl font-semibold">{session.user.name}</h2>
          <p className="text-sm text-gray-300">{session.user.email}</p>
          <span className="mt-2 inline-block bg-yellow-600 px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide">
            {session.user.role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;