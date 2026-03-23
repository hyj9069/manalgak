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
    }
    interface MapOptions {
      center: LatLng;
      level: number;
    }
    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
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
    }
    namespace services {
      class Places {
        constructor();
        categorySearch(category: string, callback: (data: any[], status: string) => void, options?: any): void;
        keywordSearch(keyword: string, callback: (data: any[], status: string) => void, options?: any): void;
      }
      class Geocoder {
        constructor();
        addressSearch(address: string, callback: (result: any[], status: string) => void): void;
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
