"use client";

import { useAuthStore } from "@/stores/auth";
import { Skeleton } from "../ui/skeleton";

const NavbarHeader = () => {
  const { user } = useAuthStore();
  return (
    <h2 className="flex gap-[16px] items-center">
      <img
        src={"/assets/axon_logo.svg"}
        className="w-[25px] h-[19.3px]"
        alt="axon_logo"
      />
      <span className="font-semibold text-[20px] leading-none ">
        <div>
          {user?.username ? (
            <p>Axon</p>
          ) : (
            // <p>{user.username}</p>
            <Skeleton className="dark h-[24px] w-[98px]" />
          )}
        </div>
      </span>
    </h2>
  );
};

export default NavbarHeader;
