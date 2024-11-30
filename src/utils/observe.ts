// import { toPng } from 'html-to-image';
import { DONATION_COTAINER } from "../constants/selectors";
// import { save2png } from "./dom";
import html2canvas from 'html2canvas';
import { save2png } from "./dom";

// 이미지의 src를 corsproxy.io를 통해 요청하여 CORS 오류를 우회하는 함수
async function fetchImageWithCorsProxy(url: string) {
    const proxyUrl = `https://corsproxy.io/?${url}`;
    const response = await fetch(proxyUrl);

    // Blob으로 응답을 받음
    const blob = await response.blob();

    // Blob을 Base64로 변환
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob); // Blob을 Base64 URL로 변환
    });
}

const captureDonate = (donate: HTMLElement) => {
    try {

        // DOM 내 모든 img 태그에 대해 CORS 프록시를 적용하여 이미지를 Base64로 변환
        donate.querySelectorAll('img').forEach(async (el) => {
            if (el.src.startsWith('http')) {
                // corsproxy.io를 통해 이미지를 Base64로 변환
                const base64Image = await fetchImageWithCorsProxy(el.src);
                console.log("Base64 Image: ", base64Image);

                // 복제된 img 요소에 Base64 이미지를 설정하여 CORS 우회
                el.src = `${base64Image}`;

                // 이미지 로딩이 끝날 때까지 기다린 후 캡처
                el.onload = () => {
                    // html2canvas로 복제된 DOM 캡처
                    html2canvas(donate, {
                        backgroundColor: "transparent", // 배경 투명 설정
                        allowTaint: true,
                        useCORS: true
                    }).then((canvas) => {
                        const imageDataURL = canvas.toDataURL('image/png'); // 캡처된 이미지의 DataURL
                        console.log('Captured image:', imageDataURL);

                        // 이미지를 파일로 다운로드 (선택 사항)
                        save2png(imageDataURL, `chrok_soop_donate_${new Date().getTime()}.png`);
                    }).catch((error) => {
                        console.error('Error in html2canvas:', error);
                    });
                };
            }
        });

    } catch (e) {
        console.warn(e);
    }
}

const processChatMessages = (msg: string) => {
    const urlRegex = /\b((https?|ftp):\/\/[-\w@:%.\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))\b/g;
    const updatedText = msg.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" style="color:inherit;">${url}</a>`;
    });

    return updatedText;
}

export const getChatAreaObserver = (DONATE_IMAGE = false) => {
    const callback = (mutationList: MutationRecord[]) => {
        mutationList.forEach((mutation) => {
            mutation.addedNodes.forEach((node: Node) => {
                if (!(node instanceof Element)) {
                    return;
                }

                if (DONATE_IMAGE) {
                    const $donate = node.querySelector(`.${DONATION_COTAINER}`) as HTMLElement;
                    if ($donate && !$donate.dataset.proceed) {
                        $donate.addEventListener('click', () => {
                            console.log($donate);
                            captureDonate(node.toElement());
                        }, false)
                        $donate.dataset.proceed = 'true';
                    }
                }

                const $msg = node.querySelector('#message-original') as HTMLElement;
                if (!$msg) return;
                if (!$msg.dataset.proceed) {
                    $msg.dataset.proceed = 'true';


                    $msg.childNodes.forEach((el: Node) => {
                        try {
                            if (el.nodeName == 'IMG' || (el.nodeName != '#text' && el.toElement().style.display == 'none')) return;
                            el.toElement().innerHTML = processChatMessages(el.textContent || '');
                        } catch (e) {
                            console.log(e, el, typeof el);
                        }
                    })
                }
            });
        });
    };

    return new MutationObserver(callback);
}

export const getNoticeAreaObserver = () => {
    const callback = (mutationList: MutationRecord[]) => {
        mutationList.forEach((mutation) => {
            const { target } = mutation;
            const node = target.toElement();
            if (!node) return;
            const msg = node.querySelector('.msg > p') as HTMLElement;
            if (!msg) return;
            if (!msg.dataset.proceed) {
                const notice = Array<string>();
                msg.childNodes.forEach((el: Node) => {
                    if (el.nodeName == 'IMG') return;

                    if (el.nodeName === '#text') {
                        notice.push(processChatMessages(el.textContent || ''))
                    }
                    else {
                        notice.push(el.toElement().outerHTML);
                    }

                    msg.dataset.proceed = 'true';
                })
                console.log(notice);
                msg.innerHTML = notice.join('');
            }
        })
    };

    return new MutationObserver(callback);
}