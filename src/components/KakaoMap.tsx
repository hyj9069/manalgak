'use client';

import { useEffect, useRef, useState } from 'react';

interface KakaoMapProps {
  center: { lat: number; lng: number };
  level?: number;
  markers?: Array<{ lat: number; lng: number; title?: string }>;
  midpoint?: { lat: number; lng: number } | null;
  recommendations?: Array<{ id: string; lat: number; lng: number; title?: string }>;
  onRecommendationClick?: (id: string) => void;
  onMapClick?: () => void;
  selectedRecommendationId?: string | null;
  className?: string;
}

export default function KakaoMap({ 
  center, 
  level = 3, 
  markers = [], 
  midpoint = null, 
  recommendations = [], 
  onRecommendationClick,
  onMapClick,
  selectedRecommendationId = null,
  className = "" 
}: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const isInitializing = useRef(false);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const recoMarkersRef = useRef<kakao.maps.Marker[]>([]);
  const recoActiveOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  // Initialize Map ONCE
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (map || isInitializing.current) return;

    isInitializing.current = true;

    const initMap = () => {
      const { kakao } = window;
      kakao.maps.load(() => {
        if (!mapContainer.current) {
          return;
        }
        
        try {
          const options = {
            center: new kakao.maps.LatLng(center.lat, center.lng),
            level: level,
          };
          const newMap = new kakao.maps.Map(mapContainer.current, options);
          newMap.setDraggable(true);
          newMap.setZoomable(true);

          kakao.maps.event.addListener(newMap, 'click', () => {
            onMapClick?.();
          });
          
          // Force relayout after a short delay to ensure dimensions are caught
          setTimeout(() => {
            newMap.relayout();
          }, 100);

          setMap(newMap);
        } catch (error) {
          console.error('[KakaoMap] Failed to initialize map:', error);
        }
      });
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      console.log('[KakaoMap] window.kakao not found, polling...');
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          console.log('[KakaoMap] window.kakao found via polling');
          clearInterval(checkKakao);
          initMap();
        }
      }, 200);
      return () => {
        clearInterval(checkKakao);
        isInitializing.current = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, level]);

  // Update center and handle layout shifts
  useEffect(() => {
    if (!map || !window.kakao || !mapContainer.current) return;
    
    // Observer for container size changes
    const observer = new ResizeObserver(() => {
      map.relayout();
      if (center) {
        const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
        map.setCenter(newCenter);
      }
    });

    observer.observe(mapContainer.current);
    return () => observer.disconnect();
  }, [map, center]);

  // Update markers
  useEffect(() => {
    if (!map || !window.kakao) return;
    console.log('[KakaoMap] Updating markers...', { markersCount: markers.length, hasMidpoint: !!midpoint });

    // Clear existing markers and overlays
    markersRef.current.forEach(m => m.setMap(null));
    overlaysRef.current.forEach(o => o.setMap(null));
    recoMarkersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];
    recoMarkersRef.current = [];

    const maps = window.kakao.maps;
    const bounds = new maps.LatLngBounds();

    // Participant markers
    markers.forEach((markerPos) => {
      const position = new maps.LatLng(markerPos.lat, markerPos.lng);
      const marker = new maps.Marker({
        position: position,
        title: markerPos.title,
      });
      marker.setMap(map);
      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Recommendation markers
    recommendations.forEach((reco) => {
      const position = new maps.LatLng(reco.lat, reco.lng);
      
      const marker = new maps.Marker({
        position: position,
        title: reco.title,
      });
      marker.setMap(map);

      maps.event.addListener(marker, 'click', () => {
        onRecommendationClick?.(reco.id);
      });

      recoMarkersRef.current.push(marker);
      bounds.extend(position);
    });

    if (midpoint) {
      const position = new maps.LatLng(midpoint.lat, midpoint.lng);
      
      const width = 34;
      const height = 50; 
      const imageSize = new maps.Size(width, height);
      const markerImage = new maps.MarkerImage(
        '/midpoint-marker.png', 
        imageSize,
        { offset: new maps.Point(width / 2, height) }
      );

      const marker = new maps.Marker({
        position: position,
        title: '중간 지점',
        image: markerImage
      });
      marker.setMap(map);
      markersRef.current.push(marker);
      bounds.extend(position);

      const content = `
        <div class="custom-overlay-premium" style="
          background: rgba(59, 130, 246, 0.95); 
          color: white; 
          border-radius: 40px; 
          padding: 6px 14px;
          border: 1px solid rgba(255,255,255,0.3);
          font-size: 11px; 
          font-weight: 900; 
          letter-spacing: -0.02em;
          box-shadow: 0 9px 6px -6px rgba(59, 130, 246, 0.5);
          backdrop-filter: blur(12px);
          white-space: nowrap;
          transform: translateY(-47px);
          text-align: center;
        ">
          만날각 발견 !
        </div>
      `;

      const overlay = new maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 1.5,
        zIndex: 10
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    }

    const totalPoints = markers.length + recommendations.length + (midpoint ? 1 : 0);
    if (totalPoints > 1) {
      map.setBounds(bounds);
    } else if (totalPoints === 1) {
      const { maps } = window.kakao;
      let targetPos: kakao.maps.LatLng | null = null;
      if (midpoint) targetPos = new maps.LatLng(midpoint.lat, midpoint.lng);
      else if (markers.length === 1) targetPos = new maps.LatLng(markers[0].lat, markers[0].lng);
      else if (recommendations.length === 1) targetPos = new maps.LatLng(recommendations[0].lat, recommendations[0].lng);
      
      if (targetPos) {
        map.setCenter(targetPos);
        if (level) map.setLevel(level);
      }
    }
  }, [map, markers, midpoint, recommendations, onRecommendationClick, level]);

  // Handle zooming to selected recommendation and showing its label
  useEffect(() => {
    if (!map || !window.kakao) return;

    if (recoActiveOverlayRef.current) {
      recoActiveOverlayRef.current.setMap(null);
      recoActiveOverlayRef.current = null;
    }

    if (!selectedRecommendationId) return;

    const reco = recommendations.find(r => r.id === selectedRecommendationId);
    if (reco) {
      const { maps } = window.kakao;
      const moveLatLon = new maps.LatLng(reco.lat, reco.lng);
      
      if (reco.title) {
        const recoContent = `
          <div style="
            background: white; 
            color: #3b82f6; 
            border-radius: 8px; 
            padding: 4px 10px;
            border: 2px solid #3b82f6;
            font-size: 11px; 
            font-weight: 800; 
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transform: translateY(-44px);
            white-space: nowrap;
            z-index: 5;
          ">
            ${reco.title}
          </div>
        `;
        const recoOverlay = new maps.CustomOverlay({
          position: moveLatLon,
          content: recoContent,
          yAnchor: 1,
          zIndex: 5
        });
        recoOverlay.setMap(map);
        recoActiveOverlayRef.current = recoOverlay;
      }

      map.panTo(moveLatLon);
    }
  }, [map, selectedRecommendationId, recommendations]);

  return (
    <div 
      ref={mapContainer} 
      className={`w-full h-full min-h-[300px] ${className}`}
    />
  );
}
