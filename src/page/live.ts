import '../utils/prototype.ts'
import { CHAT_LIST_AREA, CHAT_NOTICE, CHAT_WRITE_AREA, EL_CAPTURE_BUTTON, EL_COMP_BUTTON, NOT_BROADCAST, PLAYER_BUTTONS, EL_LIKE_BUTTON, EL_FAST_BUTTON as EL_FAST_FORWARD_BUTTON, EL_STATS_BUTTON, VOD_LIST_AREA, BLIND_AREA } from "../constants/selectors"
import { AUDIO_COMP_BUTTON, CAPTURE_BUTTON, CHAT_URL_LINK, COPY_PASTE, DONATE_IMAGE_HIDE, DONATE_IMAGE_SAVE, USE_AUTO_UP, FAST_FORWARD_BUTTON, STATS_PLAYER, DISABLE_AUTO_PLAY_VOD } from "../constants/storage"
import { createReactElement, injectScript, waitingElement } from "../utils/dom"
import { getChatAreaObserver, getNoticeAreaObserver } from "../utils/observe"
import CaptureButton from '../components/CaptureButton/CaptureButton.tsx'
import AudioCompressorButton from '../components/AudioCompressorButton/AudioCompressorButton.tsx'
import FastForwardButton from '../components/FastForwardButton/FastForwardButton.tsx'
import StatsInfo from '../components/StatsInfo/StatsInfo.tsx'

let invlAutoLike: number | null = null

const fnAutoLike = () => {
    const elLikeBtn = document.querySelector(EL_LIKE_BUTTON) as HTMLButtonElement
    elLikeBtn.click()
}

export const isLivePage = () => {
    return document.URL.includes("play.sooplive.co.kr") || document.URL.includes('play.afreecatv.com')
}

export const injectAutoLike = async () => {
    chrome.storage.local.get(
        [USE_AUTO_UP],
        (res) => {
            if (res[USE_AUTO_UP] &&
                document.querySelector(EL_LIKE_BUTTON)
            ) {
                setTimeout(() => {
                    fnAutoLike()
                }, 3000)

                if (invlAutoLike != null) {
                    clearInterval(invlAutoLike)
                }
                invlAutoLike = setInterval(() => {
                    const date = new Date()
                    if (date.toStr('HH:mm:ss') == '00:00:00') {
                        fnAutoLike()
                    }
                }, 1000)
            }
        })
}

export const injectLivePage = async () => {
    if (!isLivePage()) return

    const elBroad = await waitingElement(NOT_BROADCAST)
    if (elBroad?.style.display != 'none') {
        return
    }

    chrome.storage.local.get(
        [COPY_PASTE, CAPTURE_BUTTON, CHAT_URL_LINK, DONATE_IMAGE_SAVE, DONATE_IMAGE_HIDE, AUDIO_COMP_BUTTON, FAST_FORWARD_BUTTON, STATS_PLAYER, DISABLE_AUTO_PLAY_VOD],
        (res) => {
            const $btn_list = document.querySelector(PLAYER_BUTTONS)

            if (
                res[COPY_PASTE] &&
                document.querySelector(CHAT_WRITE_AREA)
            ) {
                injectScript("inject.js")

                window.postMessage({
                    source: 'from-extension',
                    action: 'crs_copyPaste',
                }, '*');
            }

            if (res[DISABLE_AUTO_PLAY_VOD] &&
                document.querySelector(VOD_LIST_AREA)
            ) {
                injectScript("inject.js")

                window.postMessage({
                    source: 'from-extension',
                    action: 'crs_autoPlayVod',
                }, '*');
            }

            if (
                res[CAPTURE_BUTTON] &&
                !document.getElementById(EL_CAPTURE_BUTTON) &&
                (document.querySelector(BLIND_AREA) as HTMLElement).style.display === 'none'
            ) {
                const $setting_box = document.querySelector('.setting_box')
                const $CaptureButton = document.createElement("div")
                $CaptureButton.id = EL_CAPTURE_BUTTON
                $btn_list?.insertBefore($CaptureButton, $setting_box)
                createReactElement($CaptureButton, CaptureButton)
            }

            if (
                res[CHAT_URL_LINK]
            ) {
                const $noti_area = document.querySelector(CHAT_NOTICE)
                const $chat_area = document.querySelector(CHAT_LIST_AREA)

                if ($noti_area) {
                    getNoticeAreaObserver().observe($noti_area, {
                        attributes: true,
                        attributeFilter: ['style'],
                        childList: true,
                        subtree: true
                    })
                }

                if ($chat_area) {
                    getChatAreaObserver({
                        DONATE_HIDE: res[DONATE_IMAGE_HIDE],
                        DONATE_IMAGE: res[DONATE_IMAGE_SAVE]
                    },
                    ).observe($chat_area, {
                        childList: true,
                        subtree: true
                    })
                }
            }

            if (res[AUDIO_COMP_BUTTON] &&
                !document.getElementById(EL_COMP_BUTTON)
            ) {
                const $setting_box = document.querySelector('.setting_box')
                const $AudioCompressorButton = document.createElement("div")
                $AudioCompressorButton.id = EL_COMP_BUTTON
                $btn_list?.insertBefore($AudioCompressorButton, $setting_box)
                createReactElement($AudioCompressorButton, AudioCompressorButton)
            }

            console.log(res[FAST_FORWARD_BUTTON], document.getElementById(EL_FAST_FORWARD_BUTTON))
            if (res[FAST_FORWARD_BUTTON] &&
                !document.getElementById(EL_FAST_FORWARD_BUTTON)
            ) {
                const $ctrl = document.querySelector('.ctrl')
                const $volume = document.querySelector('.volume')
                const $FastForwardButton = document.createElement("div")
                $FastForwardButton.id = EL_FAST_FORWARD_BUTTON
                $ctrl?.insertBefore($FastForwardButton, $volume)
                createReactElement($FastForwardButton, FastForwardButton)
            }

            if (res[STATS_PLAYER] &&
                !document.getElementById(EL_STATS_BUTTON)
            ) {
                const $setting_list = document.querySelector('.setting_list>ul')
                const $StatsList = document.createElement('li')
                $StatsList.id = EL_STATS_BUTTON
                $setting_list?.append($StatsList)
                createReactElement($StatsList, StatsInfo)
                console.log($setting_list, $StatsList)
            }
        }
    )
}