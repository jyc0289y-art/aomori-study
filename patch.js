#!/usr/bin/env node
/**
 * patch.js — index.src.html에 모든 수정사항을 한번에 적용
 */
const fs = require('fs');
let html = fs.readFileSync('index.src.html', 'utf8');
let changes = 0;

function replace(from, to, label) {
    if (!html.includes(from)) {
        console.error(`❌ NOT FOUND: ${label}`);
        return;
    }
    html = html.replace(from, to);
    changes++;
    console.log(`✅ ${label}`);
}

// === 1. CSS: iz-hero-img 클래스 추가 ===
replace(
    `        .izakaya-card {
            background: white;
            border-radius: 14px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.06);
            overflow: hidden;
            border-left: 4px solid var(--sake);
        }`,
    `        .izakaya-card {
            background: white;
            border-radius: 14px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.06);
            overflow: hidden;
            border-left: 4px solid var(--sake);
        }
        .iz-hero-img {
            width: 100%;
            height: 180px;
            object-fit: cover;
            display: block;
        }`,
    'CSS iz-hero-img'
);

// === 2. 이자카야/스낵바 이미지 추가 (Day 1) ===
const imgs = {
    '<!-- Idobata -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Views_at_night_in_April_of_2019_around_the_Ueno_neighborhood_in_Tokyo_19.jpg/640px-Views_at_night_in_April_of_2019_around_the_Ueno_neighborhood_in_Tokyo_19.jpg', '이자카야 골목 분위기'],
    '<!-- Icchoku -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Peque%C3%B1o_Bar_Japon%C3%A9s_%2851543924066%29.jpg/640px-Peque%C3%B1o_Bar_Japon%C3%A9s_%2851543924066%29.jpg', '소규모 이자카야 외관'],
    '<!-- Tsugaru Joppari -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Tsugaru-jamisen_Kaisenkaku_Asamushi_Onsen_Aomori_Japan06s5.jpg/640px-Tsugaru-jamisen_Kaisenkaku_Asamushi_Onsen_Aomori_Japan06s5.jpg', '쓰가루 샤미센 라이브 공연'],
    '<!-- Snack: New Michiko -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Sunakku_b%C4%81_in_Sukagawa.JPG/640px-Sunakku_b%C4%81_in_Sukagawa.JPG', '스낵바 외관'],
    '<!-- Snack: Daphne -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Inside_a_bar_in_Japan_-_2009.jpg/640px-Inside_a_bar_in_Japan_-_2009.jpg', '일본 바 내부'],
    // Day 2
    '<!-- Nebuta no kuni Takakyu -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/2007%E5%B9%B4%E3%80%81%E6%96%B0%E5%AE%BF%E3%81%AE%E5%B1%85%E9%85%92%E5%B1%8B%E3%81%AE%E5%80%8B%E5%AE%A4.jpg/640px-2007%E5%B9%B4%E3%80%81%E6%96%B0%E5%AE%BF%E3%81%AE%E5%B1%85%E9%85%92%E5%B1%8B%E3%81%AE%E5%80%8B%E5%AE%A4.jpg', '이자카야 개인실 분위기'],
    '<!-- Mitsuishi -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Nobu_Sake_Bottles_display_front.JPG/640px-Nobu_Sake_Bottles_display_front.JPG', '사케 보틀 디스플레이'],
    '<!-- Ninosuke -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Kanaiya_Chichibu_ac_%281%29.jpg/640px-Kanaiya_Chichibu_ac_%281%29.jpg', '전통 이자카야 외관'],
    '<!-- Snack: MyBoo -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Snack_near_Takadanobaba.jpg/640px-Snack_near_Takadanobaba.jpg', '스낵바 외관'],
    // Day 3
    '<!-- Fukuro -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Views_at_night_in_April_of_2019_around_the_Ueno_neighborhood_in_Tokyo_19.jpg/640px-Views_at_night_in_April_of_2019_around_the_Ueno_neighborhood_in_Tokyo_19.jpg', '대중 이자카야 거리'],
    '<!-- Ishiyaki -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Kanaiya_Chichibu_ac_%281%29.jpg/640px-Kanaiya_Chichibu_ac_%281%29.jpg', '전통 이자카야 외관'],
    '<!-- Snack: Lounge Bar Myu (new) + revisit -->': ['https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Inside_a_bar_in_Japan_-_2009.jpg/640px-Inside_a_bar_in_Japan_-_2009.jpg', '라운지바 내부'],
};

for (const [comment, [src, alt]] of Object.entries(imgs)) {
    const imgTag = `\n            <img class="iz-hero-img" src="${src}" alt="${alt}" loading="lazy">`;
    const snackClass = comment.includes('Snack') || comment.includes('Lounge');
    const cardClass = snackClass ? 'izakaya-card snack fade-in' : 'izakaya-card fade-in';
    const from = `        ${comment}\n        <div class="${cardClass}">\n            <div class="izakaya-inner">`;
    const to = `        ${comment}\n        <div class="${cardClass}">${imgTag}\n            <div class="izakaya-inner">`;
    replace(from, to, `Image: ${comment}`);
}

// === 3. 섹션 퀴즈 slice(0, 10) 제거 ===
replace(
    `const shuffled = shuffle(data).slice(0, 10); // 최대 10문제`,
    `const shuffled = shuffle(data); // 전체 문제 출제`,
    'Remove slice(0,10) limit'
);

// === 4. 여행 퀴즈를 sqData 기반으로 확장 ===
const travelQuizOld = `// ===== TRAVEL QUIZ =====
const travelQuizData = [`;
const travelQuizOldEnd = `    { q: '가게를 나갈 때 하는 쓰가루벤 인사는?', options: ['おばんです！', 'めじゃ〜！', 'せばだば、まだな！', 'わいは！'], answer: 2, explanation: '「せばだば、まだな！」= 그럼, 또 보자! 이자카야·스낵바를 나갈 때 쓰면 감동 포인트.' },
];`;

const travelQuizNew = `// ===== TRAVEL QUIZ (sqData에서 여행 문제 자동 수집 + 추가 문제) =====
const travelQuizData = (function() {
    const fromSq = [];
    Object.values(sqData).forEach(day => {
        day.forEach(item => {
            if (!item.hint) fromSq.push({ q: item.q, options: item.options, answer: item.answer, explanation: item.exp, video: item.video, videoDesc: item.videoDesc });
        });
    });
    const extra = [
        { q: '아오모리 3대 지자케(地酒)가 아닌 것은?', options: ['田酒(덴슈)', '豊盃(호하이)', '陸奥八仙(무쓰핫센)', '獺祭(닷사이)'], answer: 3, explanation: '獺祭(닷사이)는 야마구치현의 술입니다. 아오모리 3대 지자케는 田酒·豊盃·陸奥八仙.' },
        { q: '아오모리역에서 안카타(安方) 이자카야 골목까지의 거리는?', options: ['도보 2~5분', '도보 15분', '버스 10분', '택시 필요'], answer: 0, explanation: '안카타는 아오모리역에서 도보 2~5분 거리의 이자카야 밀집 지역입니다.' },
        { q: '혼마치(本町) 스낵바 거리까지 택시비는?', options: ['¥500~700', '¥700~1,000', '¥1,500~2,000', '¥2,000 이상'], answer: 1, explanation: '아오모리역에서 혼마치까지 택시 ¥700~1,000. 아오모리는 택시비가 저렴한 편입니다.' },
        { q: '아사무시 온천까지 아오이모리 철도 요금은?', options: ['¥210', '¥420', '¥630', '¥840'], answer: 1, explanation: '青い森鉄道(아오이모리 철도)로 약 20분, ¥420입니다.' },
        { q: '네부타 축제의 정식 개최 기간은?', options: ['6월 1~7일', '7월 1~7일', '8월 2~7일', '9월 1~7일'], answer: 2, explanation: '아오모리 네부타 축제는 매년 8월 2일~7일에 개최됩니다.' },
    ];
    return [...fromSq, ...extra];
})();`;

const travelStart = html.indexOf(travelQuizOld);
const travelEnd = html.indexOf(travelQuizOldEnd) + travelQuizOldEnd.length;
if (travelStart > 0 && travelEnd > travelStart) {
    html = html.substring(0, travelStart) + travelQuizNew + html.substring(travelEnd);
    changes++;
    console.log('✅ Travel quiz expanded');
} else {
    console.error('❌ Travel quiz section not found');
}

// === 5. 일본어 퀴즈를 sqData 기반으로 확장 ===
const langQuizOld = `// ===== JAPANESE LANGUAGE QUIZ =====
const langQuizData = [`;
const langQuizOldEnd = `    { q: '「常連になる」는?', hint: 'じょうれんになる', options: ['직원이 되다', '단골이 되다', '친구가 되다', '사장이 되다'], answer: 1, explanation: '常連 = 단골. 3박이면 같은 스낵바를 재방문하여 단골이 될 수 있습니다!' },
];`;

const langQuizNew = `// ===== JAPANESE LANGUAGE QUIZ (sqData에서 일본어 문제 자동 수집 + 단어표 기반 추가) =====
const langQuizData = (function() {
    const fromSq = [];
    Object.values(sqData).forEach(day => {
        day.forEach(item => {
            if (item.hint) fromSq.push({ q: item.q, hint: item.hint, options: item.options, answer: item.answer, explanation: item.exp });
        });
    });
    const extraFromSq = [];
    Object.values(sqData).forEach(day => {
        day.forEach(item => {
            if (!item.hint && /[\u300C\u300D]/.test(item.q)) extraFromSq.push({ q: item.q, hint: '', options: item.options, answer: item.answer, explanation: item.exp });
        });
    });
    const extra = [
        { q: '刺身', hint: 'さしみ', options: ['튀김', '생선회', '초밥', '조림'], answer: 1, explanation: '刺身(さしみ) = 사시미, 생선회. 일본 이자카야의 대표 안주.' },
        { q: '雰囲気', hint: 'ふんいき', options: ['날씨', '분위기', '음악', '맛'], answer: 1, explanation: '雰囲気(ふんいき) = 분위기. 리뷰에서 가장 자주 나오는 단어 중 하나.' },
        { q: '予約', hint: 'よやく', options: ['주문', '예약', '결제', '취소'], answer: 1, explanation: '予約(よやく) = 예약. 인기 이자카야는 予約必須(예약 필수).' },
        { q: '美味しい', hint: 'おいしい', options: ['맛없는', '비싼', '맛있는', '싼'], answer: 2, explanation: '美味しい(おいしい) = 맛있는. 美味い(うまい)는 같은 뜻의 구어체.' },
        { q: '乾杯', hint: 'かんぱい', options: ['건배', '주문', '계산', '감사'], answer: 0, explanation: '乾杯(かんぱい) = 건배! 이자카야 첫 잔에서 외치는 필수 표현.' },
        { q: '温泉', hint: 'おんせん', options: ['수영장', '사우나', '온천', '목욕탕'], answer: 2, explanation: '温泉(おんせん) = 온천. 浅虫温泉(아사무시 온천)은 아오모리의 대표 온천.' },
        { q: '郷土料理', hint: 'きょうどりょうり', options: ['해외 요리', '퓨전 요리', '향토 요리', '패스트푸드'], answer: 2, explanation: '郷土料理(きょうどりょうり) = 향토 요리. 아오모리의 郷土料理는 せんべい汁, 石焼料理 등.' },
        { q: '「一杯やる」는 어떤 뜻?', hint: 'いっぱいやる', options: ['한 잔 하다(술)', '많이 먹다', '한 번 해보다', '조금 쉬다'], answer: 0, explanation: '一杯やる = 한 잔 하다. 술을 마시다의 캐주얼 표현. 「軽く一杯」= 가볍게 한 잔' },
        { q: '「迫力が全然違う」', hint: 'はくりょくがぜんぜんちがう', options: ['가격이 완전 다르다', '박력이 완전히 다르다', '크기가 전혀 다르다', '인기가 완전 다르다'], answer: 1, explanation: '迫力 = 박력, 압도감. 全然違う = 완전히 다르다. 실물을 보고 감동받을 때 자주 사용.' },
        { q: '贅沢すぎる', hint: 'ぜいたくすぎる', options: ['너무 비싸다', '너무 호사스럽다', '너무 맛없다', '너무 많다'], answer: 1, explanation: '贅沢すぎる = 너무 사치스럽다/호사스럽다. 맛있는 것을 먹었을 때 감탄하는 리얼 표현.' },
        { q: '新鮮', hint: 'しんせん', options: ['신선한', '오래된', '달콤한', '매운'], answer: 0, explanation: '新鮮(しんせん) = 신선한. 해산물 리뷰에 빠지지 않는 핵심 형용사.' },
        { q: '絶品', hint: 'ぜっぴん', options: ['보통 맛', '맛없는', '절품(최고의 맛)', '특이한 맛'], answer: 2, explanation: '絶品(ぜっぴん) = 절품, 최고 수준의 맛. 리뷰에서 최고 칭찬 표현.' },
        { q: '「お土産選びに迷うくらい種類が豊富」', hint: '', options: ['기념품을 빨리 골랐다', '기념품이 별로 없었다', '기념품 고르다가 헤맬 정도로 종류가 풍부', '기념품이 비싸서 망설였다'], answer: 2, explanation: '迷うくらい = 헤맬 정도로. 豊富 = 풍부한. A-FACTORY 리뷰에서 자주 보이는 표현.' },
        { q: '飲み放題', hint: 'のみほうだい', options: ['금주', '음료 무제한', '비싼 술', '할인 메뉴'], answer: 1, explanation: '飲み放題(のみほうだい) = 노미호다이, 음료 무제한. みゅう는 120분 飲み放題 ¥4,000.' },
        { q: '銭湯', hint: 'せんとう', options: ['은행', '공중목욕탕', '병원', '학교'], answer: 1, explanation: '銭湯(せんとう) = 동네 공중목욕탕. Day 3 아침에 朝風呂(아침 목욕) 추천!' },
    ];
    return [...fromSq, ...extraFromSq, ...extra];
})();`;

const langStart = html.indexOf(langQuizOld);
const langEnd = html.indexOf(langQuizOldEnd);
if (langStart > 0 && langEnd > langStart) {
    html = html.substring(0, langStart) + langQuizNew + html.substring(langEnd + langQuizOldEnd.length);
    changes++;
    console.log('✅ Lang quiz expanded');
} else {
    console.error('❌ Lang quiz section not found');
    console.log('  Looking for:', langQuizOldEnd.substring(0, 50));
}

fs.writeFileSync('index.src.html', html, 'utf8');
console.log(`\n✅ ${changes}개 수정 완료`);
