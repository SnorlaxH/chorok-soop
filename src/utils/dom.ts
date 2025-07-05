// https://github.com/kyechan99/chzzk-plus/blob/main/src/utils/dom.ts 참고

import React from "react";
import ReactDOM from "react-dom/client";

export const createReactElement = (
    root: Element,
    element: () => JSX.Element
) => {
    ReactDOM.createRoot(root).render(React.createElement(element));
};

export async function waitingElement(
    selector: string,
    timeout: number = 5000
): Promise<HTMLElement | null> {
    const startTime = Date.now();
    while (document.querySelector(selector) === null) {
        // 타임아웃
        if (Date.now() - startTime >= timeout) {
            return null;
        }
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    return document.querySelector(selector) as HTMLElement;
}

export const injectScript = (src: string) => {
    if (!document.documentElement.querySelector(`#__crs_inject__`)) {
        const el = document.createElement("script");
        el.id = '__crs_inject__'
        el.src = chrome.runtime.getURL(src);
        document.documentElement.appendChild(el);
    }
}

export const save2png = (url: string, name: string) => {
    const download = document.createElement('a');
    download.href = url;
    download.download = name;
    download.click();
}