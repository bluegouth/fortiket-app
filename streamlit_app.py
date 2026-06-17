import math
from PIL import Image

import streamlit as st
from streamlit_image_coordinates import streamlit_image_coordinates

st.set_page_config(
    page_title="포티켓 챌린지",
    page_icon="📸",
    layout="wide"
)

# ==========================
# 초기 상태
# ==========================

defaults = {
    "page": "home",

    "quiz_stamp": False,
    "spot_stamp": False,
    "ai_stamp": False,

    "show_back_warning": False,

    "found_1": [],
    "found_2": []
}

for k, v in defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ==========================
# 공통 함수
# ==========================

def stamp_count():
    return (
        int(st.session_state.quiz_stamp)
        + int(st.session_state.spot_stamp)
        + int(st.session_state.ai_stamp)
    )

def back_button():

    col1, col2 = st.columns([1,8])

    with col1:
        if st.button("⬅", use_container_width=True):
            st.session_state.show_back_warning = True

    if st.session_state.show_back_warning:

        st.warning(
            "홈으로 이동하면 현재 진행 중인 내용은 저장되지 않습니다."
        )

        c1, c2 = st.columns(2)

        with c1:
            if st.button("이동"):
                st.session_state.page = "home"
                st.session_state.show_back_warning = False

                # 진행 중 데이터 초기화
                st.session_state.found_1 = []
                st.session_state.found_2 = []

                st.rerun()

        with c2:
            if st.button("취소"):
                st.session_state.show_back_warning = False
                st.rerun()

def check_click(x, y, answers, found):

    RADIUS = 50

    for i, (ax, ay) in enumerate(answers):

        if i in found:
            continue

        dist = math.sqrt(
            (x-ax)**2 + (y-ay)**2
        )

        if dist <= RADIUS:
            return i

    return None

# ==========================
# HOME
# ==========================

if st.session_state.page == "home":

    st.title("📸 포티켓 챌린지")

    st.markdown("### 도장을 눌러 체험을 시작하세요")

    st.write("")
    st.write("")

    c1, c2, c3 = st.columns(3)

    # 퀴즈

    with c1:

        icon = "🏅" if st.session_state.quiz_stamp else "⭕"

        if st.button(
            f"{icon}\n\n퀴즈",
            use_container_width=True
        ):
            st.session_state.page = "quiz"
            st.rerun()

    # 틀린그림

    with c2:

        icon = "🏅" if st.session_state.spot_stamp else "⭕"

        if st.button(
            f"{icon}\n\n틀린 그림 찾기",
            use_container_width=True
        ):
            st.session_state.page = "spot"
            st.rerun()

    # AI 체험

    with c3:

        icon = "🏅" if st.session_state.ai_stamp else "⭕"

        if st.button(
            f"{icon}\n\nAI 합성 체험",
            use_container_width=True
        ):
            st.session_state.page = "ai"
            st.rerun()

    st.divider()

    st.metric(
        "획득한 도장",
        f"{stamp_count()}/3"
    )

    if stamp_count() == 3:
        st.balloons()
        st.success(
            "🏆 포티켓 마스터!"
        )

# ==========================
# QUIZ
# ==========================

elif st.session_state.page == "quiz":

    back_button()

    st.title("📝 퀴즈")

    q1 = st.radio(
        "1. 사진 관련 피해를 예방하는 방법으로 적절하지 않은 것은?",
        [
            "친구 사진을 올리기 전에 동의를 받는다",
            "개인정보가 보이는 사진은 올리지 않는다",
            "SNS 공개 범위를 설정한다",
            "허락받고 찍었으니 마음대로 업로드한다"
        ]
    )

    q2 = st.radio(
        "2. 초상권 보호의 근거가 되는 법은?",
        [
            "특허법",
            "개인정보보호법",
            "헌법",
            "초상권보호법"
        ]
    )

    q3 = st.radio(
        "3. 원치 않는 사진이 게시되었을 때 가장 먼저 해야 할 행동은?",
        [
            "친구들에게 퍼뜨린다",
            "증거 확보 후 도움 요청",
            "참고 넘긴다",
            "계정 삭제"
        ]
    )

    if st.button("채점하기"):

        score = 0

        if q1 == "허락받고 찍었으니 마음대로 업로드한다":
            score += 1

        if q2 == "헌법":
            score += 1

        if q3 == "증거 확보 후 도움 요청":
            score += 1

        st.success(f"{score}/3")

        if score >= 2:
            st.session_state.quiz_stamp = True
            st.success("🏅 도장 획득!")

# ==========================
# 틀린 그림 찾기
# ==========================

elif st.session_state.page == "spot":

    back_button()

    st.title("🔍 틀린 그림 찾기")

    ANSWERS_1 = [
        (300, 250),
        (500, 450),
        (700, 600)
    ]

    ANSWERS_2 = [
        (200, 300),
        (450, 400),
        (650, 250)
    ]

    # 문제1

    if len(st.session_state.found_1) < len(ANSWERS_1):

        st.subheader("문제 1")

        c1, c2 = st.columns(2)

        with c1:
            st.image("images/1-1.png")

        with c2:

            img = Image.open("images/1-2.png")

            value = streamlit_image_coordinates(
                img,
                key="problem1"
            )

        st.write(
            f"찾음: {len(st.session_state.found_1)} / {len(ANSWERS_1)}"
        )

        if value:

            idx = check_click(
                value["x"],
                value["y"],
                ANSWERS_1,
                st.session_state.found_1
            )

            if idx is not None:

                st.session_state.found_1.append(idx)

                st.success("정답!")

                st.rerun()

    # 문제2

    else:

        st.subheader("문제 2")

        c1, c2 = st.columns(2)

        with c1:
            st.image("images/2-1.png")

        with c2:

            img = Image.open("images/2-2.png")

            value = streamlit_image_coordinates(
                img,
                key="problem2"
            )

        st.write(
            f"찾음: {len(st.session_state.found_2)} / {len(ANSWERS_2)}"
        )

        if value:

            idx = check_click(
                value["x"],
                value["y"],
                ANSWERS_2,
                st.session_state.found_2
            )

            if idx is not None:

                st.session_state.found_2.append(idx)

                st.success("정답!")

                st.rerun()

        if len(st.session_state.found_2) == len(ANSWERS_2):

            st.session_state.spot_stamp = True

            st.success(
                "🏅 틀린 그림 찾기 완료!"
            )

# ==========================
# AI 체험
# ==========================

elif st.session_state.page == "ai":

    back_button()

    st.title("🤖 AI 합성 피해 체험")

    st.info(
        "현재 준비 중입니다."
    )

    if st.button("임시 완료"):

        st.session_state.ai_stamp = True

        st.success(
            "🏅 도장 획득!"
        )