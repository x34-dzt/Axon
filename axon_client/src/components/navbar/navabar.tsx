"use client";

import type { TMenuItem } from "@/types";
import NavLink from "./navlink";
import NavbarHeader from "./NavbarHeader";
import WorkspaceSection from "../workspace/WorkspaceSection";
import { useWorkspaceStore } from "@/stores/workspace";
import { Avatar } from "../ui/avatar";
import { useState } from "react";
import UserProfileModal from "../ui/UserProfileModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { navOpen } = useWorkspaceStore();
  const menuItems: TMenuItem[] = [
    {
      _id: "home_id",
      icon: "homeIcon.svg",
      title: "Home",
      url: "",
    },
  ];

  return (
    <nav
      className={`sticky max-h-screen overflow-y-auto z-[1000000] border-r border-[#262626] flex-shrink-0 bg-customPrimary h-screen top-0 ${navOpen ? "ml-0" : "-ml-[251px]"} custom-transition-all w-[250px] py-[25px] px-[20px]`}
    >
      <div className="flex flex-col gap-[25px] h-full">
        <NavbarHeader />
        <div className="flex flex-col gap-[13px] ">
          {menuItems.map((menuLink) => {
            return <NavLink key={menuLink.title} link={menuLink} />;
          })}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex w-fit  hover:opacity-100 opacity-60 transition-all  gap-[10px]`}
          >
            <Avatar className="h-[17px] w-[17px]">
              <img
                width={17}
                height={17}
                src={`/assets/userIcon.svg`}
                alt={`icon`}
              />
            </Avatar>
            <span className="text-[13px] ">Profile</span>
          </button>
          <UserProfileModal
            isOpen={isOpen}
            onClose={() => setIsOpen((prev) => !prev)}
          />
        </div>
        <div className="flex max-h-[800px] flex-col">
          <WorkspaceSection />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
