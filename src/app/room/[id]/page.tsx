'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Share2, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import KakaoMap from '@/components/KakaoMap';

import { supabase } from '@/lib/supabase';

interface Participant {
  id: string;
  name: string;
  location: string;
  coords: { lat: number; lng: number };
}

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;
  const [participants, setParticipants] = useState<Participant[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  // 1. 실시간 데이터 구독 및 초기 데이터 페치
  useEffect(() => {
    if (!roomId) return;

    // 초기 데이터 페치
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomId);
      
      if (error) {
        console.error('Error fetching participants:', error);
      } else {
        setParticipants(data.map(p => ({
          id: p.id,
          name: p.name,
          location: p.location,
          coords: { lat: p.lat, lng: p.lng }
        })));
      }
      setIsLoading(false);
    };

    fetchParticipants();

    // 실시간 구독 설정
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'participants',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newP = payload.new;
          setParticipants(prev => [...prev, {
            id: newP.id,
            name: newP.name,
            location: newP.location,
            coords: { lat: newP.lat, lng: newP.lng }
          }]);
        } else if (payload.eventType === 'DELETE') {
          setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const [nearestStation, setNearestStation] = useState<{ name: string; lat: number; lng: number } | null>(null);

  const rawMidpoint = useMemo(() => {
    if (participants.length === 0) return null;
    const total = participants.reduce(
      (acc, p) => ({
        lat: acc.lat + p.coords.lat,
        lng: acc.lng + p.coords.lng,
      }),
      { lat: 0, lng: 0 }
    );
    return {
      lat: total.lat / participants.length,
      lng: total.lng / participants.length,
    };
  }, [participants]);

  useEffect(() => {
    if (!rawMidpoint || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      if (rawMidpoint === null && nearestStation !== null) {
        setNearestStation(null);
      }
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.categorySearch('SW8', (data: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const station = data[0];
        // Only update if name changed to prevent render loops
        if (nearestStation?.name !== station.place_name) {
          setNearestStation({
            name: station.place_name,
            lat: parseFloat(station.y),
            lng: parseFloat(station.x)
          });
        }
      } else if (nearestStation !== null) {
        setNearestStation(null);
      }
    }, {
      location: new window.kakao.maps.LatLng(rawMidpoint.lat, rawMidpoint.lng),
      radius: 2000,
      sort: window.kakao.maps.services.SortBy.DISTANCE
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMidpoint, nearestStation?.name]);

  // 최종 지점은 지하철역이 있으면 역, 없으면 주소 중간지점
  const finalMidpoint = nearestStation || rawMidpoint;
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const searchAddress = () => {
    if (!newLocation.trim() || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      if (!window.kakao?.maps?.services) {
        alert('지도 서비스를 불러오는 중입니다. 잠시만 기다려주세요!');
      }
      return;
    }
    
    setIsSearching(true);
    const geocoder = new window.kakao.maps.services.Geocoder();
    const ps = new window.kakao.maps.services.Places();
    
    // 1. 먼저 도로명/지번 주소로 검색 시도
    geocoder.addressSearch(newLocation, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setNewCoords({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x)
        });
        setNewLocation(result[0].road_address?.address_name || result[0].address_name);
        setIsSearching(false);
      } else {
        // 2. 주소 검색 실패 시 장소(키워드) 검색 시도 (예: 동수역)
        ps.keywordSearch(newLocation, (data: any, psStatus: any) => {
          if (psStatus === window.kakao.maps.services.Status.OK) {
            setNewCoords({
              lat: parseFloat(data[0].y),
              lng: parseFloat(data[0].x)
            });
            setNewLocation(data[0].place_name + " (" + (data[0].road_address_name || data[0].address_name) + ")");
          } else {
            alert('주소나 장소를 찾을 수 없습니다. 정확한 이름을 입력해주세요.');
            setNewCoords(null);
          }
          setIsSearching(false);
        });
      }
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim() || !newCoords) {
      if (!newCoords && newLocation.trim()) {
        alert('주소 검색 버튼을 눌러 정확한 위치를 확인해주세요.');
      }
      return;
    }
    if (!roomId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('participants')
        .insert([{
          room_id: roomId,
          name: newName,
          location: newLocation,
          lat: newCoords.lat,
          lng: newCoords.lng
        }]);

      if (error) throw error;

      setNewName('');
      setNewLocation('');
      setNewCoords(null);
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('참가자 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeParticipant = async (id: string) => {
    // Optimistic UI update
    const previousParticipants = [...participants];
    setParticipants(participants.filter(p => p.id !== id));

    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('삭제 중 오류가 발생했습니다.');
      // Revert optimism on failure
      setParticipants(previousParticipants);
    }
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {participants.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -2 }}
                className="group p-5 rounded-[24px] bg-white dark:bg-zinc-900 border border-foreground/[0.03] shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {p.name}
                    </div>
                    <div className="text-[13px] opacity-60 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500/70" />
                      {p.location}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeParticipant(p.id)}
                    className="opacity-0 group-hover:opacity-40 hover:!opacity-100 p-1 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button 
            variant="outline" 
            className="w-full py-8 border-dashed border-2 rounded-[24px] bg-foreground/[0.01] hover:bg-blue-50/50 hover:border-blue-500/50 transition-all group"
            onClick={() => setIsAdding(true)}
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold opacity-60">나도 참여하기</span>
            </div>
          </Button>
        </div>

        <div className="p-6 border-t border-foreground/5 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm flex gap-3">
          <Button variant="primary" className="flex-1 h-14 rounded-2xl shadow-lg shadow-blue-500/20 font-bold">
            중간 지점 확인
          </Button>
          <Button 
            variant="outline" 
            className="px-5 h-14 rounded-2xl hover:bg-white dark:hover:bg-zinc-800 relative"
            onClick={handleShare}
          >
            <AnimatePresence mode="wait">
              {isCopied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="share"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Share2 className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </aside>

      {/* Map Content */}
      <main className="flex-1 relative bg-blue-50 dark:bg-zinc-900 overflow-hidden">
        <KakaoMap 
          className="absolute inset-0"
          center={finalMidpoint || { lat: 37.4979, lng: 127.0276 }} 
          level={4}
          markers={participants.map(p => ({
            lat: p.coords.lat,
            lng: p.coords.lng,
            title: p.name
          }))}
          midpoint={finalMidpoint}
        />
        
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-full max-w-sm px-4">
          <AnimatePresence>
            {finalMidpoint && (
              <motion.div 
                initial={{ y: -50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                className="glass-premium p-6 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col items-center gap-6 text-center border-white/40 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                  <span className="text-sm font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase">최적의 중간 지점 발견!</span>
                </div>
                
                <div className="space-y-1 w-full text-center">
                  <h3 
                    className="font-black tracking-tighter text-zinc-900 dark:text-white leading-tight"
                    style={{ fontSize: '1.6rem', marginBottom: '0.6rem' }}
                  >
                    {nearestStation ? nearestStation.name : '중간 지점'}
                  </h3>
                  <p className="text-sm font-bold opacity-60 text-center">여기서 만날각? 🗺️✨</p>
                </div>

                <div className="flex gap-4 w-full">
                  <div className="flex-1 px-4 py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black">길찾기</div>
                  <div className="flex-1 px-4 py-3 rounded-2xl bg-foreground/5 text-xs font-black border border-foreground/5">공유하기</div>
                </div>
              </motion.div>
            )}
            {!finalMidpoint && (
               <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="glass px-6 py-4 rounded-[32px] shadow-2xl flex items-center justify-center gap-3 border-white/20 dark:border-white/10 mx-auto w-fit"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm font-black tracking-tight whitespace-nowrap">참여자를 추가해주세요 🗺️</span>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Add Button For Mobile */}
        <div className="absolute bottom-10 right-10 md:hidden z-20">
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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-foreground/5 space-y-10"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight">출발지 추가</h2>
                  <p className="text-xs font-bold text-blue-600/60 uppercase tracking-widest">Add Participant</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-3 hover:bg-foreground/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 opacity-40 hover:opacity-100" />
                </button>
              </div>

              <form onSubmit={addParticipant} className="space-y-8">
                <Input 
                  label="누가 참여하나요?" 
                  placeholder="예: 홍길동" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-2xl"
                  required
                />
                <div className="space-y-3">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input 
                        label="어디서 출발하시나요?" 
                        placeholder="예: 강남역" 
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="rounded-2xl"
                        required
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mb-0.5 h-[52px] px-6 rounded-2xl border-2 font-black transition-all"
                      onClick={searchAddress}
                      disabled={isSearching}
                    >
                      {isSearching ? '...' : (newCoords ? '재검색' : '검색')}
                    </Button>
                  </div>
                  <AnimatePresence>
                    {newCoords && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50"
                      >
                        <p className="text-[13px] text-blue-700 dark:text-blue-300 font-bold flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          주소가 확인되었습니다! 📍
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02]" 
                  variant="primary"
                  disabled={!newCoords}
                >
                  참여 완료
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
