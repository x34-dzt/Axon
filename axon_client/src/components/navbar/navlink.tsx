"use client";

import type { TMenuItem } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink = ({ link }: { link: TMenuItem }) => {
  const router = usePathname();
  const isActive = router === `/${link.url}`;

  return (
    <Link
      href={`/${link.url}`}
      key={link.title}
      className={`flex w-full ${isActive ? "opacity-100" : "opacity-60 "} hover:opacity-100  transition-all  gap-[10px]`}
    >
      <img
        width={17}
        height={17}
        src={`/assets/${link.icon}`}
        alt={`icon_${link.title}`}
      />
      <span className="text-sm">{link.title}</span>
    </Link>
  );
};

export default NavLink;
