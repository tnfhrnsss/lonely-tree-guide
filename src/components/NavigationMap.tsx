import React, { useEffect, useRef, useState } from 'react';
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

declare global {
  interface Window {
    naver: any;
  }
}

const NavigationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [naverApiKey, setNaverApiKey] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

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

  // 네이버 맵 스크립트 로드
  const loadNaverMapScript = (clientId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.naver && window.naver.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('네이버 맵 스크립트 로드 실패'));
      document.head.appendChild(script);
    });
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
        if (map.current && isMapLoaded) {
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

  // 기존 마커와 경로 제거
  const clearMapElements = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    
    if (routePolyline) {
      routePolyline.setMap(null);
      setRoutePolyline(null);
    }
  };

  // 지도에 마커와 경로 추가
  const addMarkersAndRoute = async (userLat: number, userLng: number) => {
    if (!map.current || !window.naver) return;

    clearMapElements();

    const newMarkers = [];

    // 사용자 위치 마커
    const userMarker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(userLat, userLng),
      map: map.current,
      title: '현재 위치',
      icon: {
        content: '<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        anchor: new window.naver.maps.Point(6, 6)
      }
    });
    newMarkers.push(userMarker);

    // 나홀로나무 마커
    const treeMarker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(LONELY_TREE.lat, LONELY_TREE.lng),
      map: map.current,
      title: LONELY_TREE.name,
      icon: {
        content: '<div style="background: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        anchor: new window.naver.maps.Point(6, 6)
      }
    });
    newMarkers.push(treeMarker);

    // 정보창
    const infoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div style="padding: 10px; font-size: 12px;">
          <h4 style="margin: 0 0 5px 0; font-weight: bold;">${LONELY_TREE.name}</h4>
          <p style="margin: 0; color: #666;">${LONELY_TREE.address}</p>
        </div>
      `
    });

    window.naver.maps.Event.addListener(treeMarker, 'click', function() {
      if (infoWindow.getMap()) {
        infoWindow.close();
      } else {
        infoWindow.open(map.current, treeMarker);
      }
    });

    setMarkers(newMarkers);

    // 네이버 길찾기 API 호출
    try {
      const response = await fetch(
        `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${userLng},${userLat}&goal=${LONELY_TREE.lng},${LONELY_TREE.lat}&option=trafast`,
        {
          headers: {
            'X-NCP-APIGW-API-KEY-ID': naverApiKey,
            'X-NCP-APIGW-API-KEY': naverApiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error('길찾기 API 오류');
      }

      const data = await response.json();
      
      if (data.route && data.route.trafast && data.route.trafast.length > 0) {
        const route = data.route.trafast[0];
        const path = [];

        // 경로 좌표 변환
        for (let i = 0; i < route.path.length; i += 2) {
          path.push(new window.naver.maps.LatLng(route.path[i + 1], route.path[i]));
        }

        // 경로 폴리라인 그리기
        const polyline = new window.naver.maps.Polyline({
          map: map.current,
          path: path,
          strokeColor: '#10b981',
          strokeOpacity: 0.8,
          strokeWeight: 5
        });

        setRoutePolyline(polyline);

        // 지도 영역 조정
        const bounds = new window.naver.maps.LatLngBounds();
        path.forEach(coord => bounds.extend(coord));
        map.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });

        setIsNavigating(true);
      } else {
        // API 실패 시 직선 경로 그리기
        const straightPath = [
          new window.naver.maps.LatLng(userLat, userLng),
          new window.naver.maps.LatLng(LONELY_TREE.lat, LONELY_TREE.lng)
        ];

        const polyline = new window.naver.maps.Polyline({
          map: map.current,
          path: straightPath,
          strokeColor: '#10b981',
          strokeOpacity: 0.8,
          strokeWeight: 5,
          strokeStyle: [10, 5] // 점선
        });

        setRoutePolyline(polyline);

        const bounds = new window.naver.maps.LatLngBounds();
        straightPath.forEach(coord => bounds.extend(coord));
        map.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });

        setIsNavigating(true);
        setError('상세 경로를 찾을 수 없어 직선 경로를 표시합니다.');
      }
    } catch (error) {
      // 네트워크 오류 시 직선 경로 그리기
      const straightPath = [
        new window.naver.maps.LatLng(userLat, userLng),
        new window.naver.maps.LatLng(LONELY_TREE.lat, LONELY_TREE.lng)
      ];

      const polyline = new window.naver.maps.Polyline({
        map: map.current,
        path: straightPath,
        strokeColor: '#10b981',
        strokeOpacity: 0.8,
        strokeWeight: 5,
        strokeStyle: [10, 5] // 점선
      });

      setRoutePolyline(polyline);

      const bounds = new window.naver.maps.LatLngBounds();
      straightPath.forEach(coord => bounds.extend(coord));
      map.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });

      setIsNavigating(true);
      setError('상세 경로를 찾을 수 없어 직선 경로를 표시합니다.');
    }
  };

  // 지도 초기화
  const initializeMap = async () => {
    if (!mapContainer.current || !naverApiKey) return;

    try {
      await loadNaverMapScript(naverApiKey);
      
      map.current = new window.naver.maps.Map(mapContainer.current, {
        center: new window.naver.maps.LatLng(LONELY_TREE.lat, LONELY_TREE.lng),
        zoom: 15,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.naver.maps.MapTypeControlStyle.BUTTON,
          position: window.naver.maps.Position.TOP_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
          style: window.naver.maps.ZoomControlStyle.SMALL,
          position: window.naver.maps.Position.TOP_RIGHT
        }
      });

      setIsMapLoaded(true);
      setError('');
    } catch (error) {
      setError('네이버 맵을 로드할 수 없습니다. API 키를 확인해주세요.');
    }
  };

  const handleApiKeySubmit = () => {
    if (!naverApiKey.trim()) {
      setError('네이버 클라우드 플랫폼 Client ID를 입력해주세요.');
      return;
    }
    initializeMap();
  };

  useEffect(() => {
    return () => {
      clearMapElements();
      if (map.current) {
        map.current.destroy();
      }
    };
  }, []);

  if (!isMapLoaded) {
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
              <Label htmlFor="apikey">네이버 클라우드 플랫폼 Client ID</Label>
              <Input
                id="apikey"
                type="text"
                placeholder="Client ID를 입력하세요"
                value={naverApiKey}
                onChange={(e) => setNaverApiKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                <a 
                  href="https://console.ncloud.com/naver-service/application" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  네이버 클라우드 플랫폼
                </a>
                에서 Maps API를 활성화하고 Client ID를 발급받으세요
              </p>
            </div>
            {error && (
              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleApiKeySubmit} className="w-full">
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