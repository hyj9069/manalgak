'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

export default function CreatePage() {
  const router = useRouter();
  const [meetingName, setMeetingName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingName.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{ title: meetingName }])
        .select()
        .single();

      if (error) throw error;
      
      router.push(`/room/${data.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('모임 방 생성 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center glass">
        <Link href="/" className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 text-center font-bold text-lg">모임 만들기</div>
        <div className="w-9" /> {/* Spacer */}
      </header>

      <main className="max-w-xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
              <Plus className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              어떤 모임인가요?
            </h1>
            <p className="opacity-60 font-medium">
              모임의 이름을 정하고 중간 지점을 찾아보세요.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-8">
            <Input
              label="모임 이름"
              placeholder="예: 강남역 맛집 탐방, 대학 동기 모임"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              required
              autoFocus
            />

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!meetingName.trim() || isLoading}
              >
                {isLoading ? '생성 중...' : '모임 방 만들기'}
              </Button>
            </div>
          </form>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-6 rounded-[32px] glass border-2 space-y-2">
              <div className="text-blue-600 font-bold text-lg">1,240+</div>
              <div className="text-xs opacity-50 font-bold tracking-tight">오늘 생성된 모임</div>
            </div>
            <div className="p-6 rounded-[32px] glass border-2 space-y-2">
              <div className="text-purple-600 font-bold text-lg">99.9%</div>
              <div className="text-xs opacity-50 font-bold tracking-tight">정확한 중간지점 계산</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
