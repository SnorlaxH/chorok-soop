import '../utils/prototype.ts';
import { CHAT_LIST_AREA, CHAT_NOTICE, CHAT_WRITE_AREA, EL_CAPTURE_BUTTON, EL_COMP_BUTTON, NOT_BROADCAST, PLAYER_BUTTONS } from "../constants/selectors";
import { AUDIO_COMP_BUTTON, CAPTURE_BUTTON, CHAT_URL_LINK, COPY_PASTE, DONATE_IMAGE_HIDE, DONATE_IMAGE_SAVE } from "../constants/storage";
import { createReactElement, injectScript, waitingElement } from "../utils/dom";
import { getChatAreaObserver, getNoticeAreaObserver } from "../utils/observe";
import CaptureButton from '../components/CaptureButton/CaptureButton.tsx';
import AudioCompressorButton from '../components/AudioCompressorButton/AudioCompressorButton.tsx';

export const isLivePage = () => {
    return document.URL.includes("play.sooplive.co.kr") || document.URL.includes('play.afreecatv.com');
}

export const injectLivePage = async () => {
    if (!isLivePage()) return;

    const elBroad = await waitingElement(NOT_BROADCAST)
    if (elBroad?.style.display != 'none') {
        return;
    }

    chrome.storage.local.get(
        [COPY_PASTE, CAPTURE_BUTTON, CHAT_URL_LINK, DONATE_IMAGE_SAVE, DONATE_IMAGE_HIDE, AUDIO_COMP_BUTTON],
        (res) => {
            const $btn_list = document.querySelector(PLAYER_BUTTONS)

            if (
                res[COPY_PASTE] &&
                document.querySelector(CHAT_WRITE_AREA)
            ) {
                injectScript("inject.js");
            }

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
                if (!$noti_area) return;
                getNoticeAreaObserver().observe($noti_area, {
                    attributes: true,
                    attributeFilter: ['style'],
                    childList: true,
                    subtree: true
                });

                const $chat_area = document.querySelector(CHAT_LIST_AREA);
                if (!$chat_area) return;
                getChatAreaObserver({
                    DONATE_HIDE: res[DONATE_IMAGE_HIDE],
                    DONATE_IMAGE: res[DONATE_IMAGE_SAVE]
                },
                ).observe($chat_area, {
                    childList: true,
                    subtree: true
                });
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