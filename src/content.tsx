import { CATCH_LAYOUT_WRAP, DASHBOARD_LAYOUT_WRAP, LIVE_LAYOUT_WRAP, POPOUT_CHAT_WRAP, POST_LAYOUT_WRAP } from "./constants/selectors";
import { injectDashboardPage } from "./page/dashboard";
import { injectAutoLike, injectLivePage } from "./page/live";
import { injectPostPage } from "./page/post";
import { injectVodPage } from "./page/vod";
import { getPageChangeObserver } from "./utils/observe";

const whenPageLoaded = setInterval(() => {
    const isBodyLoaded = !!document.body;
    const $liveWrap = document.querySelector(LIVE_LAYOUT_WRAP);
    const $postWrap = document.querySelector(POST_LAYOUT_WRAP);
    const $dashboardWrap = document.querySelector(DASHBOARD_LAYOUT_WRAP);
    const $popoutWrap = document.querySelector(POPOUT_CHAT_WRAP);
    const $catchWrap = document.querySelector(CATCH_LAYOUT_WRAP);

    if (isBodyLoaded && window && typeof window !== undefined) {
        if ($liveWrap) {
            const callback = () => {
                injectLivePage();
                injectVodPage();
            }
            try {
                callback();
                injectAutoLike();
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
        else if ($dashboardWrap) {
            try {
                injectDashboardPage();
            } catch (e) {
                console.warn(e);
            }
        }
        else if ($popoutWrap) {
            try {
                injectDashboardPage();
            } catch (e) {
                console.warn(e);
            }
        }
        else if ($catchWrap) {
            injectVodPage()
        }
        clearInterval(whenPageLoaded);
    }
}, 500);