// Google Analytics 4 动态初始化
// 依赖 window.GA_MEASUREMENT_ID（在 js/ga-config.js 中设置）
(function initGA() {
  try {
    var id = window.GA_MEASUREMENT_ID;
    if (!id || typeof id !== 'string') {
      try {
        id = localStorage.getItem('GA_MEASUREMENT_ID') || null;
      } catch {}
    }
    if (!id) {
      console.warn('GA measurement ID 未设置，跳过初始化');
      return;
    }

    // 加载 gtag 脚本
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);

    // 初始化 dataLayer 和 gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());

    // 基础配置：匿名 IP、当前页面标题与路径
    gtag('config', id, {
      anonymize_ip: true,
      page_title: document.title || undefined,
      page_path: (window.location && window.location.pathname) || undefined
    });

    // 暴露简易事件上报方法，便于后续使用
    window.analyticsTrackEvent = function(eventName, params) {
      try { gtag('event', eventName, params || {}); } catch {}
    };
  } catch (e) {
    console.warn('GA 初始化异常：', e);
  }
})();