'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  center: { lat: number; lng: number };
  level?: number;
  markers?: Array<{ lat: number; lng: number; title?: string }>;
  midpoint?: { lat: number; lng: number } | null;
  className?: string;
}

export default function KakaoMap({ center, level = 3, markers = [], midpoint = null, className = "" }: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const isInitializing = useRef(false);

  // Initialize Map ONCE
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (map || isInitializing.current) return;

    isInitializing.current = true;

    const initMap = () => {
      window.kakao.maps.load(() => {
        if (!mapContainer.current) return;
        const options = {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: level,
        };
        const newMap = new window.kakao.maps.Map(mapContainer.current, options);
        setMap(newMap);
      });
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps && !map) {
          clearInterval(checkKakao);
          initMap();
        }
      }, 100);
      return () => {
        clearInterval(checkKakao);
        isInitializing.current = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center
  useEffect(() => {
    if (!map || !window.kakao) return;
    const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
    map.setCenter(newCenter);
  }, [center.lat, center.lng, map]);

  // Update markers
  useEffect(() => {
    if (!map || !window.kakao) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    let hasMarkers = false;

    markers.forEach((markerPos) => {
      const position = new window.kakao.maps.LatLng(markerPos.lat, markerPos.lng);
      const marker = new window.kakao.maps.Marker({
        position: position,
        title: markerPos.title,
      });
      marker.setMap(map);
      bounds.extend(position);
      hasMarkers = true;
    });

    if (midpoint) {
      const position = new window.kakao.maps.LatLng(midpoint.lat, midpoint.lng);
      
      const width = 34;
      const height = 50; 
      const imageSize = new window.kakao.maps.Size(width, height);
      const markerImage = new window.kakao.maps.MarkerImage(
        '/midpoint-marker.png', 
        imageSize,
        { offset: new window.kakao.maps.Point(width / 2, height) }
      );

      const marker = new window.kakao.maps.Marker({
        position: position,
        title: '중간 지점',
        image: markerImage
      });
      marker.setMap(map);
      bounds.extend(position);
      hasMarkers = true;

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
          만날각 발견! 📍
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 1.5
      });
      overlay.setMap(map);
    }

    if (hasMarkers && markers.length > 1) {
      map.setBounds(bounds);
    }
  }, [map, markers, midpoint]);

  return (
    <div 
      ref={mapContainer} 
      className={`w-full h-full min-h-[300px] ${className}`}
    />
  );
}
