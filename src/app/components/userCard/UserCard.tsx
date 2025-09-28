import { User } from "@/app/models";
import { ReactNode } from "react";

export default function UserCard({
  user,
  moreInfo,
}: {
  user: User;
  moreInfo?: ReactNode;
}) {
  return (
    <div className="flex items-center py-1.5 px-1 hover:bg-gray-100 rounded-lg transition">
      <div className="h-8 w-8 rounded-full bg-gray-400 text-white flex items-center justify-center mr-2">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex items-center flex-col">
        <label htmlFor={`participant-${user.id}`} className="cursor-pointer">
          {user.name}
        </label>
        {moreInfo}
      </div>
    </div>
  );
}
