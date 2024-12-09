import { LIVE_LAYOUT_WRAP, POST_LAYOUT_WRAP } from "./constants/selectors";
import { injectLivePage } from "./page/live";
import { injectPostPage } from "./page/post";
import { injectVodPage } from "./page/vod";
import { getPageChangeObserver } from "./utils/observe";

const whenPageLoaded = setInterval(() => {
    const isBodyLoaded = !!document.body;
    const $liveWrap = document.querySelector(LIVE_LAYOUT_WRAP);
    const $postWrap = document.querySelector(POST_LAYOUT_WRAP);

    if (isBodyLoaded && window && typeof window !== undefined) {
        if ($liveWrap) {
            const callback = () => {
                injectLivePage();
                injectVodPage();
            }
            try {
                callback();
            } catch (e) {
                console.warn(e);
            }

            const title = document.querySelector('title');
            getPageChangeObserver(callback).observe(title!, {
                subtree: true,
                characterData: true,
                childList: true
            });
        }
        else if ($postWrap) {
            try {
                injectPostPage();
            } catch (e) {
                console.warn(e);
            }
        }
        clearInterval(whenPageLoaded);
    }
}, 500);