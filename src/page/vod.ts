import AudioCompressorButton from "../components/AudioCompressorButton/AudioCompressorButton";
import CaptureButton from "../components/CaptureButton/CaptureButton";
import { EL_CAPTURE_BUTTON, EL_COMP_BUTTON } from "../constants/selectors";
import { AUDIO_COMP_BUTTON, CAPTURE_BUTTON } from "../constants/storage";
import { createReactElement } from "../utils/dom";

export const isVodPage = () => {
    return document.URL.includes("vod.sooplive.co.kr") || document.URL.includes('vod.afreecatv.com');
}

export const injectVodPage = async () => {
    if (!isVodPage()) return;

    chrome.storage.local.get(
        [CAPTURE_BUTTON, AUDIO_COMP_BUTTON],
        (res) => {
            const $autoplay_box = document.querySelector('.autoplay_box');

            if (
                res[CAPTURE_BUTTON] &&
                !document.getElementById(EL_CAPTURE_BUTTON)
            ) {
                const $CaptureButton = document.createElement("div");
                $CaptureButton.id = EL_CAPTURE_BUTTON;
                $autoplay_box?.after($CaptureButton);
                createReactElement($CaptureButton, CaptureButton);
            }

            if (res[AUDIO_COMP_BUTTON] &&
                !document.getElementById(EL_COMP_BUTTON)
            ) {
                const $AudioCompressorButton = document.createElement("div");
                $AudioCompressorButton.id = EL_COMP_BUTTON;
                $autoplay_box?.after($AudioCompressorButton);
                createReactElement($AudioCompressorButton, AudioCompressorButton);
            }
        });
};