import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation, AlertTriangle, Compass, Navigation2, Globe } from 'lucide-react';
import { translations, languageNames, type Language } from '@/lib/translations';

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
  const [language, setLanguage] = useState<Language>('ko');

  const t = translations[language];

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
    const directions = [
      t.directions.north,
      t.directions.northeast,
      t.directions.east,
      t.directions.southeast,
      t.directions.south,
      t.directions.southwest,
      t.directions.west,
      t.directions.northwest
    ];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  // 상세 방향 안내
  const getDetailedDirection = (bearing: number): string => {
    if (bearing >= 337.5 || bearing < 22.5) return t.detailedDirections.north;
    if (bearing >= 22.5 && bearing < 67.5) return t.detailedDirections.northeast;
    if (bearing >= 67.5 && bearing < 112.5) return t.detailedDirections.east;
    if (bearing >= 112.5 && bearing < 157.5) return t.detailedDirections.southeast;
    if (bearing >= 157.5 && bearing < 202.5) return t.detailedDirections.south;
    if (bearing >= 202.5 && bearing < 247.5) return t.detailedDirections.southwest;
    if (bearing >= 247.5 && bearing < 292.5) return t.detailedDirections.west;
    if (bearing >= 292.5 && bearing < 337.5) return t.detailedDirections.northwest;
    return t.detailedDirections.straight;
  };

  // 사용자 위치 가져오기 (iOS Safari 호환성 개선)
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError(t.errors.geolocationNotSupported);
      return;
    }

    setIsLocationLoading(true);
    setError('');

    // iOS Safari에서는 사용자 제스처로 트리거되어야 하며, 
    // HTTPS 환경에서만 제대로 작동합니다
    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // iOS에서 더 긴 시간 허용
      maximumAge: 30000 // 캐시 시간 단축
    };

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

        console.log('위치 업데이트:', { 
          lat: userLat.toFixed(6), 
          lng: userLng.toFixed(6), 
          distance: dist.toFixed(3) + 'km' 
        });

        if (dist > 3) {
          setError(t.errors.tooFarAway.replace('{distance}', dist.toFixed(1)));
          setIsNavigating(false);
          return;
        }

        setIsNavigating(true);
      },
      (error) => {
        setIsLocationLoading(false);
        console.error('위치 정보 오류:', error);
        
        // iOS Safari 특별 처리
        if (error.code === error.PERMISSION_DENIED) {
          setError(t.errors.locationPermissionDenied + ' (iOS에서는 설정 > 개인정보 보호 > 위치 서비스에서 Safari 허용 필요)');
        } else {
          setError(t.errors.locationPermissionDenied);
        }
      },
      options
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                {t.appTitle}
              </h1>
              <p className="text-muted-foreground mt-1">{t.appDescription}</p>
            </div>
            
            {/* 언어 선택기 */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageNames).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  {t.destination}
                </h3>
                <p className="text-sm text-muted-foreground">{LONELY_TREE.address}</p>
                {distance !== null && (
                  <p className="text-sm text-primary font-medium mt-1">
                    {t.currentDistance}: {distance.toFixed(1)}km
                  </p>
                )}
                {userLocation && (
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <p className="font-medium">{t.currentLocation}:</p>
                    <p>{t.latitude}: {userLocation.lat.toFixed(6)}</p>
                    <p>{t.longitude}: {userLocation.lng.toFixed(6)}</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={getUserLocation}
                disabled={isLocationLoading}
                className="flex items-center gap-2"
                variant={isNavigating ? "secondary" : "default"}
              >
                <Navigation className="h-4 w-4" />
                {isLocationLoading ? t.locationChecking : isNavigating ? t.refreshLocation : t.startNavigation}
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
                {t.directionGuide}
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
                   약 {distance < 1 ? Math.round(distance * 1000) + 'm' : distance.toFixed(1) + 'km'} {t.distanceRemaining}
                 </p>
                 <p className="text-sm text-muted-foreground">
                   {t.walkingTime} {Math.ceil(distance * 12)}{t.walkingTimeUnit}
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
                 <span className="font-medium">{t.arrived}</span>
               </div>
               <p className="text-sm text-muted-foreground mt-1">
                 {t.arrivedMessage}
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
                 {t.howToUse}
               </CardTitle>
             </CardHeader>
             <CardContent>
               <ul className="space-y-2 text-sm text-muted-foreground">
                 {t.howToUseItems.map((item, index) => (
                   <li key={index}>• {item}</li>
                 ))}
               </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SimpleNavigation;