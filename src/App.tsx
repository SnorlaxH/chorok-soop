import './App.css'

import Checkbox from './components/Checkbox/Checkbox';

import {
    COPY_PASTE,
    CAPTURE_BUTTON,
    CHAT_URL_LINK,
    COMMENT_SHORTCUT,
    DONATE_IMAGE_SAVE,
    DONATE_IMAGE_HIDE,
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
                </div>

                <hr />

                <div className="config-group">

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
                    <Checkbox id={DONATE_IMAGE_SAVE}>
                        <div className="config-item">
                            <p className="item-title">후원 이미지 저장</p>
                            <p className="item-desc">후원 채팅을 클릭해 이미지로 저장합니다.</p>
                        </div>
                    </Checkbox>
                </div>
            </div>

            <div className="footer">{APP_VER}</div>
        </>
    )
}

export default App
