'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MapPin,
  Plus,
  Share2,
  X,
  Pencil,
  Trash2,
  Check,
  ChevronRight,
  Star,
  Zap,
  MessageCircleMore,
  ChevronUp,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import KakaoMap from '@/components/KakaoMap';

import { supabase } from '@/lib/supabase';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

interface Participant {
  id: string;
  name: string;
  location: string;
  coords: { lat: number; lng: number };
}

interface Recommendation {
  id: string;
  name: string;
  title: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  url: string;
  distance: string;
}

interface DbParticipant {
  id: string;
  room_id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  created_at?: string;
}

interface PresenceState {
  participant_id: string;
  online_at: string;
}

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomTitle, setRoomTitle] = useState('모임');
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);
  const [onlineParticipants, setOnlineParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  const [nearestStation, setNearestStation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Recommendation[]>([]);
  const [recoCategory, setRecoCategory] = useState<'FD6' | 'CE7' | '술집' | 'AI'>('FD6');
  const [selectedRecoId, setSelectedRecoId] = useState<string | null>(null);
  const [swiperRef, setSwiperRef] = useState<import('swiper').Swiper | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [lastConfirmedLocation, setLastConfirmedLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [hasActivatedRecommendations, setHasActivatedRecommendations] = useState(false);



  // 1. 초기 데이터 페치 및 실시간 구독
  useEffect(() => {
    if (!roomId) return;

    // Load my participant ID from localStorage
    const savedId = localStorage.getItem(`manalgak-participant-${roomId}`);
    if (savedId) setMyParticipantId(savedId);

    // 초기 데이터 페치 (방 정보 및 참여자)
    const fetchData = async () => {
      // Fetch Room
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (roomData) {
        setRoomTitle(roomData.title || '모임');
      }

      // Fetch Participants
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomId);
      
      if (error) {
        console.error('Error fetching participants:', error);
      } else if (data) {
        setParticipants((data as DbParticipant[]).map(p => ({
          id: p.id,
          name: p.name,
          location: p.location,
          coords: { lat: p.lat, lng: p.lng }
        })));
      }
      setIsLoading(false);
    };

    fetchData();

    // 실시간 구독 설정 (참여자 및 Presence)
    const participantsChannel = supabase
      .channel(`room-realtime-${roomId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'participants',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newP = payload.new;
          setParticipants(prev => {
            if (prev.some(p => p.id === newP.id)) return prev;
            return [...prev, {
              id: newP.id,
              name: newP.name,
              location: newP.location,
              coords: { lat: newP.lat, lng: newP.lng }
            }];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedP = payload.new;
          setParticipants(prev => prev.map(p => p.id === updatedP.id ? {
            id: updatedP.id,
            name: updatedP.name,
            location: updatedP.location,
            coords: { lat: updatedP.lat, lng: updatedP.lng }
          } : p));
        } else if (payload.eventType === 'DELETE') {
          setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const newState = participantsChannel.presenceState();
        const activeIds = Object.values(newState)
          .flat()
          .map((p) => (p as unknown as PresenceState).participant_id)
          .filter(Boolean);
        setOnlineParticipants(activeIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && savedId) {
          await participantsChannel.track({
            online_at: new Date().toISOString(),
            participant_id: savedId
          });
        }
      });

    return () => {
      supabase.removeChannel(participantsChannel);
    };
  }, [roomId]);

  // UseEffect to re-track when myParticipantId changes
  useEffect(() => {
    if (!roomId || !myParticipantId) return;
    
    const channel = supabase.channel(`room-realtime-${roomId}`);
    // This effect is mainly to ensure we track if the ID was just created
    const trackPresence = async () => {
      await channel.track({
        online_at: new Date().toISOString(),
        participant_id: myParticipantId
      });
    };
    
    // Check if already subscribed to track
    if (channel.state === 'joined') {
      trackPresence();
    }
  }, [roomId, myParticipantId]);

  const rawMidpoint = useMemo(() => {
    if (participants.length < 2) return null;

    // 3D Geometric Midpoint Calculation (more accurate for geographic coordinates)
    let x = 0;
    let y = 0;
    let z = 0;

    participants.forEach((p) => {
      const lat = (p.coords.lat * Math.PI) / 180;
      const lng = (p.coords.lng * Math.PI) / 180;

      x += Math.cos(lat) * Math.cos(lng);
      y += Math.cos(lat) * Math.sin(lng);
      z += Math.sin(lat);
    });

    const total = participants.length;
    x /= total;
    y /= total;
    z /= total;

    const centralLng = Math.atan2(y, x);
    const centralHyp = Math.sqrt(x * x + y * y);
    const centralLat = Math.atan2(z, centralHyp);

    return {
      lat: (centralLat * 180) / Math.PI,
      lng: (centralLng * 180) / Math.PI,
    };
  }, [participants]);

  // 최종 지점은 지하철역이 있으면 역, 없으면 주소 중간지점
  const finalMidpoint = nearestStation || rawMidpoint;

  // 중간 지점 발견 시 사이드바 자동 접기
  useEffect(() => {
    if (finalMidpoint && !isSidebarCollapsed && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsSidebarCollapsed(true);
    }
  }, [finalMidpoint, isSidebarCollapsed]);

  useEffect(() => {
    if (!rawMidpoint || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      if (rawMidpoint === null && nearestStation !== null) {
        setNearestStation(null);
      }
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.categorySearch('SW8', (data: kakao.maps.services.KakaoPlace[], status: kakao.maps.services.Status) => {
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
  }, [rawMidpoint, nearestStation?.name, nearestStation]);

  // 맛집 추천 기능 복구 및 강화
  useEffect(() => {
    if (!rawMidpoint || !window.kakao || !window.kakao.maps || !window.kakao.maps.services || recoCategory === 'AI') {
      if (rawMidpoint === null && recommendations.length > 0) {
        setRecommendations([]);
      }
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    
    const callback = (data: kakao.maps.services.KakaoPlace[], status: kakao.maps.services.Status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const top10: Recommendation[] = data.slice(0, 10).map(item => ({
          id: item.id,
          name: item.place_name,
          title: item.place_name,
          category: item.category_group_name,
          address: item.road_address_name || item.address_name,
          lat: parseFloat(item.y),
          lng: parseFloat(item.x),
          url: item.place_url,
          distance: item.distance
        }));
        setRecommendations(top10);
        // Reset swiper position
        if (swiperRef) swiperRef.slideTo(0);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        setRecommendations([]);
      }
    };

    const options = {
      location: new window.kakao.maps.LatLng(rawMidpoint.lat, rawMidpoint.lng),
      radius: 2000,
      sort: window.kakao.maps.services.SortBy.ACCURACY
    };

    if (recoCategory === '술집') {
      ps.keywordSearch('술집', callback, options);
    } else {
      ps.categorySearch(recoCategory, callback, options);
    }
  }, [rawMidpoint, recoCategory, swiperRef, recommendations.length]);

  // AI 추천 핸들러
  const handleAiRecommend = async () => {
    if (!aiQuery.trim() || !rawMidpoint) return;
    
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiQuery })
      });
      
      const data = await response.json();
      if (!response.ok) {
        setAiError(data.error || "AI 추천 중 오류가 발생했습니다.");
        setIsAiLoading(false);
        return;
      }
      setAiError(null); // Clear previous errors on success
      
      if (data.keywords) {
        setAiRecommendations([]); // Clear previous AI recos
        setRecoCategory('AI'); // Switch to AI tab immediately
        
        const ps = new window.kakao.maps.services.Places();
        const options = {
          location: new window.kakao.maps.LatLng(rawMidpoint.lat, rawMidpoint.lng),
          radius: 2000,
          sort: window.kakao.maps.services.SortBy.ACCURACY
        };

        ps.keywordSearch(data.keywords, (places: kakao.maps.services.KakaoPlace[], status: kakao.maps.services.Status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const top10: Recommendation[] = places.slice(0, 10).map((item: kakao.maps.services.KakaoPlace) => ({
              id: item.id,
              name: item.place_name,
              title: item.place_name,
              category: item.category_group_name,
              address: item.road_address_name || item.address_name,
              lat: parseFloat(item.y),
              lng: parseFloat(item.x),
              url: item.place_url,
              distance: item.distance
            }));
            setAiRecommendations(top10);
            if (swiperRef) swiperRef.slideTo(0);
            setIsAiLoading(false);
          } else {
            // Fallback: If AI keyword fails, try searching with [Nearest Station Area + Restaurant]
            const fallbackKeyword = `${nearestStation?.name || '중간지점'} 맛집`;
            console.log(`AI search failed for "${data.keywords}", trying fallback: "${fallbackKeyword}"`);
            
            ps.keywordSearch(fallbackKeyword, (fallbackPlaces: kakao.maps.services.KakaoPlace[], fallbackStatus: kakao.maps.services.Status) => {
              if (fallbackStatus === window.kakao.maps.services.Status.OK) {
                const top10: Recommendation[] = fallbackPlaces.slice(0, 10).map((item: kakao.maps.services.KakaoPlace) => ({
                  id: item.id,
                  name: item.place_name,
                  title: item.place_name,
                  category: item.category_group_name,
                  address: item.road_address_name || item.address_name,
                  lat: parseFloat(item.y),
                  lng: parseFloat(item.x),
                  url: item.place_url,
                  distance: item.distance
                }));
                setAiRecommendations(top10);
                if (swiperRef) swiperRef.slideTo(0);
              } else {
                alert(`"${data.keywords}"에 대한 검색 결과가 없고, 기본 추천도 실패했습니다.`);
              }
              setIsAiLoading(false);
            }, options);
          }
        }, options);
      }
    } catch (error) {
      console.error("AI recommend error:", error);
      alert("AI 서버와 통신 중 오류가 발생했습니다.");
      setIsAiLoading(false);
    }
  };

  // 선택된 맛집으로 스와이퍼 이동
  useEffect(() => {
    const currentRecos = recoCategory === 'AI' ? aiRecommendations : recommendations;
    if (swiperRef && selectedRecoId && currentRecos.length > 0) {
      const index = currentRecos.findIndex(r => r.id === selectedRecoId);
      if (index !== -1) {
        swiperRef.slideTo(index);
      }
    }
  }, [selectedRecoId, swiperRef, recommendations, aiRecommendations, recoCategory]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const shareToKakao = () => {
    if (!window.Kakao) return;
    
    const name = nearestStation ? nearestStation.name : '중간지점';
    const description = `우리 여기서 만날각? 최적의 중간 지점: ${name}`;
    
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '만날각 - 중간 지점 찾기',
        description: description,
        imageUrl: 'https://placeholder.supabase.co/storage/v1/object/public/images/hero-map.png', // Replace with real asset if available
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: '중간 지점 확인하기',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  };

  const searchAddress = () => {
    if (newCoords && lastConfirmedLocation === newLocation.trim()) {
      alert('이미 확인된 주소입니다. 다른 주소를 입력하고 다시 검색하시거나, 하단의 참여 완료를 눌러주세요.');
      return;
    }
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
    geocoder.addressSearch(newLocation, (result: kakao.maps.services.KakaoAddress[], status: kakao.maps.services.Status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setNewCoords({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x)
        });
        const loc = result[0].road_address?.address_name || result[0].address_name;
        setNewLocation(loc);
        setLastConfirmedLocation(loc);
        setIsSearching(false);
      } else {
        // 2. 주소 검색 실패 시 장소(키워드) 검색 시도 (예: 동수역)
        ps.keywordSearch(newLocation, (data: kakao.maps.services.KakaoPlace[], psStatus: kakao.maps.services.Status) => {
          if (psStatus === window.kakao.maps.services.Status.OK) {
            setNewCoords({
              lat: parseFloat(data[0].y),
              lng: parseFloat(data[0].x)
            });
            const loc = data[0].place_name + " (" + (data[0].road_address_name || data[0].address_name) + ")";
            setNewLocation(loc);
            setLastConfirmedLocation(loc);
          } else {
            alert('주소나 장소를 찾을 수 없습니다. 정확한 이름을 입력해주세요.');
            setNewCoords(null);
          }
          setIsSearching(false);
        });
      }
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('브라우저가 위치 정보를 지원하지 않습니다.');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
          setIsSearching(false);
          setNewCoords({ lat: latitude, lng: longitude });
          setNewLocation('현재 위치');
          setLastConfirmedLocation('현재 위치');
          return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(longitude, latitude, (result: kakao.maps.services.KakaoAddress[], status: kakao.maps.services.Status) => {
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            const addr = result[0].road_address?.address_name || result[0].address_name || '현재 위치';
            setNewCoords({ lat: latitude, lng: longitude });
            setNewLocation(addr);
            setLastConfirmedLocation(addr);
          } else {
            setNewCoords({ lat: latitude, lng: longitude });
            setNewLocation('현재 위치');
            setLastConfirmedLocation('현재 위치');
          }
          setIsSearching(false);
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('위치 정보를 가져오는 데 실패했습니다.');
        setIsSearching(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };



  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim() || !newCoords || !roomId) return;

    setIsSubmitting(true);
    try {
      if (editingParticipant) {
        // Update existing
        const { error } = await supabase
          .from('participants')
          .update({
            name: newName,
            location: newLocation,
            lat: newCoords.lat,
            lng: newCoords.lng
          })
          .eq('id', editingParticipant.id);
        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('participants')
          .insert([{
            room_id: roomId,
            name: newName,
            location: newLocation,
            lat: newCoords.lat,
            lng: newCoords.lng
          }])
          .select()
          .single();
        if (error) throw error;

        // Save me as participant
        if (data) {
          localStorage.setItem(`manalgak-participant-${roomId}`, data.id);
          setMyParticipantId(data.id);
        }
      }

      setNewName('');
      setNewLocation('');
      setNewCoords(null);
      setLastConfirmedLocation('');
      setEditingParticipant(null);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving participant:', error);
      alert('저장 중 오류가 발생했습니다.');
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

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-black"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col h-[100dvh] bg-zinc-50 dark:bg-black overflow-hidden md:flex-row relative overscroll-none">
      <motion.button 
        initial={false}
        animate={{ 
          x: isSidebarCollapsed ? 0 : 384,
          opacity: isSidebarCollapsed ? 1 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 1)
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        aria-label={isSidebarCollapsed ? "참여자 목록 열기" : "참여자 목록 닫기"}
        aria-expanded={!isSidebarCollapsed}
        aria-controls="participant-sidebar"
        className="fixed top-1/2 -translate-y-1/2 z-[60] bg-zinc-950 shadow-2xl border border-white/10 w-8 h-12 hidden md:flex items-center justify-center rounded-r-2xl left-0 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
      >
        <motion.div
          animate={{ rotate: isSidebarCollapsed ? 0 : 180 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center justify-center"
          aria-hidden="true"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </motion.div>
      </motion.button>

      {/* Left Sidebar (Participant List) */}
      <motion.aside 
        id="participant-sidebar"
        aria-label="참여자 목록"
        initial={false}
        animate={{ 
          x: isSidebarCollapsed ? (typeof window !== 'undefined' && window.innerWidth < 768 ? '-100%' : -384) : 0,
          marginRight: isSidebarCollapsed ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : -384) : 0,
          opacity: isSidebarCollapsed ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          flex flex-col bg-zinc-950 text-white
          transition-colors duration-500 h-full overflow-hidden z-[70] fixed md:relative
          ${isSidebarCollapsed ? 'pointer-events-none' : 'pointer-events-auto'}
          w-full md:w-[384px]
          flex-shrink-0
        `}
      >
        <div className="p-8 flex items-center justify-between border-b border-white/5 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
              {roomTitle}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {participants.slice(0, 3).map((p) => (
                  <div key={p.id} className="w-5 h-5 rounded-full border-2 border-zinc-950 bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-400">
                    {p.name[0]}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{participants.length}명이 참여중</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5">
              <Users className="w-5 h-5 text-white/60" aria-hidden="true" />
            </div>
            {/* Mobile Close Button */}
            {!isSidebarCollapsed && (
              <button 
                onClick={() => setIsSidebarCollapsed(true)}
                className="md:hidden w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-6 h-6 text-white/60" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 premium-scrollbar">
          <AnimatePresence mode="wait">
            {!isAdding ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
              {participants.map((p) => (
                <motion.div 
                  layout
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative"
                >
                  <div 
                    className={`
                      p-5 rounded-[28px] border transition-all duration-300
                      ${p.id === myParticipantId 
                        ? 'bg-blue-900/20 border-blue-800/50' 
                        : 'bg-zinc-900/40 border-white/5 hover:border-white/10'}
                    `}
                  >
                    <div >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 flex-shrink-0 rounded-2xl bg-zinc-900 shadow-sm border border-white/5 flex items-center justify-center font-black text-blue-400 overflow-hidden relative group-hover:scale-105 transition-transform">
                          {p.name[0]}
                          {onlineParticipants.includes(p.id) && (
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500 border-2 border-zinc-900" />
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-3 pr-[70px]">
                            <p className="font-black text-[15px] tracking-tight truncate text-white">{p.name}</p>
                            {p.id === myParticipantId && (
                              <span className="text-[9px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">나</span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-white/60 truncate">{p.location}</p>
                        </div>
                      </div>
                      {p.id === myParticipantId && (
                        <div className="absolute top-4 right-[20px] flex gap-1 z-10">
                          <button 
                            onClick={() => {
                              setEditingParticipant(p);
                              setNewName(p.name);
                              setNewLocation(p.location);
                              setNewCoords(p.coords);
                              setLastConfirmedLocation(p.location);
                              setIsAdding(true);
                            }}
                            aria-label={`${p.name} 정보 수정`}
                            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all bg-zinc-900/80 backdrop-blur-sm shadow-sm"
                          >
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button 
                            onClick={() => removeParticipant(p.id)}
                            aria-label={`${p.name} 삭제`}
                            className="p-2 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-900/20 transition-all bg-zinc-900/80 backdrop-blur-sm shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              <Button 
                variant="outline" 
                className="w-full rounded-[28px] border-dashed border-2 border-white/10 hover:border-blue-500/50 hover:bg-blue-900/10 transition-all group mt-6"
                onClick={() => setIsAdding(true)}
                aria-label="참여자 추가"
              >
                <div className="flex flex-col items-center gap-1">
                  <Plus className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <span className="text-sm font-bold text-white/60">나도 참여하기</span>
                </div>
              </Button>

              {participants.length < 2 && (
                <div className="mt-8 p-6 rounded-[32px] bg-zinc-900/50 border border-white/5 text-center space-y-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Share2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-black tracking-tight text-white/90">친구들에게 공유해보세요!</p>
                    <p className="text-[11px] font-bold text-white/60">링크를 공유하면 친구들도 <br/>직접 출발지를 입력할 수 있어요.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full rounded-xl text-xs font-black shadow-md shadow-blue-500/10"
                    onClick={handleShare}
                  >
                    {isCopied ? '복사 완료!' : '참여 링크 복사하기'}
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8 p-2"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black tracking-tight text-white">{editingParticipant ? '정보 수정' : '참여자 추가'}</h2>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Enter departure location</p>
                </div>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingParticipant(null);
                  }}
                  className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 opacity-40" />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-8">
                <Input 
                  label="이름" 
                  placeholder="본인의 이름을 입력하세요" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-2xl h-14 text-sm font-bold bg-zinc-900 border-white/5 text-white"
                  required
                />
                <div className="space-y-4">
                  <Input 
                    label="출발지" 
                    placeholder="도로명 주소 또는 키워드 (예: 강남역)" 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                    className="rounded-2xl h-14 text-sm font-bold bg-zinc-900 border-white/5 text-white"
                    required
                  />
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 h-14 rounded-2xl border-white/10 font-black flex items-center justify-center gap-2 group text-white/60"
                      onClick={getCurrentLocation}
                      disabled={isSearching}
                    >
                      <Zap className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span>{isSearching ? '...' : '현위치'}</span>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 h-14 rounded-2xl border-white/10 font-black text-white/60"
                      onClick={searchAddress}
                      disabled={isSearching}
                    >
                      {isSearching ? '...' : '주소 검색'}
                    </Button>
                  </div>
                  <AnimatePresence>
                    {newCoords && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-blue-900/20 border border-blue-800/50"
                      >
                        <p className="text-[13px] text-blue-300 font-bold flex items-center gap-2">
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
                  disabled={!newCoords || isSubmitting}
                >
                  {isSubmitting ? (editingParticipant ? '수정 중...' : '참여 중...') : (editingParticipant ? '수정 완료' : '참여 완료')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full h-14 rounded-2xl text-sm font-bold border-white/5 text-white/40" 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingParticipant(null);
                  }}
                >
                  취소
                </Button>
              </form>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {!isAdding && (
          <div className="p-6 border-t border-white/5 bg-zinc-950 flex gap-3">
          <Button 
            variant="primary" 
            className="flex-1 h-14 rounded-2xl shadow-lg shadow-blue-500/20 font-bold"
            disabled={participants.length < 2}
            onClick={() => {
              setShowMapMobile(true);
              setIsSidebarCollapsed(true);
            }}
          >
            {participants.length < 2 ? '참여자를 추가해주세요' : '중간 지점 확인'}
          </Button>
          <Button 
            variant="outline" 
            className="px-5 h-14 rounded-2xl border-none bg-zinc-900 hover:bg-zinc-800 transition-colors relative"
            onClick={handleShare}
          >
            <AnimatePresence mode="wait">
              {isCopied ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : (
                <motion.div key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Share2 className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
        )}
      </motion.aside>

      {/* Map Content */}
      <main className={`flex-1 relative bg-blue-50 dark:bg-zinc-900 overflow-hidden ${!showMapMobile ? 'hidden md:block' : 'block'}`}>
        <KakaoMap 
          className="absolute inset-0"
          center={finalMidpoint || { lat: 37.4979, lng: 127.0276 }} 
          level={3}
          markers={participants.map(p => ({
            lat: p.coords.lat,
            lng: p.coords.lng,
            title: p.name
          }))}
          midpoint={finalMidpoint}
          recommendations={hasActivatedRecommendations ? (recoCategory === 'AI' ? aiRecommendations : recommendations) : []}
          selectedRecommendationId={selectedRecoId}
          onRecommendationClick={(id) => setSelectedRecoId(id)}
          onMapClick={() => setShowRecommendations(false)}
        />
        
        {/* Top Floating Midpoint Banner */}
        <div className="absolute top-10 left-1/2 z-30 pointer-events-none w-full max-w-md px-4 flex justify-center -translate-x-1/2">
          <AnimatePresence>
            {finalMidpoint && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-premium rounded-[24px] md:rounded-full px-5 py-3.5 md:px-6 md:py-3 shadow-2xl border border-white/20 dark:border-white/10 pointer-events-auto flex flex-col md:flex-row items-center gap-2 md:gap-4 max-w-[90vw] md:max-w-none"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                  <span className="text-[15px] font-black tracking-tight break-keep text-center md:text-left">
                    {nearestStation?.name ? `${nearestStation.name}역 부근` : '중간 지점 발견!'}
                  </span>
                </div>
                <div className="hidden md:block w-[1px] h-4 bg-foreground/10" />
                <button 
                  onClick={() => {
                    setShowRecommendations(true);
                    setHasActivatedRecommendations(true);
                  }}
                  className="text-[13px] md:text-sm font-black text-blue-600 dark:text-blue-400 hover:opacity-70 transition-opacity break-keep"
                >
                  주변 맛집 보기 ✨
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Recommendation Sheet */}
        <AnimatePresence>
          {finalMidpoint && hasActivatedRecommendations && (
            <motion.div
              id="recommendation-sheet"
              initial={{ y: "100%" }}
              animate={{ y: showRecommendations ? 0 : "calc(100% - 44px)" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 z-[40] glass-premium rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-white/30 dark:border-white/10 overflow-hidden flex flex-col max-h-[70vh]"
            >
              <button 
                className="w-full h-11 flex items-center justify-center cursor-pointer group flex-shrink-0 focus:outline-none focus:bg-white/5 active:bg-white/10 transition-colors" 
                onClick={() => setShowRecommendations(!showRecommendations)}
                aria-label={showRecommendations ? "추천 목록 닫기" : "추천 목록 열기"}
                aria-expanded={showRecommendations}
                aria-controls="recommendation-sheet"
              >
                {showRecommendations ? (
                  <ChevronDown className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 transition-colors" aria-hidden="true" />
                ) : (
                  <ChevronUp className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 transition-colors" aria-hidden="true" />
                )}
              </button>

              <div className="p-6 pt-0 space-y-6 overflow-y-auto overflow-x-hidden premium-scrollbar">
                {/* Categories & AI Tab */}
                <div className="flex items-center justify-between">
                  <div className="flex bg-foreground/5 p-1 rounded-2xl overflow-x-auto no-scrollbar gap-1">
                    {(['FD6', 'CE7', '술집', 'AI'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setRecoCategory(cat)}
                        className={`px-4 py-2.5 rounded-xl text-[11px] font-black transition-all whitespace-nowrap ${
                          recoCategory === cat 
                            ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600' 
                            : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                      >
                        {cat === 'FD6' ? '음식점' : cat === 'CE7' ? '카페' : cat === '술집' ? '술집' : 'AI 추천 ✨'}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const name = nearestStation ? nearestStation.name : '중간지점';
                        const url = `https://map.kakao.com/link/to/${name},${finalMidpoint!.lat},${finalMidpoint!.lng}`;
                        window.open(url, '_blank');
                      }}
                      className="p-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border border-transparent shadow-sm hover:scale-105 transition-transform"
                      title="길찾기"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={shareToKakao}
                      className="p-3 rounded-xl bg-[#FEE500] text-[#3c1e1e] border-none shadow-sm hover:scale-105 transition-transform"
                      title="카카오톡 공유"
                    >
                      <MessageCircleMore className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Recommendations Swiper */}
                <Swiper
                  modules={[FreeMode]}
                  spaceBetween={16}
                  slidesPerView="auto"
                  freeMode={true}
                  onSwiper={setSwiperRef}
                  className="w-full !overflow-visible"
                >
                  {(recoCategory === 'AI' ? aiRecommendations : recommendations).map((reco) => (
                    <SwiperSlide key={reco.id} className="!w-[280px]">
                      <motion.div
                        onClick={() => setSelectedRecoId(reco.id)}
                        className={`p-5 rounded-3xl bg-white dark:bg-zinc-800/50 border-2 transition-all cursor-pointer h-full ${
                          selectedRecoId === reco.id 
                            ? 'border-blue-500 shadow-xl shadow-blue-500/10' 
                            : 'border-foreground/5 hover:border-blue-500/30'
                        }`}
                      >
                        <div className="text-[10px] font-black text-blue-600 mb-1.5 uppercase tracking-wider">{reco.category}</div>
                        <div className="font-black text-[15px] truncate mb-1">{reco.name}</div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-black ml-1">{(4.0 + Math.random() * 1.0).toFixed(1)}</span>
                          </div>
                          <span className="text-[11px] font-bold opacity-30">|</span>
                          <span className="text-[11px] font-bold opacity-40">리뷰 {Math.floor(Math.random() * 500) + 50}+</span>
                        </div>
                        <div className="text-[11px] font-medium opacity-40 truncate mb-4">{reco.address}</div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[11px] font-black opacity-60 bg-foreground/5 px-2.5 py-1.5 rounded-lg">{reco.distance}m</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(reco.url, '_blank');
                            }}
                            className="text-xs font-black text-blue-500 hover:underline px-2 py-1"
                          >
                            상세보기
                          </button>
                        </div>
                      </motion.div>
                    </SwiperSlide>
                  ))}
                  {(recoCategory !== 'AI' && recommendations.length === 0) && (
                    <div className="w-full py-20 text-center space-y-3 opacity-40">
                      <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mx-auto">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold">장소를 찾는 중이거나 결과가 없습니다.</p>
                    </div>
                  )}
                </Swiper>

                {/* AI Search & Input */}
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="AI에게 무엇이든 물어보세요! (예: 분위기 좋은 데이트 코스)"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiRecommend()}
                    className="w-full bg-white dark:bg-zinc-900 border-2 border-foreground/5 rounded-[24px] px-6 py-5 text-sm font-bold outline-none focus:border-blue-500/40 shadow-sm transition-all pr-14 text-zinc-900 dark:text-white"
                    disabled={isAiLoading}
                  />
                  <button 
                    onClick={handleAiRecommend}
                    disabled={isAiLoading || !aiQuery.trim()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-30 transition-all shadow-lg shadow-blue-500/20"
                  >
                    {isAiLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5 fill-current" />
                    )}
                  </button>
                </div>

                {/* AI Error Report */}
                {aiError && (
                  <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-3xl animate-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">AI 추천 오류</span>
                      <button onClick={() => setAiError(null)} className="text-zinc-400 p-1 hover:text-zinc-600"><X className="w-4 h-4" /></button>
                    </div>
                    <pre className="text-[11px] text-red-500 font-mono whitespace-pre-wrap leading-relaxed select-all">
                      {aiError}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button For Mobile Map View */}
        <div className="absolute bottom-15 right-5 md:hidden z-20 flex flex-col gap-3">
          <Button 
            className="w-14 h-14 rounded-full shadow-2xl p-0" 
            variant="primary" 
            onClick={() => setIsSidebarCollapsed(false)}
          >
            <Users className="w-6 h-6" />
          </Button>
        </div>
      </main>

      {/* Modal removed - integrated into sidebar */}
    </div>
  );
}
