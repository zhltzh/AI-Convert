const baiduTongjiId = 'ef887868142b18a0c32bd9e20da7d91f';

if (!document.querySelector('script[src*="hm.baidu.com"]')) {
  const hm = document.createElement('script');
  hm.src = `https://hm.baidu.com/hm.js?${baiduTongjiId}`;
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(hm, s);
}
