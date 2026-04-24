/**
 * productList_with_coords.csv: 위도·경도(우선) → 역 선택 시 반경 RADIUS_KM(km) 이내 상품만 POI(피커) 마커.
 * 위도/경도가 없으면 COORD_MAP / POI_CATALOG / 키워드 → 그다음 METRO_DEFAULT_LANDMARK.
 * escapeHtml, L, window.currentCity 필요.
 */
(function (global) {
  'use strict';

  var MASTER_CSV_PRODUCTS = [];
  /**
   * 역–POI(위경도) 사이 직선거리 상한( km).
   * 도보 약 1시간(4~5 km/h)을 육로보다 짧은 지오데식 거리로 근사(직선 4.5 km 이내 = 후보).
   */
  var RADIUS_KM = 4.5;

  /** POI/키워드/CSV 위경도에 매칭되지 않은 상품: 도심 기본 좌표(거리·폴백) */
  var METRO_DEFAULT_LANDMARK = {
    london: { lat: 51.5074, lng: -0.1278 },
    newyork: { lat: 40.73, lng: -73.99 },
    tokyo: { lat: 35.685, lng: 139.75 },
    bangkok: { lat: 13.75, lng: 100.55 },
    osaka: { lat: 34.6937, lng: 135.5023 },
    fukuoka: { lat: 33.5904, lng: 130.4017 },
    beijing: { lat: 39.9042, lng: 116.4074 },
    shanghai: { lat: 31.2304, lng: 121.4737 },
    taipei: { lat: 25.033, lng: 121.5654 },
    singapore: { lat: 1.3521, lng: 103.8198 },
    paris: { lat: 48.8566, lng: 2.3522 },
    barcelona: { lat: 41.3851, lng: 2.1734 },
    rome: { lat: 41.9028, lng: 12.4964 },
    sydney: { lat: -33.8688, lng: 151.2093 }
  };

  /** GNB탭 id와 메트로 키(HTML data-metro-tab) — updateTabs / CSV 가시성 */
  var UI_TAB_SPECS = [
    { m: 'newyork', el: 'tab-newyork' },
    { m: 'tokyo', el: 'tab-tokyo' },
    { m: 'osaka', el: 'tab-osaka' },
    { m: 'fukuoka', el: 'tab-fukuoka' },
    { m: 'bangkok', el: 'tab-bangkok' },
    { m: 'beijing', el: 'tab-beijing' },
    { m: 'shanghai', el: 'tab-shanghai' },
    { m: 'taipei', el: 'tab-taipei' },
    { m: 'singapore', el: 'tab-singapore' },
    { m: 'paris', el: 'tab-paris' },
    { m: 'barcelona', el: 'tab-barcelona' },
    { m: 'london', el: 'tab-london' },
    { m: 'rome', el: 'tab-rome' },
    { m: 'sydney', el: 'tab-sydney' }
  ];

  /**
   * 런던 주요 관광지: 마스터 상품명 키워드 → 대표 좌표 (자율 지오코딩).
   * COORD_MAP.london 과 동일 객체를 가리킵니다.
   */
  var locationMap = {
    '런던아이': [51.5033, -0.1195],
    '런던 아이': [51.5033, -0.1195],
    'London eye': [51.5033, -0.1195],
    'London Eye': [51.5033, -0.1195],
    'LONDON EYE': [51.5033, -0.1195],
    '대관람차': [51.5033, -0.1195],
    '대영박물관': [51.5194, -0.127],
    '영국박물관': [51.5194, -0.127],
    'British Museum': [51.5194, -0.127],
    '타워브리지': [51.5055, -0.0754],
    'Tower Bridge': [51.5055, -0.0754],
    '타워 브리지': [51.5055, -0.0754],
    '빅벤': [51.5007, -0.1246],
    'Big Ben': [51.5007, -0.1246],
    '웨스트민스터': [51.5007, -0.1246],
    'Palace of Westminster': [51.5007, -0.1246],
    '해리포터': [51.6909, -0.4184],
    '워너 브라더스': [51.6909, -0.4184],
    '윈저성': [51.4839, -0.6044],
    'Windsor': [51.4839, -0.6044],
    '스톤헨지': [51.1789, -1.8262],
    'Stonehenge': [51.1789, -1.8262],
    '옥스퍼드': [51.752, -1.2577],
    'Oxford': [51.752, -1.2577],
    '캔터베리': [51.2802, 1.0789],
    'Canterbury': [51.2802, 1.0789],
    '에딘버러': [55.9533, -3.1883],
    'Edinburgh': [55.9533, -3.1883],
    '런던탑': [51.5081, -0.0759],
    'Tower of London': [51.5081, -0.0759],
    'Westminster Abbey': [51.4993, -0.1273],
    '웨스트민스터 사원': [51.4993, -0.1273],
    'ST PAUL': [51.5136, -0.098],
    '세인트폴': [51.5136, -0.098],
    'MADAME TUSSAUD': [51.5229, -0.1542],
    '마담 투소': [51.5229, -0.1542],
    '버킹엄': [51.5014, -0.1419],
    'Buckingham': [51.5014, -0.1419]
  };

  /**
   * 사전 정의된 좌표(도시별). 상품명(마스터 상품명)에 키가 포함되면 가장 긴 키를 우선 매칭.
   * 좌표가 전혀 매칭되지 않으면 해당 상품은 로드 단계에서 제외.
   */
  var COORD_MAP = {
    london: locationMap,
    newyork: {
      'Times Square': [40.758, -73.9855],
      '타임스 스퀘어': [40.758, -73.9855],
      'Central Park': [40.7829, -73.9654],
      '센트럴 파크': [40.7829, -73.9654],
      'Statue of Liberty': [40.6892, -74.0445],
      '9/11': [40.7114, -74.0132],
      'Ground Zero': [40.7114, -74.0132],
      'Brooklyn Bridge': [40.7061, -73.9969],
      'Empire State': [40.7484, -73.9857],
      '엠파이어': [40.7484, -73.9857],
      'Grand Central': [40.7527, -73.9772]
    },
    tokyo: {
      'Skytree': [35.7101, 139.8107],
      '스카이트리': [35.7101, 139.8107],
      '시부야': [35.6595, 139.7004],
      'Shibuya': [35.6595, 139.7004],
      '신주쿠': [35.6906, 139.7005],
      'Shinjuku': [35.6906, 139.7005],
      '센소지': [35.7148, 139.7967],
      'Asakusa': [35.7148, 139.7967],
      '도쿄타워': [35.6586, 139.7454],
      'Tokyo Tower': [35.6586, 139.7454],
      '긴자': [35.6712, 139.765],
      'Ginza': [35.6712, 139.765],
      '쓰키지': [35.6655, 139.7707],
      '롯폰기': [35.6627, 139.7312],
      'Roppongi': [35.6627, 139.7312],
      '도쿄역': [35.6812, 139.7671],
      '하라주쿠': [35.6702, 139.7026],
      'Harajuku': [35.6702, 139.7026]
    },
    bangkok: {
      'Wat Arun': [13.7436, 100.4887],
      '왓아룬': [13.7436, 100.4887],
      'Wat Pho': [13.7464, 100.4923],
      '왓포': [13.7464, 100.4923],
      'Grand Palace': [13.75, 100.4925],
      '짜뚜짝': [13.799, 100.55],
      'Chatuchak': [13.799, 100.55],
      'Khaosan': [13.7583, 100.495],
      'Siam': [13.745, 100.535],
      'MBK': [13.745, 100.53],
      'Chao Phraya': [13.7319, 100.513],
      'Suvarnabhumi': [13.69, 100.75]
    }
  };

  function utf8FromB64(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }

  function parseCsvText(text) {
    var rows = [];
    var field = '';
    var row = [];
    var inQ = false;
    for (var i = 0; i < text.length; i++) {
      var c = text.charAt(i);
      if (inQ) {
        if (c === '"') {
          if (text.charAt(i + 1) === '"') {
            field += '"';
            i++;
          } else {
            inQ = false;
          }
        } else {
          field += c;
        }
      } else {
        if (c === '"') inQ = true;
        else if (c === ',') {
          row.push(field);
          field = '';
        } else if (c === '\n') {
          row.push(field);
          rows.push(row);
          row = [];
          field = '';
        } else if (c !== '\r') field += c;
      }
    }
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  function csvPickColumnIndex(headers, candidates) {
    for (var c = 0; c < candidates.length; c++) {
      var idx = headers.indexOf(candidates[c]);
      if (idx >= 0) return idx;
    }
    return -1;
  }

  function repCityToMetro(city) {
    var t = String(city || '')
      .trim()
      .replace(/^\uFEFF/, '');
    if (!t) return null;
    if (/^서울|서울특별시|Seoul/i.test(t)) return null;
    var L = t.toLowerCase();

    if (L === 'london' || t === '런던') return 'london';
    if (L === 'paris' || t === '파리') return 'paris';
    if (L === 'barcelona' || t === '바르셀로나') return 'barcelona';
    if (L === 'rome' || t === '로마' || t === 'roma') return 'rome';
    if (L === 'sydney' || t === '시드니') return 'sydney';
    if (L === 'singapore' || t === '싱가포르') return 'singapore';
    if (L === 'taipei' || t === '타이페이' || t === '台北') return 'taipei';
    if (L === 'osaka' || t === '오사카' || t === '大阪') return 'osaka';
    if (L === 'fukuoka' || t === '후쿠오카' || t === '福岡') return 'fukuoka';
    if (L === 'beijing' || t === '북경' || t === '北京' || t === '베이징') return 'beijing';
    if (L === 'shanghai' || t === '상해' || t === '上海' || t === '샹하이') return 'shanghai';
    if (L === 'tokyo' || t === '도쿄' || t === '東京') return 'tokyo';
    if (L === 'bangkok' || t === '방콕' || t.indexOf('กรุงเทพ') >= 0) return 'bangkok';
    if (L.indexOf('london') >= 0 || t.indexOf('런던') >= 0) return 'london';
    if (L.indexOf('new york') >= 0 || L === 'nyc' || t === '뉴욕' || t === '뉴욕시' || t.indexOf('뉴욕') === 0) return 'newyork';
    if (L.indexOf('manhattan') >= 0) return 'newyork';
    if (L.indexOf('beijing') >= 0) return 'beijing';
    if (L.indexOf('shanghai') >= 0) return 'shanghai';
    if (L.indexOf('osaka') >= 0) return 'osaka';
    if (L.indexOf('fukuoka') >= 0) return 'fukuoka';
    if (L.indexOf('paris') >= 0) return 'paris';
    if (L.indexOf('barcelona') >= 0) return 'barcelona';
    if (L.indexOf('rome') >= 0 || t.indexOf('로마') >= 0) return 'rome';
    if (L.indexOf('sydney') >= 0) return 'sydney';
    if (L.indexOf('singapore') >= 0) return 'singapore';
    if (L.indexOf('taipei') >= 0) return 'taipei';
    if (L.indexOf('tokyo') >= 0) return 'tokyo';
    if (L.indexOf('bangkok') >= 0) return 'bangkok';
    if (L.indexOf('london') >= 0) return 'london';

    return null;
  }

  /**
   * GNB에 있는 지하철 맵(대표도시)과 CSV 대표도시가 매핑될 때만 true.
   */
  function isMajorSubwayRepresentativeCity(name) {
    return repCityToMetro(String(name || '').trim()) != null;
  }

  function getVisibleMetroTabKeysFromRawCsv() {
    var allOn = {};
    for (var ui = 0; ui < UI_TAB_SPECS.length; ui++) {
      allOn[UI_TAB_SPECS[ui].m] = true;
    }
    var text = getMasterCsvText();
    if (!text) return allOn;
    var rows = parseCsvText(text);
    if (rows.length < 2) return allOn;
    var headers = rows[0].map(function (h) {
      return String(h || '').trim();
    });
    if (headers[0]) headers[0] = headers[0].replace(/^\uFEFF/, '');
    var colCity = csvPickColumnIndex(headers, ['대표도시', '도시', '지역', '도시명']);
    if (colCity < 0) return allOn;
    var have = {};
    for (var h0 = 0; h0 < UI_TAB_SPECS.length; h0++) {
      have[UI_TAB_SPECS[h0].m] = false;
    }
    var seen = Object.create(null);
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row || !row.length) continue;
      var city = String(row[colCity] != null ? row[colCity] : '')
        .trim()
        .replace(/^\uFEFF/, '');
      if (!city || seen[city]) continue;
      seen[city] = 1;
      if (!isMajorSubwayRepresentativeCity(city)) continue;
      var mk = repCityToMetro(city);
      if (mk && have.hasOwnProperty(mk)) have[mk] = true;
    }
    var any = false;
    for (var k1 in have) {
      if (have.hasOwnProperty(k1) && have[k1]) {
        any = true;
        break;
      }
    }
    if (!any) return allOn;
    return have;
  }

  function csvKmDistance(lat1, lng1, lat2, lng2) {
    var R = 6371;
    var toRad = Math.PI / 180;
    var dLat = (lat2 - lat1) * toRad;
    var dLng = (lng2 - lng1) * toRad;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  /** 영문·라틴 별칭은 대소문자 무시, 한글 등은 그대로 부분일치 */
  function stringContainsNormalized(haystack, needle) {
    var h = String(haystack || '');
    var n = String(needle || '');
    if (!n) return false;
    if (h.indexOf(n) >= 0) return true;
    if (/[a-zA-Z]/.test(n) && h.toLowerCase().indexOf(n.toLowerCase()) >= 0) return true;
    return false;
  }

  function findCoordFromMap(productName, metroKey) {
    var m = COORD_MAP[metroKey];
    if (!m) return null;
    var n = String(productName || '');
    var bestKey = '';
    var bestLL = null;
    for (var k in m) {
      if (!m.hasOwnProperty(k)) continue;
      if (!stringContainsNormalized(n, k)) continue;
      if (k.length > bestKey.length) {
        bestKey = k;
        bestLL = m[k];
      }
    }
    if (!bestLL) return null;
    return { name: bestKey, lat: bestLL[0], lng: bestLL[1] };
  }

  /** '마스터 상품명'에서 [ ]·해시 제거 뒤 관광·체험 키워드(낙관적 추출) */
  function extractAttractionKeywordFromMasterName(raw) {
    var s = String(raw || '')
      .replace(/\r?\n/g, ' ')
      .trim();
    if (!s) return '';
    s = s.replace(/\[([^\]]*)\]/g, ' ');
    s = s.replace(/[#_＃]/g, ' ');
    s = s.replace(/\d+\s*박\s*\d+\s*일/gi, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    var cut = s.split(/[,，、·\/|]/);
    var best = '';
    for (var i = 0; i < cut.length; i++) {
      var p = cut[i].replace(/^[\s♥☆★♡♪●○◆◇■□▶]+/g, '').trim();
      if (p.length >= 2 && p.length > best.length) best = p;
    }
    if (best.length >= 2) return best.slice(0, 90);
    var w = s.split(/\s+/).filter(Boolean);
    return w.slice(0, 8).join(' ').slice(0, 90);
  }

  /**
   * 대표도시(메트로)별 관광지 — aliases 중 상품명(또는 추출 키워드)에 부분일치, 긴 별칭 우선.
   * 웨스트엔드 뮤지컬 등은 런던 시티(웨스트민스터 인근) 근사 좌표.
   */
  var POI_CATALOG = [];
  (function buildPoiCatalog() {
    var L = [
      { m: 'london', name: '런던아이', lat: 51.5033, lng: -0.1195, a: '런던아이|런던 아이|London eye|London Eye|눈에|대관람차' },
      { m: 'london', name: '대영박물관', lat: 51.5194, lng: -0.127, a: '대영박물관|영국박물관|British Museum' },
      { m: 'london', name: '타워브리지', lat: 51.5055, lng: -0.0754, a: 'Tower Bridge|타워브리지|타워 브리지' },
      { m: 'london', name: '빅벤·웨스트민스터', lat: 51.5007, lng: -0.1246, a: 'Big Ben|빅벤|웨스민스터|웨스트민스터|Palace of Westminster' },
      { m: 'london', name: '웨스트민스터 사원', lat: 51.4993, lng: -0.1273, a: 'Westminster Abbey|웨스트민스터 사원|웨스민스터 애비' },
      { m: 'london', name: '세인트폴 대성당', lat: 51.5136, lng: -0.098, a: "ST PAUL|St Paul's|세인트폴" },
      { m: 'london', name: '런던탑', lat: 51.5081, lng: -0.0759, a: 'Tower of London|런던 탑' },
      { m: 'london', name: '해리포터 스튜디오', lat: 51.6909, lng: -0.4184, a: '해리포터|워너|Warner' },
      { m: 'london', name: '윈저성', lat: 51.4839, lng: -0.6044, a: 'Windsor|윈저' },
      { m: 'london', name: '스톤헨지', lat: 51.1789, lng: -1.8262, a: 'Stonehenge|스톤헨지' },
      { m: 'london', name: '박써마켓', lat: 51.5055, lng: -0.091, a: "Borough Market|버로 마켓|버러 마켓" },
      { m: 'london', name: '하이드파크', lat: 51.5045, lng: -0.1644, a: 'Hyde Park|하이드' },
      { m: 'london', name: '코벤트가든', lat: 51.512, lng: -0.1239, a: 'Covent|코벤트' },
      { m: 'london', name: '템즈·크루즈', lat: 51.5074, lng: -0.12, a: '템즈|Thames|크루즈' },
      { m: 'london', name: '웨스트엔드 뮤지컬', lat: 51.511, lng: -0.13, a: '무랑루즈|Moulin|라이언킹|Lion King|뮤지컬|오페라의 유령|팬덤|위키드|Wicked|레미제라블|Matilda|맘마미아|mamma|Phantom' },
      { m: 'london', name: '셜록', lat: 51.523, lng: -0.1585, a: '셜록|Sherlock|Baker' },
      { m: 'london', name: '마담투소', lat: 51.5229, lng: -0.1542, a: 'MADAME|마담 투소|Madame' },
      { m: 'newyork', name: '타임스스퀘어', lat: 40.758, lng: -73.9855, a: 'Times Square|타임스' },
      { m: 'newyork', name: '센트럴파크', lat: 40.7829, lng: -73.9654, a: 'Central Park|센트럴' },
      { m: 'newyork', name: '자유의여신', lat: 40.6892, lng: -74.0445, a: 'Statue of Liberty|리버티|엘리스' },
      { m: 'newyork', name: '9·11', lat: 40.7114, lng: -74.0132, a: '9/11|9·11|Ground Zero' },
      { m: 'newyork', name: '엠파이어', lat: 40.7484, lng: -73.9857, a: 'Empire State|엠파이어' },
      { m: 'newyork', name: '브루클린', lat: 40.7061, lng: -73.9969, a: 'Brooklyn|DUMBO' },
      { m: 'newyork', name: '그랜드센트럴', lat: 40.7527, lng: -73.9772, a: 'Grand Central' },
      { m: 'newyork', name: '퀸즈·뉴저지', lat: 40.75, lng: -73.8, a: '퀸즈|뉴저지' },
      { m: 'tokyo', name: '스카이트리', lat: 35.7101, lng: 139.8107, a: 'Skytree|スカイツリー' },
      { m: 'tokyo', name: '시부야', lat: 35.6595, lng: 139.7004, a: 'Shibuya|시부야|スクランブル' },
      { m: 'tokyo', name: '신주쿠', lat: 35.6906, lng: 139.7005, a: 'Shinjuku|新宿' },
      { m: 'tokyo', name: '아사쿠사', lat: 35.7148, lng: 139.7967, a: 'Asakusa|淺草|센소지' },
      { m: 'tokyo', name: '도쿄타워', lat: 35.6586, lng: 139.7454, a: 'Tokyo Tower' },
      { m: 'tokyo', name: '긴자', lat: 35.6712, lng: 139.765, a: 'Ginza|銀座' },
      { m: 'tokyo', name: '도쿄역·마루노우치', lat: 35.6812, lng: 139.7671, a: 'Marunouchi|도쿄 스테' },
      { m: 'tokyo', name: '하라주쿠·메이지', lat: 35.6702, lng: 139.7026, a: 'Harajuku|原宿|Meiji' },
      { m: 'tokyo', name: '디즈니', lat: 35.6359, lng: 139.8803, a: 'Disney|디즈니' },
      { m: 'tokyo', name: '우에노', lat: 35.714, lng: 139.7774, a: 'Ueno|우에노' },
      { m: 'tokyo', name: '이케부쿠로', lat: 35.7304, lng: 139.709, a: 'Ikebukuro' },
      { m: 'tokyo', name: '아키하바라', lat: 35.6997, lng: 139.7741, a: 'Akihabara|아키하바' },
      { m: 'bangkok', name: '왓아룬', lat: 13.7436, lng: 100.4887, a: 'Wat Arun' },
      { m: 'bangkok', name: '왓포', lat: 13.7464, lng: 100.4923, a: 'Wat Pho|와트' },
      { m: 'bangkok', name: '그랜드팰리스', lat: 13.75, lng: 100.4925, a: 'Grand Palace|왕궁|뚝시' },
      { m: 'bangkok', name: '짜뚜짝', lat: 13.799, lng: 100.55, a: 'Chatuchak|채칙' },
      { m: 'bangkok', name: '카오산', lat: 13.7583, lng: 100.495, a: 'Khaosan|카오산' },
      { m: 'bangkok', name: '시암', lat: 13.745, lng: 100.535, a: 'Siam|뻰짜' },
      { m: 'bangkok', name: '초박', lat: 13.7319, lng: 100.513, a: 'Chao Phraya|짜오' },
      { m: 'bangkok', name: '수완나품', lat: 13.69, lng: 100.75, a: 'Suvarnabhumi|BKK' }
    ];
    L.forEach(function (d) {
      var aliases = d.a.split('|').map(function (x) {
        return x.trim();
      });
      var ml = 0;
      aliases.forEach(function (x) {
        if (x.length > ml) ml = x.length;
      });
      POI_CATALOG.push({ m: d.m, name: d.name, lat: d.lat, lng: d.lng, aliases: aliases, _ml: ml });
    });
    POI_CATALOG.sort(function (a, b) {
      return b._ml - a._ml;
    });
  })();

  function matchPoiCatalogForMetro(text, metroKey) {
    if (!text || !metroKey) return null;
    for (var i = 0; i < POI_CATALOG.length; i++) {
      var e = POI_CATALOG[i];
      if (e.m !== metroKey) continue;
      var al = e.aliases.slice();
      al.sort(function (a2, b2) {
        return b2.length - a2.length;
      });
      for (var j = 0; j < al.length; j++) {
        if (al[j] && stringContainsNormalized(text, al[j])) {
          return { name: e.name, lat: e.lat, lng: e.lng };
        }
      }
    }
    return null;
  }

  /** COORD_MAP → POI_CATALOG(별칭) → 추출 키워드 + 동일 로직 */
  function findPoiByProductName(productName, metroKey) {
    var n = String(productName || '');
    var hit = findCoordFromMap(n, metroKey);
    if (hit) return hit;
    hit = matchPoiCatalogForMetro(n, metroKey);
    if (hit) return hit;
    var kw = extractAttractionKeywordFromMasterName(n);
    if (kw && kw.length >= 2) {
      hit = findCoordFromMap(kw, metroKey);
      if (hit) return hit;
      hit = matchPoiCatalogForMetro(kw, metroKey);
    }
    return null;
  }

  function getMasterCsvText() {
    if (typeof global.CSV_MASTER_B64 === 'string' && global.CSV_MASTER_B64.length) {
      try {
        return utf8FromB64(global.CSV_MASTER_B64);
      } catch (e) {}
    }
    return '';
  }

  function loadMasterCsvProducts() {
    var text = getMasterCsvText();
    if (!text) return [];
    var rows = parseCsvText(text);
    if (rows.length < 2) return [];
    var headers = rows[0].map(function (h) {
      return String(h || '').trim();
    });
    if (headers[0]) headers[0] = headers[0].replace(/^\uFEFF/, '');
    var colName = csvPickColumnIndex(headers, [
      '마스터상품명',
      '마스터 상품명',
      '상품명',
      '마스터_상품명'
    ]);
    var colCode = csvPickColumnIndex(headers, [
      '마스터 상품코드',
      '마스터상품코드',
      '상품코드'
    ]);
    var colPrice = csvPickColumnIndex(headers, [
      '판매가',
      '판매가격',
      '가격',
      '판매 금액',
      '금액'
    ]);
    var colStatus = csvPickColumnIndex(headers, [
      '상품 판매상태',
      '판매상태',
      '상태'
    ]);
    var colCat1 = csvPickColumnIndex(headers, ['카테고리1', '카테고리 1']);
    var colCat2 = csvPickColumnIndex(headers, ['카테고리2', '카테고리 2']);
    var colCity = csvPickColumnIndex(headers, [
      '대표도시',
      '도시',
      '지역',
      '도시명'
    ]);
    var colLat = csvPickColumnIndex(headers, ['위도', 'lat', 'latitude', 'Latitude', 'LAT']);
    var colLng = csvPickColumnIndex(headers, ['경도', 'lng', 'lon', 'longitude', 'Longitude', 'LNG', 'LON']);
    var colPoiHint = csvPickColumnIndex(headers, [
      '유추된_관광지_혹은_도시',
      '유추된 관광지 혹은 도시',
      'POI',
      '관광지'
    ]);
    var colCurrency = csvPickColumnIndex(headers, ['상품통화', '계약통화', '통화']);
    if (colName < 0) return [];
    var out = [];
    var coordUnassigned = 0;
    var fromCsvLatLng = 0;
    var cityEligible = 0;
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row || !row.length) continue;
      var name = colName >= 0 ? (row[colName] || '').trim() : '';
      if (!name || name === '테스트') continue;
      var repCity = colCity >= 0 ? String(row[colCity] || '').trim() : '';
      var mk = repCityToMetro(repCity);
      if (!mk) continue;
      var st = colStatus >= 0 ? (row[colStatus] || '').trim() : '';
      cityEligible++;
      var priceStr = colPrice >= 0 && row[colPrice] != null ? String(row[colPrice]).trim() : '';
      var priceNum = priceStr === '' ? null : Number(priceStr);
      if (isNaN(priceNum)) priceNum = null;
      var codeForLm = colCode >= 0 ? (row[colCode] || '').trim() : '';
      var latV = colLat >= 0 && row[colLat] != null ? parseFloat(String(row[colLat]).replace(/,/g, '')) : NaN;
      var lngV = colLng >= 0 && row[colLng] != null ? parseFloat(String(row[colLng]).replace(/,/g, '')) : NaN;
      var hasCsvCoords =
        !isNaN(latV) &&
        !isNaN(lngV) &&
        Math.abs(latV) <= 90 &&
        Math.abs(lngV) <= 180;
      var lm;
      if (hasCsvCoords) {
        fromCsvLatLng++;
        var hint =
          colPoiHint >= 0 ? String(row[colPoiHint] != null ? row[colPoiHint] : '').trim() : '';
        if (!hint) hint = extractAttractionKeywordFromMasterName(name);
        if (!hint) hint = name.length > 48 ? name.slice(0, 45) + '…' : name;
        lm = { name: hint, lat: latV, lng: lngV };
      } else {
        lm = findPoiByProductName(name, mk);
        if (!lm) {
          coordUnassigned++;
          var fb = METRO_DEFAULT_LANDMARK[mk];
          if (!fb) continue;
          lm = { name: name.length > 48 ? name.slice(0, 45) + '…' : name, lat: fb.lat, lng: fb.lng };
        }
      }
      out.push({
        productCode: codeForLm,
        productName: name,
        price: priceNum,
        currency: colCurrency >= 0 ? (row[colCurrency] || 'KRW').trim() : 'KRW',
        status: st,
        cat1: colCat1 >= 0 ? (row[colCat1] || '').trim() : '',
        cat2: colCat2 >= 0 ? (row[colCat2] || '').trim() : '',
        representativeCity: repCity,
        metroKey: mk,
        landmark: lm
      });
    }
    if (global.console && global.console.log) {
      global.console.log(
        '[CSV 상품] 메트로 매칭 행: ' +
          cityEligible +
          ' · CSV 위도/경도 사용: ' +
          fromCsvLatLng +
          ' · 키워드 미매칭(도심 기본): ' +
          coordUnassigned +
          ' · 지도 로드: ' +
          out.length
      );
    }
    return out;
  }

  function markStationsWithinProductRadius(metroByKey) {
    var withProducts = {};
    MASTER_CSV_PRODUCTS.forEach(function (p) {
      if (p.metroKey) withProducts[p.metroKey] = true;
    });
    var keys = metroByKey ? Object.keys(metroByKey) : [];
    keys.forEach(function (k) {
      var ctx = metroByKey[k];
      if (!ctx || !ctx.stations) return;
      ctx.stations.forEach(function (s) {
        s.csvNearest = false;
        s.walkableRealTourism = false;
      });
    });
    keys.forEach(function (metroKey) {
      if (!withProducts[metroKey]) return;
      var ctx = metroByKey[metroKey];
      if (!ctx || !ctx.stations) return;
      ctx.stations.forEach(function (st) {
        var hasNear = MASTER_CSV_PRODUCTS.some(function (p) {
          if (p.metroKey !== metroKey || !p.landmark) return false;
          return csvKmDistance(st.lat, st.lng, p.landmark.lat, p.landmark.lng) <= RADIUS_KM;
        });
        st.walkableRealTourism = hasNear;
        st.csvNearest = hasNear;
      });
    });
  }

  function formatPriceLine(p) {
    if (p.price == null || p.price === 0) return '가격문의';
    if (p.currency === 'USD') return '$' + p.price.toLocaleString('en-US');
    if (p.currency === 'EUR') return '€' + p.price.toLocaleString('en-US');
    return p.price.toLocaleString('ko-KR') + '원';
  }

  function masterProductHanatourHref(p) {
    return (
      'https://www.hanatour.com/?searchKeyword=' + encodeURIComponent(p.productCode || p.productName)
    );
  }

  function clearPoi(ctx) {
    if (ctx && ctx.stationPoiLayer) ctx.stationPoiLayer.clearLayers();
  }

  function buildDetachedProductMarkers() {
    MASTER_CSV_PRODUCTS.forEach(function (p) {
      if (p._csvMarker) {
        try {
          p._csvMarker.remove();
        } catch (e) {}
        p._csvMarker = null;
      }
    });
  }

  /**
   * 반경 이내 상품을 POI(landmark) 단위로 묶어 관광지 1곳 = 피커 1개. 가까운 관광지(역 기준) 순.
   * @returns {Array<{ name: string, lat: number, lng: number, distanceM: number, productRows: Array<{product, distanceM}> }>}
   */
  function getAttractionGroupsNearStation(metroKey, station) {
    if (!station) return [];
    var near = getMasterProductsNearStationInternal(metroKey, station);
    var buckets = Object.create(null);
    near.forEach(function (row) {
      var p = row.product;
      if (!p.landmark || p.landmark.lat == null || p.landmark.lng == null) return;
      var name = String(p.landmark.name != null ? p.landmark.name : 'POI')
        .trim() || 'POI';
      var lat = p.landmark.lat;
      var lng = p.landmark.lng;
      var key = name + '|' + lat.toFixed(5) + ',' + lng.toFixed(5);
      if (!buckets[key]) {
        buckets[key] = { name: name, lat: lat, lng: lng, rows: [] };
      }
      buckets[key].rows.push(row);
    });
    var out = Object.keys(buckets).map(function (k) {
      var b = buckets[k];
      b.rows.sort(function (a, c) {
        return a.distanceM - c.distanceM;
      });
      var dMin = b.rows[0].distanceM;
      return { name: b.name, lat: b.lat, lng: b.lng, distanceM: dMin, productRows: b.rows };
    });
    out.sort(function (a, c) {
      return a.distanceM - c.distanceM;
    });
    return out;
  }

  /**
   * 역 좌표 기준 반경 RADIUS_KM km 이내 CSV 상품(마스터 상품명·POI 매칭) 목록, 가까운 순.
   * @returns {Array<{ product: object, distanceM: number }>}
   */
  function getMasterProductsNearStationInternal(metroKey, station) {
    if (!station) return [];
    var out = [];
    MASTER_CSV_PRODUCTS.forEach(function (p) {
      if (p.metroKey !== metroKey || !p.landmark) return;
      var d = csvKmDistance(station.lat, station.lng, p.landmark.lat, p.landmark.lng);
      if (d <= RADIUS_KM) {
        out.push({ product: p, distanceM: Math.round(d * 1000) });
      }
    });
    out.sort(function (a, b) {
      return a.distanceM - b.distanceM;
    });
    return out;
  }

  function showMasterMarkersForStation(ctx, station) {
    clearPoi(ctx);
    if (typeof global.clearCsvPoiSelectionState === 'function') {
      try {
        global.clearCsvPoiSelectionState(ctx);
      } catch (e0) {}
    }
    if (ctx && ctx.map && ctx.map.closePopup) ctx.map.closePopup();
    var cityKey = global.currentCity != null && global.currentCity !== '' ? global.currentCity : ctx.key;
    if (cityKey !== ctx.key) return;
    var groups = getAttractionGroupsNearStation(cityKey, station);
    if (global.console && global.console.log) {
      global.console.log('역 주변 POI(관광지) 그룹: ' + groups.length + ' · 상품 행: ' + (groups.reduce(function (n, g) { return n + g.productRows.length; }, 0)));
    }
    if (typeof global.showCsvAttractionPickers === 'function') {
      global.showCsvAttractionPickers(ctx, station, groups);
    }
  }

  function countProductsByMetro() {
    var c = {};
    for (var ti = 0; ti < UI_TAB_SPECS.length; ti++) {
      c[UI_TAB_SPECS[ti].m] = 0;
    }
    MASTER_CSV_PRODUCTS.forEach(function (p) {
      if (p.landmark == null) return;
      if (c[p.metroKey] != null) c[p.metroKey]++;
    });
    return c;
  }

  function updateTabsFromCsv() {
    var c = countProductsByMetro();
    var visibleCity = getVisibleMetroTabKeysFromRawCsv();
    var any = false;
    for (var oi = 0; oi < UI_TAB_SPECS.length; oi++) {
      var o = UI_TAB_SPECS[oi];
      var btn = document.getElementById(o.el);
      if (btn) {
        var okProducts = c[o.m] >= 1;
        var okCityFilter = visibleCity[o.m] !== false;
        btn.hidden = !okProducts || !okCityFilter;
        if (okProducts && okCityFilter) any = true;
      }
    }
    if (!any) {
      for (var oi2 = 0; oi2 < UI_TAB_SPECS.length; oi2++) {
        var o2 = UI_TAB_SPECS[oi2];
        var b2 = document.getElementById(o2.el);
        if (b2) b2.hidden = false;
      }
    }
  }

  global.initMasterProductPipeline = function (metroByKey) {
    MASTER_CSV_PRODUCTS = loadMasterCsvProducts();
    global.MASTER_CSV_PRODUCTS = MASTER_CSV_PRODUCTS;
    global.countMasterCsv = function () {
      return MASTER_CSV_PRODUCTS.length;
    };
    if (metroByKey) {
      Object.keys(metroByKey).forEach(function (k) {
        var c = metroByKey[k];
        if (c) clearPoi(c);
      });
    }
    markStationsWithinProductRadius(metroByKey);
    buildDetachedProductMarkers();
    updateTabsFromCsv();
  };

  global.onStationClickShowMasterCsv = function (ctx, station) {
    showMasterMarkersForStation(ctx, station);
  };

  global.getMasterProductsNearStation = function (metroKey, station) {
    return getMasterProductsNearStationInternal(metroKey, station);
  };
  global.getAttractionGroupsNearStation = getAttractionGroupsNearStation;
  global.formatMasterProductPrice = formatPriceLine;
  global.getMasterProductHanatourHref = masterProductHanatourHref;
  global.RADIUS_KM_CSV = RADIUS_KM;

  global.clearMasterPoi = clearPoi;
  global.COORD_MAP = COORD_MAP;
  global.locationMap = locationMap;
  global.POI_CATALOG = POI_CATALOG;
  global.findPoiByProductName = findPoiByProductName;
  global.getVisibleMetroTabKeysFromRawCsv = getVisibleMetroTabKeysFromRawCsv;
  global.isMajorSubwayRepresentativeCity = isMajorSubwayRepresentativeCity;
  global.METRO_KEY_TO_KOREAN_SUBWAY_FILE = {
    london: '런던',
    newyork: '뉴욕',
    tokyo: '도쿄',
    bangkok: '방콕'
  };
  global.LEGACY_INLINE_METRO_KEYS = {
    london: 1,
    newyork: 1,
    tokyo: 1,
    bangkok: 1,
    osaka: 1,
    fukuoka: 1,
    beijing: 1,
    shanghai: 1,
    taipei: 1,
    singapore: 1,
    paris: 1,
    barcelona: 1,
    rome: 1,
    sydney: 1
  };
  global.getSubwayJsonFileNameForMetroKey = function (metroKey) {
    var stem = global.METRO_KEY_TO_KOREAN_SUBWAY_FILE[metroKey];
    if (!stem) return null;
    return stem + '_subway.json';
  };
})(window);
