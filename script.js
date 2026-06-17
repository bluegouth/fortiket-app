const state = {
  page: "home",
  quizStamp: false,
  spotStamp: false,
  aiStamp: false,
  aiImageUrl: null,
  aiFaceDetected: false,
  aiSelection: null,
  storyName: "",
  storyScrollIndex: 0,
  spotStage: 1,
  spotFound: [],
  spotFoundPositions: [],
  answers: [
    [
      { x1: 982, y1: 0, x2: 1167, y2: 103 },
      { x1: 547, y1: 783, x2: 625, y2: 882 },
      { x1: 809, y1: 776, x2: 913, y2: 872 },
      { x1: 1357, y1: 561, x2: 1477, y2: 660 }
    ],
    [
      { x1: 568, y1: 341, x2: 838, y2: 675 },
      { x1: 1066, y1: 294, x2: 1305, y2: 491 },
      { x1: 4, y1: 575, x2: 119, y2: 768 },
      { x1: 1055, y1: 832, x2: 1239, y2: 922 }
    ],
    [
      { x1: 961, y1: 196, x2: 1172, y2: 342 },
      { x1: 635, y1: 529, x2: 711, y2: 629 },
      { x1: 6, y1: 816, x2: 178, y2: 943 },
      { x1: 286, y1: 0, x2: 366, y2: 65 }
    ]
  ],
  showAnswerAreas: false,
  spotImages: [
    { original: "images/1-1.png", modified: "images/1-2.png", total: 4 },
    { original: "images/2-1.png", modified: "images/2-2.png", total: 4 },
    { original: "images/3-1.png", modified: "images/3-2.png", total: 4 }
  ]
};

const pageSections = {
  home: document.getElementById("home"),
  quiz: document.getElementById("quiz"),
  spot: document.getElementById("spot"),
  story: document.getElementById("story"),
  storyScroll: document.getElementById("story-scroll")
};

const quizForm = document.getElementById("quiz-form");
const quizResult = document.getElementById("quiz-result");
const stampCount = document.getElementById("stamp-count");
const completionMessage = document.getElementById("completion-message");
const quizIcon = document.getElementById("quiz-icon");
const spotIcon = document.getElementById("spot-icon");
const aiIcon = document.getElementById("ai-icon");
const aiImageInput = document.getElementById("ai-image-input");
const aiActionButton = document.getElementById("ai-action-button");
const aiRemoveBgButton = document.getElementById("ai-remove-bg-button");
const aiImagePreview = document.getElementById("ai-image-preview");
const aiFacePreview = document.getElementById("ai-face-preview");
const aiSelectionOverlay = document.getElementById("ai-selection-overlay");
const aiSelectionBox = document.getElementById("ai-selection-box");
const aiStatus = document.getElementById("ai-status");
const storyStageText = document.getElementById("story-stage-text");
const storyRestartButton = document.getElementById("story-restart-button");
const storyPostButton = document.getElementById("story-post-button");
const storyPostUser = document.getElementById("story-post-user");
const storyPostUserCaption = document.getElementById("story-post-user-caption");
const storyPostCaption = document.getElementById("story-post-caption");
const storyPostImage = document.getElementById("story-post-image");
const storyFaceOverlay = document.getElementById("story-face-overlay");
const syntheticPostCard = document.getElementById("synthetic-post-card");
const syntheticFaceOverlay = document.getElementById("synthetic-face-overlay");
const storyLikeCount = document.getElementById("story-like-count");
const storyCommentCount = document.getElementById("story-comment-count");
const storyShareCount = document.getElementById("story-share-count");
const storyChoiceResult = document.getElementById("story-choice-result");
const storyScrollShell = document.getElementById("story-scroll-shell");
const storyScrollSections = Array.from(document.querySelectorAll(".story-scroll-section"));
const spotStageText = document.getElementById("spot-stage-text");
const spotStatus = document.getElementById("spot-status");
const spotFoundCount = document.getElementById("spot-found-count");
const spotTotalCount = document.getElementById("spot-total-count");
const spotLeftImage = document.getElementById("spot-left-image");
const spotRightImage = document.getElementById("spot-right-image");
const spotShell = document.getElementById("spot-shell");
const spotClickMarkers = document.getElementById("spot-click-markers");
const spotClickMarker = document.getElementById("spot-click-marker");
const spotSetupOutput = document.getElementById("spot-setup-output");
const spotReset = document.getElementById("spot-reset");
const spotNext = document.getElementById("spot-next");
const spotPrivacyMessage = document.getElementById("spot-privacy-message");
const pageButtons = Array.from(document.querySelectorAll("[data-page]"));

function setPage(page) {
  state.page = page;
  Object.values(pageSections).forEach((section) => {
    section.classList.toggle("hidden", section.id !== page);
  });
  if (page === "spot") {
    renderSpot();
  }
  if (page === "story-scroll") {
    storyScrollShell.scrollTop = 0;
  }
}

function updateStamps() {
  const total = Number(state.quizStamp) + Number(state.spotStamp) + Number(state.aiStamp);
  stampCount.textContent = `${total}/3`;
  quizIcon.textContent = state.quizStamp ? "🏅" : "📝";
  spotIcon.textContent = state.spotStamp ? "🏅" : "🔍";
  aiIcon.textContent = state.aiStamp ? "🏅" : "🎭";

  if (total === 3) {
    completionMessage.textContent = "🏆 모든 도장을 획득했습니다.";
  } else {
    completionMessage.textContent = "";
  }
}

function getSpotCoordinates(event) {
  const rect = spotRightImage.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const width = rect.width;
  const height = rect.height;
  const naturalWidth = spotRightImage.naturalWidth;
  const naturalHeight = spotRightImage.naturalHeight;
  return {
    x: Math.round((x / width) * naturalWidth),
    y: Math.round((y / height) * naturalHeight)
  };
}

function isInsideRect(x, y, rect) {
  const left = Math.min(rect.x1, rect.x2);
  const right = Math.max(rect.x1, rect.x2);
  const top = Math.min(rect.y1, rect.y2);
  const bottom = Math.max(rect.y1, rect.y2);
  return x >= left && x <= right && y >= top && y <= bottom;
}

function getHitIndex(x, y) {
  return state.answers[state.spotStage - 1].findIndex((rect, index) => {
    if (state.spotFound.includes(index)) return false;
    return isInsideRect(x, y, rect);
  });
}

let spotMarkerTimer = null;

function renderSpot() {
  const current = state.spotImages[state.spotStage - 1];
  spotLeftImage.src = current.original;
  spotRightImage.src = current.modified;
  spotStageText.textContent = `문제 ${state.spotStage} - 이미지를 클릭해 차이를 찾아보세요.`;
  spotFoundCount.textContent = state.spotFound.length;
  spotTotalCount.textContent = current.total;
  spotNext.classList.toggle("hidden", state.spotFound.length < current.total);
  renderSpotMarkers();
  renderAnswerAreas();
}

function showPrivacyMessage(stage) {
  const messages = {
    1: [
      "명찰에는 이름, 학번 등이 포함될 수 있습니다.",
      "사진을 게시하기 전에는 명찰이 보이지 않는지 확인해 보세요."
    ],
    2: [
      "모니터 주변의 포스트잇에 계정 정보, 일정, 연락처 등을 적었다면 주의하세요.",
      "사소해 보이는 메모도 개인정보 유출의 원인이 될 수 있습니다."
    ],
    3: [
      "택배 송장에는 이름, 주소, 전화번호가 포함되어 있습니다.",
      "송장이 보이는 사진을 공유하면 개인정보가 노출될 수 있습니다."
    ]
  };

  const lines = messages[stage] || ["개인정보 보호를 항상 신경 쓰세요."];
  spotPrivacyMessage.innerHTML = `
    <div class="privacy-card">
      <button type="button" class="privacy-close" aria-label="닫기">×</button>
      ${lines.map((line) => `<p><span class="privacy-emoji">📌</span>${line}</p>`).join("")}
    </div>
  `;
  spotPrivacyMessage.classList.remove("hidden");

  const closeButton = spotPrivacyMessage.querySelector(".privacy-close");
  if (closeButton) {
    closeButton.addEventListener("click", hidePrivacyMessage, { once: true });
  }
}

function hidePrivacyMessage() {
  spotPrivacyMessage.classList.add("hidden");
}

function renderSetupInfo() {
  // setup UI removed; keep output hidden
  if (spotSetupOutput) spotSetupOutput.classList.add("hidden");
}

function renderSpotMarkers() {
  spotClickMarkers.innerHTML = "";
  const rect = spotRightImage.getBoundingClientRect();

  state.spotFoundPositions.forEach((pos) => {
    const displayX = (pos.x / spotRightImage.naturalWidth) * rect.width;
    const displayY = (pos.y / spotRightImage.naturalHeight) * rect.height;

    const marker = document.createElement("span");
    marker.className = "permanent-marker";
    marker.style.left = `${displayX}px`;
    marker.style.top = `${displayY}px`;
    spotClickMarkers.appendChild(marker);
  });
}

function renderAnswerAreas() {
  const container = document.getElementById("spot-answer-areas");
  container.innerHTML = "";

  if (!state.showAnswerAreas) {
    return;
  }

  const rect = spotRightImage.getBoundingClientRect();

  state.answers[state.spotStage - 1].forEach((answer) => {
    const left = Math.min(answer.x1, answer.x2);
    const top = Math.min(answer.y1, answer.y2);
    const width = Math.abs(answer.x2 - answer.x1);
    const height = Math.abs(answer.y2 - answer.y1);
    const displayLeft = (left / spotRightImage.naturalWidth) * rect.width;
    const displayTop = (top / spotRightImage.naturalHeight) * rect.height;
    const displayWidth = (width / spotRightImage.naturalWidth) * rect.width;
    const displayHeight = (height / spotRightImage.naturalHeight) * rect.height;

    const area = document.createElement("span");
    area.className = "spot-answer-area";
    area.style.width = `${displayWidth}px`;
    area.style.height = `${displayHeight}px`;
    area.style.left = `${displayLeft}px`;
    area.style.top = `${displayTop}px`;
    container.appendChild(area);
  });
}

function updateAiControls() {
  aiRemoveBgButton.disabled = !state.aiSelection;
  storyPostButton.classList.toggle("hidden", !state.aiFaceDetected);
  storyPostButton.disabled = !state.aiFaceDetected;
}

function resetAiPreview() {
  state.aiImageUrl = null;
  state.aiFaceDetected = false;
  state.aiSelection = null;
  state.storyName = "";
  state.storyScrollIndex = 0;
  aiImagePreview.src = "";
  aiFacePreview.src = "";
  storyPostImage.src = "";
  storyFaceOverlay.src = "";
  storyFaceOverlay.classList.add("hidden");
  syntheticFaceOverlay.src = "";
  syntheticPostCard.classList.add("hidden");
  storyPostUser.textContent = "";
  storyPostUserCaption.textContent = "";
  storyPostCaption.textContent = "오늘 찍은 원본 사진을 올렸습니다.";
  storyLikeCount.textContent = "❤️ 12";
  storyCommentCount.textContent = "💬 1";
  storyShareCount.textContent = "↗ 공유 0";
  storyChoiceResult.classList.add("hidden");
  storyChoiceResult.textContent = "";
  aiStatus.textContent = "사진을 선택하고 얼굴 영역을 지정하세요.";
  storyStageText.textContent = "이름을 입력하고 사진을 촬영해주세요.";
  aiSelectionOverlay.classList.add("hidden");
  aiSelectionBox.style.width = "0";
  aiSelectionBox.style.height = "0";
  resetStoryScrollSections();
  storyScrollShell.scrollTop = 0;
  updateAiControls();
}

async function loadAiImage(file) {
  if (!file) return;
  if (state.aiImageUrl) {
    URL.revokeObjectURL(state.aiImageUrl);
  }

  state.aiImageUrl = URL.createObjectURL(file);
  state.aiFaceDetected = false;
  state.aiSelection = null;
  aiImagePreview.src = state.aiImageUrl;
  aiFacePreview.src = "";
  storyPostButton.classList.add("hidden");
  storyPostButton.disabled = true;
  aiStatus.textContent = state.storyName
    ? "사진이 선택되었습니다. 얼굴 영역을 선택하세요."
    : "이름을 먼저 입력하면 스토리 흐름이 더 명확해집니다.";
  aiSelectionOverlay.classList.remove("hidden");
  aiSelectionBox.style.width = "0";
  aiSelectionBox.style.height = "0";
  updateStoryStage();
  updateAiControls();
}

function setAiSelection(selection) {
  if (!selection) {
    state.aiSelection = null;
    aiSelectionBox.style.width = "0";
    aiSelectionBox.style.height = "0";
    updateStoryStage();
    updateAiControls();
    return;
  }

  state.aiSelection = {
    x: Math.max(0, selection.x),
    y: Math.max(0, selection.y),
    width: Math.max(1, selection.width),
    height: Math.max(1, selection.height)
  };

  state.aiFaceDetected = false;
  aiStatus.textContent = "얼굴 영역이 선택되었습니다. 배경제거 버튼을 눌러주세요.";
  drawSelectionBox();
  updateStoryStage();
  updateAiControls();
}

function drawSelectionBox() {
  if (!state.aiSelection || !aiImagePreview.naturalWidth) {
    aiSelectionBox.style.width = "0";
    aiSelectionBox.style.height = "0";
    return;
  }

  const rect = aiImagePreview.getBoundingClientRect();
  const ratioX = rect.width / aiImagePreview.naturalWidth;
  const ratioY = rect.height / aiImagePreview.naturalHeight;

  aiSelectionBox.style.left = `${Math.round(state.aiSelection.x * ratioX)}px`;
  aiSelectionBox.style.top = `${Math.round(state.aiSelection.y * ratioY)}px`;
  aiSelectionBox.style.width = `${Math.round(state.aiSelection.width * ratioX)}px`;
  aiSelectionBox.style.height = `${Math.round(state.aiSelection.height * ratioY)}px`;
}

function updateStoryStage() {
  if (!state.storyName) {
    storyStageText.textContent = "이름을 입력하고 사진을 촬영해주세요.";
    return;
  }

  if (!state.aiImageUrl) {
    storyStageText.textContent = `${state.storyName}님, 사진을 업로드하고 얼굴을 선택해주세요.`;
    return;
  }

  if (!state.aiSelection) {
    storyStageText.textContent = `${state.storyName}님, 이미지 위에서 얼굴 영역을 선택하세요.`;
    return;
  }

  if (!state.aiFaceDetected) {
    storyStageText.textContent = `${state.storyName}님, 선택한 영역에서 배경제거를 완료하세요.`;
    return;
  }

  storyStageText.textContent = `${state.storyName}님, 배경제거가 완료되었습니다.`;
}

function getNaturalSelection(displayRect) {
  const rect = aiImagePreview.getBoundingClientRect();
  const ratioX = aiImagePreview.naturalWidth / rect.width;
  const ratioY = aiImagePreview.naturalHeight / rect.height;

  return {
    x: Math.round(displayRect.x * ratioX),
    y: Math.round(displayRect.y * ratioY),
    width: Math.round(displayRect.width * ratioX),
    height: Math.round(displayRect.height * ratioY)
  };
}

function getSelectionFromDisplay(start, end) {
  const rect = aiImagePreview.getBoundingClientRect();
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(start.x - end.x);
  const height = Math.abs(start.y - end.y);

  const clampedX = Math.max(0, Math.min(x, rect.width));
  const clampedY = Math.max(0, Math.min(y, rect.height));
  const clampedW = Math.max(1, Math.min(width, rect.width - clampedX));
  const clampedH = Math.max(1, Math.min(height, rect.height - clampedY));

  return getNaturalSelection({ x: clampedX, y: clampedY, width: clampedW, height: clampedH });
}

async function removeBackgroundFromSelection() {
  if (!state.aiImageUrl) {
    aiStatus.textContent = "먼저 사진을 선택해주세요.";
    return;
  }

  if (!state.aiSelection) {
    aiStatus.textContent = "얼굴 영역을 선택하세요.";
    return;
  }

  aiStatus.textContent = "배경제거를 처리하는 중입니다...";

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = state.aiImageUrl;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = img.naturalWidth;
    maskCanvas.height = img.naturalHeight;
    const maskCtx = maskCanvas.getContext("2d");
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.clearRect(state.aiSelection.x, state.aiSelection.y, state.aiSelection.width, state.aiSelection.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const maskAlpha = maskData.data[i + 3];
      if (maskAlpha === 0) {
        continue;
      }
      imageData.data[i + 3] = 0;
    }

    ctx.putImageData(imageData, 0, 0);

    const faceCanvas = document.createElement("canvas");
    faceCanvas.width = state.aiSelection.width;
    faceCanvas.height = state.aiSelection.height;
    const faceCtx = faceCanvas.getContext("2d");
    faceCtx.drawImage(
      canvas,
      state.aiSelection.x,
      state.aiSelection.y,
      state.aiSelection.width,
      state.aiSelection.height,
      0,
      0,
      faceCanvas.width,
      faceCanvas.height
    );

    aiFacePreview.src = faceCanvas.toDataURL("image/png");
    state.aiFaceDetected = true;
    aiStatus.textContent = "배경제거 완료! SNS 게시 버튼을 눌러 합성 피해 상황을 확인하세요.";
  } catch (error) {
    console.error(error);
    aiStatus.textContent = "배경제거에 실패했습니다. 다른 사진을 시도해주세요.";
    state.aiFaceDetected = false;
  }

  updateAiControls();
  updateStoryStage();
}

async function publishStoryPost() {
  if (!state.aiFaceDetected) {
    aiStatus.textContent = "먼저 얼굴 영역 배경제거를 완료해주세요.";
    return;
  }

  const displayName = state.storyName || "친구";
  storyPostUser.textContent = displayName;
  storyPostUserCaption.textContent = displayName;
  showOriginalPost();
  resetStoryScrollSections();
  state.storyScrollIndex = 0;
  setPage("story-scroll");
}

function showOriginalPost() {
  storyPostImage.src = state.aiImageUrl || aiImagePreview.src;
  storyFaceOverlay.src = "";
  storyFaceOverlay.classList.add("hidden");
  syntheticFaceOverlay.src = "";
  syntheticPostCard.classList.add("hidden");
  storyPostCaption.textContent = "오늘 찍은 원본 사진을 올렸습니다.";
  storyLikeCount.textContent = "❤️ 12";
  storyCommentCount.textContent = "💬 1";
  storyShareCount.textContent = "↗ 공유 0";
}

function showSyntheticPost() {
  syntheticFaceOverlay.src = aiFacePreview.src;
  syntheticPostCard.classList.remove("hidden");
  storyPostCaption.textContent = "원본 사진이 퍼진 뒤, 합성본까지 유포되기 시작했습니다.";
  storyLikeCount.textContent = "❤️ 1,248";
  storyCommentCount.textContent = "💬 98";
  storyShareCount.textContent = "↗ 공유 42";
}

function applyStoryStepEffect(step) {
  if (step === "reaction") {
    // play reaction animation and gradually update counts
    triggerReactions();
  }

  if (step === "spread") {
    triggerReactions(8, { likes: 326, comments: 37, shares: 15 });
  }

  if (step === "synthetic" || step === "mocking" || step === "response") {
    showSyntheticPost();
  }
}

function triggerReactions(times = 6, finalCounts = { likes: 84, comments: 12, shares: 3 }) {
  const baseLikes = parseInt((storyLikeCount.textContent || '❤️ 0').replace(/[^0-9]/g, '')) || 0;
  let created = 0;
  const interval = setInterval(() => {
    spawnHeart();
    created += 1;
    const current = baseLikes + created * Math.round((finalCounts.likes - baseLikes) / times || 1);
    storyLikeCount.textContent = `❤️ ${current}`;
    if (created >= times) {
      clearInterval(interval);
      storyLikeCount.textContent = `❤️ ${finalCounts.likes}`;
      storyCommentCount.textContent = `💬 ${finalCounts.comments}`;
      storyShareCount.textContent = `↗ 공유 ${finalCounts.shares}`;
    }
  }, 180);
}

function spawnHeart() {
  const shell = document.querySelector('.synth-post-shell') || storyScrollShell;
  if (!shell) return;
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = '❤️';
  // position near like count
  const rect = shell.getBoundingClientRect();
  heart.style.left = `${Math.floor(Math.random() * (rect.width * 0.6)) + 12}px`;
  heart.style.top = `${rect.height - 32}px`;
  shell.appendChild(heart);
  setTimeout(() => {
    heart.remove();
  }, 1000);
}

// handle response button interactions
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.story-choice');
  if (!btn) return;

  // reset other choice button visual states
  document.querySelectorAll('.story-choice').forEach((b) => {
    if (b !== btn) {
      b.classList.remove('correct', 'wrong', 'pressed');
    }
  });

  // visual press
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 160);

  // clear previous result state
  storyChoiceResult.classList.remove('success', 'warning');

  // mark correctness
  if (btn.dataset.choice === 'safe') {
    btn.classList.add('correct');
    // slide away the synthetic post if present and show congrats
    if (syntheticPostCard) {
      syntheticPostCard.classList.add('slide-away');
      syntheticPostCard.addEventListener('transitionend', () => {
        syntheticPostCard.classList.add('hidden');
        syntheticPostCard.classList.remove('slide-away');
      }, { once: true });
    }
    storyChoiceResult.classList.remove('hidden');
    storyChoiceResult.classList.add('success');
    storyChoiceResult.textContent = '정답입니다! 도움을 요청하고 신고한 후 상황을 정리했어요. 잘 대처했습니다.';
    if (!state.aiStamp) {
      state.aiStamp = true;
      updateStamps();
      completionMessage.textContent = '🏅 스토리 대처 도장을 획득했습니다!';
    }

    // append follow-up story section after help request
    const followUp = document.createElement('div');
    followUp.className = 'story-scroll-section hidden';
    followUp.dataset.storyStep = 'after-help';
    followUp.innerHTML = `
      <h3>도움 요청 후 상황</h3>
      <p>신고와 도움 요청으로 합성 유포는 빠르게 차단되었고, 피해는 최소화되었습니다. 지원 기관과 함께 대응을 계속합니다.</p>
    `;
    storyScrollShell.appendChild(followUp);
    storyScrollSections.push(followUp);
    // reveal the new follow-up section immediately
    revealNextStorySection();

  } else {
    btn.classList.add('wrong');
    storyChoiceResult.classList.remove('hidden');
    storyChoiceResult.classList.add('warning');
    storyChoiceResult.textContent = btn.dataset.choice === 'angry'
      ? '댓글 싸움은 상황을 악화시킬 수 있습니다. 증거를 보관하고 신고하세요.'
      : '아무 행동을 하지 않으면 유포가 지속될 수 있습니다. 증거 보관과 도움 요청을 고려하세요.';
  }
});

function showSpotMarker(x, y, success) {
  const rect = spotRightImage.getBoundingClientRect();
  const displayX = (x / spotRightImage.naturalWidth) * rect.width;
  const displayY = (y / spotRightImage.naturalHeight) * rect.height;

  spotClickMarker.style.left = `${displayX}px`;
  spotClickMarker.style.top = `${displayY}px`;
  spotClickMarker.classList.remove("hidden", "correct", "incorrect");
  spotClickMarker.classList.add("visible", success ? "correct" : "incorrect");

  if (spotMarkerTimer) {
    clearTimeout(spotMarkerTimer);
  }

  spotMarkerTimer = setTimeout(() => {
    spotClickMarker.classList.remove("visible");
    spotClickMarker.classList.add("hidden");
  }, 700);
}

spotShell.addEventListener("click", (event) => {
  if (state.page !== "spot") return;
  const { x, y } = getSpotCoordinates(event);

  const hitIndex = getHitIndex(x, y);

  if (hitIndex !== -1) {
    state.spotFound.push(hitIndex);
    state.spotFoundPositions.push({ x, y });
    spotFoundCount.textContent = state.spotFound.length;
    renderSpotMarkers();
    if (state.spotFound.length === state.spotImages[state.spotStage - 1].total) {
      spotNext.classList.remove("hidden");
      showPrivacyMessage(state.spotStage);
      if (!state.spotStamp) {
        state.spotStamp = true;
        updateStamps();
        completionMessage.textContent = "🏅 틀린 그림 찾기 도장을 획득했습니다!";
      }
    }
  } else {
    showSpotMarker(x, y, false);
  }
});

spotReset.addEventListener("click", () => {
  state.spotFound = [];
  state.spotFoundPositions = [];
  hidePrivacyMessage();
  renderSpot();
});

spotNext.addEventListener("click", () => {
  if (state.spotStage < state.spotImages.length) {
    state.spotStage += 1;
    state.spotFound = [];
    state.spotFoundPositions = [];
    spotNext.classList.add("hidden");
    hidePrivacyMessage();
    renderSpot();
  } else {
    setTimeout(() => setPage("home"), 700);
  }
});

aiActionButton.addEventListener("click", () => {
  aiImageInput.click();
});

aiImageInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) {
    loadAiImage(file);
  }
});

const aiNameInput = document.getElementById("ai-name-input");
aiNameInput.addEventListener("input", (event) => {
  state.storyName = event.target.value.trim();
  updateStoryStage();
  if (state.storyName && state.aiImageUrl) {
    aiStatus.textContent = "이름과 사진이 준비되었습니다. 얼굴 영역을 선택하세요.";
  }
});

storyRestartButton.addEventListener("click", () => {
  resetAiPreview();
  aiNameInput.value = "";
  state.storyName = "";
  aiStatus.textContent = "이름을 다시 입력하고 사진을 선택하세요.";
  updateStoryStage();
});

let aiSelectionStart = null;

aiSelectionOverlay.addEventListener("pointerdown", (event) => {
  if (!state.aiImageUrl) return;
  const rect = aiImagePreview.getBoundingClientRect();
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
  aiSelectionStart = { x, y };
  aiSelectionOverlay.setPointerCapture(event.pointerId);
  aiSelectionBox.style.left = `${x}px`;
  aiSelectionBox.style.top = `${y}px`;
  aiSelectionBox.style.width = "0px";
  aiSelectionBox.style.height = "0px";
});

aiSelectionOverlay.addEventListener("pointermove", (event) => {
  if (!aiSelectionStart) return;
  const rect = aiImagePreview.getBoundingClientRect();
  const currentX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const currentY = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
  const left = Math.min(aiSelectionStart.x, currentX);
  const top = Math.min(aiSelectionStart.y, currentY);
  const width = Math.abs(aiSelectionStart.x - currentX);
  const height = Math.abs(aiSelectionStart.y - currentY);
  aiSelectionBox.style.left = `${left}px`;
  aiSelectionBox.style.top = `${top}px`;
  aiSelectionBox.style.width = `${width}px`;
  aiSelectionBox.style.height = `${height}px`;
});

aiSelectionOverlay.addEventListener("pointerup", (event) => {
  if (!aiSelectionStart) return;
  const rect = aiImagePreview.getBoundingClientRect();
  const endX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const endY = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
  const selection = getSelectionFromDisplay(aiSelectionStart, { x: endX, y: endY });
  setAiSelection(selection);
  aiSelectionStart = null;
  aiSelectionOverlay.releasePointerCapture(event.pointerId);
});

aiSelectionOverlay.addEventListener("pointercancel", () => {
  aiSelectionStart = null;
});

aiRemoveBgButton.addEventListener("click", async () => {
  await removeBackgroundFromSelection();
});

storyPostButton.addEventListener("click", async () => {
  await publishStoryPost();
});

pageButtons.forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});

function resetStoryScrollSections() {
  storyScrollSections.forEach((section) => {
    section.classList.add("hidden");
    section.classList.remove("visible");
  });
  storyChoiceResult.classList.add("hidden");
  storyChoiceResult.textContent = "";
  // ensure the end section (홈으로 돌아가기) is always the last child
  const endSection = document.querySelector('.story-scroll-end');
  if (endSection && storyScrollShell) {
    storyScrollShell.appendChild(endSection);
  }
  // refresh the ordered list of story sections
  storyScrollSections.length = 0;
  storyScrollSections.push(...Array.from(document.querySelectorAll('.story-scroll-section')));
}

function revealNextStorySection() {
  if (state.storyScrollIndex >= storyScrollSections.length) {
    return;
  }

  const section = storyScrollSections[state.storyScrollIndex];
  section.classList.remove("hidden");
  section.classList.add("visible");
  applyStoryStepEffect(section.dataset.storyStep);
  section.scrollIntoView({ behavior: "smooth", block: "end" });
  storyScrollShell.scrollTop = storyScrollShell.scrollHeight;
  state.storyScrollIndex += 1;

  if (state.storyScrollIndex === storyScrollSections.length) {
    storyChoiceResult.classList.remove("hidden");
    storyChoiceResult.textContent = "잘하셨어요! 올바르게 대처할 준비가 되었습니다.";
  }
}

storyScrollShell.addEventListener("click", (event) => {
  if (state.page !== "story-scroll") return;
  if (event.target.closest("button")) return;
  revealNextStorySection();
});

document.querySelectorAll(".story-choice").forEach((button) => {
  button.addEventListener("click", () => {
    storyChoiceResult.classList.remove("hidden", "success", "warning");

    if (button.dataset.choice === "safe") {
      storyChoiceResult.classList.add("success");
      storyChoiceResult.textContent =
        "좋은 선택입니다. 화면 캡처, 계정명, 주소, 게시 시각을 보관하고 플랫폼 신고, 보호자·교사·상담 기관에 도움을 요청하세요.";
      if (!state.aiStamp) {
        state.aiStamp = true;
        updateStamps();
        completionMessage.textContent = "🏅 AI 합성 피해 체험 도장을 획득했습니다!";
      }
      return;
    }

    storyChoiceResult.classList.add("warning");
    storyChoiceResult.textContent =
      button.dataset.choice === "angry"
        ? "댓글로 싸우면 상황이 더 커질 수 있습니다. 먼저 증거를 확보하고 신고와 도움 요청을 진행하세요."
        : "아무것도 하지 않으면 유포가 계속될 수 있습니다. 증거를 보관하고 믿을 수 있는 어른이나 기관에 도움을 요청하세요.";
  });
});

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(quizForm);
  let score = 0;
  if (data.get("q1") === "d") score += 1;
  if (data.get("q2") === "c") score += 1;
  if (data.get("q3") === "b") score += 1;
  if (data.get("q4") === "c") score += 1;
  if (data.get("q5") === "b") score += 1;
  if (data.get("q6") === "d") score += 1;
  if (data.get("q7") === "d") score += 1;
  if (data.get("q8") === "c") score += 1;

  quizResult.classList.remove("hidden");
  quizResult.style.backgroundColor = score >= 6 ? "#edf7ed" : "#fff3cd";
  quizResult.style.color = score >= 6 ? "#1e3f20" : "#664d03";
  quizResult.textContent = score >= 6 ? `정답 ${score}/8. 🏅 도장을 획득했습니다! 홈으로 이동합니다.` : `정답 ${score}/8. 다시 시도해보세요.`;

  if (score >= 6) {
    state.quizStamp = true;
    updateStamps();
    setTimeout(() => setPage("home"), 1200);
  }
});

resetAiPreview();
updateStamps();
renderSpot();
