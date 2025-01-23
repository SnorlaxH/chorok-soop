// https://github.com/kyechan99/chzzk-plus/blob/main/src/components/button/AudioCompressorButton/AudioCompressorButton.tsx

import { useCallback, useRef, useState } from 'react';
import { VIDEO_PLAYER } from '../../constants/selectors';

import './AudioCompressorButton.css'

export default function AudioCompressorButton() {
    const video: HTMLVideoElement = document.querySelector(VIDEO_PLAYER)!;

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const compressorRef = useRef<DynamicsCompressorNode | null>(null);

    const [acActive, setAcActive] = useState(false);

    const onClickHandler = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            const button = e.currentTarget;
            const active = button.getAttribute("data-active");

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();

                sourceRef.current = audioContextRef.current.createMediaElementSource(video);
                compressorRef.current = audioContextRef.current.createDynamicsCompressor();

                compressorRef.current.threshold.setValueAtTime(
                    -50,
                    audioContextRef.current.currentTime
                );
                compressorRef.current.knee.setValueAtTime(
                    40,
                    audioContextRef.current.currentTime
                );
                compressorRef.current.ratio.setValueAtTime(
                    12,
                    audioContextRef.current.currentTime
                );
                compressorRef.current.attack.setValueAtTime(
                    0,
                    audioContextRef.current.currentTime
                );
                compressorRef.current.release.setValueAtTime(
                    0.25,
                    audioContextRef.current.currentTime
                );

                sourceRef.current.connect(audioContextRef.current.destination);
            }

            if (active === "false") {
                button.setAttribute("data-active", "true");

                sourceRef.current?.disconnect(audioContextRef.current.destination);
                sourceRef.current?.connect(compressorRef.current!);
                compressorRef.current?.connect(audioContextRef.current.destination);
                setAcActive(true);
            } else {
                button.setAttribute("data-active", "false");

                sourceRef.current!.disconnect(compressorRef.current!);
                compressorRef.current!.disconnect(audioContextRef.current.destination);
                sourceRef.current!.connect(audioContextRef.current.destination);
                setAcActive(false);
            }
        },
        []
    );

    return (
        <button type="button"
            className="crs-compressor-btn"
            data-active="false"
            onClick={onClickHandler}>
            <span>
                {acActive ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M3 11V13M6 11V13M9 11V13M12 10V14M15 11V13M18 11V13M21 11V13"
                            stroke="#ffffff"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                ) : (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M3 11V13M6 8V16M9 10V14M12 7V17M15 4V20M18 9V15M21 11V13"
                            stroke="#ffffff"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                )}
            </span>
            <div className="tooltip"><span>오디오 컴프레서</span><em></em></div>
        </button>
    )
}