import { LIVE_LAYOUT_WRAP, POST_LAYOUT_WRAP } from "./constants/selectors";
import { injectLivePage } from "./page/live";
import { injectPostPage } from "./page/post";

const whenPageLoaded = setInterval(() => {
    const isBodyLoaded = !!document.body;
    const $liveWrap = document.querySelector(LIVE_LAYOUT_WRAP);
    const $postWrap = document.querySelector(POST_LAYOUT_WRAP);

    if (isBodyLoaded && window && typeof window !== undefined) {
        if ($liveWrap) {
            injectLivePage();
            clearInterval(whenPageLoaded);
        }
        else if ($postWrap) {
            injectPostPage();
            clearInterval(whenPageLoaded);
        }
    }
}, 500);