// 전 페이지 공용 푸터를 방문자 언어로 바꿔주는 스크립트
// HTML에는 한국어 푸터가 정적으로 들어 있고(크롤러·애드센스 심사용),
// 이 스크립트가 로드 후 해당 언어로 교체한다.
(function () {
  var T = {
    ko: {
      home: '홈', saju: '사주', ziwei: '자미두수', astro: '점성술',
      privacy: '개인정보처리방침', terms: '이용약관', contact: '문의',
      free: '현재 모든 기능을 <strong>무료</strong>로 제공합니다. 회원가입과 결제 없이 이용하실 수 있으며, 멤버십은 추후 공개될 예정입니다.',
      disclaimer: '본 서비스의 모든 해석은 전통 명리학·점성술에 기반한 참고용 콘텐츠이며, 의학적·법률적·재정적 조언이 아닙니다. 중요한 결정은 해당 분야 전문가와 상담하시기 바랍니다.',
      copy: '© 2026 Trinity of Destiny. All rights reserved.',
    },
    en: {
      home: 'Home', saju: 'Saju', ziwei: 'Zi Wei Dou Shu', astro: 'Astrology',
      privacy: 'Privacy Policy', terms: 'Terms of Service', contact: 'Contact',
      free: 'Everything is <strong>free</strong> right now — no sign-up, no payment. Memberships will be introduced later.',
      disclaimer: 'All readings are reference content based on traditional Eastern and Western astrology. They are not medical, legal, or financial advice. Please consult a qualified professional for important decisions.',
      copy: '© 2026 Trinity of Destiny. All rights reserved.',
    },
    ja: {
      home: 'ホーム', saju: '四柱推命', ziwei: '紫微斗数', astro: '西洋占星術',
      privacy: 'プライバシーポリシー', terms: '利用規約', contact: 'お問い合わせ',
      free: '現在すべての機能を<strong>無料</strong>で提供しています。会員登録も決済も不要です。メンバーシップは今後公開予定です。',
      disclaimer: '本サービスの解釈はすべて伝統的な命理学・占星術に基づく参考コンテンツであり、医療・法律・金融に関する助言ではありません。重要な判断は専門家にご相談ください。',
      copy: '© 2026 Trinity of Destiny. All rights reserved.',
    },
    zh: {
      home: '首頁', saju: '四柱八字', ziwei: '紫微斗數', astro: '西洋占星',
      privacy: '隱私權政策', terms: '服務條款', contact: '聯絡我們',
      free: '目前所有功能<strong>免費</strong>提供，無需註冊或付費。會員制將於日後開放。',
      disclaimer: '本服務的所有解讀均為基於傳統命理與占星的參考內容，並非醫療、法律或財務建議。重要決定請諮詢專業人士。',
      copy: '© 2026 Trinity of Destiny. All rights reserved.',
    },
    es: {
      home: 'Inicio', saju: 'Saju', ziwei: 'Zi Wei Dou Shu', astro: 'Astrología',
      privacy: 'Política de Privacidad', terms: 'Términos del Servicio', contact: 'Contacto',
      free: 'Todo es <strong>gratuito</strong> por ahora, sin registro ni pago. La membresía se abrirá más adelante.',
      disclaimer: 'Todas las lecturas son contenido de referencia basado en la astrología tradicional oriental y occidental. No constituyen asesoramiento médico, legal ni financiero. Consulte a un profesional para decisiones importantes.',
      copy: '© 2026 Trinity of Destiny. All rights reserved.',
    },
  };

  function lang() {
    try {
      // 메인 사이트는 honcheon.lang, 소개 페이지는 tod_lang을 쓴다
      var l = localStorage.getItem('honcheon.lang') || localStorage.getItem('tod_lang')
        || (navigator.language || 'ko').slice(0, 2);
      return T[l] ? l : 'ko';
    } catch (e) {
      return 'ko';
    }
  }

  // 상대 경로 페이지(소개 페이지 등)도 있어 링크는 절대 경로로 통일한다
  var LINKS = [
    ['home', '/'], ['saju', '/saju-about.html'], ['ziwei', '/ziwei-about.html'],
    ['astro', '/astro-about.html'], ['privacy', '/privacy.html'],
    ['terms', '/terms.html'], ['contact', '/contact.html'],
  ];

  function render() {
    var d = T[lang()];
    var foots = document.querySelectorAll('.site-footer');
    for (var i = 0; i < foots.length; i++) {
      var f = foots[i];
      // i18n.js가 이 안의 텍스트를 자기 사전으로 덧칠하지 않게 막는다
      f.setAttribute('data-no-i18n', '');

      var nav = f.querySelector('nav');
      if (nav) {
        var html = '';
        for (var j = 0; j < LINKS.length; j++) {
          html += '<a href="' + LINKS[j][1] + '">' + d[LINKS[j][0]] + '</a>';
        }
        nav.innerHTML = html;
      }
      var free = f.querySelector('.free-notice');
      if (free) free.innerHTML = d.free;
      var disc = f.querySelector('.disclaimer');
      if (disc) disc.textContent = d.disclaimer;
      // 저작권 줄은 마지막 p (소개 페이지는 #page-footer가 그 자리)
      var ps = f.querySelectorAll('p');
      if (ps.length) ps[ps.length - 1].textContent = d.copy;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render, { once: true });
  } else {
    render();
  }
  // 메인 사이트의 언어 전환 이벤트
  document.addEventListener('honcheon:langchange', render);
  // 소개 페이지는 자체 setLang을 쓰므로 storage 변화도 함께 본다
  window.addEventListener('storage', render);
  window.renderSiteFooter = render;
})();
