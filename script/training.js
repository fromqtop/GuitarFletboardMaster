var app = new Vue({
  el: "#app",
  data: {
    // ゲーム基本設定
    noteNames: [
      "A",
      "A#",
      "B",
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
    ],
    openPitch: ["-", 19, 14, 10, 5, 0, -5], // 開放弦の音
    openSound: ["-", 24, 19, 15, 10, 5, 0], // 開放弦のサウンド(0 = E)
    stringColor: [
      "-",
      "#ff7f9f",
      "#bf7fff",
      "#7fbfff",
      "#7fffbf",
      "#ffff7f",
      "#ffb070",
    ],
    positionMsg: [],
    scales: [[0, 2, 4, 5, 7, 9, 11]],
    scaleNames: ["Major"],

    // モーダル表示フラグ
    settingModalShow: true, //Settingモーダル表示フラグ
    resultModalShow: false, //Resultモーダル表示フラグ
    giveupModalShow: false, //Giveupモーダル表示フラグ
    loaderShow: true, // ローダー表示

    // ゲーム設定
    useStrings: [1, 2, 3, 4, 5, 6], // 使用する弦番号
    fromFret: 0, // 使用するフレット番号(開始)
    toFret: 11, // 使用するフレット番号(終了)
    listOfQuestions: [], // 出題pitch一覧

    // 画面要素描画用
    notes: [], // noteデータ配列
    noteId: 0, // 次生成するnoteのID
    grades: [], // グレード配列
    gradeId: 0, // グレード表示のアイテムID
    touchEffects: [], // タッチエフェクト配列
    effectId: 0, // エフェクト表示のアイテムID
    touchStyle: [], // タッチエリアのスタイル
    showNotation1: true, // 出題エリアの表示ステータス
    showNotation2: true, // 出題エリアの表示ステータス
    showNoteName: false, // 回答エリアの音名表示ステータス

    // オーディオ
    guitarAudio: [],
    guitarAudioCnt: [],
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
    // *** from/to フレットの矛盾修正 ***
    fromFret: function (val) {
      if (val > this.toFret) {
        this.toFret = val;
      }
    },
    toFret: function (val) {
      if (val < this.fromFret) {
        this.fromFret = val;
      }
    },
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

      // ギター音
      for (let i = 0; i <= 35; i++) {
        const arr = [];
        for (let j = 0; j < 3; j++) {
          arr[j] = new Audio(`${path}guitar${i}.mp3`);
          arr[j].load();
        }
        this.guitarAudio[i] = arr;
        this.guitarAudioCnt[i] = 0;
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
      this.guitarAudio[pitch][this.guitarAudioCnt[pitch]].play();
      if (this.guitarAudioCnt[pitch] !== 2) {
        this.guitarAudioCnt[pitch] += 1;
      } else {
        this.guitarAudioCnt[pitch] = 0;
      }
    },
    // 楽譜表示切り替え
    toggleBtn: function (id) {
      switch (id) {
        case 0:
          this.showNotation1 = !this.showNotation1;
          break;
        case 1:
          this.showNotation2 = !this.showNotation2;
          break;
        case 2:
          this.showNoteName = !this.showNoteName;
          if (this.showNoteName) {
            this.setPositionMsg();
          } else {
            this.positionMsg.length = 0;
          }
      }
    },
    // *** ゲーム開始処理 ***
    startGame: function () {
      // 弦未選択の場合は全弦対象
      if (this.useStrings.length === 0) {
        this.useStrings = [1, 2, 3, 4, 5, 6];
      }
      // 初期化処理
      this.initVar();
      // 効果音
      this.startSound.play();
      // モーダルを非表示
      this.giveupModalShow = false;
      this.settingModalShow = false;
      // ノート削除
      this.notes.length = 0;
      // ノート生成
      this.createNote();
    },

    // *** 初期化処理 ***
    initVar: function () {
      // 出題内容とタッチエリアスタイルを設定
      this.setQuestionsAndTouchStyle();
      // 獲得ポイント調整率 は有効ポジションの数から算出
    },
    // *** ユーザー設定から出題内容とタッチエリアスタイルを設定 ***
    setQuestionsAndTouchStyle: function () {
      this.listOfQuestions.length = 0;
      for (let i = 1; i <= 72; i++) {
        const string = Math.ceil(i / 12);
        const fret = (i - 1) % 12;
        if (
          this.useStrings.includes(string) &&
          this.fromFret <= fret &&
          fret <= this.toFret
        ) {
          let pitch = this.openPitch[string] + fret;
          let octSign = "";
          if (pitch < 0) {
            pitch += 12;
            octSign = "8 vb";
          } else if (pitch > 28) {
            pitch -= 12;
            octSign = "8 va";
          }
          let sign = "";
          switch (pitch % 12) {
            case 1:
            case 4:
            case 6:
            case 9:
            case 11:
              sign = "♯";
          }
          const offsetMap = [
            0, 0, 7.5, 15, 15, 22.5, 22.5, 30, 37.5, 37.5, 45, 45,
          ]; // (A → G#)半音毎の譜面上の上昇px数
          const offsetTop1 =
            127.5 - Math.floor(pitch / 12) * 52.5 - offsetMap[pitch % 12]; // 譜面最上部からのY位置を算出
          const offsetTop2 = 17 * (string - 1);

          this.listOfQuestions.push({
            string: string,
            fret: fret,
            pitch: this.openPitch[string] + fret,
            sign: sign,
            octSign: octSign,
            wrap1Style: { top: `${offsetTop1}px` },
            noteStyle: { "background-color": this.stringColor[string] },
            signStyle: { color: this.stringColor[string] },
            noteName: this.noteNames[pitch % 12],
            wrap2Style: { top: `${offsetTop2}px` },
            noteNameStyle: {
              borderLeft: `solid 5px ${this.stringColor[string]}`,
            },
          });
          this.touchStyle[i] = "touch enabled";
        } else {
          this.touchStyle[i] = "touch disabled";
        }
      }
    },

    // *** 回答エリアタッチ時処理 ***
    touchPosition: function (e) {
      this.playSound(Number(e.currentTarget.dataset.touchSound)); // オーディオ再生
      this.createTouchEffect(e); // タッチエフェクト作成
      if (!this.showNotation1 && !this.showNotation2) {
        return;
      }
      // 正否判定
      const obj = this.checkAnswer(
        Number(e.currentTarget.dataset.touchString),
        Number(e.currentTarget.dataset.touchFret)
      );
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
        } else if (spentTime <= 5000) {
          // Great
          gradeName = "Great";
          gradeClassName = "great";
        } else if (spentTime <= 8000) {
          // Good
          gradeName = "Good";
          gradeClassName = "good";
        } else {
          // OK
          gradeName = "OK";
          gradeClassName = "ok";
        }
        // グレード表示
        const rect = this.$refs[obj.refId][0].getBoundingClientRect(); // 対象Noteの座標取得
        this.showGrade(gradeName, gradeClassName, 0, 0); // グレード表示
        // Note削除
        this.removeNote(obj.id); // 対象Note削除
        // Note作成
        this.createNote();
      } else {
        // 不正解の場合
        this.showGrade("Miss...", "miss", e.pageX, e.pageY - 25); // Miss表示
      }
    },

    // *** 正否判定処理 ***
    checkAnswer(string, fret) {
      return this.notes.find(
        (item) => item.string === string && item.fret === fret
      );
    },

    // *** ノート生成処理 ***
    createNote: function () {
      // ランダムで音程を決定
      const answer =
        this.listOfQuestions[
          Math.floor(Math.random() * this.listOfQuestions.length)
        ];
      // Note作成処理
      this.notes.push({
        id: this.noteId, // NoteのID
        refId: `Note_${this.noteId}`, // Dom直接参照用のID
        createdTime: performance.now(), // Note発生時刻
        string: answer.string, // 指定の弦
        fret: answer.fret, // 指定のフレット
        pitch: answer.pitch, // 音程
        // 5線譜用のプロパティ
        sign: answer.sign, // 臨時記号♯
        octSign: answer.octSign, // オクターブ記号
        wrap1Style: answer.wrap1Style, // css
        noteStyle: answer.noteStyle, // css
        signStyle: answer.signStyle, // css
        // 音名用のプロパティ
        noteName: answer.noteName, // 音名
        wrap2Style: answer.wrap2Style, // css
        noteNameStyle: answer.noteNameStyle, // css
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
        // styles: { left: `${x}px`, top: `${y}px` }
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
        // transform: `translateX(${e.pageX - 10}px) translateY(${e.pageY - 10}px)`
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

    setPositionMsg: function () {
      let selectedScale = 0; // スケール指定（0:メジャースケール）
      let selectedRoot = 3; // Root指定（3:C）
      this.positionMsg.length = 0;
      this.positionMsg.push(""); // touchのカウンタは1から開始するため
      let string; // 弦番号
      let fret; // フレット番号
      let noteNum; // 音番号
      let degree; // 度数番号
      for (let i = 1; i <= 72; i++) {
        string = Math.ceil(i / 12);
        fret = (i - 1) % 12;
        noteNum = (this.openPitch[string] + fret + 12) % 12; // ポジションiの実音
        if (noteNum < selectedRoot) {
          degree = noteNum + 12 - selectedRoot;
        } else {
          degree = noteNum - selectedRoot;
        }
        if (this.scales[selectedScale].includes(degree)) {
          // ポジション i の度数がスケールに含まれる場合
          this.positionMsg.push(this.noteNames[noteNum]);
        } else {
          // ポジション i の度数がスケールに無い場合
          this.positionMsg.push("");
        }
      }
    },
    backToTop: function () {
      location.href = "./index.html";
    },
  },
});
