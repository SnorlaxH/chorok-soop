import { COMMENT_LINK_BUTTON, COMMENT_SHORTCUT } from '../constants/storage.ts';
import '../utils/prototype.ts';
import { COMMENT_MODIFY, COMMENT_SUBMIT, COMMENT_WRITE, COMMENT_SECTION } from '../constants/selectors.ts';

export const isPostPage = () => {
    return document.URL.includes("ch.sooplive.co.kr") && document.URL.includes('/post/');
}

export const injectPostPage = () => {
    chrome.storage.local.get(
        [COMMENT_SHORTCUT, COMMENT_LINK_BUTTON],
        async (res) => {
            if (!isPostPage) return;

            if (res[COMMENT_SHORTCUT]) {
                const submitEvent = (event: KeyboardEvent) => {
                    const { target } = event;
                    if (target instanceof HTMLElement) {
                        if (event.ctrlKey && event.key === 'Enter') {
                            const section = target.closest(COMMENT_SECTION);
                            if (COMMENT_WRITE === target.id) {
                                section?.querySelector(COMMENT_SUBMIT)?.toElement().click();
                            }
                            else if (target.id.includes(COMMENT_MODIFY)) {
                                section?.querySelector(COMMENT_SUBMIT)?.toElement().click();
                            }
                        }
                    }
                }

                document.addEventListener('keydown', submitEvent);
            }

            if (res[COMMENT_LINK_BUTTON]) {
                const pattern = /^https:\/\/ch\.sooplive\.co\.kr\/([^\/]+)\/post\/([^\/#?]+)(?:[#?].*)?$/;
                const match = document.URL.match(pattern)

                if (!match) {
                    console.error('패턴에 일치하지 않는 URL');
                    return
                }

                const streamer = match[1];
                const title_no = match[2];


                setTimeout(async () => {
                    const comments = await fetchComments(streamer, title_no);
                    addHighlightButton(comments)
                }, 1000);
            }
        }
    )
}

const fetchComments = async (streamer: string, title_no: string): Promise<Array<any>> => {
    let commentList = Array<any>();
    let page = 1;
    let maxPage = 1;
    const FETCH_COMMENT = `https://chapi.sooplive.co.kr/api/`
    try {
        while (page <= maxPage) {
            const params = {
                page,
                orderby: 'reg_date',
                p_comment_no: '',
                c_comment_no: '',
                p_highlight_no: '',
                c_highlight_no: '',
            };
            const res = await fetch(`${FETCH_COMMENT}${streamer}/title/${title_no}/comment?${Object.entries(params).map((r) => r.join('=')).join('&')}`);
            const data = await res.json();

            if (data.data) {
                commentList = commentList.concat(data.data);
                maxPage = data.meta.last_page;
                console.log(`${page} / ${maxPage}`)
                page++;
            } else {
                console.error('댓글 로드 에러', data)
                break;
            }
        }
    } catch (err) {
        console.log(err);
    }

    return commentList;
}

const addHighlightButton = (commentList: Array<any>) => {
    const elComments = document.querySelectorAll('ul.cmmt-list > li')

    if (!elComments.length) {
        console.error('현재 페이지에서 댓글을 탐색 실패')
        return;
    }

    elComments.forEach((el) => {
        const autorWrap = el.querySelector('.cmmt-header .autor_wrap');
        const util = el.querySelector('.cmmt-header .util');
        const cmmtBtn = el.querySelector('.cmmt-btn');

        if (autorWrap && util) {
            const elNickname: HTMLElement | null = autorWrap.querySelector('div > button > p');
            const elTime: HTMLElement | null = autorWrap.querySelector('div > span');

            const nickname = elNickname ? elNickname.innerText : '';
            const time = elTime ? elTime.innerText : '';

            const filter: any = commentList.find((r: any) => r.user_nick === nickname.split('(')[0] && r.reg_date === time)

            if (filter) {
                const button = document.createElement('button');
                button.innerHTML = `
                        <div style="display: block;position: absolute;top: 50%;margin-top: -5px;left: 0;width: 1px;height: 10px;background-color: #e2e3e4;"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="76" height="28" viewBox="0 0 76 28" fill="none">
                            <g transform="translate(6, 5) scale(0.9)" stroke="#00786f" fill="none">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5.7736 8.7256a1.8 1.8 0 1 0 0 1.7488m0-1.7488c.144 .2592 .2264 .5568 .2264 .8744s-.0824 .616-.2264 .8744 m0-1.7488 7.6528-4.2512m-7.6528 6 7.6528 4.2512m0 0a1.8 1.8 0 1 0 3.148 1.7488 1.8 1.8 0 0 0-3.148-1.7488 Zm0-10.2512a1.8 1.8 0 1 0 3.1464-1.748 1.8 1.8 0 0 0-3.1464 1.748Z" />
                            </g>
                            <text x="27" y="18" fill="#00786f" font-family="sans-serif" font-size="11">링크 공유</text>
                        </svg>`;
                button.style.position = 'relative';
                button.style.padding = '2px 4px';
                button.style.cursor = 'pointer';
                button.dataset.comment = filter.p_comment_no;

                button.addEventListener('click', function () {
                    const commentId = this.dataset.comment;
                    let url = window.location.href;

                    // #으로 시작하는 selector가 있는지 확인
                    if (url.includes('#')) {
                        // # 이후의 부분을 제거
                        url = url.split('#')[0];
                    }

                    // 새로운 URL 생성
                    const newUrl = `${url}#comment_noti${commentId}`;

                    // 클립보드에 복사
                    navigator.clipboard.writeText(newUrl).then(() => {
                        alert('URL이 클립보드에 복사되었습니다.');
                    }).catch(err => {
                        console.error('클립보드 복사 중 에러 발생:', err);
                    });
                });

                cmmtBtn?.appendChild(button);
            }
        }
    })
}