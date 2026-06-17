const state = {
  page: "home",
  quizStamp: false,
  spotStamp: false,
  aiStamp: false,
  spotStage: 1,
  spotFound: [],
  answers: [
    [
      { x: 1024, y: 51 },
      { x: 1391, y: 611 },
      { x: 870, y: 793 },
      { x: 554, y: 844 }
    ],
    [
      { x: 200, y: 300 },
      { x: 450, y: 400 },
      { x: 650, y: 250 }
    ]
  ],
  hitRadius: 55,
  spotImages: [
    { original: "images/1-1.png", modified: "images/1-2.png", total: 4 },
    { original: "images/2-1.png", modified: "images/2-2.png", total: 3 }
  ]
};

const pageSections = {
  home: document.getElementById("home"),
  quiz: document.getElementById("quiz"),
  spot: document.getElementById("spot"),
  ai: document.getElementById("ai")
};

const quizForm = document.getElementById("quiz-form");
const quizResult = document.getElementById("quiz-result");
const stampCount = document.getElementById("stamp-count");
const completionMessage = document.getElementById("completion-message");
const quizIcon = document.getElementById("quiz-icon");
const spotIcon = document.getElementById("spot-icon");
const aiIcon = document.getElementById("ai-icon");
const spotStageText = document.getElementById("spot-stage-text");
const spotStatus = document.getElementById("spot-status");
const spotFoundCount = document.getElementById("spot-found-count");
const spotTotalCount = document.getElementById("spot-total-count");
const spotLeftImage = document.getElementById("spot-left-image");
const spotRightImage = document.getElementById("spot-right-image");
const spotShell = document.getElementById("spot-shell");
const spotClickMarkers = document.getElementById("spot-click-markers");
const spotClickMarker = document.getElementById("spot-click-marker");
const spotReset = document.getElementById("spot-reset");
const spotNext = document.getElementById("spot-next");
const aiComplete = document.getElementById("ai-complete");

const pageButtons = Array.from(document.querySelectorAll("[data-page]"));

function setPage(page) {
  state.page = page;
  Object.values(pageSections).forEach((section) => {
    section.classList.toggle("hidden", section.id !== page);
  });
  if (page === "spot") {
    renderSpot();
  }
}

function updateStamps() {
  const total = Number(state.quizStamp) + Number(state.spotStamp) + Number(state.aiStamp);
  stampCount.textContent = `${total}/3`;
  quizIcon.textContent = state.quizStamp ? "🏅" : "⭕";
  spotIcon.textContent = state.spotStamp ? "🏅" : "⭕";
  aiIcon.textContent = state.aiStamp ? "🏅" : "⭕";

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

function isHit(x, y) {
  return state.answers[state.spotStage - 1].some((area, index) => {
    if (state.spotFound.includes(index)) return false;
    const dx = x - area.x;
    const dy = y - area.y;
    return dx * dx + dy * dy <= state.hitRadius * state.hitRadius;
  });
}

function getHitIndex(x, y) {
  return state.answers[state.spotStage - 1].findIndex((area, index) => {
    if (state.spotFound.includes(index)) return false;
    const dx = x - area.x;
    const dy = y - area.y;
    return dx * dx + dy * dy <= state.hitRadius * state.hitRadius;
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
}

function renderSpotMarkers() {
  spotClickMarkers.innerHTML = "";
  const rect = spotRightImage.getBoundingClientRect();

  state.spotFound.forEach((index) => {
    const area = state.answers[state.spotStage - 1][index];
    const displayX = (area.x / spotRightImage.naturalWidth) * rect.width;
    const displayY = (area.y / spotRightImage.naturalHeight) * rect.height;

    const marker = document.createElement("span");
    marker.className = "permanent-marker";
    marker.style.left = `${displayX}px`;
    marker.style.top = `${displayY}px`;
    spotClickMarkers.appendChild(marker);
  });
}

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
    spotFoundCount.textContent = state.spotFound.length;
    renderSpotMarkers();
    if (state.spotFound.length === state.spotImages[state.spotStage - 1].total) {
      spotNext.classList.remove("hidden");
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
  renderSpot();
});

spotNext.addEventListener("click", () => {
  if (state.spotStage < state.spotImages.length) {
    state.spotStage += 1;
    state.spotFound = [];
    spotNext.classList.add("hidden");
    renderSpot();
  } else {
    setTimeout(() => setPage("home"), 700);
  }
});

pageButtons.forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(quizForm);
  let score = 0;
  if (data.get("q1") === "d") score += 1;
  if (data.get("q2") === "c") score += 1;
  if (data.get("q3") === "b") score += 1;

  quizResult.textContent = `${score}/3`;
  quizResult.classList.remove("hidden");
  quizResult.style.backgroundColor = score >= 2 ? "#edf7ed" : "#fff3cd";
  quizResult.style.color = score >= 2 ? "#1e3f20" : "#664d03";
  quizResult.textContent = score >= 2 ? `정답 ${score}/3. 🏅 도장을 획득했습니다! 홈으로 이동합니다.` : `정답 ${score}/3. 다시 시도해보세요.`;

  if (score >= 2) {
    state.quizStamp = true;
    updateStamps();
    setTimeout(() => setPage("home"), 1200);
  }
});

aiComplete.addEventListener("click", () => {
  state.aiStamp = true;
  updateStamps();
  completionMessage.textContent = "🏅 AI 체험 도장을 획득했습니다!";
  setTimeout(() => setPage("home"), 900);
});

updateStamps();
renderSpot();
