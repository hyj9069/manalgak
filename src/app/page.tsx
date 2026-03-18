'use client';

import { motion } from 'framer-motion';
import { MapPin, Users, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-black">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-pink-400/10 blur-[100px]" />

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-5xl z-50 px-6 py-3 flex justify-between items-center glass rounded-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tighter">만날각</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold opacity-60">
            <a href="#features" className="hover:opacity-100 transition-opacity">주요 기능</a>
            <a href="#how-it-works" className="hover:opacity-100 transition-opacity">이용 방법</a>
          </div>
          <Link 
            href="/create"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            모임 만들기
          </Link>
        </nav>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-12 md:py-24">
          <section className="flex-1 text-center lg:text-left space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-black uppercase tracking-widest mb-8 border border-blue-200/50 dark:border-blue-800/50">
                Fair Meeting Spot Recommender
              </span>
              <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tight leading-[1.1] mb-8">
                우리 중간에서 <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  &quot;만날각&quot;
                </span>
                잡아볼까요?
              </h1>
              <p className="max-w-2xl mx-auto lg:mx-0 mt-10 text-base md:text-lg opacity-80 leading-relaxed font-medium">
                모이는 사람들의 출발지에서 가장 합리적인 중간 지점을 찾아드립니다. 
                교통편, 근처 맛집, 카페까지 한 번에 추천받으세요.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <Link 
                href="/create"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-2xl text-lg font-bold hover:opacity-90 transition-all cursor-pointer"
              >
                지금 바로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold transition-all gradient-border-animated cursor-pointer">
                서비스 구경하기
              </button>
            </motion.div>
          </section>

          {/* Hero Illustration Section */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative w-full group"
          >
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square w-full rounded-[48px] overflow-hidden group">
              {/* Floating Effect Background */}
              <div className="absolute inset-0 bg-blue-500/5 rounded-[48px] blur-3xl animate-pulse" />
              <img 
                src="/hero-map.png" 
                alt="Manalgak Map Illustration" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,113,227,0.15)] group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </motion.section>
        </div>

        <section id="features" className="grid md:grid-cols-3 gap-8 py-20 border-t border-foreground/5 mt-10">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="p-8 rounded-[32px] glass border-2 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Zap className="text-blue-600 w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-3 relative z-10 tracking-tight">빠른 중간지점 계산</h3>
            <p className="opacity-60 leading-relaxed font-semibold text-[15px] relative z-10">복잡한 위치 계산은 저희에게 맡기세요. 실시간으로 가장 최적의 위경도 중앙값을 구합니다.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="p-8 rounded-[32px] glass border-2 hover:border-purple-500/30 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Users className="text-purple-600 w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-3 relative z-10 tracking-tight">실시간 모임 참여</h3>
            <p className="opacity-60 leading-relaxed font-semibold text-[15px] relative z-10">링크 하나만 공유하면 끝! 친구들도 본인의 출발지 입력을 실시간으로 확인합니다.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="p-8 rounded-[32px] glass border-2 hover:border-orange-500/30 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <MapPin className="text-orange-600 w-7 h-7" />
            </div>
            <h3 className="text-xl font-black mb-3 relative z-10 tracking-tight">장소 및 교통 추천</h3>
            <p className="opacity-60 leading-relaxed font-semibold text-[15px] relative z-10">중간 지점 근처의 지하철역과 인기 있는 맛집 정보를 한눈에 보여드려요.</p>
          </motion.div>
        </section>
      </main>

      <footer className="py-10 text-center text-sm opacity-40">
        © 2024 ManalGak. Built with Next.js & Tailwind CSS.
      </footer>
    </div>
  );
}
