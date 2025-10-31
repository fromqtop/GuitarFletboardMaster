var app = new Vue({
  el: "#app",
  data: {
    // ゲーム基本設定
    runTime: 60, // ゲーム制限時間(s)
    gameSpeed: 4000, // Note発生スパン(ms)
    lifeRemaining: 60000, // ライフ残量(ms)
    lifeWidth: 100, // lifeゲージの残量(%)

    // ゲームステータス
    isRunning: false, // ゲーム実行中かどうか

    // インターバル/タイムアウトID
    lifeIntervalId: 0, // ライフ減少IntervalのID
    noteIntervalId: 0, // Note生成IntervalのID
    comboTimerId: 0, // コンボ表示削除のTimerID

    // ゲーム調整値
    adjustTime: 0, // Note発生スパン加速値(ms)
    bonus: 0, // ライフ減少スピート低下ボーナス(ms)

    // モーダル表示フラグ
    settingModalShow: true, //Settingモーダル表示フラグ
    resultModalShow: false, //Resultモーダル表示フラグ
    giveupModalShow: false, //Giveupモーダル表示フラグ
    loaderShow: true, // ローダー表示

    // ゲーム設定
    listOfQuestions: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27,
    ], // 出題pitch一覧

    // スコア・カウンタ
    score: 0, // 合計点
    combo: { cnt: 0, show: false }, // コンボ カウント・表示フラグ
    maxCombo: 0, // 最大コンボ数
    cntPerfect: 0, // 累積Perfect数
    cntGreat: 0, // 累積Great数
    cntGood: 0, // 累積Good数
    cntOk: 0, // 累積Ok数
    cntMiss: 0, // 累積Miss数

    // 画面要素描画用
    countDown: { msg: "", show: false, cnt: 0 }, // カウントダウン用オブジェクト
    notes: [], // noteデータ配列
    noteId: 0, // 次生成するnoteのID
    grades: [], // グレード配列
    gradeId: 0, // グレード表示のアイテムID
    touchEffects: [], // タッチエフェクト配列
    effectId: 0, // エフェクト表示のアイテムID
    touchStyle: [], // タッチエリアのスタイル

    // 画面高さ不足対応用
    requiredHeight: 435 + 20, // この画面が必要とする高さ(通知エリア込)
    containerStyle: "", // containerに設定するスタイル(transform)

    // オーディオ
    pianoAudio: [],
    pianoAudioCnt: [],
    bgmSound: null,
    resultSound: null,
    btnSound: null,
    startSound: null,
  },
  created: function () {
    window.setTimeout(() => {
      if (typeof cordova === "undefined") {
        this.onDeviceReady();
      } else {
        document.addEventListener("deviceready", this.onDeviceReady, false);
      }
    }, 1000);
  },
  watch: {
    resultModalShow: function () {
      if (this.resultModalShow) {
        this.resultSound.play();
      }
    },
    settingModalShow: function () {
      if (this.settingModalShow) {
        this.btnSound.play();
      }
    },
    giveupModalShow: function () {
      if (this.giveupModalShow) {
        this.btnSound.play();
      }
    },
  },
  methods: {
    onDeviceReady() {
      // *** オーディオファイルロード ***
      let path = "./audio/";

      // 効果音等
      this.btnSound = new Audio(path + "pushBtn.mp3");
      this.startSound = new Audio(path + "start.mp3");
      this.bgmSound = new Audio(path + "jazzdrum.mp3");
      this.resultSound = new Audio(path + "result.mp3");

      // ピアノ音
      for (let i = 0; i <= 11; i++) {
        const arr = [];
        for (let j = 0; j < 3; j++) {
          arr[j] = new Audio(`${path}piano${i}.mp3`);
          arr[j].load();
        }
        this.pianoAudio[i] = arr;
        this.pianoAudioCnt[i] = 0;
      }
      // その他の音
      this.bgmSound.load();
      this.bgmSound.loop = true;
      this.resultSound.load();
      this.btnSound.load();
      this.startSound.load();

      // バックボタンを無効
      try {
        document.addEventListener(
          "backbutton",
          function () {
            return false;
          },
          false
        ); // backbuttonをリッスンする
      } catch (e) {
        // No processing
      }

      // ローダーを消す
      this.loaderShow = false;
    },
    // *** オーディオ再生処理 ***
    playSound(pitch) {
      this.pianoAudio[pitch][this.pianoAudioCnt[pitch]].play();
      if (this.pianoAudioCnt[pitch] !== 2) {
        this.pianoAudioCnt[pitch] += 1;
      } else {
        this.pianoAudioCnt[pitch] = 0;
      }
    },

    // *** 画面縦幅が不足している場合は縮小 ***
    changeContainerStyle: function () {
      if (screen.height < this.requiredHeight) {
        let scale = screen.height / this.requiredHeight;
        let translate = ((screen.height - screen.height * scale) / 2) * -1;
        this.containerStyle = {
          transform: `translateY(${translate}px) scaleY(${scale})`,
        };
      } else {
        this.containerStyle = "";
      }
    },

    // *** ゲーム開始処理 ***
    startGame: function () {
      // 初期化処理
      this.initVar();
      // 効果音
      this.startSound.play();
      // モーダルを非表示
      this.giveupModalShow = false;
      this.settingModalShow = false;
      this.resultModalShow = false;
      // カウントダウン
      this.countDown.cnt = 3;
      this.countDown.show = true;
      const countDownInterval = setInterval(
        function () {
          if (this.countDown.cnt > 0) {
            this.countDown.msg = "   Ready...";
            this.countDown.cnt -= 1;
          } else {
            this.countDown.msg = "Go !";
            // 1000ms後にGoを非表示
            setTimeout(
              function () {
                this.countDown.msg = "";
                this.countDown.show = false;
              }.bind(this),
              1000
            );
            clearInterval(countDownInterval);
            // ゲーム開始・インターバル開始
            this.isRunning = true; // ゲームステータス変更
            this.startLifeInterval(); // ライフ減少インターバル
            this.startNoteInterval(); // ノート生成インターバル
            this.bgmSound.play(); // BGM再生
          }
        }.bind(this),
        1000
      );
    },

    // *** ゲーム終了処理 ***
    endGame: function () {
      this.isRunning = false;
      this.lifeWidth = 0; // ライフゲージを0にする
      clearInterval(this.lifeIntervalId); // ライフ減少インターバル
      clearInterval(this.noteIntervalId); // ノート生成インターバル
      // 残存ノート全削除
      while (this.notes.length > 0) {
        clearTimeout(this.notes[0].timerId);
        this.removeNote(this.notes[0].id);
      }
      // BGM停止
      this.bgmSound.pause(); // BGM再生
      this.bgmSound.currentTime = 0; // BGM再生
      // Resultモーダル表示
      this.resultModalShow = true;
    },

    // *** 初期化処理 ***
    initVar: function () {
      this.lifeRemaining = 60000; // ライフ残量(ms)
      this.lifeWidth = 100; // lifeゲージの残量(%)
      this.adjustTime = 0; // Note発生スパン加速値(ms)
      this.bonus = 0; // ライフ減少スピート低下ボーナス(ms)
      this.score = 0; // 合計点
      this.combo = { cnt: 0, show: false }; // コンボ カウント・表示フラグ
      this.maxCombo = 0; // 最大コンボ数
      this.cntPerfect = 0; // 累積Perfect数
      this.cntGreat = 0; // 累積Great数
      this.cntGood = 0; // 累積Good数
      this.cntOk = 0; // 累積Ok数
      this.cntMiss = 0; // 累積Miss数
    },

    // *** ライフゲージインターバル開始 *** //
    startLifeInterval: function () {
      const startTime = performance.now(); // ゲーム開始時刻
      const lifeInterval = function () {
        this.bonus = Math.min(this.combo.cnt, 50); // コンボ数 * 1ms ダメージ減(最大50ms)
        this.lifeRemaining -= 100 - this.bonus; // ライフ減少(100ms - コンボボーナスms)
        this.lifeWidth = (this.lifeRemaining / (1000 * this.runTime)) * 100; // ライフゲージ描画
        if (this.lifeRemaining <= 0) {
          this.endGame(); // ゲーム終了
        }
      }.bind(this);
      this.lifeIntervalId = setInterval(lifeInterval, 100);
    },

    // *** Note生成インターバル開始 *** //
    startNoteInterval: function () {
      const noteInterval = function () {
        this.createNote();
        this.noteIntervalId = setTimeout(
          noteInterval,
          Math.max(this.gameSpeed - this.adjustTime, 300)
        );
      }.bind(this);
      noteInterval();
    },

    // *** 回答エリアタッチ時処理 ***
    touchPosition: function (e) {
      if (!this.isRunning) {
        return;
      } // ゲーム未開始の場合は処理しない
      if (this.combo.show) {
        clearTimeout(this.comboTimerId);
      } // コンボ非表示タイマーをクリア
      this.playSound(Number(e.currentTarget.dataset.touchPitch)); // オーディオ再生
      this.createTouchEffect(e); // タッチエフェクト作成
      const obj = this.checkAnswer(Number(e.currentTarget.dataset.touchPitch)); // 正否判定
      if (obj) {
        // 正解の場合
        // グレード判定・各種計算
        const spentTime = performance.now() - obj.createdTime;
        let gradeName;
        let gradeClassName;
        if (spentTime <= 3000) {
          // Perfect
          gradeName = "Perfect";
          gradeClassName = "perfect";
          this.combo.cnt += 1;
          this.score += 300;
          this.cntPerfect += 1;
        } else if (spentTime <= 5000) {
          // Great
          gradeName = "Great";
          gradeClassName = "great";
          this.combo.cnt += 1;
          this.score += 200;
          this.cntGreat += 1;
        } else if (spentTime <= 8000) {
          // Good
          gradeName = "Good";
          gradeClassName = "good";
          this.combo.cnt += 1;
          this.score += 100;
          this.cntGood += 1;
        } else {
          // OK
          gradeName = "OK";
          gradeClassName = "ok";
          this.combo.cnt = 0;
          this.score += 50;
          this.cntOk += 1;
        }
        // MaxCombo更新
        if (this.combo.cnt >= this.maxCombo) {
          this.maxCombo = this.combo.cnt;
        }
        // Combo表示
        if (this.combo.cnt >= 2) {
          this.combo.show = true;
          // Combo非表示タイマーセット
          this.comboTimerId = setTimeout(
            function () {
              this.combo.show = false;
            }.bind(this),
            750
          );
        } else {
          this.combo.show = false;
        }
        // スピードアップ処理
        this.adjustTime = this.cntPerfect * 50 + this.cntGreat * 25;
        // グレード表示
        const rect = this.$refs[obj.refId][0].getBoundingClientRect(); // 対象Noteの座標取得
        this.showGrade(gradeName, gradeClassName, rect.left, rect.top - 17); // グレード表示
        // Note削除
        clearTimeout(obj.timerId); // 対象Noteのタイマー解除
        this.removeNote(obj.id); // 対象Note削除
      } else {
        // 不正解の場合
        this.cntMiss += 1; // Missカウントアップ
        this.combo.cnt = 0; // Comboストップ
        this.combo.show = false; // Combo非表示
        this.lifeRemaining -= 1000; // ライフ1秒減
        this.showGrade("Miss...", "miss", e.pageX, e.pageY - 25); // Miss表示
      }
    },

    // *** 正否判定処理 ***
    checkAnswer(pitch) {
      return this.notes.find((item) => item.pitch % 12 === pitch);
    },

    // *** ノート生成処理 ***
    createNote: function () {
      // ランダムで音程を決定
      const pitch =
        this.listOfQuestions[
          Math.floor(Math.random() * this.listOfQuestions.length)
        ];
      // 臨時記号を算出
      let sign = "";
      switch (pitch % 12) {
        case 1:
        case 4:
        case 6:
        case 9:
        case 11:
          sign = "♯";
      }
      const offsetMap = [0, 0, 7.5, 15, 15, 22.5, 22.5, 30, 37.5, 37.5, 45, 45]; // (A → G#)半音毎の譜面上の上昇px数
      const offsetTop =
        127.5 - Math.floor(pitch / 12) * 52.5 - offsetMap[pitch % 12]; // 譜面最上部からのY位置を算出

      // 時間切れ時の処理
      const timerId = setTimeout(
        function (noteId) {
          const rect = this.$refs[`Note_${noteId}`][0].getBoundingClientRect(); // 対象Noteの座標取得
          this.showGrade("Miss...", "miss", rect.left + 40, rect.top - 17); // グレード表示
          this.removeNote(noteId); // Note削除
          this.cntMiss += 1; // Missカウントアップ
          this.combo.cnt = 0; // Comboストップ
          if (this.combo.show) {
            clearTimeout(this.comboTimerId);
          } // コンボ非表示タイマーをクリア
          this.combo.show = false; // Combo非表示
          this.lifeRemaining -= 1000; // ライフ1秒減
        }.bind(this),
        10000,
        this.noteId
      );

      // Note作成処理
      this.notes.push({
        id: this.noteId, // NoteのID
        refId: `Note_${this.noteId}`, // Dom直接参照用のID
        timerId: timerId, // Note消滅のタイマーID
        pitch: pitch, // 音程
        sign: sign, // 臨時記号♯♭
        styles: { top: `${offsetTop}px` }, // css(譜面上辺からの縦距離)
        createdTime: performance.now(), // Note発生時刻
      });
      // idカウントアップ
      this.noteId += 1;
    },

    // *** ノート削除処理 ***
    removeNote: function (noteId) {
      for (let i = 0; i < this.notes.length; i++) {
        if (this.notes[i].id === noteId) {
          this.notes.splice(i, 1);
        }
      }
    },

    // *** グレード表示処理 ***
    showGrade: function (gradeName, gradeClassName, x, y) {
      // 作成処理
      this.grades.push({
        refId: `Grade_${this.gradeId}`,
        gradeName: gradeName,
        gradeClassName: gradeClassName,
        styles: { left: `${x}px`, top: `${y}px` },
      });
      this.gradeId += 1;
      // 削除処理(タイマー)
      setTimeout(
        function () {
          this.grades.shift();
        }.bind(this),
        500
      );
    },

    // *** タッチエフェクト作成/削除処理 ***
    createTouchEffect: function (e) {
      // 作成処理
      this.touchEffects.push({
        refId: `Effect_${this.effectId}`,
        styles: {
          transform: `translateX(${e.pageX - 10}px) translateY(${
            e.pageY - 10
          }px)`,
        },
      });
      this.effectId += 1;
      // 削除処理(タイマー)
      setTimeout(
        function () {
          this.touchEffects.shift();
        }.bind(this),
        150
      );
    },
    backToTop: function () {
      location.href = "./index.html";
    },
  },
});
