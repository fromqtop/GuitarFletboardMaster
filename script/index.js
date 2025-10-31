var mySwiper = new Swiper(".swiper-container", {
  loop: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    type: "bullets",
    clickable: true,
  },
});

// オーディオ
let path = "./audio/";

// 効果音等
btnSound = new Audio(path + "pushBtn.mp3");
startSound = new Audio(path + "start.mp3");

// その他の音
btnSound.load();
startSound.load();

function pushPlayBtn(page) {
  // 効果音
  startSound.play();
  setTimeout(function () {
    window.location.href = page + ".html";
  }, 300);
}

function pushSwipeBtn() {
  btnSound.play();
}
