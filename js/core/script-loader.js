/**
 * 外部依赖加载器。
 *
 * 国内网络访问 jsdelivr / sheetjs 等境外 CDN 经常超时或被污染，加载失败会直接
 * 让转换工具不可用。所有库因此改为按「本地副本 → 国内镜像 → 境外源」的顺序逐个
 * 尝试，单个源超时后立刻切换下一个，全部失败时才抛出可读的中文提示。
 *
 * 缓存由调用方负责（各库的 `xxxLoader ??=`），这里只保证一次 Promise 只尝试一轮。
 */

/** 单个源的等待上限：超过后立刻换下一个源，避免用户长时间看到加载中。 */
const SOURCE_TIMEOUT_MS = 8000;
const DEFAULT_ERROR = '组件加载失败，请检查网络后重试。';

/**
 * 用 <script> 注入一个经典脚本，超时或加载失败时移除节点并抛错。
 * @param {string} source
 * @param {{ timeoutMs?: number, errorMessage?: string }} options
 * @returns {Promise<void>}
 */
export function injectScript(source, { timeoutMs = SOURCE_TIMEOUT_MS, errorMessage = DEFAULT_ERROR } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('外部组件只能在浏览器环境中加载。'));
      return;
    }

    const script = document.createElement('script');
    let settled = false;

    const finish = (error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (error) {
        script.remove();
        reject(error);
      } else {
        resolve();
      }
    };

    const timer = window.setTimeout(() => finish(new Error(errorMessage)), timeoutMs);

    script.src = source;
    script.async = true;
    script.onload = () => finish();
    // 被墙或被拦截的源只会触发 error，没有更多细节可读。
    script.onerror = () => finish(new Error(errorMessage));
    document.head.append(script);
  });
}

/**
 * 依次尝试多个源，直到 `isReady()` 返回真。
 * @param {string[]} sources
 * @param {{ isReady?: () => boolean, timeoutMs?: number, errorMessage?: string }} options
 * @returns {Promise<void>}
 */
export async function loadScriptSources(sources, { isReady, timeoutMs = SOURCE_TIMEOUT_MS, errorMessage = DEFAULT_ERROR } = {}) {
  const ready = typeof isReady === 'function' ? isReady : () => true;
  if (ready()) return;

  for (const source of sources) {
    try {
      await injectScript(source, { timeoutMs, errorMessage });
      // 脚本返回 200 但全局变量缺失时继续下一个源，而不是留下一半状态。
      if (ready()) return;
    } catch {
      // 当前源不可用，换下一个。
    }
  }

  throw new Error(errorMessage);
}

/**
 * 动态 import 一个 ES 模块，带超时。模块脚本受 CORS 约束，候选源必须回传
 * Access-Control-Allow-Origin（已验证 npmmirror / unpkg / jsdelivr 均支持）。
 * @param {string} source
 * @param {{ timeoutMs?: number, errorMessage?: string }} options
 * @returns {Promise<any>}
 */
export function importModule(source, { timeoutMs = SOURCE_TIMEOUT_MS, errorMessage = DEFAULT_ERROR } = {}) {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    import(source).then(
      (module) => {
        window.clearTimeout(timer);
        resolve(module);
      },
      () => {
        window.clearTimeout(timer);
        reject(new Error(errorMessage));
      },
    );
  });
}
