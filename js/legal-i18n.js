// 법적 문서 페이지(개인정보·약관·문의)를 방문자 언어로 교체하는 스크립트
// HTML에는 한국어 본문이 정적으로 들어 있고(크롤러·애드센스 심사용),
// 이 스크립트가 로드 후 해당 언어로 갈아끼운다.
(function () {
  var SUPPORTED = ['ko', 'en', 'ja', 'zh', 'es'];
  var NAMES = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文', es: 'Español' };
  // 상단 네비게이션 문구 (본문 언어팩과 별개로 여기서 처리)
  var NAV_CTA = {
    ko: '내 사주 보기 →', en: 'View my chart →', ja: '私の命式を見る →',
    zh: '查看我的命盤 →', es: 'Ver mi carta →',
  };

  // <body data-legal-page="privacy"> 로 어떤 문서인지 알려준다
  var PAGE = document.body.getAttribute('data-legal-page');
  if (!PAGE) return;

  function lang() {
    try {
      var l = localStorage.getItem('honcheon.lang') || localStorage.getItem('tod_lang')
        || (navigator.language || 'ko').slice(0, 2);
      return SUPPORTED.indexOf(l) >= 0 ? l : 'ko';
    } catch (e) {
      return 'ko';
    }
  }

  var cache = {};
  function loadPack(l) {
    if (l === 'ko') return Promise.resolve(null); // 한국어는 HTML 원본을 그대로 쓴다
    if (cache[l]) return Promise.resolve(cache[l]);
    return import('/js/legal/' + l + '.js')
      .then(function (m) { cache[l] = m.default; return cache[l]; })
      .catch(function () { return null; }); // 언어팩이 없으면 한국어 유지
  }

  var koMain = null;
  var koTitle = document.title;
  var koDesc = (document.querySelector('meta[name=description]') || {}).content || '';

  function apply(l) {
    var main = document.querySelector('main');
    if (!main) return;
    if (koMain === null) koMain = main.innerHTML; // 최초 1회 한국어 원본 보관

    document.documentElement.lang = l;
    var cta = document.querySelector('nav .nav-cta');
    if (cta) cta.textContent = NAV_CTA[l] || NAV_CTA.ko;
    loadPack(l).then(function (pack) {
      var d = pack && pack[PAGE];
      if (!d) {
        main.innerHTML = koMain;
        document.title = koTitle;
        setDesc(koDesc);
        return;
      }
      main.innerHTML = d.main;
      document.title = d.title;
      setDesc(d.desc);
    });
  }

  function setDesc(v) {
    var m = document.querySelector('meta[name=description]');
    if (m) m.content = v;
  }

  // 이 페이지에는 사이트 i18n 스크립트를 싣지 않으므로 자체 선택기를 붙인다
  function installPicker() {
    var nav = document.querySelector('nav');
    if (!nav || document.getElementById('legal-lang')) return;
    var sel = document.createElement('select');
    sel.id = 'legal-lang';
    sel.setAttribute('aria-label', 'Language');
    sel.innerHTML = SUPPORTED.map(function (l) {
      return '<option value="' + l + '">' + NAMES[l] + '</option>';
    }).join('');
    sel.value = lang();
    sel.addEventListener('change', function () {
      try { localStorage.setItem('honcheon.lang', sel.value); } catch (e) { /* 저장 실패는 무시 */ }
      apply(sel.value);
      if (window.renderSiteFooter) window.renderSiteFooter();
    });
    nav.appendChild(sel);
  }

  function boot() {
    installPicker();
    apply(lang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
