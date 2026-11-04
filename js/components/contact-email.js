/**
 * 联系方式邮箱挂载。
 *
 * 静态 HTML 里不出现完整邮箱地址（避免被垃圾邮件爬虫抓走），
 * 由这个脚本在浏览器端拼出真实的 mailto 链接。
 * 未启用 JavaScript 时，页面上显示的是 "user [at] host" 的可读混淆形式。
 *
 * 以后换成域名邮箱时，只改这里的 EMAIL_USER 和 EMAIL_DOMAIN 两行即可。
 */

const EMAIL_USER = "40836112";
const EMAIL_DOMAIN = "qq.com";

function mount() {
  const address = `${EMAIL_USER}@${EMAIL_DOMAIN}`;
  const link = document.createElement("a");
  link.href = `mailto:${address}?subject=${encodeURIComponent("Aixuno 反馈")}`;
  link.className = "text-link";
  link.textContent = address;
  link.setAttribute("rel", "nofollow");

  document.querySelectorAll("[data-contact-email]").forEach((slot) => {
    slot.replaceChildren(link.cloneNode(true));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
