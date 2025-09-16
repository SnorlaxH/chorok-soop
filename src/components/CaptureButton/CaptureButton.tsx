// import { styled } from '@mui/material/styles'
import CropIcon from '@mui/icons-material/Crop'
import React from 'react'
import { BLIND_AREA, INPUT_UI_CLS_LIST, INPUT_UI_ID_LIST, VIDEO_PLAYER } from '../../constants/selectors'
import { save2png } from '../../utils/dom'

import './CaptureButton.css'
import { isCatch } from '../../page/vod'

export default function CaptureButton() {
    React.useEffect(() => {
        const captureEvent = (event: KeyboardEvent) => {
            const { target } = event
            if (target instanceof HTMLElement) {
                if (!INPUT_UI_CLS_LIST.includes(target.className) &&
                    !INPUT_UI_ID_LIST.includes(target.id) &&
                    target.getAttribute('type') !== 'password' &&
                    target.getAttribute('type') !== 'number' &&
                    !event.ctrlKey &&
                    (document.querySelector(BLIND_AREA) as HTMLElement).style.display === 'none') {
                    // T: 캡처
                    if (event.key === 't' || event.key === 'T') {
                        captureVideo()
                    }
                }
            }
        }

        document.addEventListener('keydown', captureEvent)
        return () => {
            document.removeEventListener('keydown', captureEvent)
        }
    }, [])

    const captureVideo = (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault()

        try {
            const video = (isCatch() ? document.querySelector('video#video_p') : document.querySelector(VIDEO_PLAYER)) as HTMLVideoElement
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const context = canvas.getContext('2d')

            if (!context) return
            context.drawImage(video, 0, 0, canvas.width, canvas.height)

            const imageDataURL = canvas.toDataURL('image/png')
            const id = document.URL.replace('https://play.sooplive.co.kr/', '').replace('https://dashboard.sooplive.co.kr/', '').replace('https://vod.sooplive.co.kr/', '').split('/'[0])
            save2png(imageDataURL, `chrok_soop_${id}_${new Date().toStr('yyyyMMdd_HHmmsszzz')}.png`)
        } catch (e) {
            console.warn(e)
        }
    }

    return (
        <button type="button"
            className="crs-capture-btn"
            onClick={captureVideo}>
            <CropIcon />
            <div className="tooltip"><span>스크린샷 (T)</span><em></em></div>
        </button>
    )
}