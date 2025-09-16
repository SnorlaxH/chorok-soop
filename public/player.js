
const url = document.URL
const elThumb = document.querySelector('.vod_thumb')
const elVideo = document.getElementById('video')
const convertBtn = document.getElementById('convertBtn');

const { createFFmpeg, fetchFile } = FFmpeg;

function buildTrackFile(trackBuf) {
    if (!trackBuf.init) {
        throw new Error('Init segment missing for track');
    }
    const initSize = trackBuf.init.byteLength;
    const total = initSize + trackBuf.totalSize;
    const out = new Uint8Array(total);
    let offset = 0;
    out.set(trackBuf.init, offset);
    offset += initSize;
    for (const seg of trackBuf.segments) {
        out.set(seg.buffer, offset);
        offset += seg.buffer.byteLength;
    }
    return out;
}


const ffmpeg = createFFmpeg({
    corePath: chrome.runtime.getURL("ffmpeg-core.js"),
    wasmPath: chrome.runtime.getURL("ffmpeg-core.wasm"),
    log: true,
    mainName: 'main'
});

async function downloadMergedMp4(tracks, outputFileName) {
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    // 트랙별 바이너리 구축
    const videoBytes = buildTrackFile(tracks.video);
    await ffmpeg.FS('writeFile', 'video.mp4', videoBytes);

    // 오디오 트랙이 있다면
    const hasAudio = tracks.audio.init || tracks.audio.segments.length;
    if (hasAudio) {
        const audioBytes = buildTrackFile(tracks.audio);
        await ffmpeg.FS('writeFile', 'audio.mp4', audioBytes);
    }

    // remux (copy) → 하나의 MP4
    // 주의: 일부 스트림에선 타임스케일/시작 PTS 불일치로 sync 어긋날 수 있음 → -fflags +genpts 시도
    const args = [
        '-i', 'video.mp4',
        '-i', 'audio.mp4',
        '-c', 'copy',
        '-map', '0:v:0',
        '-map', '1:a:0?',
        '-movflags', 'faststart',
        '-fflags', '+genpts',
        'output.mp4'
    ];


    await ffmpeg.run(...args);

    const data = ffmpeg.FS('readFile', 'output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    downloadFile(blob, outputFileName);
}

const processFragmentsWithFFmpeg = async (fragments, outputFileName) => {
    if (ffmpeg.isLoaded()) {
        await ffmpeg.exit()
    }
    await ffmpeg.load()

    const fileIndex = fragments.length

    // 모든 .ts 세그먼트를 가상 파일 시스템에 기록
    for (let i = 0; i < fileIndex; i++) {
        await ffmpeg.FS('writeFile', `fragment${i}.mp4`, new Uint8Array(fragments[i]));
    }

    // inputs.txt 파일 생성: 모든 .ts 파일을 나열
    let inputsContent = '';
    for (let i = 0; i < fileIndex; i++) {
        inputsContent += `file 'fragment${i}.mp4'\n`;
    }
    await ffmpeg.FS('writeFile', 'inputs.txt', inputsContent);

    // FFmpeg 명령어 실행: concat demuxer를 사용하여 .ts 파일들을 병합하여 MP4로 변환
    const ffmpegArgs = ['-f', 'concat', '-i', 'inputs.txt', '-c', 'copy', 'output.mp4'];
    await ffmpeg.run(...ffmpegArgs);

    // 변환된 파일 읽기
    const outputData = await ffmpeg.FS('readFile', 'output.mp4');
    const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });

    downloadFile(outputBlob, outputFileName)
}

function downloadFile(blob, fileName) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}

const port = chrome.runtime.connect({ name: "player" });
port.onMessage.addListener(({ action, title, thumb_nail }) => {
    if (action === 'title') {
        document.title = title;
        elThumb.style.backgroundImage = `url(${thumb_nail})`
    }
});

if (Hls.isSupported()) {
    const hls = new Hls({
        enableWorker: false,
    })
    const m3u8Url = url.split('#')[1]

    const tracks = {
        video: { init: undefined, segments: [], totalSize: 0 },
        audio: { init: undefined, segments: [], totalSize: 0 },
        total: 0,
    };

    hls.loadSource(m3u8Url)
    hls.attachMedia(elVideo)

    function classifyFrag(frag) {
        // hls.js에서 audio/main 구분
        if (frag.type === 'audio') return 'audio';
        return 'video'; // 'main'을 video로 취급 (자막 등 추가 트랙은 추가 처리)
    }

    // HLS.js에서 로드된 비디오 프래그먼트를 MP4Box.js에 추가
    hls.on(Hls.Events.FRAG_LOADED, async function (event, data) {
        // await runFFmpeg(data.payload, 'output.mp4')
        const frag = data.frag;
        const track = classifyFrag(frag);
        const payload = new Uint8Array(data.payload); // ArrayBuffer → Uint8Array

        console.log('[FRAG_LOADED]', data);

        // init 세그먼트 판별
        const isInit =
            frag.sn === 'initSegment' ||
            frag.sn === -1 ||
            (frag.relurl && /init|map|mp4init|cmfi/i.test(frag.relurl));
        console.log('[FRAG_LOADED] - isInit', frag.sn, frag.relurl)
        if (isInit) {
            // 기존 init 덮어쓰기 (가장 최근 레벨 선택)
            tracks[track].init = payload;
            console.log(`[${track}] init segment captured (${payload.byteLength} bytes)`);
            return;
        }
        // init 세그먼트 없는 경우 프래그먼트에서 가져옴
        if (!tracks[track].init) {
            const { initSegment } = frag;
            if (initSegment && initSegment.data && initSegment.data.length) {
                tracks[track].init = initSegment.data;
            }
        }

        // 일반 세그먼트
        tracks[track].segments.push({
            sn: frag.sn,
            ptsStart: frag.start,
            duration: frag.duration,
            buffer: payload,
        });
        tracks[track].totalSize += payload.byteLength;
    });

    // 변환 버튼 클릭 시 MP4 파일 생성 및 다운로드
    convertBtn.addEventListener('click', async function () {
        // 최소 세그먼트 도착 검사
        if (!tracks.video.init && tracks.video.segments.length === 0) {
            alert('아직 비디오 세그먼트가 수집되지 않았습니다.');
            return;
        }
        await downloadMergedMp4(tracks, `${document.title}.mp4`)
    });
} else if (elVideo.canPlayType('application/vnd.apple.mpegurl')) {
    // 브라우저가 HLS를 네이티브로 지원하는 경우 (예: Safari)
    elVideo.src = m3u8Url;
    elVideo.addEventListener('loadedmetadata', function () {
        elVideo.play();
    });
    // 이 경우 MP4 변환은 지원되지 않음
    convertBtn.disabled = true;
    convertBtn.textContent = '변환 지원 안 됨';
} else {
    console.error('HLS.js가 지원되지 않으며, 브라우저도 HLS를 지원하지 않습니다.');
}

document.onkeydown = function (event) {
    //console.log(event.keyCode)
    if (event.keyCode == 32) {
        if (elVideo.paused) {
            elVideo.play()
        } else {
            elVideo.pause()
        }
    } else if (event.keyCode == 39) {
        elVideo.currentTime += 5
    } else if (event.keyCode == 37) {
        elVideo.currentTime -= 5
    } else if (event.keyCode == 38) {
        if (elVideo.volume < 1)
            elVideo.volume += 0.1
    } else if (event.keyCode == 40) {
        if (elVideo.volume > 0)
            elVideo.volume -= 0.1
    } else if (event.keyCode == 77) {
        elVideo.muted = !elVideo.muted
    } else if (event.keyCode == 70) {
        elVideo.requestFullscreen()
    }
}