import '../utils/prototype.ts';
import { CHAT_LIST_AREA, CHAT_NOTICE, CHAT_WRITE_AREA, NOT_BROADCAST, PLAYER_BUTTONS } from "../constants/selectors";
import { CAPTURE_BUTTON, CHAT_URL_LINK, COPY_PASTE, DONATE_IMAGE_HIDE, DONATE_IMAGE_SAVE } from "../constants/storage";
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
        [COPY_PASTE, CAPTURE_BUTTON, CHAT_URL_LINK, DONATE_IMAGE_SAVE, DONATE_IMAGE_HIDE],
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
                !document.getElementById("crs-capture-btn")
            ) {
                const $setting_box = document.querySelector('.setting_box');
                const $CaptureButton = document.createElement("div");
                $CaptureButton.id = "crs-capture-btn";
                $btn_list?.insertBefore($CaptureButton, $setting_box);
                createReactElement($CaptureButton, CaptureButton);

                const $AudioCompressorButton = document.createElement("div");
                $AudioCompressorButton.id = "crs-compressor-btn";
                $btn_list?.insertBefore($AudioCompressorButton, $setting_box);
                createReactElement($AudioCompressorButton, AudioCompressorButton);
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

            // if (
            //     res[DONATE_IMAGE]
            // ) {
            //     const $chat_area = document.querySelector(CHAT_LIST_AREA);
            //     if (!$chat_area) return;
            //     $chat_area.addEventListener('click', (event) => {
            //         const { target } = event;
            //         if (target instanceof HTMLElement) {
            //             const $donate = target.querySelector(`.${DONATION_COTAINER}`) as HTMLElement;
            //             console.log($donate);
            //             if ($donate) {
            //                 captureDonate($donate);
            //             }
            //         }
            //     });
            // }
        }
    )
}