'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Participant, Recommendation, DbParticipant, PresenceState } from '../types';
import { useRoomStore } from '@/store/useRoomStore';

export const useRoomLogic = (roomId: string) => {
  const {
    participants,
    setParticipants,
    onlineParticipants,
    setOnlineParticipants,
    roomTitle,
    setRoomTitle,
    myParticipantId,
    setMyParticipantId,
    nearestStation,
    setNearestStation,
    recommendations,
    setRecommendations,
    aiRecommendations,
    setAiRecommendations,
    recoCategory,
    setRecoCategory,
    selectedRecoId,
    setSelectedRecoId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isAdding,
    setIsAdding,
  } = useRoomStore();

  const [isLoading, setIsLoading] = useState(true);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [lastConfirmedLocation, setLastConfirmedLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);

  // 1. 초기 데이터 페치 및 실시간 구독
  useEffect(() => {
    if (!roomId) return;

    const savedId = localStorage.getItem(`manalgak-participant-${roomId}`);
    if (savedId) setMyParticipantId(savedId);

    const fetchData = async () => {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (roomData) setRoomTitle(roomData.title || '모임');

      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomId);
      
      if (data) {
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
          setParticipants([...participants, {
            id: newP.id,
            name: newP.name,
            location: newP.location,
            coords: { lat: newP.lat, lng: newP.lng }
          }]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedP = payload.new;
          setParticipants(participants.map(p => p.id === updatedP.id ? {
            id: updatedP.id,
            name: updatedP.name,
            location: updatedP.location,
            coords: { lat: updatedP.lat, lng: updatedP.lng }
          } : p));
        } else if (payload.eventType === 'DELETE') {
          setParticipants(participants.filter(p => p.id !== payload.old.id));
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
  }, [roomId, setParticipants, setOnlineParticipants, setRoomTitle, setMyParticipantId, participants]);

  // Midpoint calculation
  const rawMidpoint = useMemo(() => {
    if (participants.length < 2) return null;
    let x = 0; let y = 0; let z = 0;
    participants.forEach((p) => {
      const lat = (p.coords.lat * Math.PI) / 180;
      const lng = (p.coords.lng * Math.PI) / 180;
      x += Math.cos(lat) * Math.cos(lng);
      y += Math.cos(lat) * Math.sin(lng);
      z += Math.sin(lat);
    });
    const total = participants.length;
    x /= total; y /= total; z /= total;
    const centralLng = Math.atan2(y, x);
    const centralHyp = Math.sqrt(x * x + y * y);
    const centralLat = Math.atan2(z, centralHyp);
    return { lat: (centralLat * 180) / Math.PI, lng: (centralLng * 180) / Math.PI };
  }, [participants]);

  const finalMidpoint = nearestStation || rawMidpoint;

  // Sidebar auto-collapse
  useEffect(() => {
    if (finalMidpoint && !hasAutoCollapsed && !isSidebarCollapsed && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsSidebarCollapsed(true);
      setHasAutoCollapsed(true);
    }
  }, [finalMidpoint, hasAutoCollapsed, isSidebarCollapsed, setIsSidebarCollapsed]);

  // Kakao Station Search
  useEffect(() => {
    if (!rawMidpoint || !window.kakao?.maps) return;
    window.kakao.maps.load(() => {
      if (!window.kakao.maps.services) return;
      const ps = new window.kakao.maps.services.Places();
      const options = {
        location: new window.kakao.maps.LatLng(rawMidpoint.lat, rawMidpoint.lng),
        radius: 5000,
        sort: window.kakao.maps.services.SortBy.DISTANCE
      };
      ps.categorySearch('SW8', (data, status) => {
        if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
          const station = data[0];
          const cleanName = station.place_name.replace(/\s*역(\([^)]*\))?$/, '');
          if (nearestStation?.name !== cleanName) {
            setNearestStation({ name: cleanName, lat: parseFloat(station.y), lng: parseFloat(station.x) });
          }
        }
      }, options);
    });
  }, [rawMidpoint, nearestStation, setNearestStation]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim() || !newCoords || !roomId) return;
    setIsSubmitting(true);
    try {
      if (editingParticipant) {
        await supabase.from('participants').update({ name: newName, location: newLocation, lat: newCoords.lat, lng: newCoords.lng }).eq('id', editingParticipant.id);
      } else {
        const { data } = await supabase.from('participants').insert([{ room_id: roomId, name: newName, location: newLocation, lat: newCoords.lat, lng: newCoords.lng }]).select().single();
        if (data) {
          localStorage.setItem(`manalgak-participant-${roomId}`, data.id);
          setMyParticipantId(data.id);
        }
      }
      setNewName(''); setNewLocation(''); setNewCoords(null); setLastConfirmedLocation(''); setEditingParticipant(null); setIsAdding(false);
    } catch (error) { alert('저장 중 오류가 발생했습니다.'); } finally { setIsSubmitting(false); }
  };

  const removeParticipant = async (id: string) => {
    try {
      await supabase.from('participants').delete().eq('id', id);
    } catch (error) { alert('삭제 중 오류가 발생했습니다.'); }
  };

  const searchAddress = () => {
    if (!newLocation.trim() || !window.kakao?.maps?.services) return;
    setIsSearching(true);
    const geocoder = new window.kakao.maps.services.Geocoder();
    const ps = new window.kakao.maps.services.Places();
    geocoder.addressSearch(newLocation, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const loc = result[0].road_address?.address_name || result[0].address_name;
        setNewCoords({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
        setNewLocation(loc); setLastConfirmedLocation(loc); setIsSearching(false);
      } else {
        ps.keywordSearch(newLocation, (data, psStatus) => {
          if (psStatus === window.kakao.maps.services.Status.OK) {
            const loc = data[0].place_name + " (" + (data[0].road_address_name || data[0].address_name) + ")";
            setNewCoords({ lat: parseFloat(data[0].y), lng: parseFloat(data[0].x) });
            setNewLocation(loc); setLastConfirmedLocation(loc);
          }
          setIsSearching(false);
        });
      }
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsSearching(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setNewCoords({ lat: latitude, lng: longitude });
      setNewLocation('현재 위치'); setLastConfirmedLocation('현재 위치'); setIsSearching(false);
    });
  };

  const handleAiRecommend = async (query: string) => {
    if (!query.trim() || !rawMidpoint) return;
    setIsAiLoading(true); setAiError(null);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });
      const data = await res.json();
      if (data.error) {
        setAiError(data.error);
        setIsAiLoading(false);
        return;
      }
      if (data.keywords) {
        setRecoCategory('AI');
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(data.keywords, (places, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setAiRecommendations(places.slice(0, 10).map(item => ({
              id: item.id, name: item.place_name, title: item.place_name, category: item.category_group_name,
              address: item.road_address_name || item.address_name, lat: parseFloat(item.y), lng: parseFloat(item.x),
              url: item.place_url, distance: item.distance
            })));
          }
          setIsAiLoading(false);
        }, { location: new window.kakao.maps.LatLng(rawMidpoint.lat, rawMidpoint.lng), radius: 2000 });
      } else {
        setIsAiLoading(false);
      }
    } catch { setAiError("오류가 발생했습니다."); setIsAiLoading(false); }
  };

  return {
    isLoading, editingParticipant, setEditingParticipant,
    aiQuery, setAiQuery, isAiLoading, aiError,
    newName, setNewName, newLocation, setNewLocation, newCoords,
    isSearching, isCopied, isSubmitting,
    showRecommendations, setShowRecommendations,
    rawMidpoint, finalMidpoint,
    handleShare, handleModalSubmit, removeParticipant,
    searchAddress, getCurrentLocation, handleAiRecommend
  };
};
