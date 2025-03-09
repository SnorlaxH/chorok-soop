
const url = document.URL
const elThumb = document.querySelector('.vod_thumb')
const elVideo = document.getElementById('video')
const convertBtn = document.getElementById('convertBtn');

const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({
    corePath: chrome.runtime.getURL("ffmpeg-core.js"),
    wasmPath: chrome.runtime.getURL("ffmpeg-core.wasm"),
    log: true,
    mainName: 'main'
});

async function runFFmpeg(buffer, outputFileName) {
    if (ffmpeg.isLoaded()) {
        await ffmpeg.exit();
    }

    await ffmpeg.load();

    await ffmpeg.FS('writeFile', 'input.ts', new Uint8Array(buffer));
    const commandStr = `-i input.ts -c copy output.mp4`

    await ffmpeg.run(...commandStr.split(' '));


    const data = await ffmpeg.FS('readFile', 'output.mp4');
    console.error(data)
    const blob = new Blob([data.buffer]);

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
        await ffmpeg.FS('writeFile', `fragment${i}.ts`, new Uint8Array(fragments[i]));
    }

    // inputs.txt 파일 생성: 모든 .ts 파일을 나열
    let inputsContent = '';
    for (let i = 0; i < fileIndex; i++) {
        inputsContent += `file 'fragment${i}.ts'\n`;
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

    hls.loadSource(m3u8Url)
    hls.attachMedia(elVideo)
    // M3U8 매니페스트가 파싱되면 비디오 재생 시작
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
        // video.play();
    });

    // MP4Box.js 초기화
    const mp4Buffer = []
    // HLS.js에서 로드된 비디오 프래그먼트를 MP4Box.js에 추가
    hls.on(Hls.Events.FRAG_LOADED, async function (event, data) {
        // await runFFmpeg(data.payload, 'output.mp4')
        const payload = data.payload
        mp4Buffer.push(payload)
    });

    // 변환 버튼 클릭 시 MP4 파일 생성 및 다운로드
    convertBtn.addEventListener('click', async function () {
        if (mp4Buffer.length) {
            console.log(mp4Buffer)
            await processFragmentsWithFFmpeg(mp4Buffer, `${document.title}.mp4`)
        }
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