#!/usr/bin/env node
/**
 * build.js — 빌드 타임 pre-tokenization
 *
 * kuromoji.js로 모든 일본어 텍스트를 미리 토큰화하여
 * 런타임 사전 로딩(~20MB)을 제거한다.
 *
 * Usage: node build.js
 * Input:  index.html (원본, kuromoji 런타임 코드 포함)
 * Output: index.html (토큰화 완료, kuromoji 런타임 코드 제거)
 *
 * 원본 백업: index.src.html
 */

const fs = require('fs');
const path = require('path');
const kuromoji = require('kuromoji');
const cheerio = require('cheerio');

// ===== koDict — HTML에서 추출 (빌드 타임용) =====
const koDict = {
    '本州':'혼슈 — 일본 본토의 가장 큰 섬','最北端':'최북단','東北':'도호쿠 — 일본 동북부 지방',
    '韓国':'한국','観光客':'관광객','地元':'현지, 그 지역','人々':'사람들','外国人':'외국인',
    '好奇心':'호기심','好意':'호의','寡黙':'과묵 — 말이 적음','温かい':'따뜻한',
    '居酒屋':'이자카야 — 일본식 선술집','地酒':'지자케 — 그 지역 양조 술','酒蔵':'양조장',
    '打ち解ける':'마음을 열다, 친해지다','桜':'벚꽃','肌寒い':'살짝 쌀쌀한',
    '雰囲気':'분위기','会話':'대화','疲労':'피로','消費':'소비','気温':'기온',
    '開花':'개화','満喫':'만끽 — 충분히 즐기다','古川':'후루카와','市場':'시장',
    '魚菜':'어채 — 생선과 채소','食券':'식권','海鮮丼':'해산물 덮밥','刺身':'사시미 — 생선회',
    '台所':'부엌','贅沢':'사치, 호사','気さく':'스스럼없는, 친근한','仕組み':'구조, 시스템',
    '特産品':'특산품','試飲':'시음','醸造所':'양조장','飲み比べ':'비교 시음',
    'お土産':'기념품, 선물','品種':'품종','非加熱':'비가열','迷う':'헤매다, 고민하다',
    '豊富':'풍부한','祭り':'축제','山車':'다시 — 축제 장식 수레','実物':'실물',
    '博物館':'박물관','迫力':'박력, 압도감','盛り上がる':'분위기가 고조되다',
    '掛け声':'구호','展示':'전시','話題':'화제','味わえる':'맛볼 수 있다',
    '貴重':'귀중한','大衆':'대중','煮込み':'조림','名物':'명물',
    'カウンター':'카운터','看板':'간판','三味線':'샤미센 — 일본 전통 악기',
    '生演奏':'생연주','郷土料理':'향토 요리','常連':'단골','居心地':'거주 환경, 편안함',
    '一杯':'한 잔','洗練':'세련','航空便':'항공편','到着':'도착','運行':'운행',
    '乗車':'승차','徒歩':'도보','市内':'시내','移動':'이동','伝統':'전통',
    '挑戦':'도전','自然':'자연','熱心':'열심','最高':'최고','歴史':'역사',
    '制作':'제작','過程':'과정','労働者':'노동자','価格':'가격','積極的':'적극적',
    '観光':'관광','名所':'명소','初日':'첫날','周辺':'주변','青森':'아오모리',
    '駅':'역','店主':'주인','種類':'종류','人気':'인기','現金':'현금',
    '見学':'견학','全然':'완전히','違う':'다르다','文化':'문화','地域':'지역',
    '構造':'구조','小規模':'소규모','中心':'중심','店内':'점내',
    'おすすめ':'추천','おしゃれ':'세련된, 멋있는','初めて':'처음',
    'ねぶた':'네부타 — 아오모리의 대표 축제','シードル':'시드르 — 사과 발포주',
    'りんご':'사과','ジェラート':'젤라토','カラオケ':'가라오케','スナック':'스낵바',
    'ママさん':'마마상 — 스낵바 여주인','リーズナブル':'합리적인 가격','ローカル':'로컬, 현지',
    'サラリーマン':'직장인','リアル':'리얼, 진짜','メニュー':'메뉴','ライブ':'라이브',
    'せんべい汁':'전병국','シンボル':'심볼, 상징','イベント':'이벤트',
    '非公式':'비공식','観光案内所':'관광안내소',
    '乗り場':'승강장','利用':'이용','可能':'가능','空港':'공항',
    '夜':'밤','朝食':'아침식사','散歩':'산책','安方':'야스카타','本町':'혼마치',
    'エリア':'에리어, 구역','スタート':'스타트','座る':'앉다','座って':'앉아서',
    '最初':'처음, 최초','限り':'한없이','お酒':'술','多い':'많은',
    '飲み':'마시기','場':'장소','店':'가게','空い':'비어 있는',
    'ゆったり':'여유롭게','酒':'술','話':'이야기','広がる':'퍼지다, 넓어지다',
    '天気':'날씨','下旬':'하순','中旬':'중순','今回':'이번','旅':'여행',
    '見られ':'볼 수 있는','代わり':'대신','春':'봄','静か':'조용한',
    '暖かい':'따뜻한','必須':'필수','市民':'시민','買っ':'사서',
    '店舗':'점포','回り':'돌며','好き':'좋아하는','選ん':'골라서',
    '自分':'자신','作る':'만들다','体験':'체험','聞く':'듣다',
    '親切':'친절','喜ば':'기뻐하','言う':'말하다',
    '入れ':'들어가다','追加':'추가','前':'앞',
    '特産品':'특산품','お菓子':'과자','階':'층',
    '使っ':'사용한','写真':'사진','伝わら':'전달되다',
    '子供':'아이','大人':'어른','一緒':'함께','叫ぶ':'외치다',
    '感動':'감동','経験':'경험','混雑':'혼잡','平日':'평일',
    '必見':'필견, 꼭 봐야 할','素晴らしい':'훌륭한','圧倒的':'압도적',
    '見応え':'볼 만한 가치','充実':'충실','営業':'영업','定休日':'정기 휴일',
    '予約':'예약','不要':'불필요','必要':'필요','注文':'주문',
    '料理':'요리','美味しい':'맛있는','新鮮':'신선한','食べ':'먹다',
    '楽しめる':'즐길 수 있다',
    '落ち着い':'차분한','賑やか':'활기찬','昔':'옛날','懐かしい':'그리운',
    '温泉':'온천','旅館':'료칸, 여관','宿泊':'숙박','予算':'예산',
    '交通':'교통','バス':'버스','タクシー':'택시','電車':'전차',
    '時間':'시간','分':'분','円':'엔','約':'약, 대략',
    '席':'좌석','熟成':'숙성','黒味噌':'흑된장',
    '毎晩':'매일 밤','郷土':'향토','演奏':'연주',
    '爆発':'폭발','座れ':'앉을 수 있다','最前列':'맨 앞줄',
    '観覧席':'관람석','軽快':'경쾌','津軽弁':'쓰가루벤 — 쓰가루 방언',
    '魅力的':'매력적','旅行':'여행',
    '情報':'정보','グルメ':'맛집, 미식','ベテラン':'베테랑','キャリア':'경력',
    '営む':'운영하다','隠れた':'숨겨진','詳しい':'상세한, 잘 아는',
    '絶品':'절품 — 최고 수준의 맛','大満足':'대만족','柔らかい':'부드러운',
    '素朴':'소박한','品質':'품질','間違い':'틀림없는','串':'꼬치',
    '軽く':'가볍게','テレビ':'TV','ぴったり':'딱, 안성맞춤','コスパ':'가성비(코스트 퍼포먼스)',
    '最強':'최강','旨味':'감칠맛','美味い':'맛있는 (구어체)','タレ':'타레 — 양념 소스',
    '清潔感':'청결감','落ち着ける':'편안한, 차분한','出張族':'출장족',
    '風情':'정취, 운치','たっぷり':'듬뿍, 가득','語り部':'이야기꾼',
    '民謡':'민요','ボリューム':'볼륨, 양','手軽':'간편한, 부담 없는',
    'お腹いっぱい':'배부르게','クオリティ':'퀄리티','値段':'가격',
    '外観':'외관','清潔':'청결','居心地がいい':'편안한, 있기 좋은',
    '気さくに':'스스럼없이','迎える':'맞이하다','ちゃんと':'제대로, 확실히',
    '初心者':'초심자, 초보','安心':'안심','ボトル':'보틀','オブジェ':'오브제',
    '優雅':'우아한','まさに':'그야말로, 바로',
    '空間':'공간','社交的':'사교적','仲良く':'사이 좋게','自然と':'자연스럽게',
    '温かく':'따뜻하게','常連さん':'단골 손님',
    '変わらない':'변하지 않는','注文する':'주문하다','食べた':'먹은',
    '寝かせた':'재운, 숙성시킨','深い':'깊은','味わい':'맛, 풍미',
    'たまらない':'참을 수 없는, 최고인','独特':'독특한','生きてる':'살아있는',
    '本当に':'정말로','近く':'근처','ビジネスホテル':'비즈니스호텔',
    '目の前':'눈앞','聴かせて':'들려주어','貝焼き':'가이야키 — 조개구이',
    '味噌':'미소 — 된장','じゃっぱ汁':'잣파지루 — 생선 아라 국',
    '香り':'향기','昭和':'쇼와 — 일본 연호(1926~1989)',
    '入ると':'들어가면','説明':'설명','項目':'항목','透明':'투명',
    '料金':'요금','入れる':'들어갈 수 있다','並べられた':'늘어놓은',
    '通じて':'통해서','他':'다른','お客さん':'손님',
    '割':'할(비율)','客':'손님',
    '寝かせ':'재우다, 숙성시키다','レバー':'레바 — 간',
    'しっかり':'확실히, 제대로','ドリンク':'드링크, 음료','別':'별도',
    '浅虫':'아사무시 — 아오모리시의 온천 지구','温泉街':'온천 마을','海辺':'해변',
    '公衆浴場':'공중목욕탕','散策':'산책',
    '足湯':'족탕 — 발만 담그는 온천','餅':'떡, 모찌',
    '水族館':'수족관','海洋':'해양','生物':'생물','食堂':'식당','定食':'정식',
    '昼飲み':'낮술','活気':'활기','予約必須':'예약 필수',
    '凝縮':'농축, 응축','厚み':'두께','高品質':'고품질',
    '印象的':'인상적','聖地':'성지',
    '利き酒':'시음 — 여러 술을 비교하며 맛보기','大型':'대형','規模':'규모',
    '看板メニュー':'간판 메뉴, 대표 메뉴','郷土料理の真髄':'향토 요리의 정수',
    '明朗会計':'명랑 회계 — 투명한 가격 체계','姉妹店':'자매점','大歓迎':'대환영',
    'おもてなし':'환대, 접대 — 일본식 호스피탈리티',
    '飲み放題':'노미호다이 — 음료 무제한','銭湯':'센토 — 동네 공중목욕탕',
    '朝風呂':'아사부로 — 아침 목욕','喫茶店':'킷사텐 — 옛날 스타일 다방',
    '渋い':'떫은 / 시크한, 멋지게 낡은 (칭찬)','お通し':'오토시 — 이자카야 기본 안주',
    '圧巻':'압권 — 압도적으로 훌륭한','ぽかぽか':'따뜻해지는 느낌 (의태어)',
    '石焼':'돌구이','沸き上がる':'끓어오르다','爆発的':'폭발적',
    '送別会':'송별회','紅鮭':'홍연어','白煮':'백자 조림',
    '大衆居酒屋':'대중 이자카야','正統派':'정통파',
    '2次会':'2차 (가게를 옮겨 마시기)','3次会':'3차',
    'ラウンジ':'라운지','電子マネー':'전자 머니','ライブ公演':'라이브 공연',
    '馴染み':'나지미 — 익숙함, 단골','リムジンバス':'리무진 버스',
    '荷物':'짐','ギリギリ':'겨우겨우, 아슬아슬',
    '動線':'동선 — 이동 경로','美術館':'미술관','遺跡':'유적','市営バス':'시영 버스',
    'お年寄り':'어르신','入浴':'입욕, 목욕','興味津々':'흥미진진',
    '社交場':'사교장','挨拶':'인사',
    '記念品':'기념품',
};

const posKo = {
    '名詞':'명사','動詞':'동사','形容詞':'형용사','形容動詞':'형용동사',
    '副詞':'부사','連体詞':'연체사','接頭詞':'접두사','感動詞':'감탄사',
    'フィラー':'필러','記号':'기호','助詞':'조사','助動詞':'조동사',
    '接続詞':'접속사','接尾辞':'접미사'
};

function kataToHira(str) {
    return str.replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

const skipPos = new Set(['助詞','助動詞','記号','接続詞']);
const skipSurface = new Set(['、','。','（','）','「','」','・','！','？','〜','～','―','—',
    'の','は','が','を','に','で','と','も','や','へ','から','まで','より','か','な','ね',
    'よ','わ','さ','ぞ','ぜ','て','た','だ','れ','ら','り','る','い','う','え','お',
    'し','す','せ','そ','ば','け','こ','き','く','っ','ん','、','。','…','　',' ',
    '1','2','3','4','5','6','7','8','9','0','～','〜','−','\n']);

function shouldShowTip(token) {
    if (skipSurface.has(token.surface_form)) return false;
    if (token.surface_form.length === 1 && /[ぁ-ん]/.test(token.surface_form)) return false;
    if (skipPos.has(token.pos)) return false;
    if (/^[0-9０-９\s.,、。！？]+$/.test(token.surface_form)) return false;
    if (/^[ぁ-ん]+$/.test(token.surface_form) && !koDict[token.surface_form]) return false;
    return true;
}

function buildTipData(token) {
    const reading = token.reading ? kataToHira(token.reading) : '';
    const surface = token.surface_form;
    const basic = token.basic_form && token.basic_form !== surface ? token.basic_form : '';
    const ko = koDict[surface] || koDict[basic] || '';
    const pos = !ko && token.pos ? (posKo[token.pos] || token.pos) : '';
    return { reading, basic, ko, surface, pos };
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// テキストをトークン化してHTMLを生成
function tokenizeText(text, tokenizer) {
    if (!text.trim()) return text;
    if (!/[\u3000-\u9FFF\uF900-\uFAFF]/.test(text)) return escapeHtml(text);

    const tokens = tokenizer.tokenize(text);
    let html = '';
    tokens.forEach(token => {
        const escaped = escapeHtml(token.surface_form);
        if (shouldShowTip(token)) {
            const d = buildTipData(token);
            const attrs = [];
            if (d.reading && d.reading !== d.surface) attrs.push(`data-r="${escapeHtml(d.reading)}"`);
            if (d.ko) attrs.push(`data-m="${escapeHtml(d.ko)}"`);
            if (d.basic) attrs.push(`data-b="${escapeHtml(d.basic)}"`);
            if (d.pos) attrs.push(`data-p="${escapeHtml(d.pos)}"`);
            html += `<span class="jw" ${attrs.join(' ')}>${escaped}</span>`;
        } else {
            html += escaped;
        }
    });
    return html;
}

// ===== MAIN =====
async function main() {
    const htmlPath = path.join(__dirname, 'index.html');
    const backupPath = path.join(__dirname, 'index.src.html');

    // 원본 백업
    if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(htmlPath, backupPath);
        console.log('✅ 원본 백업: index.src.html');
    }

    // 원본에서 작업 (이미 빌드된 파일이 아닌 소스에서)
    const sourceHtml = fs.readFileSync(backupPath, 'utf8');

    console.log('⏳ kuromoji 사전 로드 중...');
    const tokenizer = await new Promise((resolve, reject) => {
        kuromoji.builder({
            dicPath: path.join(__dirname, 'node_modules/kuromoji/dict/')
        }).build((err, t) => err ? reject(err) : resolve(t));
    });
    console.log('✅ kuromoji 사전 로드 완료');

    const $ = cheerio.load(sourceHtml, { decodeEntities: false });

    // 1. 정적 일본어 요소 토큰화
    const selectors = [
        '.ja', '.expr-original', '.timestamp-table td',
        '.vid-title', '.vid-meta', '.vid-reason',
        '.review-item .ja', '.note-expr', '.note-desc',
        '.expr-point', '.vocab-table td:first-child'
    ];

    let tokenizedCount = 0;

    selectors.forEach(sel => {
        $(sel).each(function() {
            const el = $(this);
            // 이미 토큰화된 요소 스킵
            if (el.attr('data-jw-done')) return;

            processElement(el, $, tokenizer);
            el.attr('data-jw-done', '1');
            tokenizedCount++;
        });
    });
    console.log(`✅ ${tokenizedCount}개 요소 토큰화 완료`);

    // 2. sqData 퀴즈 콘텐츠 토큰화
    // sqData의 텍스트를 토큰화된 HTML로 변환
    const sqDataMatch = sourceHtml.match(/const sqData = \{[\s\S]*?\n\};/);
    if (sqDataMatch) {
        // sqData를 eval로 추출
        let sqDataStr = sqDataMatch[0];
        const sqDataBody = sqDataStr.replace('const sqData = ', '').replace(/;\s*$/, '');
        const sqData = eval('(' + sqDataBody + ')');

        // 각 퀴즈 항목의 일본어 텍스트를 토큰화
        for (const dayKey of Object.keys(sqData)) {
            for (const item of sqData[dayKey]) {
                item.qHtml = tokenizeText(item.q, tokenizer);
                item.hintHtml = item.hint ? tokenizeText(item.hint, tokenizer) : '';
                item.optionsHtml = item.options.map(opt => tokenizeText(opt, tokenizer));
                item.expHtml = tokenizeText(item.exp, tokenizer);
            }
        }

        // sqData를 새 버전으로 교체 (HTML 포함)
        const newSqData = 'const sqData = ' + JSON.stringify(sqData, null, 4)
            .replace(/\\"/g, '"')  // JSON이 이스케이프한 따옴표 복원은 하면 안 됨
            + ';';
        // 실제로는 JSON.stringify가 제대로 이스케이프하므로 그대로 사용
        const newSqDataClean = 'const sqData = ' + jsonToJs(sqData) + ';';

        console.log(`✅ sqData 퀴즈 ${Object.keys(sqData).length}개 Day 토큰화 완료`);
    }

    // 3. 런타임 kuromoji 관련 코드 제거
    let outputHtml = $.html();

    // #jw-loading 인디케이터 제거
    outputHtml = outputHtml.replace(/<div id="jw-loading"[^>]*>.*?<\/div>/s, '');

    // koDict ~ applyKuromoji 함수 전체 제거 (hover dictionary 섹션)
    outputHtml = outputHtml.replace(
        /\/\/ ===== HOVER DICTIONARY — kuromoji\.js 자동 형태소 분석 =====[\s\S]*?\/\/ 로딩 표시 제거\n\s*const indicator = document\.getElementById\('jw-loading'\);\n\s*if \(indicator\) indicator\.style\.display = 'none';\n\}/,
        '// ===== HOVER DICTIONARY — 빌드 타임 토큰화 완료, 런타임 코드 제거됨 ====='
    );

    // kuromoji.js 동적 로드 블록 제거
    outputHtml = outputHtml.replace(
        /\/\/ kuromoji\.js 동적 로드[\s\S]*?document\.head\.appendChild\(script\);\n\}\)\(\);/,
        '// kuromoji.js — 빌드 타임에 토큰화 완료, 런타임 로드 불필요'
    );

    // window._jwTokenizer 참조 제거 (sqShow, sqAnswer 내)
    outputHtml = outputHtml.replace(
        /\s*\/\/ 퀴즈 동적 콘텐츠에 호버 사전 적용\n\s*if \(window\._jwTokenizer\) applyKuromoji\(window\._jwTokenizer\);/g,
        ''
    );
    outputHtml = outputHtml.replace(
        /\s*\/\/ 해설 텍스트에도 호버 사전 적용\n\s*if \(window\._jwTokenizer\) applyKuromoji\(window\._jwTokenizer\);/g,
        ''
    );

    // sqShow에서 q.q → q.qHtml, q.hint → q.hintHtml, opt → q.optionsHtml[i] 사용
    outputHtml = outputHtml.replace(
        /html \+= `<div class="sq-q">\$\{q\.q\}\$\{q\.hint \? ` <span class="sq-hint">\$\{q\.hint\}<\/span>` : ''\}<\/div>`;/,
        'html += `<div class="sq-q">${q.qHtml || q.q}${q.hintHtml ? ` <span class="sq-hint">${q.hintHtml}</span>` : (q.hint ? ` <span class="sq-hint">${q.hint}</span>` : \'\')}</div>`;'
    );
    outputHtml = outputHtml.replace(
        /html \+= `<div class="sq-opt" onclick="sqAnswer\('\$\{id\}',\$\{i\},this\)">\$\{opt\}<\/div>`;/,
        'html += `<div class="sq-opt" onclick="sqAnswer(\'${id}\',${i},this)">${q.optionsHtml ? q.optionsHtml[i] : opt}</div>`;'
    );

    // sqAnswer에서 q.exp → q.expHtml 사용
    outputHtml = outputHtml.replace(
        /let expHtml = q\.exp;/,
        'let expHtml = q.expHtml || q.exp;'
    );

    // sqData 교체 (토큰화된 버전으로)
    if (sqDataMatch) {
        const sqDataSrc = sourceHtml.match(/const sqData = \{[\s\S]*?\n\};/)[0];
        // sqData를 eval로 다시 추출하고 토큰화
        const sqDataBody2 = sqDataSrc.replace('const sqData = ', '').replace(/;\s*$/, '');
        const sqData = eval('(' + sqDataBody2 + ')');
        for (const dayKey of Object.keys(sqData)) {
            for (const item of sqData[dayKey]) {
                item.qHtml = tokenizeText(item.q, tokenizer);
                item.hintHtml = item.hint ? tokenizeText(item.hint, tokenizer) : '';
                item.optionsHtml = item.options.map(opt => tokenizeText(opt, tokenizer));
                item.expHtml = tokenizeText(item.exp, tokenizer);
            }
        }
        const newSqDataStr = 'const sqData = ' + jsonToJs(sqData) + ';';
        outputHtml = outputHtml.replace(/const sqData = \{[\s\S]*?\n\};/, newSqDataStr);
    }

    fs.writeFileSync(htmlPath, outputHtml, 'utf8');

    const srcSize = (fs.statSync(backupPath).size / 1024).toFixed(0);
    const outSize = (fs.statSync(htmlPath).size / 1024).toFixed(0);
    console.log(`\n📊 결과:`);
    console.log(`   원본: ${srcSize} KB`);
    console.log(`   빌드: ${outSize} KB`);
    console.log(`   런타임 사전 제거: ~20 MB 절약`);
    console.log(`\n✅ 빌드 완료! index.html이 업데이트되었습니다.`);
}

// cheerio 요소 내의 텍스트 노드를 토큰화
function processElement(el, $, tokenizer) {
    const contents = el.contents();
    contents.each(function() {
        const node = $(this);
        if (this.type === 'text') {
            const text = this.data;
            if (!text.trim()) return;
            if (!/[\u3000-\u9FFF\uF900-\uFAFF]/.test(text)) return;

            const html = tokenizeText(text, tokenizer);
            if (html !== escapeHtml(text)) {
                // 텍스트 노드를 토큰화된 HTML로 교체
                node.replaceWith(html);
            }
        } else if (this.type === 'tag') {
            // .jw나 .jw-tip 내부는 스킵
            if (node.hasClass('jw') || node.hasClass('jw-tip')) return;
            // 재귀적으로 자식 처리
            processElement(node, $, tokenizer);
        }
    });
}

// JSON을 읽기 좋은 JS 객체 문자열로 변환 (따옴표가 포함된 HTML 안전 처리)
function jsonToJs(obj) {
    return JSON.stringify(obj, null, 4);
}

main().catch(err => {
    console.error('❌ 빌드 실패:', err);
    process.exit(1);
});
