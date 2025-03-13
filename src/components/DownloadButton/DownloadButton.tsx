
import DownloadIcon from '@mui/icons-material/Download';
import { isCatch } from '../../page/vod';

import './DownloadButton.css'

export default function DownloadButton() {
    const downloadVideo = async () => {
        const match = document.URL.match(/\/player\/([0-9]+)/);
        const vid = match ? match[1] : null;
        if (vid) {
            const m3u8: Array<object> = []
            const url_api = isCatch() ? 'https://api.m.sooplive.co.kr/station/video/a/catchview' : 'https://api.m.sooplive.co.kr/station/video/a/view'

            const formData = new FormData()
            formData.append('nTitleNo', vid)
            if (isCatch()) {
                formData.append('nPageNo', '1')
                formData.append('nLimit', '10')
            }
            else {
                formData.append('nPlaylistIdx', '0')
                formData.append('nApiLevel', '10')
            }

            await fetch(url_api, {
                method: 'POST',
                headers: {
                    "Referrer": document.URL.toString(),
                },
                body: formData
            }).then(async (response) => {
                const json = await response.json()
                const data = json.data.length ? json.data[0] : json.data

                const file = data.files.map((r: any) => {
                    if (r.hasOwnProperty('quality_info')) {
                        const original = r.quality_info.filter((item: any) => item.name === 'original')
                        return original.length > 0 ? original[0].file : r.quality_info[0].file
                    }
                    else {
                        return r.file
                    }
                })
                m3u8.push({ url: file, title: data.title, thumb_nail: data.catch_thumb || data.thumb })
            })

            if (m3u8.length) {
                chrome.runtime.sendMessage({
                    type: 'm3u8',
                    payload: { ...m3u8[0] }
                })
            }
        }
    }

    return (
        <button type="button"
            className="crs-download-btn"
            onClick={downloadVideo}>
            <DownloadIcon />
            <div className="tooltip"><span>다운로드</span><em></em></div>
        </button>
    )
}