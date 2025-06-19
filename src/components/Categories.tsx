import Link from "next/link"
import { Keyboard, Mouse, Square, Zap, Crown, Wrench } from "lucide-react"

const categories = [
    {
        name: "Keyboards",
        href: "/category/keyboards",
        icon: Keyboard,
        description: "Mechanical & Gaming Keyboards",
        color: "bg-purple-100 text-purple-600 group-hover:bg-purple-200",
    },
    {
        name: "Mouse",
        href: "/category/mouse",
        icon: Mouse,
        description: "Gaming & Wireless Mice",
        color: "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
    },
    {
        name: "Mousepads",
        href: "/category/mousepads",
        icon: Square,
        description: "Gaming & Extended Mousepads",
        color: "bg-green-100 text-green-600 group-hover:bg-green-200",
    },
    {
        name: "Switches",
        href: "/category/switches",
        icon: Zap,
        description: "Mechanical Key Switches",
        color: "bg-orange-100 text-orange-600 group-hover:bg-orange-200",
    },
    {
        name: "Keycaps",
        href: "/category/keycaps",
        icon: Crown,
        description: "Custom & Artisan Keycaps",
        color: "bg-pink-100 text-pink-600 group-hover:bg-pink-200",
    },
    {
        name: "Accessories",
        href: "/category/accessories",
        icon: Wrench,
        description: "Tools & Other Accessories",
        color: "bg-gray-100 text-gray-600 group-hover:bg-gray-200",
    },
]

export function CategoriesSection() {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 bg-clip-text text-transparent pb-8 text-center -tracking-wide">Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => {
                            const IconComponent = category.icon
                            return (
                                <Link
                                    key={category.name}
                                    href={category.href}
                                    className="group block p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-200 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg transition-colors ${category.color}`}>
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                </div>
            </div>
        </section>
    )
}
