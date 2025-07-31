import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';

// 나홀로나무 위치
const LONELY_TREE = {
  lat: 37.522710,
  lng: 127.120301,
  name: "올림픽공원 나홀로나무",
  address: "서울특별시 송파구 올림픽로 424"
};

const NavigationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isTokenSet, setIsTokenSet] = useState(false);

  // 두 지점 간 거리 계산 (km)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 사용자 위치 가져오기
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const dist = calculateDistance(userLat, userLng, LONELY_TREE.lat, LONELY_TREE.lng);
        
        setUserLocation({ lat: userLat, lng: userLng });
        setDistance(dist);

        if (dist > 3) {
          setError(`나홀로나무로부터 ${dist.toFixed(1)}km 떨어져 있습니다. 3km 이내에서만 내비게이션을 이용할 수 있습니다.`);
          return;
        }

        setError('');
        if (map.current && isTokenSet) {
          addMarkersAndRoute(userLat, userLng);
        }
      },
      (error) => {
        setError('위치 정보를 가져올 수 없습니다. 위치 서비스를 허용해 주세요.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // 지도에 마커와 경로 추가
  const addMarkersAndRoute = async (userLat: number, userLng: number) => {
    if (!map.current) return;

    // 기존 마커와 경로 제거
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // 사용자 위치 마커
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([userLng, userLat])
      .setPopup(new mapboxgl.Popup().setHTML('<div>현재 위치</div>'))
      .addTo(map.current);

    // 나홀로나무 마커
    new mapboxgl.Marker({ color: '#10b981' })
      .setLngLat([LONELY_TREE.lng, LONELY_TREE.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div>
          <h3>${LONELY_TREE.name}</h3>
          <p>${LONELY_TREE.address}</p>
        </div>
      `))
      .addTo(map.current);

    // 경로 찾기
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${userLng},${userLat};${LONELY_TREE.lng},${LONELY_TREE.lat}?steps=true&geometries=geojson&access_token=${mapboxToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // 경로 라인 추가
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }

        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#10b981',
            'line-width': 4
          }
        });

        // 지도 영역 조정
        const coordinates = route.geometry.coordinates;
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 50 });

        setIsNavigating(true);
      }
    } catch (error) {
      setError('경로를 찾을 수 없습니다.');
    }
  };

  // 지도 초기화
  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [LONELY_TREE.lng, LONELY_TREE.lat],
      zoom: 15
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    setIsTokenSet(true);
  };

  const handleTokenSubmit = () => {
    if (!mapboxToken.trim()) {
      setError('Mapbox 토큰을 입력해주세요.');
      return;
    }
    initializeMap();
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!isTokenSet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              나홀로나무 찾기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="token">Mapbox Access Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="pk.ey..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
                에서 무료 토큰을 받으세요
              </p>
            </div>
            <Button onClick={handleTokenSubmit} className="w-full">
              지도 시작하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="bg-card border-b p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            나홀로나무 내비게이션
          </h1>
          <p className="text-muted-foreground mt-1">올림픽공원의 나홀로나무까지 안내해드립니다</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* 컨트롤 패널 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">목적지: {LONELY_TREE.name}</h3>
                <p className="text-sm text-muted-foreground">{LONELY_TREE.address}</p>
                {distance !== null && (
                  <p className="text-sm text-primary font-medium mt-1">
                    현재 거리: {distance.toFixed(1)}km
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={getUserLocation}
                  className="flex items-center gap-2"
                  variant={isNavigating ? "secondary" : "default"}
                >
                  <Navigation className="h-4 w-4" />
                  {isNavigating ? "경로 새로고침" : "내비게이션 시작"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-4 border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 지도 */}
        <Card>
          <CardContent className="p-0">
            <div 
              ref={mapContainer} 
              className="w-full h-[60vh] rounded-lg"
              style={{ minHeight: '400px' }}
            />
          </CardContent>
        </Card>

        {/* 안내 */}
        {isNavigating && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Navigation className="h-4 w-4" />
                <span>녹색 선을 따라 나홀로나무까지 이동하세요. 도보로 약 {distance ? Math.ceil(distance * 12) : '?'}분 소요됩니다.</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NavigationMap;