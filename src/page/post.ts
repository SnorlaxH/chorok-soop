import { COMMENT_LINK_BUTTON, COMMENT_SHORTCUT } from '../constants/storage.ts';
import '../utils/prototype.ts';
import { COMMENT_SUBMIT, COMMENT_SECTION } from '../constants/selectors.ts';

export const isPostPage = () => {
    return document.URL.includes("sooplive.co.kr/station/") && document.URL.includes('/post/');
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
                            event.preventDefault();
                            event.stopImmediatePropagation();

                            const section = target.closest(COMMENT_SECTION);
                            section?.querySelector(COMMENT_SUBMIT)?.toElement().click();
                            console.log(event);
                        }
                    }
                }

                document.addEventListener('keydown', submitEvent, { capture: true });
            }

            if (res[COMMENT_LINK_BUTTON]) {
                const pattern = /^https:\/\/www\.sooplive\.co\.kr\/station\/([^\/]+)\/post\/([^\/#?]+)(?:[#?].*)?$/;
                const match = document.URL.match(pattern)

                if (!match) {
                    console.error('패턴에 일치하지 않는 URL');
                    return
                }

                const streamer = match[1];
                const title_no = match[2];

                // 스타일 추가
                const crsStyle = document.createElement('style');
                crsStyle.innerHTML = `
                    .crs-comment-button {
                        display: flex;
                        color: #00786f;
                        justify-content: center;
                        align-items: center;
                    }
                    .crs-comment-button:before {
                        content: "";
                        display: block;
                        flex: 0 0 auto;
                        background: var(--soop-mode-fill-fillTertiary);
                        width: 3px;
                        height: 3px;
                        border-radius: 50%;
                    }
                    .crs-comment-button button {
                        display: flex;
                        height: 32px;
                        justify-content: center;
                        align-items: center;
                        gap: 4px;
                        padding: 0 8px;
                        color: #00786f;
                    }
                    .crs-comment-button span {
                        font-size: var(--soop-typographyPrimitives-body-b_sm_r-fontSize)
                    }
                `
                document.head.appendChild(crsStyle);

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
    const elComments = document.querySelectorAll('ul[class^=CommentList_comment] > li[class^=CommentItem_commentInputElement]')

    if (!elComments.length) {
        console.error('현재 페이지에서 댓글을 탐색 실패')
        return;
    }

    elComments.forEach((el) => {
        const commentInfoWrap = el.querySelector('[class^=CommentItem_commentInfo]');
        const reactionWrap = el.querySelector('[class^=CommentItem_reaction]');

        if (commentInfoWrap) {
            const elNickname: HTMLElement | null = commentInfoWrap.querySelector('div[class^=CommentItem_nickname] > div > div');
            const elTime: HTMLElement | null = commentInfoWrap.querySelector('div[class^=CommentItem_registerDate]');

            const nickname = elNickname ? elNickname.innerText : '';
            const time = elTime ? elTime.innerText : '';

            const filter: any = commentList.find((r: any) => r.user_nick === nickname.split('(')[0] && r.reg_date === time)
            console.log(filter);
            if (filter) {
                const button = document.createElement('div');
                button.className = 'crs-comment-button';
                button.innerHTML = `
                    <button>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="null" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:16px; heigth:16px;"> <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /> </svg>
                        <span>링크 공유</span>
                    </button>
                `;
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

                reactionWrap?.appendChild(button);
            }
        }
    })
}