"use client";

import React, { useState } from "react";
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
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <MaxWidthWrapper className="h-16 flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo and Site Name */}
          <Link href="/">
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
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
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
                          <Link href="/category/keycaps">
                            <div className="font-medium">Keycaps</div>
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
                    <Link href="/contact">Contact</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 transition-transform duration-500 hover:scale-110"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        <div
          className={`absolute top-16 left-0 right-0 bg-white border-b border-gray-200 md:hidden transition-all duration-500 ease-in-out ${isMenuOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
        >
          <div className="flex flex-col p-4 space-y-4">
            <Link href="/" className="font-medium hover:text-purple-600">
              Home
            </Link>
            <div className="space-y-2">
              <div className="font-medium">Categories</div>
              <div className="pl-4 space-y-2">
                <Link href="/category/keyboards" className="block hover:text-purple-600">Keyboards</Link>
                <Link href="/category/mouse" className="block hover:text-purple-600">Mouse</Link>
                <Link href="/category/mousepads" className="block hover:text-purple-600">Mousepads</Link>
                <Link href="/category/switches" className="block hover:text-purple-600">Switches</Link>
                <Link href="/category/keycaps" className="block hover:text-purple-600">Keycaps</Link>
                <Link href="/category/accessories" className="block hover:text-purple-600">Accessories</Link>
              </div>
            </div>
            <Link href="/new" className="font-medium hover:text-purple-600">
              New Products
            </Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
