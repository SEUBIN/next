/**
 * 런던/도쿄 HTML과 동일한 형식: lineId, name, color, outline, coords[[lat,lng]...], stationNames(역마다 1:1)
 * 궤도·역 위치는 관광 시인성용 근사치이며, 공사 구간·개통 변경은 반영되지 않을 수 있습니다.
 */
(function (g) {
  'use strict';

  function L(lineId, name, color, outline, coords, stationNames) {
    return {
      lineId: lineId,
      name: name,
      color: color,
      outline: outline || color,
      coords: coords,
      stationNames: stationNames || []
    };
  }

  g.METRO_EXTRA_LINE_DEFS = {
    /* 파리 (RATP Métro 주요: 시인성·색상) */
    paris: [
      L(
        'pa-m1',
        'M1',
        '#ffbe00',
        '#d49e00',
        [
          [48.891, 2.224],
          [48.888, 2.249],
          [48.875, 2.295],
          [48.865, 2.321],
          [48.857, 2.352],
          [48.845, 2.373]
        ],
        ['La Défense', 'Charles de Gaulle-Étoile', 'Champs-Élysées', 'Palais-Royal', 'Bastille', 'Vincennes']
      ),
      L(
        'pa-m4',
        'M4',
        '#a40069',
        '#6e0045',
        [
          [48.906, 2.334],
          [48.884, 2.344],
          [48.87, 2.346],
          [48.85, 2.337],
          [48.841, 2.321]
        ],
        ['Porte de Clignancourt', 'Barbès', 'Gare du Nord', 'Châtelet', 'Montparnasse']
      ),
      L('pa-m6', 'M6', '#6bb587', '#458060', [[48.852, 2.295], [48.858, 2.28], [48.863, 2.289], [48.86, 2.306]], [
        'Passy',
        'Trocadéro',
        'Kléber',
        'Charles de Gaulle-Étoile'
      ]),
      L(
        'pa-m8',
        'M8',
        '#d282be',
        '#9e5a8c',
        [
          [48.86, 2.448],
          [48.85, 2.41],
          [48.847, 2.373],
          [48.86, 2.352]
        ],
        ['Créteil', 'Gare de Lyon', 'Bastille', 'Opéra']
      ),
      L('pa-m12', 'M12', '#006ba6', '#004a73', [[48.91, 2.383], [48.888, 2.349], [48.87, 2.346], [48.84, 2.322]], [
        'Porte de la Chapelle',
        'Jules Joffrin',
        'Notre-Dame de Lorette',
        'Montparnasse'
      ])
    ],
    /* 오사카 메트로(주요 방사선) */
    osaka: [
      L(
        'os-mido',
        '御堂筋',
        '#e5171f',
        '#a30f16',
        [
          [34.81, 135.511],
          [34.775, 135.498],
          [34.704, 135.5],
          [34.67, 135.502]
        ],
        ['Shin-Osaka', 'Umeda', 'Shinsaibashi', 'Namba']
      ),
      L('os-chuo', '中央', '#019a66', '#016645', [[34.685, 135.502], [34.68, 135.507], [34.665, 135.502], [34.64, 135.485]], [
        'Honmachi',
        'Hommachi',
        'Nagahoribashi',
        'Bentencho'
      ]),
      L('os-tani', '谷町', '#9a7bb8', '#6a527d', [[34.71, 135.48], [34.695, 135.5], [34.675, 135.515], [34.66, 135.51]], [
        'Tenjimbashisuji6',
        'Minamimorimachi',
        'Tanimachi4',
        'Abeno'
      ]),
      L('os-senn', '千日前', '#ee86b0', '#b25e84', [[34.665, 135.502], [34.658, 135.506], [34.645, 135.506]], [
        'Namba',
        'Nippombashi',
        'Tsuruhashi'
      ])
    ],
    fukuoka: [
      L(
        'fu-kuko',
        '공항',
        '#f19c00',
        '#b06f00',
        [
          [33.59, 130.421],
          [33.585, 130.42],
          [33.57, 130.415],
          [33.56, 130.4]
        ],
        ['Fukuokakūkō', 'Shin-Fukuoka', 'Hakata', 'Gion']
      ),
      L('fu-hako', '箱崎', '#1bb267', '#117545', [[33.58, 130.4], [33.575, 130.39], [33.57, 130.38]], [
        'Hakata',
        'Gofukumachi',
        'Bakurocho'
      ])
    ],
    beijing: [
      L(
        'bj-l1',
        '1',
        '#c43b0d',
        '#8a2808',
        [
          [39.98, 116.327],
          [39.94, 116.372],
          [39.9, 116.398],
          [39.86, 116.417],
          [39.83, 116.434]
        ],
        ['Pingguoyuan', 'Xidan', 'Tiananmen West', 'Beijingzhan', 'Sihui']
      ),
      L('bj-l2', '2', '#0059b3', '#003d7a', [[39.99, 116.325], [39.97, 116.46], [39.88, 116.45], [39.85, 116.43]], [
        'Xizhimen',
        'Dongzhimen',
        'Jiuxianqiao',
        'Beijingzhan'
      ]),
      L('bj-l4', '4', '#008a5b', '#005a3d', [[39.99, 116.31], [39.97, 116.34], [39.93, 116.35], [39.87, 116.35]], [
        'Anheqiao',
        'Zhongguancun',
        'Haidian',
        'Gongzhufen'
      ]),
      L('bj-l5', '5', '#994878', '#6a3154', [[39.99, 116.3], [39.97, 116.38], [39.94, 116.42], [39.9, 116.44]], [
        'Tiantongyuan',
        'Lishuiqiao',
        'Hepingxi',
        'Dongdan'
      ])
    ],
    shanghai: [
      L(
        'sh-l1',
        '1',
        '#e3002b',
        '#9a001d',
        [
          [31.3, 121.47],
          [31.25, 121.44],
          [31.2, 121.43],
          [31.15, 121.4]
        ],
        ['Fujin Rd', 'Hengshan Rd', 'South Huangpi Rd', 'Xinzhuang']
      ),
      L('sh-l2', '2', '#82b816', '#5a800f', [[31.3, 121.44], [31.27, 121.47], [31.22, 121.5], [31.18, 121.5]], [
        'East Xujing',
        'Jing an Temple',
        'Lujiazui',
        'Longyang Rd'
      ]),
      L('sh-l10', '10', '#6f2277', '#4a1750', [[31.28, 121.48], [31.25, 121.5], [31.22, 121.5]], [
        'Hangzhong',
        'Laoximen',
        'Jiao Tong Uni'
      ])
    ],
    taipei: [
      L(
        'tp-red',
        'R',
        '#e50033',
        '#9a0022',
        [
          [25.2, 121.445],
          [25.17, 121.44],
          [25.1, 121.46],
          [25.04, 121.515],
          [24.99, 121.54]
        ],
        ['Tamsui', 'Shilin', 'Zhongshan', 'Taipei 101/World Trade Center', 'Xiangshan']
      ),
      L('tp-blue', 'BL', '#0070bd', '#004c82', [[25.08, 121.5], [25.06, 121.51], [25.04, 121.51], [25.02, 121.5]], [
        'Songshan',
        'Nanjing Fuxing',
        'Ximen',
        'Nanshijiao'
      ]),
      L('tp-green', 'G', '#008955', '#005a39', [[25.08, 121.56], [25.06, 121.55], [25.04, 121.52]], [
        'Xindian',
        'Gongguan',
        'Taipower Bldg'
      ]),
      L('tp-orange', 'O', '#f8b21c', '#b07f0f', [[25.1, 121.47], [25.06, 121.5], [25.03, 121.5]], [
        'Luzhou',
        'Minquan West Rd',
        'Guting'
      ])
    ],
    singapore: [
      L(
        'sg-ns',
        'NS',
        '#d42e12',
        '#8f1f0c',
        [
          [1.455, 103.82],
          [1.42, 103.83],
          [1.35, 103.845],
          [1.3, 103.86],
          [1.28, 103.86]
        ],
        ['Jurong East', 'Bukit Batok', 'Orchard', 'City Hall', 'Marina South']
      ),
      L('sg-ew', 'EW', '#009645', '#00612f', [[1.32, 103.76], [1.33, 103.8], [1.35, 103.86], [1.36, 103.89]], [
        'Boon Lay',
        'Clementi',
        'Paya Lebar',
        'Changi Airport'
      ]),
      L('sg-ne', 'NE', '#9016b0', '#5a0e70', [[1.31, 103.87], [1.29, 103.86], [1.28, 103.86]], [
        'HarbourFront',
        'Chinatown',
        'Hougang'
      ]),
      L('sg-ce', 'CC', '#f98821', '#b25f16', [[1.3, 103.8], [1.29, 103.86], [1.28, 103.86]], [
        'Buona Vista',
        'Bayfront',
        'Paya Lebar'
      ])
    ],
    barcelona: [
      L('bc-l1', 'L1', '#c40048', '#890032', [[41.49, 2.14], [41.45, 2.19], [41.42, 2.19], [41.38, 2.17]], [
        'Fondo',
        'Catalunya',
        'Urq.',
        'Hospital de Bellvitge'
      ]),
      L('bc-l2', 'L2', '#9331a0', '#662270', [[41.45, 2.25], [41.42, 2.19], [41.4, 2.17], [41.35, 2.14]], [
        'Badalona',
        'Sagrada Familia',
        'Passeig de Gràcia',
        'Paral·lel'
      ]),
      L('bc-l3', 'L3', '#00a550', '#006e36', [[41.46, 2.18], [41.44, 2.15], [41.41, 2.16], [41.37, 2.14]], [
        'Trinitat Nova',
        'Diagonal',
        'Drassanes',
        'Zona Universitària'
      ]),
      L('bc-l4', 'L4', '#fe8d00', '#b06100', [[41.45, 2.17], [41.42, 2.19], [41.4, 2.2], [41.35, 2.18]], [
        'Trinitat Vella',
        'Urquinaona',
        'Barceloneta',
        'Ciutadella Vila Olímpica'
      ])
    ],
    rome: [
      L('rm-a', 'A', '#f58220', '#aa5a16', [[41.98, 12.5], [41.95, 12.5], [41.92, 12.5], [41.89, 12.5], [41.86, 12.48]], [
        'Battistini',
        'Ottaviano',
        'Spagna',
        'Termini',
        'Anagnina'
      ]),
      L('rm-b', 'B', '#0069b1', '#004a7a', [[41.97, 12.54], [41.9, 12.52], [41.86, 12.48], [41.85, 12.47]], [
        'Jonio',
        'Bologna',
        'Colosseo',
        'Laurentina'
      ])
    ],
    sydney: [
      L('sy-t1', 'T1 Nth', '#f1b51c', '#a87b12', [[-33.7, 151.12], [-33.8, 151.18], [-33.87, 151.2], [-33.89, 151.22]], [
        'Hornsby',
        'Chatswood',
        'Gordon',
        'Central'
      ]),
      L('sy-t2', 'T2 Apx', '#ec7406', '#a34f04', [[-33.9, 151.18], [-33.91, 151.18], [-33.94, 151.17], [-33.95, 151.15]], [
        'Leppington',
        'Lidcombe',
        'Mascot',
        'T2'
      ]),
      L('sy-t4', 'T4 East', '#1e90ff', '#1563b3', [[-33.87, 151.2], [-33.89, 151.22], [-33.99, 151.08], [-34.04, 151.05]], [
        'Central',
        'Redfern',
        'Hurstville',
        'Waterfall'
      ]),
      L('sy-t8', 'T8 Sth', '#2f5f9a', '#1e416a', [[-33.9, 151.18], [-33.95, 151.14], [-34, 150.9]], [
        'Central',
        'Wolli Creek',
        'Campbelltown'
      ])
    ]
  };

  g.buildMetroStationsFromLineDefs = function (tourismStations, lineDefs) {
    var t0 = tourismStations || [];
    var degNear = 0.004;
    function near(a, b) {
      return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2)) < degNear;
    }
    var gen = [];
    lineDefs.forEach(function (def) {
      def.coords.forEach(function (coord, i) {
        if (!def.stationNames[i]) return;
        gen.push({
          id: 'gen-' + def.lineId + '-' + i,
          name: def.stationNames[i],
          lat: coord[0],
          lng: coord[1],
          tubeLineKey: def.lineId,
          lineColor: def.color,
          places: []
        });
      });
    });
    var filtered = gen.filter(function (g) {
      return !t0.some(function (t) {
        return t.tubeLineKey === g.tubeLineKey && near(t, g);
      });
    });
    return t0.concat(filtered);
  };
})(window);
