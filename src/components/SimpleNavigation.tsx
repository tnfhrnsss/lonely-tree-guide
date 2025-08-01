import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, AlertTriangle, Compass, Navigation2 } from 'lucide-react';

// 나홀로나무 위치
const LONELY_TREE = {
  lat: 37.522710,
  lng: 127.120301,
  name: "올림픽공원 나홀로나무",
  address: "서울특별시 송파구 올림픽로 424"
};

interface UserLocation {
  lat: number;
  lng: number;
}

const SimpleNavigation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

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

  // 방향각 계산 (북쪽 기준 시계방향 각도)
  const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  // 방향각을 방위로 변환
  const getDirectionText = (bearing: number): string => {
    const directions = ['북쪽', '북동쪽', '동쪽', '남동쪽', '남쪽', '남서쪽', '서쪽', '북서쪽'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  // 상세 방향 안내
  const getDetailedDirection = (bearing: number): string => {
    if (bearing >= 337.5 || bearing < 22.5) return "정북쪽으로 직진";
    if (bearing >= 22.5 && bearing < 67.5) return "북동쪽으로 이동";
    if (bearing >= 67.5 && bearing < 112.5) return "정동쪽으로 이동";
    if (bearing >= 112.5 && bearing < 157.5) return "남동쪽으로 이동";
    if (bearing >= 157.5 && bearing < 202.5) return "정남쪽으로 이동";
    if (bearing >= 202.5 && bearing < 247.5) return "남서쪽으로 이동";
    if (bearing >= 247.5 && bearing < 292.5) return "정서쪽으로 이동";
    if (bearing >= 292.5 && bearing < 337.5) return "북서쪽으로 이동";
    return "직진";
  };

  // 사용자 위치 가져오기
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setIsLocationLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const dist = calculateDistance(userLat, userLng, LONELY_TREE.lat, LONELY_TREE.lng);
        const bear = calculateBearing(userLat, userLng, LONELY_TREE.lat, LONELY_TREE.lng);
        
        setUserLocation({ lat: userLat, lng: userLng });
        setDistance(dist);
        setBearing(bear);
        setIsLocationLoading(false);

        if (dist > 3) {
          setError(`나홀로나무로부터 ${dist.toFixed(1)}km 떨어져 있습니다. 3km 이내에서만 정확한 안내를 제공합니다.`);
          setIsNavigating(false);
          return;
        }

        setIsNavigating(true);
      },
      (error) => {
        setIsLocationLoading(false);
        setError('위치 정보를 가져올 수 없습니다. 위치 서비스를 허용해 주세요.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // 주기적으로 위치 업데이트
  useEffect(() => {
    if (isNavigating) {
      const interval = setInterval(() => {
        getUserLocation();
      }, 10000); // 10초마다 위치 업데이트

      return () => clearInterval(interval);
    }
  }, [isNavigating]);

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

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* 목적지 정보 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {LONELY_TREE.name}
                </h3>
                <p className="text-sm text-muted-foreground">{LONELY_TREE.address}</p>
                {distance !== null && (
                  <p className="text-sm text-primary font-medium mt-1">
                    현재 거리: {distance.toFixed(1)}km
                  </p>
                )}
              </div>
              
              <Button 
                onClick={getUserLocation}
                disabled={isLocationLoading}
                className="flex items-center gap-2"
                variant={isNavigating ? "secondary" : "default"}
              >
                <Navigation className="h-4 w-4" />
                {isLocationLoading ? "위치 확인 중..." : isNavigating ? "경로 새로고침" : "내비게이션 시작"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 방향 안내 */}
        {isNavigating && bearing !== null && distance !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                방향 안내
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 나침반 */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-4 border-muted bg-card flex items-center justify-center">
                    <div 
                      className="absolute w-1 h-12 bg-primary rounded-full origin-bottom transform transition-transform duration-500"
                      style={{ 
                        transform: `rotate(${bearing}deg) translateY(-50%)`,
                        transformOrigin: 'center bottom'
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-primary"></div>
                    </div>
                    <div className="text-xs font-bold text-center">
                      <div>{Math.round(bearing)}°</div>
                      <div className="text-muted-foreground text-xs">{getDirectionText(bearing)}</div>
                    </div>
                  </div>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">N</div>
                  <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-xs font-bold">E</div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">S</div>
                  <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 text-xs font-bold">W</div>
                </div>
              </div>

              {/* 방향 텍스트 */}
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">{getDetailedDirection(bearing)}</p>
                <p className="text-sm text-muted-foreground">
                  약 {distance < 1 ? Math.round(distance * 1000) + 'm' : distance.toFixed(1) + 'km'} 남음
                </p>
                <p className="text-sm text-muted-foreground">
                  도보 시간: 약 {Math.ceil(distance * 12)}분
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 도착 안내 */}
        {distance !== null && distance < 0.05 && (
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary">
                <Navigation2 className="h-5 w-5" />
                <span className="font-medium">목적지에 도착했습니다! 🌳</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                나홀로나무를 찾아 멋진 사진을 남겨보세요!
              </p>
            </CardContent>
          </Card>
        )}

        {/* 사용법 안내 */}
        {!isNavigating && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                사용법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• "내비게이션 시작" 버튼을 눌러 현재 위치를 확인하세요</li>
                <li>• 나침반을 보고 화살표 방향으로 이동하세요</li>
                <li>• 3km 이내에서 정확한 방향 안내를 제공합니다</li>
                <li>• 위치는 10초마다 자동으로 업데이트됩니다</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SimpleNavigation;