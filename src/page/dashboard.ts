import '../utils/prototype.ts';
import { CHAT_LIST_AREA, CHAT_NOTICE, EL_CAPTURE_BUTTON, EL_COMP_BUTTON, PLAYER_BUTTONS } from "../constants/selectors";
import { AUDIO_COMP_BUTTON, CAPTURE_BUTTON, CHAT_URL_LINK, COPY_PASTE, DONATE_IMAGE_HIDE, DONATE_IMAGE_SAVE } from "../constants/storage";
import { createReactElement, waitingElement } from "../utils/dom";
import { getChatAreaObserver, getNoticeAreaObserver } from "../utils/observe";
import CaptureButton from '../components/CaptureButton/CaptureButton.tsx';
import AudioCompressorButton from '../components/AudioCompressorButton/AudioCompressorButton.tsx';

const isDashboard = () => {
    return document.URL.includes('dashboard.sooplive.co.kr');
}

const isPopup = () => {
    return document.URL.includes('dashboard.sooplive.co.kr/popup.php');
}

export const injectDashboardPage = async () => {
    if (!isDashboard()) return;

    if (!isPopup()) {
        const elLive = await waitingElement('#livePlayer')
        if (elLive?.style.display != 'block') {
            return;
        }
    }
    else {
        const elChatArea = await waitingElement('#chat_area')
        if(elChatArea?.style.display == 'block') {
            return;
        }
    }

    chrome.storage.local.get(
        [COPY_PASTE, CAPTURE_BUTTON, CHAT_URL_LINK, DONATE_IMAGE_SAVE, DONATE_IMAGE_HIDE, AUDIO_COMP_BUTTON],
        (res) => {
            const $btn_list = document.querySelector(PLAYER_BUTTONS)

            if (
                res[CAPTURE_BUTTON] &&
                !document.getElementById(EL_CAPTURE_BUTTON)
            ) {
                const $setting_box = document.querySelector('.setting_box');
                const $CaptureButton = document.createElement("div");
                $CaptureButton.id = EL_CAPTURE_BUTTON;
                $btn_list?.insertBefore($CaptureButton, $setting_box);
                createReactElement($CaptureButton, CaptureButton);
            }

            if (
                res[CHAT_URL_LINK]
            ) {
                const $noti_area = document.querySelector(CHAT_NOTICE);
                const $chat_area = document.querySelector(CHAT_LIST_AREA);
                // if (!$noti_area) return;
                if ($noti_area) {
                    getNoticeAreaObserver().observe($noti_area, {
                        attributes: true,
                        attributeFilter: ['style'],
                        childList: true,
                        subtree: true
                    });
                }

                if ($chat_area) {
                    getChatAreaObserver({
                        DONATE_HIDE: res[DONATE_IMAGE_HIDE],
                        DONATE_IMAGE: res[DONATE_IMAGE_SAVE]
                    },
                    ).observe($chat_area, {
                        childList: true,
                        subtree: true
                    });
                }
            }

            if (res[AUDIO_COMP_BUTTON] &&
                !document.getElementById(EL_COMP_BUTTON)
            ) {
                const $setting_box = document.querySelector('.setting_box');
                const $AudioCompressorButton = document.createElement("div");
                $AudioCompressorButton.id = EL_COMP_BUTTON;
                $btn_list?.insertBefore($AudioCompressorButton, $setting_box);
                createReactElement($AudioCompressorButton, AudioCompressorButton);
            }
        }
    )
}