declare global {
  interface Window {
    kakao: any;
    Kakao: any;
  }

  namespace kakao.maps {
    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }
    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      setLevel(level: number): void;
      relayout(): void;
      setBounds(bounds: LatLngBounds): void;
      getCenter(): LatLng;
      getLevel(): number;
      panTo(latlng: LatLng): void;
      setDraggable(draggable: boolean): void;
      setZoomable(zoomable: boolean): void;
    }
    interface MapOptions {
      center: LatLng;
      level: number;
    }
    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
      getPosition(): LatLng;
      getTitle(): string;
    }
    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
      image?: MarkerImage;
    }
    class LatLngBounds {
      constructor();
      extend(latlng: LatLng): void;
    }
    class Size {
      constructor(width: number, height: number);
    }
    class Point {
      constructor(x: number, y: number);
    }
    class MarkerImage {
      constructor(src: string, size: Size, options?: MarkerImageOptions);
    }
    interface MarkerImageOptions {
      offset?: Point;
    }
    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
    }
    interface CustomOverlayOptions {
      position: LatLng;
      content: string | HTMLElement;
      yAnchor?: number;
      zIndex?: number;
    }

    namespace event {
      function addListener(target: any, type: string, callback: (...args: any[]) => void): void;
    }

    namespace services {
      interface KakaoPlace {
        id: string;
        place_name: string;
        category_group_name: string;
        road_address_name: string;
        address_name: string;
        y: string;
        x: string;
        place_url: string;
        distance: string;
      }

      interface KakaoAddress {
        address_name: string;
        y: string;
        x: string;
        address_type: 'REGION' | 'ROAD' | 'REGION_ADDR' | 'ROAD_ADDR';
        road_address: {
          address_name: string;
          region_1depth_name: string;
          region_2depth_name: string;
          region_3depth_name: string;
          road_name: string;
          underground_yn: 'Y' | 'N';
          main_building_no: string;
          sub_building_no: string;
          building_name: string;
          zone_no: string;
        } | null;
        address: {
          address_name: string;
          region_1depth_name: string;
          region_2depth_name: string;
          region_3depth_name: string;
          mountain_yn: 'Y' | 'N';
          main_address_no: string;
          sub_address_no: string;
          zip_code: string;
        };
      }

      class Places {
        constructor();
        categorySearch(category: string, callback: (data: KakaoPlace[], status: Status) => void, options?: any): void;
        keywordSearch(keyword: string, callback: (data: KakaoPlace[], status: Status) => void, options?: any): void;
      }

      class Geocoder {
        constructor();
        addressSearch(address: string, callback: (result: KakaoAddress[], status: Status) => void): void;
        coord2Address(lng: number, lat: number, callback: (result: KakaoAddress[], status: Status) => void): void;
      }

      enum Status {
        OK = 'OK',
        ZERO_RESULT = 'ZERO_RESULT',
        ERROR = 'ERROR'
      }

      enum SortBy {
        DISTANCE = 'DISTANCE',
        ACCURACY = 'ACCURACY'
      }
    }
    function load(callback: () => void): void;
  }
}

export {};
