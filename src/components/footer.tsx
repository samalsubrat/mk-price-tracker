import Link from "next/link"
import MaxWidthWrapper from "./MaxWidthWrapper"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-pink-50/10" />

      <MaxWidthWrapper className=" py-16 relative z-10">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
           
            {/* Categories Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Categories</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/category/keyboards" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Keyboards
                  </Link>
                </li>
                <li>
                  <Link href="/category/switches" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Switches
                  </Link>
                </li>
                <li>
                  <Link href="/category/keycaps" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Keycaps
                  </Link>
                </li>
                <li>
                  <Link href="/category/mouse" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Mice
                  </Link>
                </li>
                <li>
                  <Link href="/category/accessories" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Accessories
                  </Link>
                </li>
              </ul>
            </div>

             {/* Pages Section */}
             <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Pages</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Brand Section */}
            <div className="flex items-center justify-center md:justify-end">
              <div className="text-right">
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-800 leading-tight"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  MK Price Tracker
                </h2>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">© 2025 All rights reserved.</p>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  )
}
