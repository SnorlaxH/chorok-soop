import CaptureButton from "../components/CaptureButton/CaptureButton";
import { CAPTURE_BUTTON } from "../constants/storage";
import { createReactElement } from "../utils/dom";

export const isVodPage = () => {
    return document.URL.includes("vod.sooplive.co.kr") || document.URL.includes('vod.afreecatv.com');
}

export const injectVodPage = async () => {
    if (!isVodPage()) return;

    chrome.storage.local.get(
        [CAPTURE_BUTTON],
        (res) => {

            if (
                res[CAPTURE_BUTTON]
            ) {
                const $autoplay_box = document.querySelector('.autoplay_box');
                const $CaptureButton = document.createElement("div");
                $CaptureButton.id = "crs-capture-btn";
                $autoplay_box?.after($CaptureButton);
                createReactElement($CaptureButton, CaptureButton);
            }
        });
};