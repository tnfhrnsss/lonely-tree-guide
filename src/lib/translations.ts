export type Language = 'ko' | 'en' | 'zh' | 'ja';

export interface Translations {
  appTitle: string;
  appDescription: string;
  destination: string;
  destinationAddress: string;
  currentDistance: string;
  startNavigation: string;
  refreshLocation: string;
  locationChecking: string;
  directionGuide: string;
  detailedDirections: {
    north: string;
    northeast: string;
    east: string;
    southeast: string;
    south: string;
    southwest: string;
    west: string;
    northwest: string;
    straight: string;
  };
  directions: {
    north: string;
    northeast: string;
    east: string;
    southeast: string;
    south: string;
    southwest: string;
    west: string;
    northwest: string;
  };
  distanceRemaining: string;
  walkingTime: string;
  walkingTimeUnit: string;
  arrived: string;
  arrivedMessage: string;
  howToUse: string;
  howToUseItems: string[];
  currentLocation: string;
  latitude: string;
  longitude: string;
  errors: {
    geolocationNotSupported: string;
    locationPermissionDenied: string;
    tooFarAway: string;
  };
}

export const translations: Record<Language, Translations> = {
  ko: {
    appTitle: "나홀로나무 내비게이션",
    appDescription: "올림픽공원의 나홀로나무까지 안내해드립니다",
    destination: "올림픽공원 나홀로나무",
    destinationAddress: "서울특별시 송파구 올림픽로 424",
    currentDistance: "현재 거리",
    startNavigation: "내비게이션 시작",
    refreshLocation: "경로 새로고침",
    locationChecking: "위치 확인 중...",
    directionGuide: "방향 안내",
    detailedDirections: {
      north: "정북쪽으로 직진",
      northeast: "북동쪽으로 이동",
      east: "정동쪽으로 이동",
      southeast: "남동쪽으로 이동",
      south: "정남쪽으로 이동",
      southwest: "남서쪽으로 이동",
      west: "정서쪽으로 이동",
      northwest: "북서쪽으로 이동",
      straight: "직진"
    },
    directions: {
      north: "북쪽",
      northeast: "북동쪽",
      east: "동쪽",
      southeast: "남동쪽",
      south: "남쪽",
      southwest: "남서쪽",
      west: "서쪽",
      northwest: "북서쪽"
    },
    distanceRemaining: "남음",
    walkingTime: "도보 시간: 약",
    walkingTimeUnit: "분",
    arrived: "목적지에 도착했습니다! 🌳",
    arrivedMessage: "나홀로나무를 찾아 멋진 사진을 남겨보세요!",
    howToUse: "사용법",
    howToUseItems: [
      "내비게이션 시작 버튼을 눌러 현재 위치를 확인하세요",
      "나침반을 보고 화살표 방향으로 이동하세요",
      "3km 이내에서 정확한 방향 안내를 제공합니다",
      "위치는 10초마다 자동으로 업데이트됩니다"
    ],
    currentLocation: "현재 위치",
    latitude: "위도",
    longitude: "경도",
    errors: {
      geolocationNotSupported: "이 브라우저는 위치 서비스를 지원하지 않습니다.",
      locationPermissionDenied: "위치 정보를 가져올 수 없습니다. 위치 서비스를 허용해 주세요.",
      tooFarAway: "나홀로나무로부터 {distance}km 떨어져 있습니다. 3km 이내에서만 정확한 안내를 제공합니다."
    }
  },
  en: {
    appTitle: "Lonely Tree Navigation",
    appDescription: "Navigate to the Lonely Tree in Olympic Park",
    destination: "Olympic Park Lonely Tree",
    destinationAddress: "424 Olympic-ro, Songpa-gu, Seoul, South Korea",
    currentDistance: "Current Distance",
    startNavigation: "Start Navigation",
    refreshLocation: "Refresh Location",
    locationChecking: "Checking location...",
    directionGuide: "Direction Guide",
    detailedDirections: {
      north: "Go straight north",
      northeast: "Head northeast",
      east: "Head east",
      southeast: "Head southeast",
      south: "Head south",
      southwest: "Head southwest",
      west: "Head west",
      northwest: "Head northwest",
      straight: "Go straight"
    },
    directions: {
      north: "North",
      northeast: "Northeast",
      east: "East",
      southeast: "Southeast",
      south: "South",
      southwest: "Southwest",
      west: "West",
      northwest: "Northwest"
    },
    distanceRemaining: "remaining",
    walkingTime: "Walking time: about",
    walkingTimeUnit: "min",
    arrived: "You have arrived at your destination! 🌳",
    arrivedMessage: "Find the Lonely Tree and take a beautiful photo!",
    howToUse: "How to Use",
    howToUseItems: [
      "Press Start Navigation to check your current location",
      "Follow the compass arrow direction",
      "Accurate guidance provided within 3km",
      "Location updates automatically every 10 seconds"
    ],
    currentLocation: "Current Location",
    latitude: "Latitude",
    longitude: "Longitude",
    errors: {
      geolocationNotSupported: "This browser does not support geolocation services.",
      locationPermissionDenied: "Unable to get location information. Please allow location services.",
      tooFarAway: "You are {distance}km away from the Lonely Tree. Accurate guidance is only provided within 3km."
    }
  },
  zh: {
    appTitle: "孤独树导航",
    appDescription: "导航至奥林匹克公园的孤独树",
    destination: "奥林匹克公园孤独树",
    destinationAddress: "韩国首尔松坡区奥林匹克路424号",
    currentDistance: "当前距离",
    startNavigation: "开始导航",
    refreshLocation: "刷新位置",
    locationChecking: "正在检查位置...",
    directionGuide: "方向指引",
    detailedDirections: {
      north: "正北方向直行",
      northeast: "朝东北方向",
      east: "朝正东方向",
      southeast: "朝东南方向",
      south: "朝正南方向",
      southwest: "朝西南方向",
      west: "朝正西方向",
      northwest: "朝西北方向",
      straight: "直行"
    },
    directions: {
      north: "北方",
      northeast: "东北",
      east: "东方",
      southeast: "东南",
      south: "南方",
      southwest: "西南",
      west: "西方",
      northwest: "西北"
    },
    distanceRemaining: "剩余",
    walkingTime: "步行时间：约",
    walkingTimeUnit: "分钟",
    arrived: "您已到达目的地！🌳",
    arrivedMessage: "找到孤独树并拍下美丽的照片吧！",
    howToUse: "使用方法",
    howToUseItems: [
      "按开始导航按钮检查当前位置",
      "按照指南针箭头方向前进",
      "3公里内提供准确指引",
      "位置每10秒自动更新"
    ],
    currentLocation: "当前位置",
    latitude: "纬度",
    longitude: "经度",
    errors: {
      geolocationNotSupported: "此浏览器不支持地理位置服务。",
      locationPermissionDenied: "无法获取位置信息。请允许位置服务。",
      tooFarAway: "您距离孤独树{distance}公里。仅在3公里内提供准确指引。"
    }
  },
  ja: {
    appTitle: "一本木ナビゲーション",
    appDescription: "オリンピック公園の一本木まで案内します",
    destination: "オリンピック公園一本木",
    destinationAddress: "韓国ソウル特別市松坡区オリンピック路424",
    currentDistance: "現在の距離",
    startNavigation: "ナビゲーション開始",
    refreshLocation: "位置更新",
    locationChecking: "位置確認中...",
    directionGuide: "方向案内",
    detailedDirections: {
      north: "正北に直進",
      northeast: "北東に向かう",
      east: "正東に向かう",
      southeast: "南東に向かう",
      south: "正南に向かう",
      southwest: "南西に向かう",
      west: "正西に向かう",
      northwest: "北西に向かう",
      straight: "直進"
    },
    directions: {
      north: "北",
      northeast: "北東",
      east: "東",
      southeast: "南東",
      south: "南",
      southwest: "南西",
      west: "西",
      northwest: "北西"
    },
    distanceRemaining: "残り",
    walkingTime: "徒歩時間：約",
    walkingTimeUnit: "分",
    arrived: "目的地に到着しました！🌳",
    arrivedMessage: "一本木を見つけて素敵な写真を撮りましょう！",
    howToUse: "使用方法",
    howToUseItems: [
      "ナビゲーション開始ボタンを押して現在位置を確認してください",
      "コンパスの矢印方向に移動してください",
      "3km以内で正確な方向案内を提供します",
      "位置は10秒ごとに自動更新されます"
    ],
    currentLocation: "現在位置",
    latitude: "緯度",
    longitude: "経度",
    errors: {
      geolocationNotSupported: "このブラウザは位置情報サービスをサポートしていません。",
      locationPermissionDenied: "位置情報を取得できません。位置情報サービスを許可してください。",
      tooFarAway: "一本木から{distance}km離れています。3km以内でのみ正確な案内を提供します。"
    }
  }
};

export const languageNames: Record<Language, string> = {
  ko: "한국어",
  en: "English", 
  zh: "中文",
  ja: "日本語"
};
