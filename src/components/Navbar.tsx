"use client";

import React from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";


const Navbar = () => {
  return (
    <nav className="w-full bg-white  border-b border-gray-200 sticky top-0 z-50 ">
      <MaxWidthWrapper className="h-16 flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo and Site Name */}
          <div className="flex items-center space-x-3 mr-8">
            {/* Circular Logo */}
            <div className="size-10 rounded-full bg-purple-400 flex items-center justify-center">
              <span className="text-white text-xs">MKPT</span>
            </div>
            {/* Site Name */}
            <span className="text-lg select-none">
              <span className="font-bold">mk</span>pricetracker
            </span>
          </div>
          {/* Navigation Menu */}
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link href="/category/keyboards">
                          <div className="font-medium">Keyboards</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link href="/category/mouse">
                          <div className="font-medium">Mouse</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link href="/category/mousepads">
                          <div className="font-medium">Mousepads</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link href="/category/switches">
                          <div className="font-medium">Switches</div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link href="/category/accessories">
                          <div className="font-medium">Accessories</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/new">New Products</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
