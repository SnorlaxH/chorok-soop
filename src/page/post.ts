import { COMMENT_SHORTCUT } from '../constants/storage.ts';
import '../utils/prototype.ts';
import { COMMENT_MODIFY, COMMENT_SUBMIT, COMMENT_WRITE, COMMENT_SECTION } from '../constants/selectors.ts';

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
                        if (event.ctrlKey && event.key === 'Enter') {
                            const section = target.closest(COMMENT_SECTION);
                            if (COMMENT_WRITE === target.id) {
                                section?.querySelector(COMMENT_SUBMIT)?.toElement().click();
                            }
                            else if (target.id.includes(COMMENT_MODIFY)) {
                                console.log(section);
                                section?.querySelector(COMMENT_SUBMIT)?.toElement().click();
                            }
                        }
                    }
                }

                document.addEventListener('keydown', submitEvent);
            }
        }
    )
}