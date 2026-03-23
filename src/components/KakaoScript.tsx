'use client';

import Script from 'next/script';

export default function KakaoScript() {
  return (
    <>
      <Script 
        id="kakao-maps-sdk"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_CLIENT_ID || '39a9067c8e8b75d5dea24eefaf9ec282'}&libraries=services,clusterer&autoload=false`} 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[KakaoScript] Kakao Maps script loaded successfully');
        }}
        onError={(e) => {
          console.error('[KakaoScript] Kakao Maps script failed to load. Check your API key and domain settings:', e);
        }}
      />
      <Script
        id="kakao-sdk"
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_MAPS_CLIENT_ID || '39a9067c8e8b75d5dea24eefaf9ec282');
            console.log('[KakaoScript] Kakao SDK initialized');
          }
        }}
      />
    </>
  );
}
