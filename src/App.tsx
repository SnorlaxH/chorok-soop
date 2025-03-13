import './App.css'

import Checkbox from './components/Checkbox/Checkbox';

import {
    COPY_PASTE,
    CAPTURE_BUTTON,
    CHAT_URL_LINK,
    COMMENT_SHORTCUT,
    DONATE_IMAGE_SAVE,
    DONATE_IMAGE_HIDE,
    AUDIO_COMP_BUTTON,
    USE_AUTO_UP,
    FAST_FORWARD_BUTTON,
    STATS_PLAYER,
} from './constants/storage';

const APP_VER = `ver. ${chrome.runtime.getManifest().version}`

function App() {
    return (
        <>
            <div className="app">
                <img src="./icon64.png" />
                <div className="app-name">쵸록 숲</div>
                <div>변경된 설정은 새로고침 후 적용됩니다.</div>
            </div>

            <div className="main">
                <div className="config-group">
                    <h2>라이브 & VOD</h2>
                    <Checkbox id={COPY_PASTE}>
                        <div className="config-item">
                            <p className="item-title">채팅창 복사&붙여넣기</p>
                            <p className="item-desc">채팅창 복사 붙여넣기를 활성화합니다.</p>
                        </div>
                    </Checkbox>

                    <Checkbox id={CAPTURE_BUTTON}>
                        <div className="config-item">
                            <p className="item-title">스크린샷</p>
                            <p className="item-desc">방송화면에 스크린샷 버튼을 추가합니다.</p>
                        </div>
                    </Checkbox>

                    <Checkbox id={CHAT_URL_LINK}>
                        <div className="config-item">
                            <p className="item-title">채팅창 URL 연결</p>
                            <p className="item-desc">채팅창 URL 클릭 시 새 창으로 연결됩니다.</p>
                        </div>
                    </Checkbox>

                    <Checkbox id={DONATE_IMAGE_HIDE}>
                        <div className="config-item">
                            <p className="item-title">후원 메시지 숨기기</p>
                            <p className="item-desc">채팅창에 후원 메시지를 숨깁니다.</p>
                        </div>
                    </Checkbox>

                    <Checkbox id={AUDIO_COMP_BUTTON}>
                        <div className="config-item">
                            <p className="item-title">오디오 컴프레서</p>
                            <p className="item-desc">오디오 컴프레서를 활성화 해 볼륨을 증폭합니다.</p>
                        </div>
                    </Checkbox>

                    <Checkbox id={USE_AUTO_UP}>
                        <div className="config-item">
                            <p className="item-title">UP버튼 자동 클릭</p>
                            <p className="item-desc">방송 입장(3초 후)에 자동으로 UP버튼을 누릅니다.</p>
                        </div>
                    </Checkbox>

                    <Checkbox id={FAST_FORWARD_BUTTON}>
                        <div className="config-item">
                            <p className="item-title">빨리 감기</p>
                            <p className="item-desc">라이브 영상의 재생 시간을 최근으로 이동합니다.</p>
                        </div>
                    </Checkbox>

                    <Checkbox id={STATS_PLAYER}>
                        <div className="config-item">
                            <p className="item-title">통계 활성화</p>
                            <p className="item-desc">설정 메뉴에 라이브 통계를 활성화 합니다.</p>
                        </div>
                    </Checkbox>
                </div>

                <hr />

                <div className="config-group">
                    <h2>게시글</h2>
                    <Checkbox id={COMMENT_SHORTCUT}>
                        <div className="config-item">
                            <p className="item-title">댓글 등록 단축키</p>
                            <p className="item-desc">댓글 등록 단축키를 활성화합니다.</p>
                            <p className="item-desc"><kbd>Ctrl</kbd> + <kbd>Enter</kbd></p>
                        </div>
                    </Checkbox>
                </div>

                <hr />

                <div className="config-group">
                    <h2>스트리머 메뉴</h2>
                    <Checkbox id={DONATE_IMAGE_SAVE}>
                        <div className="config-item">
                            <p className="item-title">후원 이미지 저장</p>
                            <p className="item-desc">후원 채팅을 좌클릭 해 이미지로 저장합니다.</p>
                            <p className="item-desc">이미지 처리에 시간이 소요됩니다.</p>
                        </div>
                    </Checkbox>
                </div>
            </div>

            <div className="footer">{APP_VER}</div>
        </>
    )
}

export default App
