const state = {
  page: "home",
  quizStamp: false,
  spotStamp: false,
  aiStamp: false,
  dinoUnlocked: false,
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
const uploadPlaceholderView = document.getElementById("upload-placeholder-view");
const previewImageWrapper = document.getElementById("preview-image-wrapper");
const pageButtons = Array.from(document.querySelectorAll("[data-page]"));

function setPage(page) {
  state.page = page;
  Object.values(pageSections).forEach((section) => {
    if (section) {
      section.classList.toggle("hidden", section.id !== page);
    }
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

  // If we collected all 3 basic stamps, unlock the physical dino special mission
  if (total === 3 && !state.dinoUnlocked) {
    state.dinoUnlocked = true;
    unlockDinoMission(); 
  }

  stampCount.textContent = `${total}/3`;

  quizIcon.textContent = state.quizStamp ? "🏅" : "📝";
  spotIcon.textContent = state.spotStamp ? "🏅" : "🔍";
  aiIcon.textContent = state.aiStamp ? "🏅" : "🎭";

  const dinoIcon = document.getElementById("dino-icon");
  const dinoCard = document.getElementById("dino-card");
  if (dinoIcon) {
    dinoIcon.textContent = state.dinoUnlocked ? "🎁" : "🔒";
  }

  if (dinoCard && state.dinoUnlocked) {
    dinoCard.classList.remove("locked");
    dinoCard.classList.add("unlocked-glow");
    dinoCard.removeAttribute("disabled");
  }

  if (total === 3) {
    completionMessage.innerHTML = "🏆 축하합니다! 모든 체험 도장(3/3)을 획득하셨습니다!<br>우측의 [🎁 특별 상품 미션] 카드를 눌러 오프라인 특별 미션에 참여해 보세요! 🦖✨";
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

function updateStepper(stepNumber) {
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    if (stepEl) {
      stepEl.classList.toggle("active", i === stepNumber);
      stepEl.classList.toggle("completed", i < stepNumber);
    }
  }
  const dividers = document.querySelectorAll(".stepper-container .step-divider");
  dividers.forEach((div, idx) => {
    div.classList.toggle("completed", idx < stepNumber - 1);
  });
}

function showPushNotification(title, text, appLogo = "📸", duration = 3000) {
  const notif = document.getElementById("phone-push-notif");
  if (!notif) return;

  const appLogoEl = notif.querySelector(".push-app-logo");
  const appNameEl = document.getElementById("push-app-name");
  const textEl = document.getElementById("push-notif-text");

  if (appLogoEl) appLogoEl.textContent = appLogo;
  if (appNameEl) appNameEl.textContent = title;
  if (textEl) textEl.textContent = text;

  notif.classList.remove("hidden");

  // Soft vibration on mobile if supported
  if (navigator.vibrate) {
    navigator.vibrate([80, 40, 80]);
  }

  setTimeout(() => {
    notif.classList.add("hidden");
  }, duration);
}

function updateSecurityMeter(widthPercent, statusText) {
  const bar = document.getElementById("security-bar");
  const text = document.getElementById("security-level-text");
  if (bar) {
    bar.style.width = `${widthPercent}%`;
    if (widthPercent >= 80) {
      bar.style.background = "linear-gradient(90deg, #10b981, #059669)";
    } else if (widthPercent >= 50) {
      bar.style.background = "linear-gradient(90deg, #eab308, #ca8a04)";
    } else if (widthPercent >= 30) {
      bar.style.background = "linear-gradient(90deg, #f97316, #ea580c)";
    } else {
      bar.style.background = "linear-gradient(90deg, #f43f5e, #e11d48)";
    }
  }
  if (text) {
    text.textContent = statusText;
  }
}

function addLogToConsole(message, type = "sys") {
  const container = document.getElementById("notif-logs-container");
  if (!container) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timestamp = `${hours}:${minutes}:${seconds}`;

  const logItem = document.createElement("div");
  logItem.className = `notif-log-item ${type}`;
  logItem.innerHTML = `
    <span class="log-time">[${timestamp}]</span>
    <p>${message}</p>
  `;
  container.appendChild(logItem);
  container.scrollTop = container.scrollHeight;
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
  syntheticFaceOverlay.style.display = "block";
  const blockedOverlay = document.getElementById("blocked-post-overlay");
  if (blockedOverlay) {
    blockedOverlay.classList.remove("visible");
  }
  syntheticPostCard.classList.add("hidden");
  storyPostUser.textContent = "";
  storyPostUserCaption.textContent = "";
  storyPostCaption.textContent = "오늘 찍은 원본 사진을 올렸습니다.";
  storyLikeCount.textContent = "❤️ 12";
  storyCommentCount.textContent = "💬 1";
  storyShareCount.textContent = "↗ 공유 0";
  storyChoiceResult.classList.add("hidden");
  storyChoiceResult.textContent = "";
  aiStatus.textContent = "이름을 등록한 후 원본 사진을 불러와 주세요.";
  storyStageText.textContent = "이름을 입력하고 사진을 촬영하거나 가져와주세요.";
  aiSelectionOverlay.classList.add("hidden");
  aiSelectionBox.style.width = "0";
  aiSelectionBox.style.height = "0";
  if (uploadPlaceholderView) {
    uploadPlaceholderView.classList.remove("hidden");
  }
  if (previewImageWrapper) {
    previewImageWrapper.classList.add("hidden");
  }
  resetStoryScrollSections();
  storyScrollShell.scrollTop = 0;
  updateAiControls();
  updateStepper(1);
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
    ? "사진이 등록되었습니다. 이미지 안에서 얼굴 영역을 마우스로 드래그 하세요."
    : "이름을 먼저 입력하면 스토리 시나리오가 더욱 자연스러워집니다.";
  aiSelectionOverlay.classList.remove("hidden");
  aiSelectionBox.style.width = "0";
  aiSelectionBox.style.height = "0";
  if (uploadPlaceholderView) {
    uploadPlaceholderView.classList.add("hidden");
  }
  if (previewImageWrapper) {
    previewImageWrapper.classList.remove("hidden");
  }
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
  aiStatus.textContent = "얼굴 좌표 추출 성공! 우측의 '배경제거 (마스킹)' 버튼을 눌러 소스를 추출하세요.";
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
    storyStageText.textContent = "이름을 입력하고 사진을 촬영하거나 가져와주세요.";
    updateStepper(1);
    return;
  }

  if (!state.aiImageUrl) {
    storyStageText.textContent = `${state.storyName}님, 사진 촬영이나 업로드 버튼을 눌러 원본을 업로드 하세요.`;
    updateStepper(2);
    return;
  }

  if (!state.aiSelection) {
    storyStageText.textContent = `${state.storyName}님, 사진 속 본인의 얼굴을 사각형으로 마우스 드래그 하세요.`;
    updateStepper(3);
    return;
  }

  if (!state.aiFaceDetected) {
    storyStageText.textContent = `${state.storyName}님, '얼굴 배경제거 (마스킹)'를 실행하여 소스를 수집하세요.`;
    updateStepper(3);
    return;
  }

  storyStageText.textContent = `${state.storyName}님, 준비 완료! 아래의 '가상 SNS에 사진 게시하기'를 누르세요.`;
  updateStepper(4);
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

  aiStatus.textContent = "🤖 얼굴 배경 제거 중...";

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
    aiStatus.textContent = "얼굴 소스 추출 완료! 아래의 '가상 SNS에 사진 게시하기' 버튼을 눌러 위협 탐지 시뮬레이터로 넘어가세요.";
  } catch (error) {
    console.error(error);
    aiStatus.textContent = "배경제거에 실패했습니다. 정면 인물 사진을 사용해 보세요.";
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

  const displayName = state.storyName || "지민";
  storyPostUser.textContent = displayName;
  storyPostUserCaption.textContent = displayName;
  showOriginalPost();
  resetStoryScrollSections();
  state.storyScrollIndex = 0;
  setPage("story-scroll");

  // Show the Simulation Intro Tip Modal popup
  const tipModal = document.getElementById("story-tip-modal");
  if (tipModal) {
    tipModal.classList.remove("hidden");
  }

  // Initial Simulator boot logs
  const logsContainer = document.getElementById("notif-logs-container");
  if (logsContainer) logsContainer.innerHTML = "";
  addLogToConsole("가상 위협 추적 시뮬레이터가 성공적으로 마운트되었습니다.", "sys");
  addLogToConsole("네트워크 상태 분석 모듈: ONLINE", "sys");
}

function showOriginalPost() {
  storyPostImage.src = state.aiImageUrl || aiImagePreview.src;
  storyFaceOverlay.src = "";
  storyFaceOverlay.classList.add("hidden");
  syntheticFaceOverlay.src = "";
  syntheticFaceOverlay.style.display = "block";
  syntheticPostCard.classList.add("hidden");
  
  const blockedOverlay = document.getElementById("blocked-post-overlay");
  if (blockedOverlay) {
    blockedOverlay.classList.remove("visible");
  }

  storyPostCaption.textContent = "오늘 찍은 원본 사진을 올렸습니다.";
  storyLikeCount.textContent = "❤️ 12";
  storyCommentCount.textContent = "💬 1";
  storyShareCount.textContent = "↗ 공유 0";
}

function showSyntheticPost() {
  syntheticFaceOverlay.src = aiFacePreview.src;
  syntheticFaceOverlay.style.display = "block";
  syntheticPostCard.classList.remove("hidden");
  
  const blockedOverlay = document.getElementById("blocked-post-overlay");
  if (blockedOverlay) {
    blockedOverlay.classList.remove("visible");
  }
}

function applyStoryStepEffect(step) {
  // Clean up any left-side dynamic selections from previous steps to keep the left column compact
  const narrativeCard = document.getElementById("story-narrative-card");
  if (narrativeCard) {
    const existingDel = narrativeCard.querySelector(".deletion-targets-container");
    if (existingDel) {
      existingDel.remove();
    }
  }

  // Hide the Phase 05 choice grid and choice result unless the current step is the response step
  const choiceGrid = document.getElementById("narrative-choice-grid");
  if (choiceGrid) {
    choiceGrid.classList.add("hidden");
  }
  const storyChoiceResult = document.getElementById("story-choice-result");
  if (storyChoiceResult) {
    storyChoiceResult.classList.add("hidden");
    storyChoiceResult.classList.remove("success", "warning");
  }

  if (step === "reaction") {
    triggerReactions();
    showPushNotification("SNS 알림", `${state.storyName || "지민"}님의 피드에 댓글과 좋아요가 등록됩니다!`, "💬");
    updateSecurityMeter(100, "안전 (Lv.4)");
    addLogToConsole("원본 게시물이 성공적으로 SNS 데이터베이스에 인덱싱되었습니다.", "ok");
    addLogToConsole("정상 트래픽 감지: 주변 친구들과의 안전한 상호소통 중.", "ok");
  }

  if (step === "spread") {
    triggerReactions(8, { likes: 148, comments: 24, shares: 12 });
    showPushNotification("보안 경고", "외부 IP 대역에서 대규모의 사진 이미지 무단 크롤링 탐지!", "🌐");
    updateSecurityMeter(70, "주의 (Lv.3) : 무단 아카이빙 감지");
    addLogToConsole("경고: 제3자 크롤러 봇에 의해 원본 고해상도 초상이 백업 폴더로 다운로드됨.", "warn");
    addLogToConsole("유출 발원지: 익명 다크서버 스크래핑 IP 탐지.", "warn");
  }

  if (step === "synthetic") {
    showSyntheticPost();
    showPushNotification("긴급 알림", "불법 유포 채널(텔레그램 방) 내 딥페이크 악성 합성본 생성 및 배포 감지!", "🚨");
    updateSecurityMeter(40, "경고 (Lv.2) : 딥페이크 불법 합성본 탐지");
    addLogToConsole("치명적: 추출된 본인 얼굴 좌표를 기반으로 한 악의적 합성 이미지 발견.", "crit");
    addLogToConsole("유포 채널: 보안 단체 메신저방 및 암호화 커뮤니티", "crit");
  }

  if (step === "mocking") {
    showSyntheticPost();
    showPushNotification("트래픽 폭주", "유포된 가짜 합성물에 대한 제3자 악성 리트윗 및 전파 수치 급증!", "🔥");
    updateSecurityMeter(15, "위험 (Lv.1) : 무차별적인 사이버 불링 확산");
    addLogToConsole("치명적: 사실 확인 없는 2차 조롱 및 단톡방 리포스팅이 연쇄 반응을 일으킴.", "crit");
    addLogToConsole("시스템 긴급: 피해자의 디지털 평판 피해 심각 단계 돌입", "crit");
  }

  if (step === "response") {
    showSyntheticPost();
    showPushNotification("대응 긴급 명령", "보안 등급 차단을 위해 안전 행동 수칙에 맞게 대응 조치하십시오.", "🛡️");
    addLogToConsole("골든 타임 가동: 가용한 보안 조치들을 검토하여 네트워크를 방어하세요.", "warn");
    const choiceGrid = document.getElementById("narrative-choice-grid");
    if (choiceGrid) {
      choiceGrid.classList.remove("hidden");
    }
  }

  if (step === "deletion") {
    showSyntheticPost();
    // Inject left selection panel inside #story-narrative-card
    const narrativeCard = document.getElementById("story-narrative-card");
    if (narrativeCard) {
      // Remove any existing selection container to prevent duplicate rendering
      const existing = narrativeCard.querySelector(".deletion-targets-container");
      if (existing) existing.remove();

      const targetsContainer = document.createElement("div");
      targetsContainer.className = "deletion-targets-container dynamic-append";
      targetsContainer.innerHTML = `
        <div class="dt-title">📥 긴급 유포 중단 / 삭제 요청 대상 선택</div>
        <p class="dt-subtitle">아래의 각 기관을 클릭하여 실시간 조치를 신청해 보세요.</p>
        <div class="dt-grid">
          <button type="button" class="dt-item-btn" id="btn-target-provider">
            <div class="dt-icon">🏢</div>
            <div class="dt-info">
              <strong class="dt-name">서비스 제공자 <span class="dt-badge-inline" id="badge-provider">삭제 및 차단</span></strong>
              <span class="dt-desc">정보통신망법 제44조의7에 따른 즉시 임시차단</span>
            </div>
          </button>
          
          <button type="button" class="dt-item-btn" id="btn-target-center">
            <div class="dt-icon">🛡️</div>
            <div class="dt-info">
              <strong class="dt-name">피해자지원센터 <span class="dt-badge-inline" id="badge-center">피해 지원</span></strong>
              <span class="dt-desc">상담 연계 및 국가 차원의 상시 모니터링 삭제 지원</span>
            </div>
          </button>
          
          <button type="button" class="dt-item-btn" id="btn-target-kcsc">
            <div class="dt-icon">🏛️</div>
            <div class="dt-info">
              <strong class="dt-name">방심위 <span class="dt-badge-inline" id="badge-kcsc">긴급 심의</span></strong>
              <span class="dt-desc">불법 사이트 및 가해 피드에 대한 긴급 접속차단</span>
            </div>
          </button>
          
          <button type="button" class="dt-item-btn" id="btn-target-police">
            <div class="dt-icon">🚨</div>
            <div class="dt-info">
              <strong class="dt-name">경찰청 <span class="dt-badge-inline" id="badge-police">수사 의뢰</span></strong>
              <span class="dt-desc">IP 추적 및 채집 정보 증거 송치를 통한 형사 고소</span>
            </div>
          </button>
        </div>
      `;
      narrativeCard.appendChild(targetsContainer);

      // Add event listeners to the buttons
      const btnProvider = targetsContainer.querySelector("#btn-target-provider");
      const btnCenter = targetsContainer.querySelector("#btn-target-center");
      const btnKcsc = targetsContainer.querySelector("#btn-target-kcsc");
      const btnPolice = targetsContainer.querySelector("#btn-target-police");

      const badgeProvider = targetsContainer.querySelector("#badge-provider");
      const badgeCenter = targetsContainer.querySelector("#badge-center");
      const badgeKcsc = targetsContainer.querySelector("#badge-kcsc");
      const badgePolice = targetsContainer.querySelector("#badge-police");

      const delBar = document.getElementById("del-bar");
      const delPct = document.getElementById("del-pct");
      const delStep = document.getElementById("del-step");
      const delDot = document.getElementById("del-dot");
      const delStatusText = document.getElementById("del-status-text");
      const delPrompt = document.getElementById("deletion-prompt");
      const delSection = document.querySelector('[data-story-step="deletion"]');

      btnCenter.addEventListener("click", () => {
        btnCenter.classList.add("completed");
        badgeCenter.textContent = "접수 완료";
        showPushNotification("피해지원센터 접수 완료", "상담 및 유포 모니터링 연계 조치가 등록되었습니다.", "🛡️");
        addLogToConsole("피해지원센터 접수 완료: 디지털성범죄 피해자지원센터(02-735-8994)로 전문 유포 파일 삭제 지원 서비스가 신청되었습니다.", "ok");
      });

      btnKcsc.addEventListener("click", () => {
        btnKcsc.classList.add("completed");
        badgeKcsc.textContent = "심의 완료";
        showPushNotification("방심위 심의 신청 완료", "해당 웹사이트 주소(URL)에 대한 긴급 접속 차단 심의가 청구되었습니다.", "🏛️");
        addLogToConsole("방심위 심의 신청 완료: 방송통신심의위원회에 정보통신망법 위반 불법정보 및 딥페이크 성적 허위영상물 심의 및 차단 요청이 등록되었습니다.", "ok");
      });

      btnPolice.addEventListener("click", () => {
        btnPolice.classList.add("completed");
        badgePolice.textContent = "신고 완료";
        showPushNotification("경찰청 신고 접수 완료", "사이버 범죄 수사관에 의해 가해자 추적 및 형사 처벌 절차가 개시되었습니다.", "🚨");
        addLogToConsole("경찰 신고 접수 완료: 경찰청 사이버 수사망을 통해 유포 단톡방 캡처본 및 피해 URL 채집 증거 정보가 수사 민원용으로 공식 전달되었습니다.", "ok");
      });

      btnProvider.addEventListener("click", () => {
        btnProvider.classList.add("completed");
        btnProvider.style.pointerEvents = "none";
        badgeProvider.textContent = "조치 중";

        if (delDot) {
          delDot.classList.add("red");
        }
        if (delStatusText) {
          delStatusText.textContent = "유포 차단 진행 중 (실시간 연계)";
        }

        let progress = 0;
        const steps = [
          { pct: 15, text: "가상의 플랫폼사 정보통신법 제44조의7에 근거한 임시 조치 명령 접수...", log: "임시차단: 가상의 플랫폼사 정보통신법 제44조의7에 근거한 임시 조치 명령 접수.", logType: "ok" },
          { pct: 35, text: "불법 공유 단톡방 내 합성 파일 원본 파일 경로 추출 중...", log: "해시추출: 불법 유포 파일에 대한 이미지 해시값(DNA) 및 메타데이터 추출 완료.", logType: "ok" },
          { pct: 60, text: "플랫폼 내 불법 합성물 서버 매칭 필터링 실행 중...", log: "서버차단: SNS 데이터베이스 내 동일 해시 합성 이미지 일괄 블라인드 및 접근 제한 조치.", logType: "ok" },
          { pct: 85, text: "실시간 스크래핑 방지 및 인덱싱 완전 삭제 동기화 중...", log: "웹 캐시 필터링: 주요 포털 및 피드 캐시 메모리 내 인덱스 삭제 동기화 완료.", logType: "ok" },
          { pct: 100, text: "플랫폼 내 합성 사진 차단 및 임시조치 완료!", log: "조치 완료: 서비스 제공자 기술조치에 따라 가해 게시물 임시차단 및 삭제 완료.", logType: "ok" }
        ];

        let currentStepIdx = 0;
        const interval = setInterval(() => {
          progress += 1;
          if (progress > 100) progress = 100;

          if (delBar) delBar.style.width = `${progress}%`;
          if (delPct) delPct.textContent = `${progress}%`;

          if (currentStepIdx < steps.length && progress >= steps[currentStepIdx].pct) {
            const step = steps[currentStepIdx];
            if (delStep) delStep.textContent = step.text;
            addLogToConsole(step.log, step.logType);
            currentStepIdx++;
          }

          if (progress >= 100) {
            clearInterval(interval);
            if (delDot) {
              delDot.classList.remove("red");
              delDot.classList.add("green");
            }
            if (delStatusText) {
              delStatusText.textContent = "전체 경로 차단 완료 (안전)";
            }
            if (delPrompt) {
              delPrompt.classList.remove("hidden");
            }
            if (delSection) {
              delSection.dataset.completed = "true";
            }

            badgeProvider.textContent = "삭제 완료";

            // Hide synthetic-face-overlay inside phone with fly-away micro-animation!
            const syntheticFaceOverlay = document.getElementById("synthetic-face-overlay");
            if (syntheticFaceOverlay) {
              const synthShell = syntheticFaceOverlay.closest(".synth-post-shell");
              const synthCard = syntheticFaceOverlay.closest(".synthetic-post-card");
              if (synthShell) synthShell.classList.add("allow-overflow");
              if (synthCard) synthCard.classList.add("allow-overflow");

              syntheticFaceOverlay.classList.add("fly-out-active");
              syntheticFaceOverlay.addEventListener("animationend", () => {
                syntheticFaceOverlay.style.display = "none";
                syntheticFaceOverlay.classList.remove("fly-out-active");
                if (synthShell) synthShell.classList.remove("allow-overflow");
                if (synthCard) synthCard.classList.remove("allow-overflow");
              }, { once: true });
            }
            
            // Show blocked post overlay!
            const blockedOverlay = document.getElementById("blocked-post-overlay");
            if (blockedOverlay) {
              blockedOverlay.classList.add("visible");
            }

            showPushNotification("임시조치 완료", "서비스 제공자(SNS 플랫폼사)에 의한 게시글 차단 조치가 실시간 반영되었습니다.", "🛡️");
          }
        }, 40);
      });
    }
  }

  if (step === "safe-upload") {
    let heartCount = 0;
    const heartInterval = setInterval(() => {
      if (state.page !== "story-scroll" || state.storyScrollIndex === 0) {
        clearInterval(heartInterval);
        return;
      }
      spawnSafeHeart();
      heartCount++;
      if (heartCount > 16) {
        clearInterval(heartInterval);
      }
    }, 280);

    showPushNotification("새 게시물 게시 완료", "안전하게 게시물이 등록되었습니다.", "🔒");
    addLogToConsole("게시 완료: 비공개 보관소 내에 새로운 미디어가 안전하게 로드되었습니다.", "ok");
    addLogToConsole("시뮬레이션 완료: 피해 극복 및 예방 솔루션을 완벽하게 이행하였습니다!", "sys");

    if (!state.aiStamp) {
      state.aiStamp = true;
      updateStamps();
      completionMessage.textContent = "🏅 AI 합성 피해 대처 도장을 획득했습니다!";
    }
  }
}

function triggerReactions(times = 6, finalCounts = { likes: 84, comments: 12, shares: 3 }) {
  const baseLikes = parseInt((storyLikeCount.textContent || "❤️ 0").replace(/[^0-9]/g, "")) || 0;
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
  const scrollShell = document.getElementById("story-scroll-shell");
  if (!scrollShell) return;

  const synthCard = document.getElementById("synthetic-post-card");
  let activeShell = null;
  if (synthCard && !synthCard.classList.contains("hidden")) {
    activeShell = synthCard.querySelector(".synth-post-shell");
  } else {
    activeShell = document.querySelector(".insta-card .synth-post-shell");
  }
  
  if (!activeShell) return;

  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = "❤️";
  
  const shellRect = activeShell.getBoundingClientRect();
  const scrollRect = scrollShell.getBoundingClientRect();
  
  // Calculate relative top/left inside scrollShell (adjusting for vertical scrolling)
  const leftBase = shellRect.left - scrollRect.left;
  const topBase = shellRect.top - scrollRect.top + scrollShell.scrollTop;
  
  // Random horizontal position within the middle 70% of the image width
  const leftOffset = leftBase + Math.floor(Math.random() * (shellRect.width * 0.7)) + (shellRect.width * 0.15);
  // Start near the bottom of the active image
  const topOffset = topBase + shellRect.height - 30;
  
  heart.style.left = `${leftOffset}px`;
  heart.style.top = `${topOffset}px`;
  
  // Organic variations for scale, rotation, horizontal sway, and duration
  const xOffset = (Math.random() * 120 - 60) + "px";
  const rotateOffset = (Math.random() * 60 - 30) + "deg";
  const randomScale = (Math.random() * 0.4 + 0.8).toFixed(2); // 0.8rem to 1.2rem
  const randomDuration = (Math.random() * 0.4 + 1.0).toFixed(2) + "s"; // 1.0s to 1.4s
  
  heart.style.setProperty("--x-offset", xOffset);
  heart.style.setProperty("--rotate-offset", rotateOffset);
  heart.style.fontSize = `${randomScale}rem`;
  heart.style.animationDuration = randomDuration;
  
  scrollShell.appendChild(heart);
  setTimeout(() => {
    heart.remove();
  }, parseFloat(randomDuration) * 1000);
}

// handle consolidated response button interactions with active dashboard logging
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".story-choice");
  if (!btn) return;

  document.querySelectorAll(".story-choice").forEach((b) => {
    if (b !== btn) {
      b.classList.remove("correct", "wrong", "pressed");
    }
  });

  btn.classList.add("pressed");
  setTimeout(() => btn.classList.remove("pressed"), 160);

  storyChoiceResult.classList.remove("success", "warning");

  // Clean up any existing warning popups or dynamic warning chat bubbles
  document.querySelectorAll(".dynamic-append").forEach((el) => {
    if (
      el.classList.contains("smartphone-chat-popup") ||
      el.classList.contains("chat-response-warning") ||
      el.classList.contains("simulated-messenger-room")
    ) {
      el.remove();
    }
  });

  if (btn.dataset.choice === "safe") {
    btn.classList.add("correct");
    if (syntheticPostCard) {
      syntheticPostCard.classList.add("slide-away");
      syntheticPostCard.addEventListener(
        "transitionend",
        () => {
          syntheticPostCard.classList.add("hidden");
          syntheticPostCard.classList.remove("slide-away");
        },
        { once: true }
      );
    }
    storyChoiceResult.classList.remove("hidden");
    storyChoiceResult.classList.add("success");
    storyChoiceResult.textContent = "정답입니다! 확실하게 증거를 수집한 후 실시간 삭제 센터(디안방) 및 방심위 유포 정지 심의 전송, 계정 보안 설정을 실시간 연계 조치합니다.";

    updateSecurityMeter(50, "진행 중 (Lv.3) : 긴급 우회 삭제 프로토콜 가동");
    appendInteractiveRecoveryStages();
  } else {
    btn.classList.add("wrong");
    storyChoiceResult.classList.remove("hidden");
    storyChoiceResult.classList.add("warning");

    const chatBubble = document.createElement("div");

    if (btn.dataset.choice === "angry") {
      storyChoiceResult.textContent = "댓글로 욕설을 하거나 폭로전을 펼치면 오히려 가해자가 합성 링크를 가린 채 도망치고 사건의 무마를 꾀할 우려가 큽니다. 침착하게 먼저 디지털 증거를 확보해야 합니다.";
      updateSecurityMeter(10, "위험 (Lv.1) : 직접 항의로 가해자 증거 은닉 시도");
      addLogToConsole("경고: 피해자의 개인적인 다이렉트 항의로 인해 가해 대화방 폭파 유도 및 증거 인멸 가능성 증가.", "warn");

      chatBubble.className = "simulated-messenger-room dynamic-append";
      chatBubble.innerHTML = `
        <div class="chat-header">📱 실시간 가해 단톡방 (키보드 배틀)</div>
        <div class="msg-item outgoing">
          <div class="msg-bubble">야, 당장 사진 지우고 사과해라. 네가 뭔데 내 사진 함부로 합성해서 유포해?? 진짜 미쳤어??</div>
        </div>
        <div class="msg-item incoming">
          <div class="msg-avatar attacker">😈</div>
          <div class="msg-bubble">
            <span class="msg-sender attacker-name">유포자</span>
            어쩔티비? ㅋㅋ 꼬우면 고소해봐~ 누가 유포했는지 증거는 있고? ㅋㅋㅋ
          </div>
        </div>
        <div class="msg-item incoming">
          <div class="msg-avatar troll">👤</div>
          <div class="msg-bubble">
            <span class="msg-sender">익명_34</span>
            오 얼굴 주인 직접 등판함? ㅋㅋㅋ 캡쳐완료 개꿀잼 개꿀딱~
          </div>
        </div>
        <div class="msg-item outgoing">
          <div class="msg-bubble">너희 신상 다 확보해서 경찰서에 다 넘길 거야. 인격살인 해놓고 무사할 줄 알아?</div>
        </div>
        <div class="msg-item incoming">
          <div class="msg-avatar attacker">😈</div>
          <div class="msg-bubble">
            <span class="msg-sender attacker-name">유포자</span>
            응~ 쫄아서 짖는 소리 개꿀잼이고~ 방 터트리고 텔레그램방으로 런하면 그만이야~ ㅅㄱ
          </div>
        </div>
        <div class="msg-system-status">⚠️ 가해자가 방을 폭파하고 퇴장하였습니다.</div>
        <div class="chat-guide-red">
          <strong>🚨 직접 항의의 위험성</strong>
          감정적으로 대항하면 가해자는 증거를 즉각 지우고 방을 탈퇴하여 도망치기 때문에 사법처리가 대단히 어려워집니다. 왼쪽에서 다른 안전한 대응책을 선택하세요!
        </div>
      `;
    } else {
      storyChoiceResult.textContent = "무서워 숨고 아무 조치 없이 혼자 SNS만 삭제해버리면, 백그라운드 클라우드와 음성 텔레그램방 등을 통해 영원히 보이지 않는 곳에서 지속 복제 및 유포될 수 있습니다. 용기를 내어 도움을 받아 유포를 삭제 처리해야 합니다.";
      updateSecurityMeter(5, "위험 (Lv.1) : 무대처 방치로 인한 영구 복제 노출");
      addLogToConsole("경고: 피해 데이터 방치 및 가해 대화방 지속 활동 방관으로 인한 3차, 4차 다크웹 재유포 확률 최대치 수렴.", "warn");

      chatBubble.className = "simulated-messenger-room dynamic-append";
      chatBubble.innerHTML = `
        <div class="chat-header">📱 유포 커뮤니티 실시간 반응</div>
        <div class="msg-item incoming">
          <div class="msg-avatar troll">👤</div>
          <div class="msg-bubble">
            <span class="msg-sender">익명_98</span>
            야 얘 SNS 계정 지웠네? ㅋㅋㅋ 쫄아서 도망친 거 보소 ㅋㅋㅋ
          </div>
        </div>
        <div class="msg-item incoming">
          <div class="msg-avatar troll">👤</div>
          <div class="msg-bubble">
            <span class="msg-sender">익명_12</span>
            계정 터트리면 뭐하냐 이미 다른 유포방에 다 퍼졌는데 ㅋㅋㅋ 평생 박제 ㅅㄱ
          </div>
        </div>
        <div class="msg-system-status">⚠️ 불법 합성물이 다수의 익명 서버로 2차 공유되고 있습니다.</div>
        <div class="chat-guide-red">
          <strong>🚨 무대응 방치의 위험성</strong>
          아무 조치 없이 SNS만 삭제하고 도망치면 백그라운드에서 2차 유포가 무차별 확산되며 원본 증거 수집도 불가능해집니다. 왼쪽에서 안전한 대응책을 다시 선택하세요!
        </div>
      `;
    }

    if (storyScrollShell) {
      storyScrollShell.appendChild(chatBubble);
      setTimeout(() => {
        chatBubble.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
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
  // Clean up any dynamically appended interactive sections
  document.querySelectorAll(".dynamic-append").forEach((el) => el.remove());

  storyScrollSections.forEach((section) => {
    section.classList.add("hidden");
    section.classList.remove("visible");
  });
  
  const choiceGrid = document.getElementById("narrative-choice-grid");
  if (choiceGrid) {
    choiceGrid.classList.add("hidden");
  }
  storyChoiceResult.classList.add("hidden");
  storyChoiceResult.textContent = "";
  
  document.querySelectorAll(".story-choice").forEach((b) => {
    b.classList.remove("correct", "wrong", "pressed");
  });

  const endSection = document.querySelector('.story-scroll-end');
  if (endSection && storyScrollShell) {
    storyScrollShell.appendChild(endSection);
  }
  storyScrollSections.length = 0;
  storyScrollSections.push(...Array.from(document.querySelectorAll('.story-scroll-section')));

  const narrativeCard = document.getElementById("story-narrative-card");
  if (narrativeCard) {
    const badge = narrativeCard.querySelector(".narrative-step-badge");
    const title = document.getElementById("narrative-title");
    const desc = document.getElementById("narrative-desc");
    if (badge) badge.textContent = "SYSTEM READY";
    if (title) title.innerHTML = "시뮬레이터 준비 완료";
    if (desc) desc.innerHTML = "오른쪽 스마트폰 화면을 아무 곳이나 클릭(터치)하여 사건 시뮬레이션을 전개하세요.";
    narrativeCard.classList.remove("narrative-active-glow");
  }

  // Restore instructions visibility
  const instructions = document.querySelector(".story-scroll-instructions");
  if (instructions) {
    instructions.style.display = "flex";
  }
}

function revealNextStorySection() {
  if (state.storyScrollIndex >= storyScrollSections.length) {
    return;
  }

  // Hide scroll instructions banner to free up space
  const instructions = document.querySelector(".story-scroll-instructions");
  if (instructions) {
    instructions.style.display = "none";
  }

  const section = storyScrollSections[state.storyScrollIndex];
  section.classList.remove("hidden");
  section.classList.add("visible");

  // Sync with Left Narrative Card
  const headerText = section.querySelector(".sc-header")?.innerHTML || "";
  const descText = section.querySelector("p")?.innerHTML || "";
  const narrativeCard = document.getElementById("story-narrative-card");
  if (narrativeCard) {
    const badge = narrativeCard.querySelector(".narrative-step-badge");
    const title = document.getElementById("narrative-title");
    const desc = document.getElementById("narrative-desc");

    if (badge) badge.textContent = `PHASE 0${state.storyScrollIndex + 1}`;
    if (title) title.innerHTML = headerText;
    if (desc) desc.innerHTML = descText;

    narrativeCard.classList.remove("narrative-active-glow");
    void narrativeCard.offsetWidth; // force reflow
    narrativeCard.classList.add("narrative-active-glow");
  }

  applyStoryStepEffect(section.dataset.storyStep);

  // Smooth scroll to the newly active section
  setTimeout(() => {
    section.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 50);

  state.storyScrollIndex += 1;
}

storyScrollShell.addEventListener("click", (event) => {
  if (state.page !== "story-scroll") return;
  if (event.target.closest("button")) return;
  if (event.target.closest("input")) return;
  if (event.target.closest("label")) return;

  // Block clicking to advance if we are in an interactive step that is not completed yet!
  const currentSection = storyScrollSections[state.storyScrollIndex - 1];
  if (currentSection) {
    const step = currentSection.dataset.storyStep;
    if ((step === "deletion" || step === "privacy-config") && !currentSection.dataset.completed) {
      return;
    }
  }

  revealNextStorySection();
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

window.addEventListener("resize", () => {
  if (state.page === "story" && state.aiSelection) {
    drawSelectionBox();
  }
});

// Story Intro Modal close listeners
const closeTipModalBtn = document.getElementById("close-tip-modal");
if (closeTipModalBtn) {
  closeTipModalBtn.addEventListener("click", () => {
    const tipModal = document.getElementById("story-tip-modal");
    if (tipModal) {
      tipModal.classList.add("hidden");
    }
  });
}
const tipModalEl = document.getElementById("story-tip-modal");
if (tipModalEl) {
  tipModalEl.addEventListener("click", (e) => {
    if (e.target.classList.contains("tip-modal-overlay")) {
      tipModalEl.classList.add("hidden");
    }
  });
}

resetAiPreview();
updateStamps();
renderSpot();

function appendInteractiveRecoveryStages() {
  const displayName = state.storyName || "지민";

  // Step 6: Deletion
  const delSection = document.createElement("div");
  delSection.className = "story-scroll-section dynamic-append hidden";
  delSection.dataset.storyStep = "deletion";
  delSection.innerHTML = `
    <div class="sc-header" style="color: #38bdf8;">🌐 긴급 삭제 요청 및 실시간 필터링</div>
    <p>디지털성범죄피해자지원센터 및 방송통신심의위원회와 긴밀하게 공조하여, 불법 유포된 딥페이크 합성 이미지에 대한 플랫폼 긴급 임시조치 및 삭제 프로토콜을 수행합니다.</p>
    <div class="deletion-card">
      <div class="deletion-status">
        <span class="status-indicator-dot red" id="del-dot"></span>
        <strong id="del-status-text">유포 차단 진행 전 (대기)</strong>
      </div>
      <div class="deletion-progress-container">
        <div class="deletion-progress-bar" id="del-bar"></div>
        <span class="deletion-progress-percent" id="del-pct">0%</span>
      </div>
      <p class="deletion-current-step" id="del-step">삭제 요청 대기 중...</p>
      <div style="width: 100%; margin-top: 12px; padding: 12px; background: rgba(56, 189, 248, 0.06); border: 1px dashed rgba(56, 189, 248, 0.3); border-radius: 8px; text-align: center; color: #38bdf8; font-size: 0.8rem; font-weight: 500; animation: fadeIn 0.4s ease;">
        👈 왼쪽 화면의 삭제 요청처 중에서 대상을 선택해 주세요.
      </div>
    </div>
    <div class="click-prompt hidden" id="deletion-prompt">👇 삭제 완료! 다음 단계를 진행하려면 스마트폰 화면을 터치하세요.</div>
  `;

  // Step 7: Privacy configuration
  const privacySection = document.createElement("div");
  privacySection.className = "story-scroll-section dynamic-append hidden";
  privacySection.dataset.storyStep = "privacy-config";
  privacySection.innerHTML = `
    <div class="sc-header" style="color: #a78bfa;">🔒 재발 방지 : 계정 보안 공개 범위 설정</div>
    <p>또 다른 위협이나 스크래핑 크롤러 봇이 내 사진을 무단 채집해가지 못하도록, 새로운 게시글을 올리기 전 스마트폰 계정 보안 및 공개 범위를 강력하게 설정합니다.</p>
    <div class="privacy-settings-card">
      <div class="privacy-option-item">
        <label class="premium-checkbox-container">
          <input type="checkbox" id="chk-private" />
          <span class="checkmark"></span>
          <div class="option-details">
            <strong>🔒 비공개 계정으로 전환 (Private)</strong>
            <span>수락한 팔로워만 내 프로필과 스토리글을 볼 수 있습니다.</span>
          </div>
        </label>
      </div>
      <div class="privacy-option-item">
        <label class="premium-checkbox-container">
          <input type="checkbox" id="chk-download" />
          <span class="checkmark"></span>
          <div class="option-details">
            <strong>🚫 이미지 우클릭 및 다운로드 비활성화</strong>
            <span>제3자의 무단 복제 및 스크린샷 캡처 시도를 최소화합니다.</span>
          </div>
        </label>
      </div>
      <div class="privacy-option-item">
        <label class="premium-checkbox-container">
          <input type="checkbox" id="chk-search" />
          <span class="checkmark"></span>
          <div class="option-details">
            <strong>👁️ 구글 등 검색 엔진 인덱싱 거부 (No-index)</strong>
            <span>외부 검색 노출과 사설 크롤링 봇 스크래핑을 차단합니다.</span>
          </div>
        </label>
      </div>
      <button type="button" class="premium-button btn-primary" id="btn-apply-privacy" style="width: 100%; margin-top: 12px;" disabled>
        <span>🔒 보안 설정 적용하기 (모두 선택 필수)</span>
      </button>
    </div>
    <div class="click-prompt hidden" id="privacy-prompt">👇 설정 적용 완료! 다음 단계를 진행하려면 스마트폰 화면을 터치하세요.</div>
  `;

  // Step 8: Safe upload
  const safeUploadSection = document.createElement("div");
  safeUploadSection.className = "story-scroll-section dynamic-append hidden";
  safeUploadSection.dataset.storyStep = "safe-upload";
  safeUploadSection.innerHTML = `
    <div class="sc-header" style="color: #34d399;">🔒 안전한 새로운 시작 : 비공개 게시</div>
    <p>강력한 공개 범위 보안 설정이 실시간 반영되었습니다! 이제 검증된 내 친구들하고만 건강하게 소통할 수 있는 안전한 비공개 SNS 게시물을 업로드했습니다.</p>
    
    <div class="insta-card secure-post">
      <div class="insta-header">
        <div class="insta-avatar secure">🔒</div>
        <div>
          <strong id="safe-post-user">${displayName}</strong>
          <span class="post-location">🔒 비공개 계정 (팔로워 전용)</span>
        </div>
      </div>
      <div class="synth-post-shell">
        <img id="safe-post-image" src="${state.aiImageUrl || aiImagePreview.src}" alt="안전한 게시물 이미지" />
        <div class="secure-overlay">
          <span class="lock-shield">🔒</span>
          <span class="secure-badge">보안 필터 가동 중</span>
        </div>
      </div>
      <div class="insta-actions">
        <span class="action-stat secure">💚 좋아요 18</span>
        <span class="action-stat secure">💬 댓글 3</span>
        <span class="action-stat secure">🔒 공유 차단됨</span>
      </div>
      <div class="insta-caption">
        <strong id="safe-post-user-caption">${displayName}</strong>
        <p>보안 설정을 철저히 하고 올리니까 정말 마음이 편안해지네! 내 소중한 일상은 내가 지킨다 🔒💚✨</p>
      </div>
    </div>
  `;

  // Append them to DOM
  storyScrollShell.appendChild(delSection);
  storyScrollShell.appendChild(privacySection);
  storyScrollShell.appendChild(safeUploadSection);

  // Push to tracking list
  storyScrollSections.push(delSection, privacySection, safeUploadSection);

  // Wire Privacy Checkboxes & Button (Step 7)
  const chkPrivate = privacySection.querySelector("#chk-private");
  const chkDownload = privacySection.querySelector("#chk-download");
  const chkSearch = privacySection.querySelector("#chk-search");
  const btnApplyPrivacy = privacySection.querySelector("#btn-apply-privacy");
  const privacyPrompt = privacySection.querySelector("#privacy-prompt");

  const checkAllChecked = () => {
    const allChecked = chkPrivate.checked && chkDownload.checked && chkSearch.checked;
    btnApplyPrivacy.disabled = !allChecked;
  };

  chkPrivate.addEventListener("change", checkAllChecked);
  chkDownload.addEventListener("change", checkAllChecked);
  chkSearch.addEventListener("change", checkAllChecked);

  btnApplyPrivacy.addEventListener("click", () => {
    chkPrivate.disabled = true;
    chkDownload.disabled = true;
    chkSearch.disabled = true;
    btnApplyPrivacy.disabled = true;
    btnApplyPrivacy.innerHTML = "<span>✅ 보안 설정 적용 완료</span>";
    btnApplyPrivacy.style.background = "linear-gradient(135deg, #10b981, #059669)";
    btnApplyPrivacy.style.color = "#fff";

    addLogToConsole("계정 보안 갱신: 프로필 및 스토리의 전체 공개 설정이 '비공개(Private)'로 즉시 전환됨.", "ok");
    addLogToConsole("다운로드 차단: DRM 소스 무단 스크래핑 방지 보안 계층 가동.", "ok");
    addLogToConsole("인덱싱 제어: Googlebot/Yeti 검색 수집 거부(robots-noindex) 메타 태그 업데이트 완료.", "ok");
    addLogToConsole("보안 강화 성공: 이제 외부 크롤러가 초상 이미지를 스크래핑할 수 없습니다.", "ok");

    updateSecurityMeter(100, "안전 (Lv.5) : 비공개 계정 및 크롤링 완전 방어");
    showPushNotification("보안 설정 완료", "계정의 공개 범위 및 방어 설정이 실시간 적용되었습니다.", "🔒");

    privacyPrompt.classList.remove("hidden");
    privacySection.dataset.completed = "true";
  });

  // Finally reveal Step 6!
  revealNextStorySection();
}

function spawnSafeHeart() {
  const scrollShell = document.getElementById("story-scroll-shell");
  if (!scrollShell) return;

  const securePost = document.querySelector(".insta-card.secure-post");
  if (!securePost) return;

  const activeShell = securePost.querySelector(".synth-post-shell");
  if (!activeShell) return;

  const heart = document.createElement("span");
  heart.className = "floating-heart safe";
  
  const icons = ["💚", "💖", "✨", "🔒"];
  heart.textContent = icons[Math.floor(Math.random() * icons.length)];
  
  const shellRect = activeShell.getBoundingClientRect();
  const scrollRect = scrollShell.getBoundingClientRect();
  
  const leftBase = shellRect.left - scrollRect.left;
  const topBase = shellRect.top - scrollRect.top + scrollShell.scrollTop;
  
  const leftOffset = leftBase + Math.floor(Math.random() * (shellRect.width * 0.7)) + (shellRect.width * 0.15);
  const topOffset = topBase + shellRect.height - 30;
  
  heart.style.left = `${leftOffset}px`;
  heart.style.top = `${topOffset}px`;
  
  const xOffset = (Math.random() * 120 - 60) + "px";
  const rotateOffset = (Math.random() * 60 - 30) + "deg";
  const randomScale = (Math.random() * 0.4 + 0.8).toFixed(2);
  const randomDuration = (Math.random() * 0.4 + 1.2).toFixed(2) + "s";
  
  heart.style.setProperty("--x-offset", xOffset);
  heart.style.setProperty("--rotate-offset", rotateOffset);
  heart.style.fontSize = `${randomScale}rem`;
  heart.style.animationDuration = randomDuration;
  
  scrollShell.appendChild(heart);
  setTimeout(() => {
    heart.remove();
  }, parseFloat(randomDuration) * 1000);
}

// ==========================================
// 🦖 HIDDEN DINO SPECIAL REAL-LIFE ALERT SYSTEM 📡
// ==========================================

// Trigger Dino Unlock Modal popup
function unlockDinoMission() {
  const unlockModal = document.getElementById("dino-unlock-modal");
  if (unlockModal) {
    unlockModal.classList.remove("hidden");
  }
}

// ------------------------------------------
// 🛠️ Register Interactive Dino Event Listeners
// ------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const closeDinoModalBtn = document.getElementById("close-dino-unlock-modal");
  if (closeDinoModalBtn) {
    closeDinoModalBtn.addEventListener("click", () => {
      document.getElementById("dino-unlock-modal").classList.add("hidden");
    });
  }

  const dinoCard = document.getElementById("dino-card");
  if (dinoCard) {
    dinoCard.addEventListener("click", () => {
      if (state.dinoUnlocked) {
        unlockDinoMission();
      }
    });
  }
});


