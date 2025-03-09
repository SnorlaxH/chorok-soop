import AudioCompressorButton from "../components/AudioCompressorButton/AudioCompressorButton";
import CaptureButton from "../components/CaptureButton/CaptureButton";
import DownloadButton from "../components/DownloadButton/DownloadButton";
import { EL_CAPTURE_BUTTON, EL_COMP_BUTTON, EL_DOWNLOAD_BUTTON } from "../constants/selectors";
import { AUDIO_COMP_BUTTON, CAPTURE_BUTTON } from "../constants/storage";
import { createReactElement } from "../utils/dom";

export const isVodPage = () => {
    return document.URL.includes("vod.sooplive.co.kr") || document.URL.includes('vod.afreecatv.com');
}

export const isCatch = () => {
    return document.URL.includes("/catch")
}

export const injectVodPage = async () => {
    if (!isVodPage()) return;

    chrome.storage.local.get(
        [CAPTURE_BUTTON, AUDIO_COMP_BUTTON],
        (res) => {
            if (!isCatch()) {
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

                if (
                    res[CAPTURE_BUTTON] &&
                    !document.getElementById(EL_DOWNLOAD_BUTTON)
                ) {
                    const $DownloadButton = document.createElement("div");
                    $DownloadButton.id = EL_DOWNLOAD_BUTTON
                    $autoplay_box?.after($DownloadButton)
                    createReactElement($DownloadButton, DownloadButton)
                }

                if (res[AUDIO_COMP_BUTTON] &&
                    !document.getElementById(EL_COMP_BUTTON)
                ) {
                    const $AudioCompressorButton = document.createElement("div");
                    $AudioCompressorButton.id = EL_COMP_BUTTON;
                    $autoplay_box?.after($AudioCompressorButton);
                    createReactElement($AudioCompressorButton, AudioCompressorButton);
                }
            }
            else {
                const $util_wrap = document.querySelector('.catch_webplayer_wrap') as HTMLElement
                const $crs_info = document.createElement('div')
                $crs_info.style.position = 'absolute'
                $crs_info.style.top = '20px'
                $crs_info.style.left = '20px'
                $crs_info.style.zIndex = '15'
                $crs_info.style.display = 'flex'
                $crs_info.style.flexDirection = 'column'
                $crs_info.style.gap = '1em'

                if (
                    res[CAPTURE_BUTTON] &&
                    !document.getElementById(EL_CAPTURE_BUTTON)
                ) {
                    const $CaptureButton = document.createElement("div");
                    $CaptureButton.id = EL_CAPTURE_BUTTON;
                    $crs_info?.appendChild($CaptureButton);
                    createReactElement($CaptureButton, CaptureButton);
                }

                if (
                    res[CAPTURE_BUTTON] &&
                    !document.getElementById(EL_DOWNLOAD_BUTTON)
                ) {
                    const $DownloadButton = document.createElement("div");
                    $DownloadButton.id = EL_DOWNLOAD_BUTTON
                    $crs_info?.appendChild($DownloadButton)
                    createReactElement($DownloadButton, DownloadButton)
                }

                $util_wrap?.appendChild($crs_info)
            }
        });
};