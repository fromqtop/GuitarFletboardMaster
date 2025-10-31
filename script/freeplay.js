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
    defaultDegreeName: [
      "R",
      "b9",
      "9",
      "m3",
      "M3",
      "11",
      "#11",
      "5",
      "b13",
      "13",
      "m7",
      "M7",
    ],
    scaleList: [
      {
        label: "Simple :",
        scaleDatas: [
          { scaleId: 0, scaleName: "No Scale" },
          { scaleId: 1, scaleName: "Root Only" },
        ],
      },
      {
        label: "Triad :",
        scaleDatas: [
          { scaleId: 2, scaleName: "Major Triad" },
          { scaleId: 3, scaleName: "Minor Triad" },
          { scaleId: 4, scaleName: "Augment Triad" },
          { scaleId: 5, scaleName: "Diminished Triad" },
        ],
      },
      {
        label: "Tetrad :",
        scaleDatas: [
          { scaleId: 6, scaleName: "Major 7th" },
          { scaleId: 7, scaleName: "Dominant 7th" },
          { scaleId: 8, scaleName: "Minor 7th" },
          { scaleId: 9, scaleName: "Minor 7th b5" },
          { scaleId: 10, scaleName: "Minor Major 7th" },
          { scaleId: 11, scaleName: "Augment Major 7th" },
          { scaleId: 12, scaleName: "Augment 7th" },
          { scaleId: 13, scaleName: "Diminished 7th" },
        ],
      },
      {
        label: "Basic :",
        scaleDatas: [
          { scaleId: 14, scaleName: "Major" },
          { scaleId: 15, scaleName: "Natural Minor" },
        ],
      },
      {
        label: "Penta Tonic :",
        scaleDatas: [
          { scaleId: 16, scaleName: "Major Penta Tonic" },
          { scaleId: 17, scaleName: "Minor Penta Tonic" },
        ],
      },
      {
        label: "Modes of Major Scale :",
        scaleDatas: [
          { scaleId: 18, scaleName: "Ionian" },
          { scaleId: 19, scaleName: "Dorian" },
          { scaleId: 20, scaleName: "Phrigian" },
          { scaleId: 21, scaleName: "Lydian" },
          { scaleId: 22, scaleName: "Mixolydian" },
          { scaleId: 23, scaleName: "Aeolian" },
          { scaleId: 24, scaleName: "Locrian" },
        ],
      },
      {
        label: "Modes of Harmonic Minor Scale :",
        scaleDatas: [
          { scaleId: 25, scaleName: "Harmonic Minor" },
          { scaleId: 26, scaleName: "Locrian ♮6" },
          { scaleId: 27, scaleName: "Ionian #5" },
          { scaleId: 28, scaleName: "Dorian #4" },
          { scaleId: 29, scaleName: "Phrigian Major (HMP5↓)" },
          { scaleId: 30, scaleName: "Lydian #2" },
          { scaleId: 31, scaleName: "Super Locrian b7" },
        ],
      },
      {
        label: "Modes of Melodic Minor Scale :",
        scaleDatas: [
          { scaleId: 32, scaleName: "Melodic Minor" },
          { scaleId: 33, scaleName: "Dorian b2" },
          { scaleId: 34, scaleName: "Lydian #5" },
          { scaleId: 35, scaleName: "Lydian b7" },
          { scaleId: 36, scaleName: "Mixolydian b6" },
          { scaleId: 37, scaleName: "Aeolian b5" },
          { scaleId: 38, scaleName: "Super Locrian" },
          { scaleId: 39, scaleName: "(Altered)" },
        ],
      },
      {
        label: "Symmetrical :",
        scaleDatas: [
          { scaleId: 40, scaleName: "Diminished" },
          { scaleId: 41, scaleName: "Combination of Diminished" },
          { scaleId: 42, scaleName: "Whole Tone" },
          { scaleId: 43, scaleName: "Chromatic" },
        ],
      },
    ],
    scales: [
      // Simple
      { degrees: ["x"], degreeNames: ["x"] }, // 0 : No Scale
      { degrees: [0], degreeNames: ["R"] }, // 1 : Root Only
      // Triad
      { degrees: [0, 4, 7], degreeNames: ["R", "M3", "5"] }, // 2 : Major Triad
      { degrees: [0, 3, 7], degreeNames: ["R", "m3", "5"] }, // 3 : Minor Triad
      { degrees: [0, 4, 8], degreeNames: ["R", "3", "#5"] }, // 4 : Augment Triad
      { degrees: [0, 3, 6], degreeNames: ["R", "m3", "b5"] }, // 5 : Diminished Triad
      // Tetrad
      { degrees: [0, 4, 7, 11], degreeNames: ["R", "M3", "5", "M7"] }, // 6 : Major 7th
      { degrees: [0, 4, 7, 10], degreeNames: ["R", "M3", "5", "m7"] }, // 7 : Dominant 7th
      { degrees: [0, 3, 7, 10], degreeNames: ["R", "m3", "5", "m7"] }, // 8 : Minor 7th
      { degrees: [0, 3, 6, 10], degreeNames: ["R", "m3", "b5", "m7"] }, // 9 : Minor 7th b5
      { degrees: [0, 3, 7, 11], degreeNames: ["R", "m3", "5", "M7"] }, // 10 : Minor Major 7th
      { degrees: [0, 4, 8, 11], degreeNames: ["R", "M3", "#5", "M7"] }, // 11 : Augment Major 7th
      { degrees: [0, 4, 8, 10], degreeNames: ["R", "M3", "#5", "m7"] }, // 12 : Augment 7th
      { degrees: [0, 3, 6, 9], degreeNames: ["R", "m3", "b5", "bb7"] }, // 13 : Diminished 7th
      // Basic
      {
        degrees: [0, 2, 4, 5, 7, 9, 11],
        degreeNames: ["R", "9", "M3", "11", "5", "13", "M7"],
      }, // 14 : Major
      {
        degrees: [0, 2, 3, 5, 7, 8, 10],
        degreeNames: ["R", "9", "m3", "11", "5", "b13", "m7"],
      }, // 15 : Minor
      // Penta Tonics
      { degrees: [0, 2, 4, 7, 9], degreeNames: ["R", "9", "M3", "5", "13"] }, // 16 : Major Penta Tonic
      { degrees: [0, 3, 5, 7, 10], degreeNames: ["R", "m3", "11", "5", "m7"] }, // 17 : Minor Penta Tonic
      // Modes of Major Scale
      {
        degrees: [0, 2, 4, 5, 7, 9, 11],
        degreeNames: ["R", "9", "M3", "11", "5", "13", "M7"],
      }, // 18 : Ionian
      {
        degrees: [0, 2, 3, 5, 7, 9, 10],
        degreeNames: ["R", "9", "m3", "11", "5", "13", "b7"],
      }, // 19 : Dorian
      {
        degrees: [0, 1, 3, 5, 7, 8, 10],
        degreeNames: ["R", "b9", "m3", "11", "5", "b13", "m7"],
      }, // 20 : Phrigian
      {
        degrees: [0, 2, 4, 6, 7, 9, 11],
        degreeNames: ["R", "9", "M3", "#11", "5", "13", "M7"],
      }, // 21 : Lydian
      {
        degrees: [0, 2, 4, 5, 7, 9, 10],
        degreeNames: ["R", "9", "M3", "11", "5", "13", "m7"],
      }, // 22 : Mixolydian
      {
        degrees: [0, 2, 3, 5, 7, 8, 10],
        degreeNames: ["R", "9", "m3", "11", "5", "b13", "m7"],
      }, // 23 : Aeolian
      {
        degrees: [0, 1, 3, 5, 6, 8, 10],
        degreeNames: ["R", "b9", "m3", "11", "b5", "b13", "m7"],
      }, // 24 : Locrian
      // Modes of Harmonic Minor Scale
      {
        degrees: [0, 2, 3, 5, 7, 8, 11],
        degreeNames: ["R", "9", "m3", "11", "5", "b13", "M7"],
      }, // 25 : Harmonic Minor
      {
        degrees: [0, 1, 3, 5, 6, 9, 10],
        degreeNames: ["R", "b9", "m3", "11", "b5", "13", "m7"],
      }, // 26 : Locrian ♮6
      {
        degrees: [0, 2, 4, 5, 8, 9, 11],
        degreeNames: ["R", "9", "M3", "11", "#5", "13", "M7"],
      }, // 27 : Ionian #5
      {
        degrees: [0, 2, 3, 6, 7, 9, 10],
        degreeNames: ["R", "9", "m3", "#11", "5", "13", "m7"],
      }, // 28 : Dorian #4
      {
        degrees: [0, 1, 4, 5, 7, 8, 10],
        degreeNames: ["R", "b9", "M3", "11", "5", "b13", "m7"],
      }, // 29 : Phrigian Major (HMP5↓)
      {
        degrees: [0, 3, 4, 6, 7, 9, 11],
        degreeNames: ["R", "#9", "M3", "#11", "5", "13", "M7"],
      }, // 30 : Lydian #2
      {
        degrees: [0, 1, 3, 4, 6, 8, 9],
        degreeNames: ["R", "b9", "m3", "b11", "b5", "b13", "bb7"],
      }, // 31 : Super Locrian b7
      // Modes of Melodic Minor Scale
      {
        degrees: [0, 2, 3, 5, 7, 9, 11],
        degreeNames: ["R", "9", "m3", "11", "5", "13", "M7"],
      }, // 32 : Melodic Minor
      {
        degrees: [0, 1, 3, 5, 7, 9, 10],
        degreeNames: ["R", "b9", "m3", "11", "5", "13", "m7"],
      }, // 33 : Dorian b2
      {
        degrees: [0, 2, 4, 6, 8, 9, 11],
        degreeNames: ["R", "9", "M3", "#11", "#5", "13", "M7"],
      }, // 34 : Lydian #5
      {
        degrees: [0, 2, 4, 6, 7, 9, 10],
        degreeNames: ["R", "9", "M3", "#11", "5", "13", "m7"],
      }, // 35 : Lydian b7
      {
        degrees: [0, 2, 4, 5, 7, 8, 10],
        degreeNames: ["R", "9", "M3", "11", "5", "b13", "m7"],
      }, // 36 : Mixolydian b6
      {
        degrees: [0, 2, 3, 5, 6, 8, 10],
        degreeNames: ["R", "9", "m3", "11", "b5", "b13", "m7"],
      }, // 37 : Aeolian b5
      {
        degrees: [0, 1, 3, 4, 6, 8, 10],
        degreeNames: ["R", "b9", "m3", "b11", "b5", "b13", "m7"],
      }, // 38 : Super Locrian
      {
        degrees: [0, 1, 3, 4, 6, 8, 10],
        degreeNames: ["R", "b9", "#9", "M3", "#11", "b13", "m7"],
      }, // 39 : (Altered)
      // Symmetrical
      {
        degrees: [0, 2, 3, 5, 6, 8, 9, 11],
        degreeNames: ["R", "9", "m3", "11", "b5", "#5", "13", "M7"],
      }, // 40 : Diminished
      {
        degrees: [0, 1, 3, 4, 6, 7, 9, 10],
        degreeNames: ["R", "b9", "m3", "M3", "#11", "5", "13", "m7"],
      }, // 41 : Combination of Diminished
      {
        degrees: [0, 2, 4, 6, 8, 10],
        degreeNames: ["R", "9", "M3", "#11", "#5", "m7"],
      }, // 42 : Whole Tone
      {
        degrees: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        degreeNames: [
          "R",
          "b9",
          "9",
          "m3",
          "M3",
          "11",
          "#11",
          "5",
          "#5",
          "13",
          "m7",
          "M7",
        ],
      }, // 43 : Chromatic
    ],

    roots: [
      { text: "C", value: 3 },
      { text: "C#", value: 4 },
      { text: "D", value: 5 },
      { text: "D#", value: 6 },
      { text: "E", value: 7 },
      { text: "F", value: 8 },
      { text: "F#", value: 9 },
      { text: "G", value: 10 },
      { text: "G#", value: 11 },
      { text: "A", value: 0 },
      { text: "A#", value: 1 },
      { text: "B", value: 2 },
    ],

    // モーダル表示フラグ
    exitModalShow: false, // Giveupモーダル表示フラグ
    loaderShow: true, // ローダー表示

    // ゲーム設定
    useStrings: [1, 2, 3, 4, 5, 6], // 使用する弦番号
    fromFret: 0, // 使用するフレット番号(開始)
    toFret: 21, // 使用するフレット番号(終了)
    listOfQuestions: [], // 出題pitch一覧
    selectedRoot: 3,
    selectedScale: 0,
    selectedLayerRoot: 3,
    selectedLayerScale: 0,

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
    showMode: "hide",
    changeModeBtnLabel: "≫ Note",

    // オーディオ
    guitarAudio: [],
    guitarAudioCnt: [],
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
  mounted: function () {
    // ポジション初期設定
    this.setPositionMsg();
  },
  watch: {
    selectedRoot: function () {
      this.setPositionMsg();
    },
    selectedScale: function () {
      this.setPositionMsg();
    },
    selectedLayerRoot: function () {
      this.setPositionMsg();
    },
    selectedLayerScale: function () {
      this.setPositionMsg();
    },
  },
  methods: {
    // *** オーディオ読み込み処理 ***
    onDeviceReady() {
      // *** オーディオファイルロード ***
      let path = "./audio/";

      // 効果音等
      this.btnSound = new Audio(path + "pushBtn.mp3");
      this.startSound = new Audio(path + "start.mp3");

      // ギター音
      for (let i = 0; i <= 45; i++) {
        const arr = [];
        for (let j = 0; j < 3; j++) {
          arr[j] = new Audio(`${path}guitar${i}.mp3`);
          arr[j].load();
        }
        this.guitarAudio[i] = arr;
        this.guitarAudioCnt[i] = 0;
      }
      // その他の音
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
    changeMode: function () {
      switch (this.showMode) {
        case "hide":
          this.showMode = "noteName";
          this.changeModeBtnLabel = "≫ Degree";
          break;
        case "noteName":
          this.showMode = "degreeName";
          this.changeModeBtnLabel = "≫ Hide";
          break;
        case "degreeName":
          this.showMode = "hide";
          this.changeModeBtnLabel = "≫ Note";
          break;
      }
    },
    // *** ゲーム開始処理 ***
    startGame: function () {
      // 効果音
      this.startSound.play();
      // モーダルを非表示
      this.exitModalShow = false;
    },

    // *** 回答エリアタッチ時処理 ***
    touchPosition: function (e) {
      this.playSound(Number(e.currentTarget.dataset.touchSound)); // オーディオ再生
      this.createTouchEffect(e); // タッチエフェクト作成
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
      this.positionMsg.length = 0;
      // touchのカウンタは1開始のため0は初期値
      this.positionMsg.push({
        styles: "",
        noteName: "",
        degreeName: "",
      });
      for (let i = 1; i <= 132; i++) {
        const string = Math.ceil(i / 22);
        const fret = (i - 1) % 22;
        let styles = "";
        // ポジションiの実音を算出
        const noteNum = (this.openPitch[string] + fret + 12) % 12;
        // ポジションiの度数(メインスケール)を算出
        let degree;
        if (noteNum < this.selectedRoot) {
          degree = noteNum + 12 - this.selectedRoot;
        } else {
          degree = noteNum - this.selectedRoot;
        }
        // ポジションiの度数(レイヤースケール)を算出
        let layerDegree;
        if (noteNum < this.selectedLayerRoot) {
          layerDegree = noteNum + 12 - this.selectedLayerRoot;
        } else {
          layerDegree = noteNum - this.selectedLayerRoot;
        }
        // 表示文字の設定
        const degreeIndex =
          this.scales[this.selectedScale].degrees.indexOf(degree);
        const layerDegreeIndex =
          this.scales[this.selectedLayerScale].degrees.indexOf(layerDegree);
        if (degreeIndex !== -1 || layerDegreeIndex !== -1) {
          // ポジション i の度数がスケール(メインorレイヤー)に含まれる場合
          if (degreeIndex !== -1) {
            styles += " show-main";
          }
          if (layerDegreeIndex !== -1) {
            styles += " show-layer";
          }
          // メインスケールのrootの場合は専用スタイル
          if (degree === 0 && this.selectedScale !== 0) {
            styles += " root";
          }
          // 表示文字を設定する
          let degreeName = "";
          if (degreeIndex !== -1) {
            degreeName =
              this.scales[this.selectedScale].degreeNames[degreeIndex];
          } else {
            degreeName = this.defaultDegreeName[degree];
          }
          this.positionMsg.push({
            styles: styles,
            noteName: this.noteNames[noteNum],
            degreeName: degreeName,
          });
        } else {
          // ポジション i の度数がスケールに無い場合
          this.positionMsg.push({
            styles: styles,
            noteName: "",
            degreeName: "",
          });
        }
      }
    },
    backToTop: function () {
      location.href = "./index.html";
    },
  },
});
