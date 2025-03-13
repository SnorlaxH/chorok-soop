import { useEffect, useState } from "react"
import { waitingElement } from "../../utils/dom"
import { EL_STATS_BUTTON, VIDEO_PLAYER } from "../../constants/selectors"

import './StatsInfo.css'

export default function StatsInfo() {
    const [latency, setLatency] = useState<string>("")
    const update = async () => {
        try {
            const video = await waitingElement(VIDEO_PLAYER) as HTMLVideoElement
            if (video) {
                const buffered = video.buffered
                if (buffered.length) {
                    const remainingBufferTime = buffered.end(buffered.length - 1) - video.currentTime
                    // console.log(remainingBufferTime)
                    setLatency(remainingBufferTime >= 0 ? (remainingBufferTime * 1000).toFixed(0) : '')
                }
                else {
                    setLatency('')
                }
            }
        } catch (e) {
            console.warn(e)
        }
    }

    useEffect(() => {
        update()

        const invl = setInterval(() => {
            update()
        }, 1000)
        return () => {
            clearInterval(invl)
        }
    }, [])

    return (
        <button type="button"
            className={EL_STATS_BUTTON}>
            <span>지연 시간</span>
            <span>{latency}ms</span>
        </button>
    )
}