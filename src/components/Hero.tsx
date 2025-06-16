"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { FlickeringGrid } from "./flickering-grid"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-white via-gray-50 to-purple-50 -mt-5 pb-20 sm:py-32 relative overflow-hidden pt-16">
      {/* Large Curved Background Element */}
      <div className="absolute h-[300px] w-[1000px] sm:w-[2000px] sm:h-[768px] lg:w-[5000px] lg:h-[1000px] rounded-[100%] bg-white left-1/2 -translate-x-1/2 bg-[radial-gradient(closest-side,#ffffff_90%,#FBF3FD)] top-[calc(100%-96px)] sm:top-[calc(100%-100px)] z-50 mt-10 sm:mt-2 border-t border-gray-200 " />

      {/* Flickering Grid Background */}
      <div className="absolute inset-0 opacity-40">
        <FlickeringGrid
          squareSize={3}
          gridGap={8}
          flickerChance={0.2}
          color="rgb(147, 51, 234)"
          maxOpacity={0.4}
          className="w-full h-full"
        />
      </div>

      {/* Additional Flickering Grid Layer */}
      <div className="absolute inset-0 opacity-20">
        <FlickeringGrid
          squareSize={2}
          gridGap={12}
          flickerChance={0.15}
          color="rgb(236, 72, 153)"
          maxOpacity={0.3}
          className="w-full h-full"
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-pink-100/50" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-400/20 rounded-full blur-3xl animate-pulse" />

      <div className="relative container mx-auto px-4 py-12 lg:py-8 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8" >
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2 text-sm font-medium mb-6 shadow-sm">
              <div className="size-4 rounded-full bg-purple-400 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">MK</span>
              </div>
              {"India's #1 Keyboard Price Comparison Platform"}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find the Best Deals on
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 bg-clip-text text-transparent">
                Mechanical Keyboards
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Compare prices across India's top vendors. Never overpay to
            <br />
            complete your dream setup.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-10 items-center">
            <Input
              placeholder="Search keyboards, mice, switches..."
              className="py-4.5 text-lg bg-white/95 backdrop-blur-sm border-gray-300 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 shadow-sm"
            />
            <Button
              asChild
              size="lg"
              className="bg-purple-500 hover:bg-purple-600 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-white"
            >
              <Link href="/search">Search Products</Link>
            </Button>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="group flex items-center justify-center gap-4 p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white/95 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Real-time Tracking</div>
                <div className="text-sm text-gray-600">Live price updates</div>
              </div>
            </div>

            <div className="group flex items-center justify-center gap-4 p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white/95 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Trusted Vendors</div>
                <div className="text-sm text-gray-600">Verified sellers only</div>
              </div>
            </div>

            <div className="group flex items-center justify-center gap-4 p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white/95 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">New Updates</div>
                <div className="text-sm text-gray-600">Never miss a product</div>
              </div>
            </div> */}
          {/* </div> */}
        </div>
      </div>

    </section>
  )
}
