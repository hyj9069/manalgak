'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Share2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Participant {
  id: string;
  name: string;
  location: string;
}

export default function RoomPage({ params }: { params: { id: string } }) {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: '김철수', location: '서울 강남역' },
    { id: '2', name: '이영희', location: '인천 부평역' },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const addParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim()) return;

    const newP = {
      id: Math.random().toString(),
      name: newName,
      location: newLocation,
    };
    setParticipants([...participants, newP]);
    setNewName('');
    setNewLocation('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-black overflow-hidden md:flex-row">
      {/* Sidebar - Participant List */}
      <aside className="w-full md:w-96 bg-white dark:bg-zinc-950 border-r border-foreground/5 flex flex-col z-10">
        <div className="p-6 border-b border-foreground/5 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              참여자 목록
            </h1>
            <span className="text-sm font-bold opacity-40">{participants.length}명</span>
          </div>
          <p className="text-sm opacity-60 font-medium">우리 어디서 만날까요?</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {participants.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5"
              >
                <div className="font-bold">{p.name}</div>
                <div className="text-xs opacity-50 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {p.location}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button 
            variant="outline" 
            className="w-full py-6 border-dashed border-2 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            나도 참여하기
          </Button>
        </div>

        <div className="p-6 border-t border-foreground/5 flex gap-3">
          <Button variant="primary" className="flex-1">중간 지점 확인</Button>
          <Button variant="outline" className="px-4">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* Map Content */}
      <main className="flex-1 relative bg-blue-50 dark:bg-zinc-900 overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4">
            <div className="animate-pulse bg-blue-500/20 w-32 h-32 rounded-full absolute -top-16 -left-16 blur-2xl" />
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 rounded-full border border-foreground/10 text-sm font-bold shadow-xl animate-bounce">
              이곳에 지도가 표시됩니다 🗺️
            </div>
            <p className="text-xs opacity-40 font-medium">곧 Kakao Maps API를 연동할 예정입니다.</p>
          </div>
        </div>

        {/* Floating Add Button For Mobile */}
        <div className="absolute bottom-10 right-10 md:hidden">
          <Button className="w-14 h-14 rounded-full shadow-2xl p-0" variant="primary">
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl border border-foreground/5 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">내 출발지 입력</h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-foreground/5 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={addParticipant} className="space-y-6">
                <Input 
                  label="이름" 
                  placeholder="예: 홍길동" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
                <Input 
                  label="출발지" 
                  placeholder="예: 서울역, 강남구 삼성동" 
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" size="lg">참여 완료</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
