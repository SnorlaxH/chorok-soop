import { COMMENT_SHORTCUT } from '../constants/storage.ts';
import '../utils/prototype.ts';
import { COMMENT_SUBMIT, COMMENT_WRITE } from '../constants/selectors.ts';

export const isPostPage = () => {
    return document.URL.includes("ch.sooplive.co.kr") && document.URL.includes('/post/');
}

export const injectPostPage = () => {
    chrome.storage.local.get(
        [COMMENT_SHORTCUT],
        (res) => {
            if (!isPostPage) return;

            if (res[COMMENT_SHORTCUT]) {
                const submitEvent = (event: KeyboardEvent) => {
                    const { target } = event;
                    if (target instanceof HTMLElement) {
                        console.log(target.id);
                        if (COMMENT_WRITE === target.id && event.ctrlKey) {
                            console.log(event.key)
                            if (event.key === 'Enter')
                                document.querySelector(COMMENT_SUBMIT)?.toElement().click();
                        }
                    }
                }

                document.addEventListener('keydown', submitEvent);
            }
        }
    )
}