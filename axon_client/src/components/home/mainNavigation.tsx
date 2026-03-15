"use client";

import { useWorkspaceStore } from "@/stores/workspace";
import type { TNavigationWorkspaceContent } from "@/types";
import Link from "next/link";
import DynamicIcon from "../ui/DynamicIcon";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const MainNavigation = () => {
  const workspaceStore = useWorkspaceStore();
  const mainWorkspaceList: TNavigationWorkspaceContent[] | undefined =
    workspaceStore.workspace?.main?.map((workspace) => ({
      _id: workspace._id,
      title: workspace.title,
      cover: workspace.cover,
      icon: workspace.icon,
      workspaceType: workspace.workspace,
    }));
  const axonverseWorkspaceList: TNavigationWorkspaceContent[] | undefined =
    workspaceStore.workspace?.axonverse?.map((workspace) => ({
      _id: workspace._id,
      title: workspace.title,
      cover: workspace.cover,
      icon: workspace.icon,
      workspaceType: workspace.workspace,
    }));

  return (
    <div className="px-[40px] py-[40px] space-y-[30px]">
      <h2 className="font-bold text-[18px] text_glow">
        Navigate easily to any page here
      </h2>
      <div className="flex gap-[15px] flex-col">
        <div className="flex flex-col gap-[10px]">
          {workspaceStore.workspace.main?.length !== 0 && (
            <p className="text-[#595959] text-[13px]">main</p>
          )}
          <ScrollArea className="w-full max-w-5xl whitespace-nowrap">
            <div className="flex gap-[10px] pb-2.5">
              {mainWorkspaceList?.map((mainNavItems) => (
                <NavItems
                  workspaceType={mainNavItems.workspaceType}
                  key={mainNavItems._id}
                  _id={mainNavItems._id}
                  title={mainNavItems.title}
                  cover={mainNavItems.cover}
                  icon={mainNavItems.icon}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="flex max-w-full flex-col gap-[10px]">
          {workspaceStore.workspace.axonverse?.length !== 0 && (
            <p className="text-[#595959] text-[13px]">axonverse</p>
          )}
          <ScrollArea className=" max-w-5xl whitespace-nowrap custom-scrollbar">
            <div className="flex gap-[10px] pb-2.5">
              {axonverseWorkspaceList?.map((mainNavItems) => (
                <NavItems
                  workspaceType={mainNavItems.workspaceType}
                  key={mainNavItems._id}
                  _id={mainNavItems._id}
                  title={mainNavItems.title}
                  cover={mainNavItems.cover}
                  icon={mainNavItems.icon}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

const NavItems = ({
  _id,
  title,
  cover,
  icon,
  workspaceType,
}: TNavigationWorkspaceContent) => {
  return (
    <Link
      draggable={false}
      href={`/workspace/${workspaceType}/${_id}`}
      className="flex select-none items-center flex-shrink-0 hover:bg-neutral-800 transition-all rounded-lg px-2 py-1 gap-[10px]"
    >
      <DynamicIcon
        name={icon}
        height={15}
        width={15}
        className="translate-y-[1px] scale-[0.94]"
      />
      <span className="text-[15px] leading-tight">{title}</span>
    </Link>
  );
};

export default MainNavigation;
