/**
 * 防抖
 *
 * 只有在某个时间内，没有再次触发某个函数时，才真正的调用这个函数
 *
 * 防抖的应用场景：
 * ① 搜索框（确保不会每次输入都发送请求）；
 * ② 频繁的点击按钮，触发某个事件；
 * ③ 监听浏览器滚动事件，完成某些特定操作；
 * ④ 用户缩放浏览器的 resize 事件。
 *
 * @param {Function} fn 执行的方法
 * @param {number} wait 时间
 * @param {boolean} immediate 立即执行（让其在第一次输入的时候，就给用户一个联想）
 * @returns 返回一个函数，该函数返回一个 Promise，解析为执行的方法的返回值。另外，该函数还具有一个 cancel 方法，用于取消防抖
 */
export default function debounce<T extends (...args: unknown[]) => unknown>(fn: Function, wait: number = 250, immediate: boolean = false): ((...args: Parameters<T>) => Promise<ReturnType<T>>) & {
    cancel: () => void
} {
    /**
     * setTimeout 的返回类型是 number | NodeJS.Timeout。这是因为在 Node.js 环境中，setTimeout 返回的是一个 Timeout 对象，而在浏览器环境中，返回的是一个数字。
     */
    let timer: NodeJS.Timeout | number | null = null;
    /**
     * 控制在中间暂停的时候，接下来也能立即执行
     */
    let isInvoke: boolean = false;

    const _debounce = function(...args: Parameters<T>): Promise<ReturnType<T>> {
        /**
         * 在外部获取 fn 中的返回值
         */
        return new Promise((resolve, reject) => {
            try {
                if (timer) {
                    clearTimeout(timer);
                }

                if (immediate && !isInvoke) {
                    const result = fn.apply(this, args);
                    isInvoke = true;
                    resolve(result);
                    return;
                }

                timer = setTimeout((): void => {
                    /**
                     * 确保 this 指向的正确
                     */
                    const result = fn.apply(this, args);
                    isInvoke = false;
                    resolve(result);
                }, wait);
            } catch (e) {
                reject(e);
            }
        });
    };

    /**
     * 取消功能：在触发的过程中，突然要取消
     * 取消之后，重置所有变量
     */
    _debounce.cancel = function(): void {
        if (timer) {
            clearTimeout(timer);
            timer = null;
            isInvoke = false;
        }
    };

    return _debounce;
}