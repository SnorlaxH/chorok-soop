import React from 'react'
import { VIDEO_PLAYER } from '../../constants/selectors'

import './FastForwardButton.css'

export default function FastForwardButton() {
    const fastForwardEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault()

        try {
            const player = document.querySelector(VIDEO_PLAYER) as HTMLVideoElement
            player.currentTime = player.buffered.end(
                player.buffered.length - 1
            )
        } catch (e) {
            console.warn(e)
        }
    }

    return (
        <button type="button"
            className="crs-fastforward-btn"
            onClick={fastForwardEvent}>
            <div className="tooltip"><span>빨리 감기</span><em></em></div>
        </button>
    )
}