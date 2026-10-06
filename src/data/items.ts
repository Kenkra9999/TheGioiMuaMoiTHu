export interface LuxuryItem {
  id: string;
  name: string;
  nameEn: string;
  category: 'real-estate' | 'supercars' | 'motorbikes' | 'jewelry-gold' | 'aviation-marine';
  subCategory: string;
  priceUsd: number;
  priceVnd: number;
  image: string;
  badge?: string;
  description: string;
  locationOrOrigin?: string;
  rentalIncomePerSec?: number; // In VND
  specs: Record<string, string>;
  interactiveType: 'car-drive' | 'bike-ride' | 'house-tour' | 'jewelry-inspect' | 'yacht-cruise' | 'jet-flight';
  vehicleConfig?: {
    topSpeed: number; // km/h
    acceleration: number; // 0-100s
    handling: number;
    color: string;
    bodyType: 'supercar' | 'sedan' | 'truck' | 'bike' | 'scooter' | 'hypercar';
    engineSound: 'supercar' | 'wave' | 'scooter' | 'ducati' | 'cybertruck' | 'luxury';
    nitroCapacity?: number;
  };
  houseConfig?: {
    style: 'modern-villa' | 'penthouse' | 'classic-manor' | 'asian-heritage' | 'island-resort';
    skybox: 'sunset' | 'night-neon' | 'sunny';
    hasPool: boolean;
    hasBalcony: boolean;
    floors: number;
    garageSpots: number;
  };
  jewelryConfig?: {
    type: 'watch' | 'gold-bar' | 'diamond-ring' | 'necklace' | 'crown';
    material: 'gold' | 'rose-gold' | 'platinum' | 'diamond' | 'emerald';
    sparkleIntensity: number;
    hasMovingParts: boolean;
  };
}

export const EXCHANGE_RATE_USD_VND = 25400;

export const LUXURY_ITEMS: LuxuryItem[] = [
  // ==================== BẤT ĐỘNG SẢN (REAL ESTATE) ====================
  {
    id: 're-landmark81',
    name: 'Landmark 81 Sky Villa - Tầng Thượng 81',
    nameEn: 'Landmark 81 Sky Villa Penthouse',
    category: 'real-estate',
    subCategory: 'Sky Villa / Penthouse',
    priceUsd: 12500000,
    priceVnd: 317500000000,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    badge: '👑 Biểu Tượng TP.HCM',
    description: 'Căn Sky Villa siêu sang nằm tại đỉnh tháp Landmark 81, tầm nhìn 360 độ ôm trọn sông Sài Gòn và thành phố. Nội thất Versace & B&B Italia xa hoa.',
    locationOrOrigin: 'Bình Thạnh, TP. Hồ Chí Minh',
    rentalIncomePerSec: 150000, // 150k VND / sec = 540M / hour
    specs: {
      'Diện Tích': '680 m²',
      'Phòng Ngủ': '5 Phòng VIP Master',
      'Tầm Nhìn': '360° Toàn Cảnh Sài Gòn',
      'Hồ Bơi': 'Hồ bơi vô cực trên không',
      'Bãi Đỗ Xe': '3 Slot Siêu Xe Riêng',
      'Dịch Vụ': 'Quản gia 24/7 & Sân đỗ trực thăng'
    },
    interactiveType: 'house-tour',
    houseConfig: {
      style: 'penthouse',
      skybox: 'night-neon',
      hasPool: true,
      hasBalcony: true,
      floors: 2,
      garageSpots: 3
    }
  },
  {
    id: 're-thaodien-villa',
    name: 'Dinh Thự Thảo Điền Riverfront Mansion',
    nameEn: 'Thao Dien Riverside Luxury Villa',
    category: 'real-estate',
    subCategory: 'Biệt Thự Độc Bản',
    priceUsd: 8500000,
    priceVnd: 215900000000,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    badge: '💎 Đẳng Cấp Thượng Lưu',
    description: 'Dinh thự ven sông Thảo Điền phong cách nghỉ dưỡng nhiệt đới với bến du thuyền cá nhân, vườn phong lan và hồ bơi tràn bờ view hoàng hôn.',
    locationOrOrigin: 'Thảo Điền, TP. Thủ Đức, TP.HCM',
    rentalIncomePerSec: 100000,
    specs: {
      'Diện Tích': '1,200 m²',
      'Mặt Tiền Sông': '35m Ven Sông Sài Gòn',
      'Phòng Ngủ': '6 Phòng Ngủ En-suite',
      'Bến Du Thuyền': 'Có bến cập du thuyền riêng',
      'Hầm Rượu': 'Hầm chứa 3,000 chai vang Pháp'
    },
    interactiveType: 'house-tour',
    houseConfig: {
      style: 'modern-villa',
      skybox: 'sunset',
      hasPool: true,
      hasBalcony: true,
      floors: 3,
      garageSpots: 6
    }
  },
  {
    id: 're-vinhomes-riverside',
    name: 'Dinh Thự Vinhomes Riverside Hoa Phượng',
    nameEn: 'Vinhomes Riverside Royal Manor',
    category: 'real-estate',
    subCategory: 'Dinh Thự Hoàng Gia',
    priceUsd: 6800000,
    priceVnd: 172720000000,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    badge: '🏰 Lâu Đài Hà Nội',
    description: 'Dinh thự tân cổ điển kiểu Pháp bao quanh bởi kênh đào xanh biếc tại Vinhomes Riverside Long Biên. Cổng đúc đồng nguyên khối dát vàng.',
    locationOrOrigin: 'Long Biên, Hà Nội',
    rentalIncomePerSec: 80000,
    specs: {
      'Diện Tích': '950 m²',
      'Kiến Trúc': 'Tân Cổ Điển Pháp',
      'Kênh Đào': 'Sân vườn tiếp giáp sông nhân tạo',
      'Phòng Tiệc': 'Phòng khánh tiết đón 40 khách',
      'An Ninh': 'Bảo vệ đa lớp 24/7'
    },
    interactiveType: 'house-tour',
    houseConfig: {
      style: 'classic-manor',
      skybox: 'sunny',
      hasPool: true,
      hasBalcony: true,
      floors: 4,
      garageSpots: 4
    }
  },
  {
    id: 're-beverly-hills',
    name: 'Biệt Thự Beverly Hills Billionaire Modern',
    nameEn: 'Beverly Hills Ultra-Luxury Mansion',
    category: 'real-estate',
    subCategory: 'Siêu Biệt Thự Mỹ',
    priceUsd: 38000000,
    priceVnd: 965200000000,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    badge: '🌟 Hollywood Elite',
    description: 'Siêu dinh thự đắt giá trên đồi Beverly Hills với rạp chiếu phim IMAX tư nhân, spa khoáng nóng, hầm ngắm xe hơi xoay tròn 360 độ.',
    locationOrOrigin: 'Beverly Hills, California, USA',
    rentalIncomePerSec: 450000,
    specs: {
      'Diện Tích': '2,500 m²',
      'Phòng Ngủ': '8 Phòng Master Suite',
      'Rạp Phim': 'IMAX Private Cinema 20 ghế',
      'Gara 3D': 'Hầm đỗ 12 siêu xe kính trong suốt',
      'Tầm Nhìn': 'Toàn cảnh Los Angeles & Thái Bình Dương'
    },
    interactiveType: 'house-tour',
    houseConfig: {
      style: 'modern-villa',
      skybox: 'sunset',
      hasPool: true,
      hasBalcony: true,
      floors: 3,
      garageSpots: 12
    }
  },
  {
    id: 're-manhattan-penthouse',
    name: 'Penthouse Manhattan Central Park Tower',
    nameEn: 'Manhattan Billionaires Row Penthouse',
    category: 'real-estate',
    subCategory: 'Siêu Penthouse New York',
    priceUsd: 65000000,
    priceVnd: 1651000000000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    badge: '🗽 Đỉnh Cao Nước Mỹ',
    description: 'Căn Penthouse cao nhất thế giới nằm trên con phố Tỷ Phú (Billionaires’ Row), view trọn vẹn công viên Central Park và đường chân trời New York.',
    locationOrOrigin: 'Manhattan, New York, USA',
    rentalIncomePerSec: 800000,
    specs: {
      'Diện Tích': '1,100 m²',
      'Độ Cao': 'Tầng 120 (430m trên mây)',
      'Thang Máy': 'Thang máy riêng siêu tốc 10m/s',
      'Nội Thất': 'Đá cẩm thạch Calacatta & Gỗ Óc Chó',
      'Dịch Vụ': 'Đầu bếp Michelin riêng'
    },
    interactiveType: 'house-tour',
    houseConfig: {
      style: 'penthouse',
      skybox: 'sunset',
      hasPool: true,
      hasBalcony: true,
      floors: 3,
      garageSpots: 2
    }
  },
  {
    id: 're-dalat-pine',
    name: 'Biệt Thự Đồi Thông Sương Mù Đà Lạt',
    nameEn: 'Dalat Pine Hill Sunset Villa',
    category: 'real-estate',
    subCategory: 'Biệt Thự Nghỉ Dưỡng',
    priceUsd: 2900000,
    priceVnd: 73660000000,
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    badge: '🌲 Thiên Đường Săn Mây',
    description: 'Dinh thự gỗ phong cách Bắc Âu nằm trên đỉnh đồi thông biệt lập, lò sưởi củi ấm áp, sân golf mini và không gian thưởng trà ngắm hoàng hôn.',
    locationOrOrigin: 'Phường 3, TP. Đà Lạt, Lâm Đồng',
    rentalIncomePerSec: 35000,
    specs: {
      'Diện Tích': '1,500 m²',
      'Vị Trí': 'Đỉnh đồi thông riêng biệt',
      'Tiện Ích': 'Lò sưởi châu Âu, Sân BBQ & Trà đạo',
      'Khí Hậu': 'Mát mẻ 16-22°C quanh năm'
    },
    interactiveType: 'house-tour',
    houseConfig: {
      style: 'asian-heritage',
      skybox: 'sunset',
      hasPool: false,
      hasBalcony: true,
      floors: 2,
      garageSpots: 4
    }
  },
  {
    id: 're-metropole-thuthiem',
    name: 'Căn Hộ Dual-Key The Metropole Thủ Thiêm',
    nameEn: 'The Metropole Thu Thiem Luxury Suite',
    category: 'real-estate',
    subCategory: 'Chung Cư Cao Cấp',
    priceUsd: 1800000,
    priceVnd: 45720000000,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    badge: '🏙️ Trái Tim Thủ Thiêm',
    description: 'Căn hộ view trực diện sông Sài Gòn và Quận 1, trang bị hệ thống Smarthome AI điều khiển giọng nói, thang máy nhận diện khuôn mặt.',
    locationOrOrigin: 'Khu Đô Thị Mới Thủ Thiêm, TP.HCM',
    rentalIncomePerSec: 25000,
    specs: {
      'Diện Tích': '180 m²',
      'Phòng Ngủ': '3 Phòng Ngủ Hiện Đại',
      'Hệ Thống': 'Full Smarthome AI 4.0',
      'Tiện Ích': 'Phòng Gym 5 sao, Sân Tennis trên cao'
    },
    interactiveType: 'house-tour',
    houseConfig: {
      style: 'modern-villa',
      skybox: 'night-neon',
      hasPool: true,
      hasBalcony: true,
      floors: 1,
      garageSpots: 2
    }
  },

  // ==================== SIÊU XE & XE SANG (SUPERCARS) ====================
  {
    id: 'car-bugatti-chiron',
    name: 'Bugatti Chiron Pur Sport W16',
    nameEn: 'Bugatti Chiron Pur Sport',
    category: 'supercars',
    subCategory: 'Hypercar Độc Bản',
    priceUsd: 3800000,
    priceVnd: 96520000000,
    image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
    badge: '⚡ Tốc Độ 490 km/h',
    description: 'Đỉnh cao kỹ nghệ cơ khí thế giới với khối động cơ W16 8.0L 4 Turbo, sản sinh 1,500 mã lực. Khung gầm sợi carbon nguyên khối siêu nhẹ.',
    locationOrOrigin: 'Molsheim, Pháp',
    specs: {
      'Động Cơ': '8.0L Quad-Turbo W16',
      'Công Suất': '1,500 Mã Lực',
      'Tăng Tốc 0-100': '2.3 Giây',
      'Tốc Độ Tối Đa': '490 km/h',
      'Số Lượng': 'Chỉ 60 chiếc toàn cầu'
    },
    interactiveType: 'car-drive',
    vehicleConfig: {
      topSpeed: 490,
      acceleration: 2.3,
      handling: 9.8,
      color: '#0284c7',
      bodyType: 'hypercar',
      engineSound: 'supercar',
      nitroCapacity: 100
    }
  },
  {
    id: 'car-rolls-phantom',
    name: 'Rolls-Royce Phantom VIII Peace & Glory',
    nameEn: 'Rolls-Royce Phantom VIII Extended',
    category: 'supercars',
    subCategory: 'Xe Siêu Sang Doanh Nhân',
    priceUsd: 1200000,
    priceVnd: 30480000000,
    image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1200&q=80',
    badge: '👑 Biệt Thự Di Động',
    description: 'Biểu tượng tối thượng của giới quý tộc. Bầu trời ngàn sao Starlight Headliner, cửa hít tự động, cách âm khoang hành khách tuyệt đối.',
    locationOrOrigin: 'Goodwood, Anh Quốc',
    specs: {
      'Động Cơ': '6.75L Twin-Turbo V12',
      'Công Suất': '563 Mã Lực',
      'Nội Thất': 'Da bò thượng hạng Bắc Âu & Gỗ quý',
      'Bầu Trời Sao': '1,344 bóng sợi quang phát sáng',
      'Tủ Lạnh': 'Ngăn làm mát Champagne & Ly pha lê'
    },
    interactiveType: 'car-drive',
    vehicleConfig: {
      topSpeed: 250,
      acceleration: 5.1,
      handling: 8.5,
      color: '#0f172a',
      bodyType: 'sedan',
      engineSound: 'luxury',
      nitroCapacity: 50
    }
  },
  {
    id: 'car-lambo-revuelto',
    name: 'Lamborghini Revuelto V12 Hybrid',
    nameEn: 'Lamborghini Revuelto High-Performance EV',
    category: 'supercars',
    subCategory: 'Siêu Xe Thế Hệ Mới',
    priceUsd: 650000,
    priceVnd: 16510000000,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
    badge: '🔥 Bò Tót 1015 HP',
    description: 'Siêu phẩm V12 Plug-in Hybrid kết hợp 3 mô tơ điện. Thiết kế phi thuyền viễn tưởng với cửa cắt kéo trứ danh của Lamborghini.',
    locationOrOrigin: 'Sant\'Agata Bolognese, Ý',
    specs: {
      'Hệ Dẫn Động': 'V12 6.5L + 3 Mô tơ điện',
      'Tổng Công Suất': '1,015 Mã Lực',
      'Tăng Tốc 0-100': '2.5 Giây',
      'Tốc Độ Tối Đa': '350 km/h',
      'Cửa Mở': 'Scissor Doors (Cắt kéo)'
    },
    interactiveType: 'car-drive',
    vehicleConfig: {
      topSpeed: 355,
      acceleration: 2.5,
      handling: 9.5,
      color: '#ea580c',
      bodyType: 'supercar',
      engineSound: 'supercar',
      nitroCapacity: 80
    }
  },
  {
    id: 'car-ferrari-sf90',
    name: 'Ferrari SF90 Stradale Assetto Fiorano',
    nameEn: 'Ferrari SF90 Stradale Track Pack',
    category: 'supercars',
    subCategory: 'Siêu Xe Ngựa Chồm',
    priceUsd: 550000,
    priceVnd: 13970000000,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
    badge: '🏎️ Thần Gió Nước Ý',
    description: 'Siêu xe thương mại mạnh nhất của Ferrari với công nghệ đua F1, gói khí động học Assetto Fiorano và ống xả thể thao Titanium.',
    locationOrOrigin: 'Maranello, Ý',
    specs: {
      'Động Cơ': '4.0L Twin-Turbo V8 + Hybrid',
      'Công Suất': '1,000 Mã Lực',
      'Tăng Tốc 0-100': '2.5 Giây',
      'Hộp Số': '8 Cấp F1 Ly Hợp Kép'
    },
    interactiveType: 'car-drive',
    vehicleConfig: {
      topSpeed: 340,
      acceleration: 2.5,
      handling: 9.7,
      color: '#dc2626',
      bodyType: 'supercar',
      engineSound: 'supercar',
      nitroCapacity: 85
    }
  },
  {
    id: 'car-porsche-gt3rs',
    name: 'Porsche 911 GT3 RS (992)',
    nameEn: 'Porsche 911 GT3 RS Weissach Package',
    category: 'supercars',
    subCategory: 'Quái Vật Đường Đua',
    priceUsd: 320000,
    priceVnd: 8128000000,
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    badge: '🏁 Vua Bo Cua Nürburgring',
    description: 'Cỗ máy đường đua hợp pháp với cánh gió DRS chủ động tạo lực ép 860kg ở 285 km/h. Động cơ hút khí tự nhiên 9,000 vòng/phút gầm rú mê hoặc.',
    locationOrOrigin: 'Stuttgart, Đức',
    specs: {
      'Động Cơ': '4.0L Boxer 6 Xi-lanh N/A',
      'Vòng Tua': 'Max 9,000 RPM',
      'Công Suất': '525 Mã Lực',
      'Cánh Gió': 'Hệ thống DRS F1 Active Aero'
    },
    interactiveType: 'car-drive',
    vehicleConfig: {
      topSpeed: 300,
      acceleration: 3.2,
      handling: 10.0,
      color: '#10b981',
      bodyType: 'supercar',
      engineSound: 'supercar',
      nitroCapacity: 75
    }
  },
  {
    id: 'car-cybertruck',
    name: 'Tesla Cybertruck Cyberbeast Tri-Motor',
    nameEn: 'Tesla Cybertruck Cyberbeast 845HP',
    category: 'supercars',
    subCategory: 'Bán Tải Tương Lai',
    priceUsd: 120000,
    priceVnd: 3048000000,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    badge: '🛡️ Thép Bọc Thép Chống Đạn',
    description: 'Vỏ thép không gỉ siêu cứng Ultra-Hard 30X Cold-Rolled Stainless Steel, kính chống đạn và mô-men xoắn tức thì như tên lửa.',
    locationOrOrigin: 'Texas, USA',
    specs: {
      'Động Cơ': '3 Mô Tơ Điện Tri-Motor',
      'Công Suất': '845 Mã Lực',
      'Mô-men Xoắn': '13,960 Nm',
      'Tăng Tốc 0-100': '2.6 Giây',
      'Thân Vỏ': 'Thép không gỉ chống đạn'
    },
    interactiveType: 'car-drive',
    vehicleConfig: {
      topSpeed: 210,
      acceleration: 2.6,
      handling: 8.2,
      color: '#94a3b8',
      bodyType: 'truck',
      engineSound: 'cybertruck',
      nitroCapacity: 60
    }
  },
  {
    id: 'car-jesko',
    name: 'Koenigsegg Jesko Attack Carbon Edition',
    nameEn: 'Koenigsegg Jesko 1600HP Hypercar',
    category: 'supercars',
    subCategory: 'Megacar 1600HP',
    priceUsd: 4200000,
    priceVnd: 106680000000,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    badge: '🚀 Quái Vật Tốc Độ',
    description: 'Siêu phẩm Thụy Điển với hộp số LST 9 cấp không cần ly hợp chuyển số trong 2 mili giây. Sử dụng nhiên liệu E85 tạo ra 1,600 mã lực.',
    locationOrOrigin: 'Ängelholm, Thụy Điển',
    specs: {
      'Động Cơ': '5.0L Twin-Turbo Flat-plane V8',
      'Công Suất': '1,600 Mã Lực (E85)',
      'Hộp Số': '9 Cấp LST Siêu Tốc',
      'Tốc Độ Tối Đa': '480+ km/h'
    },
    interactiveType: 'car-drive',
    vehicleConfig: {
      topSpeed: 485,
      acceleration: 2.2,
      handling: 9.9,
      color: '#f59e0b',
      bodyType: 'hypercar',
      engineSound: 'supercar',
      nitroCapacity: 100
    }
  },

  // ==================== XE MÁY & MÔ TÔ VIỆT NAM (MOTORBIKES) ====================
  {
    id: 'bike-wave-alpha',
    name: 'Honda Wave Alpha 110cc Đỏ Cờ',
    nameEn: 'Honda Wave Alpha 110 Classic Vietnam',
    category: 'motorbikes',
    subCategory: 'Xe Số Quốc Dân',
    priceUsd: 750,
    priceVnd: 19050000,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    badge: '🇻🇳 Huyền Thoại Đường Phố',
    description: 'Chiếc xe máy quốc dân gắn liền với triệu người dân Việt Nam. Bền bỉ vô đối, tiết kiệm xăng 1.7L/100km, luồn lách mọi con hẻm ngõ ngách.',
    locationOrOrigin: 'Vĩnh Phúc, Việt Nam',
    specs: {
      'Động Cơ': '110cc 4 kỳ, 1 xi-lanh',
      'Tiêu Hao Xăng': '1.72 L / 100km',
      'Hộp Số': '4 Số Tròn',
      'Bảo Dưỡng': 'Bất cứ tiệm sửa xe nào ở VN',
      'Độ Bền': 'Chạy 20 năm vẫn nổ êm'
    },
    interactiveType: 'bike-ride',
    vehicleConfig: {
      topSpeed: 95,
      acceleration: 12.0,
      handling: 9.2,
      color: '#ef4444',
      bodyType: 'bike',
      engineSound: 'wave',
      nitroCapacity: 20
    }
  },
  {
    id: 'bike-sh350i',
    name: 'Honda SH 350i Thể Thao Đen Nhám',
    nameEn: 'Honda SH 350i Sport Edition',
    category: 'motorbikes',
    subCategory: 'Vua Xe Tay Ga',
    priceUsd: 6000,
    priceVnd: 152400000,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    badge: '⭐ Đẳng Cấp SH Trùm Phố',
    description: 'Vua của phân khúc tay ga cao cấp tại Việt Nam. Khối động cơ eSP+ 330cc mạnh mẽ, phanh ABS 2 kênh, kiểm soát lực kéo HSTC và khóa Smartkey.',
    locationOrOrigin: 'Honda Việt Nam',
    specs: {
      'Động Cơ': 'eSP+ 330cc PGM-FI',
      'Công Suất': '28.8 Mã Lực',
      'Công Nghệ': 'Phanh ABS 2 Kênh & HSTC',
      'Đồng Hồ': 'Màn hình LCD đôi kết nối Bluetooth'
    },
    interactiveType: 'bike-ride',
    vehicleConfig: {
      topSpeed: 145,
      acceleration: 7.5,
      handling: 8.8,
      color: '#1e293b',
      bodyType: 'scooter',
      engineSound: 'scooter',
      nitroCapacity: 40
    }
  },
  {
    id: 'bike-exciter155',
    name: 'Yamaha Exciter 155 VVA ABS GP Master',
    nameEn: 'Yamaha Exciter 155 VVA Racing',
    category: 'motorbikes',
    subCategory: 'Vua Đường Phố Côn Tay',
    priceUsd: 2100,
    priceVnd: 53340000,
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80',
    badge: '🔥 Underbone Thể Thao',
    description: 'Ông vua đường phố côn tay với công nghệ van biến thiên VVA thừa hưởng từ siêu mô tô YZF-R1. Hộp số 6 cấp trợ lực chống trượt Slipper Clutch.',
    locationOrOrigin: 'Yamaha Motor VN',
    specs: {
      'Động Cơ': '155cc VVA 4 Van',
      'Công Suất': '17.9 Mã Lực',
      'Hộp Số': '6 Cấp Côn Tay',
      'Trang Bị': 'Khóa Smartkey & Sạc điện thoại'
    },
    interactiveType: 'bike-ride',
    vehicleConfig: {
      topSpeed: 135,
      acceleration: 8.2,
      handling: 9.4,
      color: '#2563eb',
      bodyType: 'bike',
      engineSound: 'scooter',
      nitroCapacity: 35
    }
  },
  {
    id: 'bike-vespa-dior',
    name: 'Vespa 946 Christian Dior Limited Edition',
    nameEn: 'Vespa 946 Christian Dior Haute Couture',
    category: 'motorbikes',
    subCategory: 'Xe Nghệ Thuật Giới Hạn',
    priceUsd: 35000,
    priceVnd: 889000000,
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1200&q=80',
    badge: '💎 Thời Trang Triệu Đô',
    description: 'Sự kết hợp giữa biểu tượng xe Ý và nhà mốt thời trang xa xỉ Christian Dior. Họa tiết Dior Oblique độc quyền, yên xe bọc da thủ công tại Paris.',
    locationOrOrigin: 'Pontedera, Ý & Paris, Pháp',
    specs: {
      'Động Cơ': '125cc 3V i-Get ABS',
      'Họa Tiết': 'Dior Oblique Haute Couture',
      'Phụ Kiện': 'Túi đựng đồ Dior & Mũ bảo hiểm theo xe',
      'Số Lượng': 'Giới hạn 946 chiếc toàn cầu'
    },
    interactiveType: 'bike-ride',
    vehicleConfig: {
      topSpeed: 110,
      acceleration: 10.0,
      handling: 8.6,
      color: '#fef08a',
      bodyType: 'scooter',
      engineSound: 'scooter',
      nitroCapacity: 25
    }
  },
  {
    id: 'bike-ducati-panigale',
    name: 'Ducati Panigale V4 S Corse Racing',
    nameEn: 'Ducati Panigale V4 S Superbike',
    category: 'motorbikes',
    subCategory: 'Superbike 1,100cc',
    priceUsd: 38000,
    priceVnd: 965200000,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    badge: '🏍️ 215 HP Tên Lửa Mặt Đất',
    description: 'Cỗ máy Superbike vô địch giải đua thế giới với động cơ Desmosedici Stradale V4 1,103cc. Hệ thống treo Ohlins điện tử và cánh gió khí động học.',
    locationOrOrigin: 'Bologna, Ý',
    specs: {
      'Động Cơ': 'Desmosedici Stradale V4 1,103cc',
      'Công Suất': '215.5 Mã Lực',
      'Tốc Độ Tối Đa': '315 km/h',
      'Trọng Lượng Khô': '174 kg (Tỉ lệ công suất/trọng lượng khủng)'
    },
    interactiveType: 'bike-ride',
    vehicleConfig: {
      topSpeed: 315,
      acceleration: 2.8,
      handling: 9.6,
      color: '#dc2626',
      bodyType: 'bike',
      engineSound: 'ducati',
      nitroCapacity: 90
    }
  },
  {
    id: 'bike-ninja-h2r',
    name: 'Kawasaki Ninja H2R Supercharged 310HP',
    nameEn: 'Kawasaki Ninja H2R Track Hyperbike',
    category: 'motorbikes',
    subCategory: 'Hyperbike Siêu Nạp',
    priceUsd: 55000,
    priceVnd: 1397000000,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    badge: '⚡ 400 km/h Quái Thú Supercharged',
    description: 'Chiếc mô tô nhanh nhất hành tinh trang bị bộ siêu nạp Supercharger do ngành hàng không vũ trụ Kawasaki thiết kế. Cánh gió sợi carbon tự ghì thân xe.',
    locationOrOrigin: 'Akashi, Nhật Bản',
    specs: {
      'Động Cơ': '998cc Supercharged Inline-4',
      'Công Suất': '310 Mã Lực (326 HP với Ram Air)',
      'Tốc Độ Kỷ Lục': '400 km/h',
      'Vật Liệu': 'Thân vỏ Full Carbon Fiber'
    },
    interactiveType: 'bike-ride',
    vehicleConfig: {
      topSpeed: 400,
      acceleration: 2.5,
      handling: 9.7,
      color: '#22c55e',
      bodyType: 'bike',
      engineSound: 'ducati',
      nitroCapacity: 100
    }
  },
  {
    id: 'bike-dream-zin',
    name: 'Honda Dream II Thái Lan "Đầu Bấm" Zin 100%',
    nameEn: 'Honda Dream II Thai Spec Vintage Collector',
    category: 'motorbikes',
    subCategory: 'Xe Cổ Sưu Tầm',
    priceUsd: 12000,
    priceVnd: 304800000,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    badge: '🏆 Báu Vật Sưu Tầm',
    description: 'Huyền thoại Dream Thái "tem lửa" còn nguyên thùng chưa lăn bánh, tem zin, căm đùm ốc 7 màu nguyên bản của dân chơi xe sành điệu.',
    locationOrOrigin: 'Bangkok, Thái Lan (Nhập khẩu nguyên chiếc)',
    specs: {
      'Tình Trạng': 'Zin 100% Cực Phẩm Sưu Tầm',
      'Động Cơ': '100cc Bền Vĩnh Cửu',
      'Giá Trị': 'Tăng giá theo từng năm'
    },
    interactiveType: 'bike-ride',
    vehicleConfig: {
      topSpeed: 100,
      acceleration: 11.5,
      handling: 9.0,
      color: '#713f12',
      bodyType: 'bike',
      engineSound: 'wave',
      nitroCapacity: 25
    }
  },

  // ==================== TRANG SỨC, VÀNG BẠC & ĐỒNG HỒ (JEWELRY & GOLD) ====================
  {
    id: 'jewel-gold-1kg',
    name: 'Thỏi Vàng SJC 9999 Nguyên Khối 1 Kilogram',
    nameEn: '1KG 999.9 SJC Pure Solid Gold Bar',
    category: 'jewelry-gold',
    subCategory: 'Vàng Khối Đầu Tư',
    priceUsd: 92000,
    priceVnd: 2336800000,
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80',
    badge: '🌟 Vàng Ròng 99.99%',
    description: 'Thỏi vàng nguyên chất 99.99% chuẩn ngân hàng nhà nước và thị trường quốc tế. Khắc laser mã số sê-ri độc bản, kênh giữ tài sản an toàn nhất lịch sử.',
    locationOrOrigin: 'Tổng Công Ty Vàng Bạc Đá Quý Sài Gòn (SJC)',
    specs: {
      'Trọng Lượng': '1,000 Gram (26.66 Cây Vàng)',
      'Độ Tinh Khiết': '99.99% Au (Vàng 24K)',
      'Chứng Nhận': 'Kiểm Định Quốc Gia & Khắc Laser Seri',
      'Thanh Khoản': 'Quy đổi tiền mặt tức thì 100%'
    },
    interactiveType: 'jewelry-inspect',
    jewelryConfig: {
      type: 'gold-bar',
      material: 'gold',
      sparkleIntensity: 8,
      hasMovingParts: false
    }
  },
  {
    id: 'jewel-patek-chime',
    name: 'Patek Philippe Grandmaster Chime 6300G',
    nameEn: 'Patek Philippe Grandmaster Chime White Gold',
    category: 'jewelry-gold',
    subCategory: 'Đồng Hồ Đỉnh Cao Thế Giới',
    priceUsd: 3500000,
    priceVnd: 88900000000,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    badge: '👑 Vua Đồng Hồ Thế Giới',
    description: 'Tuyệt tác đồng hồ đeo tay phức tạp nhất từng được chế tác bởi Patek Philippe với 20 tính năng cơ học phức tạp (Grand Complications) và 2 mặt số xoay.',
    locationOrOrigin: 'Geneva, Thụy Sĩ',
    specs: {
      'Bộ Máy': 'Caliber 300 GS AL 36-750 QIS FUS IRM',
      'Tính Năng': '20 Complications, Điểm Chuông Westminster',
      'Vỏ Máy': 'Vàng Trắng 18K Chạm Khắc Thủ Công',
      'Mặt Kính': 'Hai mặt xoay Sapphire kép'
    },
    interactiveType: 'jewelry-inspect',
    jewelryConfig: {
      type: 'watch',
      material: 'platinum',
      sparkleIntensity: 9,
      hasMovingParts: true
    }
  },
  {
    id: 'jewel-rolex-rainbow',
    name: 'Rolex Cosmograph Daytona Rainbow Everose',
    nameEn: 'Rolex Daytona Rainbow 116595RBOW',
    category: 'jewelry-gold',
    subCategory: 'Đồng Hồ Siêu Sao',
    priceUsd: 550000,
    priceVnd: 13970000000,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
    badge: '🌈 36 Viên Đá Sapphire Cầu Vồng',
    description: 'Phiên bản Daytona đắt giá nhất của Rolex với vành bezel nạm 36 viên đá Sapphire đa sắc màu tự nhiên chuyển màu hoàn hảo, cọc số kim cương.',
    locationOrOrigin: 'Geneva, Thụy Sĩ',
    specs: {
      'Chất Liệu': 'Vàng Hồng Everose 18K Độc Quyền',
      'Đá Quý': '36 Viên Sapphire Cầu Vồng & 56 Viên Kim Cương',
      'Bộ Máy': 'Calibre 4130 Chronograph Cơ Tự Động',
      'Dự Trữ Cót': '72 Giờ'
    },
    interactiveType: 'jewelry-inspect',
    jewelryConfig: {
      type: 'watch',
      material: 'rose-gold',
      sparkleIntensity: 10,
      hasMovingParts: true
    }
  },
  {
    id: 'jewel-richard-mille-88',
    name: 'Richard Mille RM 88 Automatic Tourbillon Smiley',
    nameEn: 'Richard Mille RM 88 Tourbillon Smiley',
    category: 'jewelry-gold',
    subCategory: 'Đồng Hồ Triệu Phú',
    priceUsd: 1200000,
    priceVnd: 30480000000,
    image: 'https://images.unsplash.com/photo-1547996160-71dfabbce5ed?auto=format&fit=crop&w=1200&q=80',
    badge: '😊 Tourbillon Siêu Hiếm',
    description: 'Kiệt tác nghệ thuật điêu khắc siêu nhỏ bằng vàng vi mô với biểu tượng mặt cười Smiley 3D, hoa hồng, dứa và ly cocktail làm hoàn toàn bằng tay.',
    locationOrOrigin: 'Les Breuleux, Thụy Sĩ',
    specs: {
      'Bộ Máy': 'Calibre CRMT7 Tourbillon Tự Động',
      'Vỏ Máy': 'Gốm Trắng ATZ & Vàng Đỏ 18K',
      'Số Lượng': 'Giới hạn 50 chiếc thế giới'
    },
    interactiveType: 'jewelry-inspect',
    jewelryConfig: {
      type: 'watch',
      material: 'gold',
      sparkleIntensity: 9,
      hasMovingParts: true
    }
  },
  {
    id: 'jewel-pink-star',
    name: 'Nhẫn Kim Cương Hồng "The Pink Star" 59.60 Carat',
    nameEn: 'The Pink Star 59.60-Carat Vivid Pink Diamond',
    category: 'jewelry-gold',
    subCategory: 'Đá Quý Đấu Giá Kỷ Lục',
    priceUsd: 71200000,
    priceVnd: 1808480000000,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
    badge: '💎 Kỷ Lục Đắt Nhất Lịch Sử',
    description: 'Viên kim cương màu hồng hoàn hảo lớn nhất từng được Viện Ngọc học Hoa Kỳ (GIA) chứng nhận phân loại Type IIa hoàn mỹ không tì vết.',
    locationOrOrigin: 'Nam Phi & Chế tác tại New York',
    specs: {
      'Trọng Lượng': '59.60 Carat (11.92 Gram)',
      'Màu Sắc': 'Fancy Vivid Pink (Hồng Rực Rỡ)',
      'Độ Tinh Khiết': 'Internally Flawless (Hoàn Hảo Tuyệt Đối)',
      'Đấu Giá Kỷ Lục': 'Sotheby\'s Hong Kong ($71.2M)'
    },
    interactiveType: 'jewelry-inspect',
    jewelryConfig: {
      type: 'diamond-ring',
      material: 'diamond',
      sparkleIntensity: 10,
      hasMovingParts: false
    }
  },
  {
    id: 'jewel-cartier-panthere',
    name: 'Vòng Tay Cartier Panthère Ngọc Lục Bảo & Kim Cương',
    nameEn: 'Cartier Panthère Emerald & Diamond Bangle',
    category: 'jewelry-gold',
    subCategory: 'Trang Sức Nữ Hoàng',
    priceUsd: 280000,
    priceVnd: 7112000000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    badge: '🐆 Linh Vật Báo Đốm Cartier',
    description: 'Biểu tượng kinh điển của nhà kim hoàn Cartier Paris với đôi mắt nạm ngọc lục bảo Emerald Colombia sáng rực rỡ, mũi mã não đen và toàn thân nạm kim cương.',
    locationOrOrigin: 'Place Vendôme, Paris, Pháp',
    specs: {
      'Chất Liệu': 'Vàng Trắng 18K & Bạch Kim',
      'Đá Quý': '2 Viên Ngọc Lục Bảo & 480 Viên Kim Cương',
      'Chế Tác': 'Thủ công hơn 350 giờ làm việc'
    },
    interactiveType: 'jewelry-inspect',
    jewelryConfig: {
      type: 'necklace',
      material: 'emerald',
      sparkleIntensity: 9,
      hasMovingParts: false
    }
  },
  {
    id: 'jewel-dragon-chain',
    name: 'Dây Chuyền Vàng 24K 10 Lượng Song Long Chầu Nguyệt',
    nameEn: 'Vietnamese Traditional 24K Pure Gold Dragon Chain',
    category: 'jewelry-gold',
    subCategory: 'Vàng Phong Thủy Việt Nam',
    priceUsd: 38000,
    priceVnd: 965200000,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
    badge: '🐉 Thần Tài Phú Quý',
    description: 'Dây chuyền vàng ròng 9999 đúc hình song long chầu nguyệt tinh xảo, biểu tượng của sự uy quyền, thịnh vượng và may mắn tài lộc cho đại gia.',
    locationOrOrigin: 'Làng nghề Kim Hoàn Đồng Xâm, Việt Nam',
    specs: {
      'Trọng Lượng': '10 Lượng Vàng Ròng (375 Gram)',
      'Hàm Lượng': 'Vàng 24K 99.99%',
      'Họa Tiết': 'Rồng Vàng Uốn Lượn Phong Thủy'
    },
    interactiveType: 'jewelry-inspect',
    jewelryConfig: {
      type: 'necklace',
      material: 'gold',
      sparkleIntensity: 8,
      hasMovingParts: false
    }
  },

  // ==================== HÀNG KHÔNG & DU THUYỀN (AVIATION & MARINE) ====================
  {
    id: 'marine-history-supreme',
    name: 'Siêu Du Thuyền Mạ Vàng "History Supreme"',
    nameEn: 'History Supreme Gold-Plated Superyacht',
    category: 'aviation-marine',
    subCategory: 'Siêu Du Thuyền Đắt Nhất',
    priceUsd: 4800000000,
    priceVnd: 121920000000000,
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
    badge: '👑 $4.8 TỶ ĐÔ - DÁT 100 TẤN VÀNG',
    description: 'Du thuyền độc nhất vô nhị bọc 100,000 kg vàng ròng và bạch kim từ đáy tàu đến mỏ neo, phòng ngủ chính ốp xương khủng long T-Rex thật và đá thiên thạch.',
    locationOrOrigin: 'Monaco & Vương Quốc Anh',
    rentalIncomePerSec: 5000000, // 5M VND/sec
    specs: {
      'Chiều Dài': '100 Feet (30.5m)',
      'Khối Lượng Vàng': '100 Tấn Vàng 24K & Bạch Kim',
      'Đặc Biệt': 'Xương Khủng Long T-Rex & Đá Thiên Thạch',
      'Vận Tốc': '45 Hải Lý/Giờ'
    },
    interactiveType: 'yacht-cruise',
    vehicleConfig: {
      topSpeed: 90,
      acceleration: 6.0,
      handling: 7.0,
      color: '#f59e0b',
      bodyType: 'supercar',
      engineSound: 'luxury'
    }
  },
  {
    id: 'aviation-gulfstream-g700',
    name: 'Chuyên Cơ Riêng Gulfstream G700 VIP Flagship',
    nameEn: 'Gulfstream G700 Ultra-Long Range Jet',
    category: 'aviation-marine',
    subCategory: 'Chuyên Cơ Tỷ Phú',
    priceUsd: 78000000,
    priceVnd: 1981200000000,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    badge: '✈️ Tầm Bay Xuyên Lục Địa',
    description: 'Chuyên cơ kinh doanh rộng nhất và xa nhất thế giới. Có 5 khu vực sinh hoạt riêng biệt, phòng ngủ Master giường King, phòng tắm vòi sen trên không.',
    locationOrOrigin: 'Savannah, Georgia, USA',
    rentalIncomePerSec: 900000,
    specs: {
      'Tầm Bay': '7,750 Hải Lý (14,353 km - Hà Nội bay thẳng New York)',
      'Tốc Độ': 'Mach 0.925 (1,142 km/h)',
      'Sức Chứa': '19 Hành Khách VIP',
      'Áp Suất Cabin': 'Thấp nhất thế giới, không mệt mỏi khi bay'
    },
    interactiveType: 'jet-flight',
    vehicleConfig: {
      topSpeed: 1140,
      acceleration: 3.0,
      handling: 8.0,
      color: '#ffffff',
      bodyType: 'hypercar',
      engineSound: 'luxury'
    }
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Tất Cả Danh Mục', icon: 'Sparkles', count: LUXURY_ITEMS.length },
  { id: 'real-estate', name: 'Bất Động Sản', icon: 'Building2', count: LUXURY_ITEMS.filter(i => i.category === 'real-estate').length },
  { id: 'supercars', name: 'Siêu Xe & Xe Hơi', icon: 'Car', count: LUXURY_ITEMS.filter(i => i.category === 'supercars').length },
  { id: 'motorbikes', name: 'Xe Máy & Mô Tô VN', icon: 'Bike', count: LUXURY_ITEMS.filter(i => i.category === 'motorbikes').length },
  { id: 'jewelry-gold', name: 'Trang Sức & Vàng Bạc', icon: 'Gem', count: LUXURY_ITEMS.filter(i => i.category === 'jewelry-gold').length },
  { id: 'aviation-marine', name: 'Du Thuyền & Chuyên Cơ', icon: 'Ship', count: LUXURY_ITEMS.filter(i => i.category === 'aviation-marine').length },
];
