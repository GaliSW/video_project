let app = new Vue({
    el: "#app",
    data: {
        bannerVd: "", //youtube網址
        subtitle: "", //字幕陣列
        cate: "", //該影片分類
        cateList: "", //相關推薦列表
        allTime: "", //影片總長
        currentTime: "00:00", //時間條
        currentTimeMin: "00:00.00", //抓字幕時間
        startTimeArr: [], //每段字幕開始時間
        endTimeArr: "", //每段字幕結束時間
        en_content: "", //單句英文字幕
        ch_content: "", //單句中文字幕
        sIndex: "0", //字幕Index
        timeupdate: "false", //時間更新才有開啟
        subtitle_en: [], //側邊欄字幕
        videoId: "", //影片ID
        record_start_time: [], //整段配音影片開始時間
        record_end_time: [], //整段配音影片結束時間
        Arecord_start_time: [], //A配音影片開始時間
        Arecord_end_time: [], //A配音影片結束時間
        Brecord_start_time: [], //B配音影片開始時間
        Brecord_end_time: [], //B配音影片結束時間
        role: "", //角色
        mode: "", //模式
        recordIndex: 0, //目前錄音片段ID
        dialogInt: "",
        rec: {},
        wave: {},
        sentence_end: "", //片段開始時間
        sentence_start: "", //片段結束時間
        timer: "", //倒數顯示
        recBlob: [], //單一錄音檔案
        recId: 0, //錄音檔案ID
        sid: "",
        sid2: "",
        recDone: false,
        cid: "",
        mid: "",
        roleAindex: [], //角色A的錄音段落ID
        roleBindex: [], //角色B的錄音段落ID
        progress: "0%",
        nowplayingAudio: "",
        singleAudio: "",
        singleRec: 0,
        RecordingList: {},
        recBlobLength: "",
    },
    created() {
        var player;
        this.createPlayer();
        // this.circle(10);
        var bar;
        this.cid = sessionStorage.getItem("cindx");
        this.mid = sessionStorage.getItem("mindx");
    },
    methods: {
        createPlayer() {
            const url = window.location.search;
            let id = "";
            if (url.indexOf("?") != -1) {
                const ary = url.split("?")[1].split("&");
                // console.log(ary);
                for (i = 0; i <= ary.length - 1; i++) {
                    if (ary[i].split("=")[0] == "id") {
                        id = decodeURI(ary[i].split("=")[1]);
                        this.videoId = id;
                    } else if (ary[i].split("=")[0] == "cate") {
                        cate = decodeURI(ary[i].split("=")[1]);
                        this.cate = cate;
                        if (cate == "WeeklyNews") {
                            cate = "Weekly News";
                        } else if (cate == "LifeStyle") {
                            cate = "Life Style";
                        }
                    }
                }
            }
            if (cate !== "Cinephile") {
                document.getElementById("check_cate").style.display = "none";
            }
            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/ProgramJson.asp?indx=${id}`
                )
                .then((response) => {
                    // console.log(response);
                    // ==========================================
                    // == 影片各資料取得
                    // ==========================================
                    //取得字幕列表
                    this.subtitle = response.data.data;
                    for (let i = 0; i < this.subtitle.length; i++) {
                        let en = this.subtitle[i].en_content.split(" ");
                        let enObj = {};
                        enObj[i] = en;
                        this.subtitle_en[i] = en;
                    }

                    //取得字幕開始時間陣列&取得配音片段開始時間&結束時間
                    const startTimeLength = parseInt(response.data.data.length);
                    const startTimeArr = [];
                    for (let i = 0; i < startTimeLength; i++) {
                        let startTime = response.data.data[i].starttime
                            .slice(3, 10)
                            .replace(",", ".");
                        startTimeArr.push(startTime);
                    }
                    this.startTimeArr = startTimeArr; //字幕陣列

                    for (let i = 0; i < startTimeLength; i++) {
                        if (response.data.data[i].role !== "") {
                            this.record_start_time.push(
                                response.data.data[i].starttime //整段配音開始時間陣列
                            );
                            this.record_end_time.push(
                                response.data.data[i].endtime //整段配音結束時間陣列
                            );
                        }

                        if (response.data.data[i].role == "A") {
                            this.Arecord_start_time.push(
                                response.data.data[i].starttime //A配音開始時間陣列
                            );
                            this.Arecord_end_time.push(
                                response.data.data[i].endtime //A配音結束時間陣列
                            );
                            this.roleAindex.push(i);
                        } else if (response.data.data[i].role == "B") {
                            this.Brecord_start_time.push(
                                response.data.data[i].starttime //B配音開始時間陣列
                            );
                            this.Brecord_end_time.push(
                                response.data.data[i].endtime //B配音結束時間陣列
                            );
                            this.roleBindex.push(i);
                        }
                    }
                    // 取得 youtube 網址轉換
                    const youtubeId =
                        response.data.info.urls.split("https://youtu.be/")[1];
                    const youtubeUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&enablejsapi=1&controls=0&showinfo=0&autoplay=0&cc_lang_pref=en&cc_load_policy=0`;
                    this.bannerVd = youtubeUrl;
                    //掛載 youtube api
                    var tag = document.createElement("script");
                    tag.src = "https://www.youtube.com/iframe_api";
                    var firstScriptTag =
                        document.getElementsByTagName("script")[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                    window.onYouTubeIframeAPIReady = () => {
                        player = new YT.Player("bannerVd", {
                            playerVars: {
                                autoplay: 0,
                                playsinline: 1,
                                modestbranding: 1,
                                loop: 1,
                                rel: 0,
                                // controls: 0,
                                overlay: 0,
                                showinfo: 0, //隱藏影片資訊
                                modestbranding: 1, //隱藏logo
                                fs: 0, //隱藏全螢幕按鈕
                                cc_lang_pref: "en",
                                cc_load_policy: 0, //隱藏字幕
                                iv_load_policy: 0, //隱藏註釋
                                autohide: 0, //播放時隱藏控制器
                            },
                            events: {
                                onReady: onPlayerReady,
                                onStateChange: onPlayerStateChange,
                            },
                        });
                    };
                    function onPlayerReady() {
                        //取得影片時間軸
                        let allSec = player.getDuration();
                        let allMin = Math.floor(allSec / 60).toFixed(0);
                        let sec = allSec % 60;
                        app.allTime = `${allMin}:${sec}`; //影片總長
                        setInterval(app.fnTimeChecking, 10); //timeUpdate
                    }
                    function onPlayerStateChange(e) {
                        switch (e.data) {
                            case 0: //=== 結束 ===
                                document
                                    .querySelector(".lds-rippleB")
                                    .classList.add("none");
                                document
                                    .querySelector(".lds-rippleA")
                                    .classList.add("none");
                                break;
                            case 1: //=== 播放 ===
                                player.playVideo();
                                app.timeupdate = "true";
                                break;
                            case 2: //=== 暫停 ===
                                player.pauseVideo();
                                app.timeupdate = "false";
                                break;
                        }
                    }
                });

            let mid = 0;
            //登入後memberId
            if (sessionStorage.getItem("mindx") !== null) {
                mid = sessionStorage.getItem("mindx");
            }

            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/defaultlist.asp?member_id=${mid}`
                )
                .then((response) => {
                    // console.log(response);
                    this.cateList = response.data[`${cate}`];
                });
        },
        fnTimeChecking() {
            if (this.timeupdate == "false") {
                return false;
            }
            // console.log(app.timeupdate);
            const time = player.getCurrentTime();
            const allTime = player.getDuration();
            // ==========================================
            // === 單句重播&正常播放&全部播放 ===
            // ==========================================
            if (this.mode == "單句") {
                console.log(this.recordIndex);
                let end = "";
                let start = "";
                let index = "";
                if (this.role == "A") {
                    end = this.Arecord_end_time;
                    start = this.Arecord_start_time;
                    index = this.roleAindex;
                } else if (this.role == "B") {
                    end = this.Brecord_end_time;
                    start = this.Brecord_start_time;
                    index = this.roleBindex;
                }
                const sentence_end =
                    Number(end[`${this.recordIndex}`].slice(3, 5) * 60) +
                    Number(
                        end[`${this.recordIndex}`]
                            .slice(6, 11)
                            .replace(",", ".")
                    );
                const sentence_start =
                    Number(start[`${this.recordIndex}`].slice(3, 5) * 60) +
                    Number(
                        start[`${this.recordIndex}`]
                            .slice(6, 11)
                            .replace(",", ".")
                    );
                this.sentence_end = Number((sentence_end - 0.1).toFixed(1));
                this.sentence_start = sentence_start;
                const now_time = Number(player.getCurrentTime().toFixed(1));
                if (now_time === this.sentence_end) {
                    player.seekTo(sentence_start - 0.1);
                    player.pauseVideo();
                    this.en_content =
                        this.subtitle[`${index[this.recordIndex]}`][
                            "en_content"
                        ];
                    this.ch_content =
                        this.subtitle[`${index[this.recordIndex]}`][
                            "ch_content"
                        ];
                    console.log(sentence_start);
                }
            } else if (this.mode == "正常") {
                let end = "";
                let start = "";
                let index = "";
                if (this.role == "A") {
                    end = this.Arecord_end_time;
                    start = this.Arecord_start_time;
                    index = this.roleAindex;
                } else if (this.role == "B") {
                    end = this.Brecord_end_time;
                    start = this.Brecord_start_time;
                    index = this.roleBindex;
                }

                const sentence_end =
                    Number(end[`${this.recordIndex}`].slice(3, 5) * 60) +
                    Number(
                        end[`${this.recordIndex}`]
                            .slice(6, 11)
                            .replace(",", ".")
                    );
                const sentence_start =
                    Number(start[`${this.recordIndex}`].slice(3, 5) * 60) +
                    Number(
                        start[`${this.recordIndex}`]
                            .slice(6, 11)
                            .replace(",", ".")
                    );
                this.sentence_end = Number(sentence_end.toFixed(1));
                this.sentence_start = Number(sentence_start.toFixed(1));
                const now_time = Number(player.getCurrentTime().toFixed(1));
                if (now_time === this.sentence_end) {
                    player.seekTo(sentence_start - 0.1);
                    player.pauseVideo();
                    this.en_content =
                        this.subtitle[`${index[this.recordIndex]}`][
                            "en_content"
                        ];
                    this.ch_content =
                        this.subtitle[`${index[this.recordIndex]}`][
                            "ch_content"
                        ];
                    document
                        .querySelector(".function03")
                        .classList.remove("none");
                }
            } else if (this.mode == "全部播放") {
                let idNameArr = []; //音檔名稱陣列
                if (this.role == "A") {
                    for (let i = 0; i < this.roleAindex.length; i++) {
                        let idName = `audio${this.roleAindex[i]}${this.mid}`;
                        idNameArr.push(idName);
                    }
                } else if (this.role == "B") {
                    for (let i = 0; i < this.roleBindex.length; i++) {
                        let idName = `audio${this.roleBindex[i]}${this.mid}`;
                        idNameArr.push(idName);
                    }
                }
                let audio = document.getElementById(
                    `${idNameArr[this.recordIndex]}`
                );

                this.nowplayingAudio = audio;
                let end = "";
                let start = "";
                if (this.role == "A") {
                    end = this.Arecord_end_time;
                    start = this.Arecord_start_time;
                } else if (this.role == "B") {
                    end = this.Brecord_end_time;
                    start = this.Brecord_start_time;
                }
                if (this.recordIndex <= this.recBlobLength - 1) {
                    const sentence_end =
                        Number(end[`${this.recordIndex}`].slice(3, 5) * 60) +
                        Number(
                            end[`${this.recordIndex}`]
                                .slice(6, 11)
                                .replace(",", ".")
                        );
                    const sentence_start =
                        Number(start[`${this.recordIndex}`].slice(3, 5) * 60) +
                        Number(
                            start[`${this.recordIndex}`]
                                .slice(6, 11)
                                .replace(",", ".")
                        );
                    this.sentence_end = Number(sentence_end.toFixed(1));
                    this.sentence_start = Number(sentence_start.toFixed(1));
                    const now_time = Number(player.getCurrentTime().toFixed(1));

                    if (now_time === this.sentence_start) {
                        player.mute();
                        audio.play();
                    }

                    if (now_time === this.sentence_end) {
                        player.unMute();
                        audio.pause();
                        app.recordIndex += 1;
                    }
                } else {
                    document.getElementById("allAudioStart").style.display =
                        "block";
                    document.getElementById("allAudioPause").style.display =
                        "none";
                }
            }
            //時間軸秒數顯示及判斷
            if (time < allTime) {
                let currentTime = (time / allTime) * 100;
                document.querySelector(
                    ".goTime_bar"
                ).style.width = `${currentTime}%`;
                let min = Math.floor(time / 60);
                let sec = (time % 60).toFixed(0);
                let minsec = (time % 60).toFixed(1);
                if (min < 10 && sec < 10) {
                    app.currentTime = `0${min}:0${sec}`;
                    app.currentTimeMin = `0${min}:0${minsec}`;
                } else if (min < 10 && sec == 10) {
                    app.currentTime = `0${min}:${sec}`;
                    app.currentTimeMin = `0${min}:${minsec}`;
                } else if (min < 10 && sec > 10) {
                    app.currentTime = `0${min}:${sec}`;
                    app.currentTimeMin = `0${min}:${minsec}`;
                } else if (min >= 10 && sec < 10) {
                    app.currentTime = `${min}:0${sec}`;
                    app.currentTimeMin = `${min}:0${minsec}`;
                } else {
                    app.currentTime = `${min}:${sec}`;
                    app.currentTimeMin = `${min}:${minsec}`;
                }
            }
        },
        // === 開始示範 ===
        startSample() {
            if (this.cid == null) {
                document.getElementById("myModal01").classList.remove("none");
            } else {
                document.getElementById("startSample").classList.add("none");
                document.querySelector(".begin_mask").classList.add("none");
                document.querySelector(".demo_button").classList.remove("none");
                document.querySelector(".function01").classList.remove("none");
                const sentence_start = this.record_start_time[this.recordIndex];
                const min = Number(sentence_start.slice(3, 5)) * 60;
                const sec = Number(
                    sentence_start.slice(6, 11).replace(",", ".")
                );
                const time = min + sec;
                player.seekTo(time - 2);
                player.unMute().playVideo();
            }
        },
        // === 略過示範 ===
        passSample() {
            player.pauseVideo();
            document.querySelector(".lds-rippleA").classList.add("none");
            document.querySelector(".lds-rippleB").classList.add("none");
        },
        // === 選擇腳色 ===
        chooseRole(role) {
            // document.querySelector(".function01").classList.add("none");
            // document.querySelector(".function02").style.display = "block";
            // document.querySelector(".lds-rippleA").classList.add("none");
            if (role == "A") {
                document
                    .querySelector(`.button_A`)
                    .classList.add("button_activeA");
                document
                    .querySelector(`.button_B`)
                    .classList.remove("button_activeB");
            } else {
                document
                    .querySelector(`.button_B`)
                    .classList.add("button_activeB");
                document
                    .querySelector(`.button_A`)
                    .classList.remove("button_activeA");
            }

            this.role = role;
        },
        // === 開始配音 ===
        startRecord() {
            this.mode == "正常";
            if (this.role == "") {
                alert("請先選擇任一角色來扮演");
            } else {
                document.querySelector(".function02").style.display = "none";
                document.querySelector(".demo_button").style.pointerEvents =
                    "none";
                // this.startSample();
                this.mode = "正常";
                this.recordIndex = 0;
                this.recOpen();
                setTimeout(() => {
                    let sentence_start = this.record_start_time[0];
                    const min = Number(sentence_start.slice(3, 5)) * 60;
                    const sec = Number(
                        sentence_start.slice(6, 11).replace(",", ".")
                    );
                    const time = min + sec;
                    player.seekTo(time - 2);
                    player.unMute().playVideo();
                }, 1500);
            }
        },
        // === 重播原音 ===
        replay() {
            this.mode = "單句";
            player.unMute().playVideo();
        },
        // ==========================================
        // == 錄音裝置請求 (audio設置)
        // ==========================================
        showDialog() {
            if (!/mobile/i.test(navigator.userAgent)) {
                return;
            }
            dialogCancel();

            let div = document.createElement("div");
            document.body.appendChild(div);
            div.innerHTML =
                "" +
                '<div class="waitDialog">' +
                '<div class="waitDialog-1">' +
                '<div style="flex:1;"></div>' +
                '<div class="waitDialog-2">' +
                '<div style="padding-bottom:10px;">錄音功能需要麥克風權限，請允許；如果未看到任何請求，請點擊忽略</div>' +
                '<div style="text-align:center;"><a onclick="waitDialogClick()" style="color:#0B1">忽略</a></div>' +
                "</div>" +
                '<div style="flex:1;"></div>' +
                "</div>" +
                "</div>";
        },

        createDelayDialog() {
            this.dialogInt = setTimeout(() => {
                app.showDialog();
            }, 8000);
        },

        dialogCancel() {
            clearTimeout(this.dialogInt);
            const elems = document.querySelectorAll(".waitDialog");
            for (let i = 0; i < elems.length; i++) {
                elems[i].parentNode.removeChild(elems[i]);
            }
        },
        // ==========================================
        // == browser 錄音充許開啟 (audio設置)
        // ==========================================
        recOpen() {
            let newRec = Recorder({
                type: "mp3",
                sampleRate: 16000,
                bitRate: 16,
                onProcess: function (
                    buffers,
                    powerLevel,
                    bufferDuration,
                    bufferSampleRate,
                    newBufferIdx,
                    asyncEnd
                ) {},
            });

            this.createDelayDialog(); // 防止特異 browser 設定狀況
            newRec.open(
                function () {
                    app.dialogCancel();
                    console.log(newRec);
                    console.log(
                        Recorder.FrequencyHistogramView({
                            elem: ".recwave",
                        })
                    );
                    app.rec = newRec;
                    app.wave = Recorder.FrequencyHistogramView({
                        elem: ".recwave",
                    });
                },
                function (msg, isUserNotAllow) {
                    alert("未偵測到錄音裝置");
                    app.dialogCancel();
                    location.reload();
                }
            );

            window.waitDialogClick = function () {
                app.dialogCancel();
            };
            // console.log("rec is open");
        },
        // ==========================================
        // == browser 錄音充許關閉 (釋放資源) (audio設置)
        // ==========================================
        recClose() {
            if (app.rec) {
                app.rec.close();
            }
        },
        // ==========================================
        // == 開始錄音(audio設置)
        // ==========================================
        recStart() {
            app.rec && Recorder.IsOpen() ? app.rec.start() : app.recOpen();
        },

        // ==========================================
        // == 结束錄音，得到音頻文件 (audio設置)
        // ==========================================
        recStop() {
            if (!(app.rec && Recorder.IsOpen())) {
                return;
            }
            app.rec.stop(function (blob, duration) {
                // console.log(blob);
                app.recBlob.push(blob);
                // console.log("push", recBlob);

                // CREATE AUDIO ELE v
                if (!app.recBlob) {
                    return;
                }

                // 加載 audio 物件 v
                const audio = document.createElement("audio");
                audio.controls = true; // true => 產生可操控介面
                audio.preload = "auto";
                audio.load();
                audio.setAttribute("id", "myAudio_" + app.recordIndex);
                document.getElementById("audioBox").append(audio);

                //簡單利用URL生成播放地址，注意不用了時需要revokeObjectURL，否則霸占暫存
                audio.src = (window.URL || webkitURL).createObjectURL(
                    app.recBlob[app.recordIndex]
                );
                setTimeout(function () {
                    (window.URL || webkitURL).revokeObjectURL(audio.src);
                }, 1000);
            });
        },
        // ==========================================
        // == 结束錄音，播放錄音(audio設置)
        // ==========================================
        playAudio(type) {
            this.mode = "單句";
            // console.log(document.getElementById("audioBox").childNodes.length);
            // if (app.recBlob[app.recordIndex] !== null) {
            //     app.recBlob.splice(app.recordIndex, 1);
            // }
            if (
                document.getElementById(`myAudio_${app.recordIndex}`) !==
                undefined
            ) {
                document.getElementById(`myAudio_${app.recordIndex}`).remove();
            }
            const audio = document.createElement("audio");
            audio.controls = true; // true => 產生可操控介面
            audio.preload = "auto";
            audio.load();
            audio.setAttribute("id", "myAudio_" + app.recordIndex);
            document.getElementById("audioBox").append(audio);

            //簡單利用URL生成播放地址，注意不用了時需要revokeObjectURL，否則霸占暫存
            audio.src = (window.URL || webkitURL).createObjectURL(
                app.recBlob[app.recordIndex]
            );
            setTimeout(function () {
                (window.URL || webkitURL).revokeObjectURL(audio.src);
            }, 1000);

            app.singleAudio = audio;

            if (type == "start") {
                // stop to active v
                player.seekTo(this.sentence_start);
                player.playVideo();
                player.mute();
                app.singleAudio.play();
                document.getElementById("start_voice").style.display = "none";
                document.getElementById("stop_voice").style.display = "block";
                const fn = function () {
                    let current = player.getCurrentTime();
                    const a = current - app.sentence_start;
                    const b = app.sentence_end - app.sentence_start;

                    if (audio.ended) {
                        // app.singleRec += 1;
                        document.getElementById("start_voice").style.display =
                            "block";
                        // console.log("end");
                        document.getElementById("stop_voice").style.display =
                            "none";
                        player.pauseVideo();
                        app.singleAudio.pause();
                        app.singleAudio.currentTime = 0;
                        app.singleAudio = "";
                        clearInterval(app.sid);
                        // document.querySelector(".function03").classList.add("none");
                    }
                };
                app.sid = setInterval(fn, 10);
            } else if (type == "stop") {
                // active to stop v
                // app.singleRec += 1;
                player.pauseVideo();
                this.singleAudio.pause();
                this.singleAudio.currentTime = 0;
                app.singleAudio = "";
                clearInterval(app.sid);
                document.getElementById("start_voice").style.display = "block";
                document.getElementById("stop_voice").style.display = "none";
            }
        },
        // ==========================================
        // == 錄音上傳
        // ==========================================
        uploadFile() {
            app.audioList();
            const roleAry = []; // ex:[mp3_100,mp3_103]
            if (this.role == "B") {
                for (let i = 0; i < this.roleBindex.length; i++) {
                    roleAry.push(`${this.roleBindex[i]}`);
                }
            } else if (this.role == "A") {
                for (let i = 0; i < this.roleAindex.length; i++) {
                    roleAry.push(`${this.roleAindex[i]}`);
                }
            }
            // --------------------------------
            let formData = new FormData();
            for (i = 0; i < this.recBlob.length; i++) {
                const p1 = roleAry[i];
                const p2 = this.recBlob[i];
                const p3 =
                    this.cid +
                    "-" +
                    this.mid +
                    "-" +
                    this.videoId +
                    "-" +
                    roleAry[i] +
                    ".mp3";
                formData.append(p1, p2, p3);
            }
            formData.append("member_id", this.mid);
            formData.append("customer_id", this.cid);
            formData.append("news_id", this.videoId);
            //上傳api
            axios({
                method: "post",
                url: "https://funday.asia/newmylessonmobile/api/InteractiveVideoUpload",
                data: formData,
                headers: {
                    "Content-Type": false,
                },
                //上傳進度顯示
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.lengthComputable) {
                        let complete =
                            ((progressEvent.loaded / progressEvent.total) *
                                100) |
                            (0 + "%");
                        app.progress = complete;
                        if (complete >= 100) {
                            app.progress = "100%";
                        }
                    }
                },
            })
                .then(function (response) {
                    document.querySelector(".function04").classList.add("none");
                    setTimeout(function () {
                        document.getElementById(
                            "uploadProgress"
                        ).style.display = "none";
                    }, 1000);
                    setTimeout(function () {
                        document
                            .querySelector(".function06")
                            .classList.remove("none");
                        document
                            .querySelector(".demo_button")
                            .classList.add("none");
                    }, 1500);
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        // ==========================================
        // === 開始錄製&動畫顯示 ===
        // ==========================================
        goRec() {
            const time = this.sentence_end - this.sentence_start;
            this.recStart();

            player.seekTo(this.sentence_start - 0.1);
            player.playVideo();
            player.mute();

            setTimeout(() => {
                this.recStop();
                player.pauseVideo();
            }, time * 1000);

            // === 秒數倒數 ===
            document.getElementById("timer").classList.remove("none");
            let timer = Math.round(time * 10) / 10;
            let sid;
            sid = setInterval(() => {
                if (timer > 0) {
                    timer -= 0.1;
                    timer = Math.round(timer * 10) / 10;
                } else {
                    clearInterval(sid);
                }
                this.timeStr(timer, true, "分", "秒");
            }, 100);
            // === circle動畫 ===
            const circleTime = time.toFixed(2) * 1000; //ex:1230
            bar = new ProgressBar.Circle(container, {
                strokeWidth: 6,
                easing: "linear",
                duration: circleTime,
                color: "#1ca7ec",
                trailColor: "#4a4a4a",
                trailWidth: 1,
                svgStyle: null,
                reverse: true,
            });
            bar.animate(-1.0);
            this.checkLast();
            if (this.recDone == true) {
                setTimeout(() => {
                    document.querySelector(".function03").classList.add("none");
                    document.getElementById("container").innerHTML = "";
                    document.getElementById("timer").classList.add("none");
                    document
                        .querySelector(".function04")
                        .classList.remove("none");
                    document.getElementById("nextRec").classList.add("none");
                    document.getElementById("recDone").classList.remove("none");
                    document.getElementById("uploadProgress").style.display =
                        "block";
                }, circleTime + 500);
            } else {
                setTimeout(() => {
                    document.querySelector(".function03").classList.add("none");
                    document.getElementById("container").innerHTML = "";
                    document.getElementById("timer").classList.add("none");
                    document
                        .querySelector(".function04")
                        .classList.remove("none");
                    document.getElementById("nextRec").classList.remove("none");
                    document.getElementById("recDone").classList.add("none");
                }, circleTime + 500);
            }
        },
        // ==========================================
        // === 重新錄製&動畫顯示 ===
        // ==========================================
        reRec() {
            // this.mode = "單句";
            app.recBlob.splice(app.recordIndex, 1);
            // document.getElementById(`myAudio_${app.recordIndex}`).remove();
            const idName = "myAudio_" + app.recordIndex;
            const audio = document.getElementById(idName);

            audio.remove();
            // console.log(audio);
            const time = this.sentence_end - this.sentence_start;
            this.recStart();

            player.seekTo(this.sentence_start);
            player.playVideo();
            player.mute();

            setTimeout(() => {
                this.recStop();
                // console.log("is pasue 4");
                player.pauseVideo();
            }, time * 1000);

            // === 秒數倒數 ===
            document.getElementById("timer2").classList.remove("none");
            let timer = Math.round(time * 10) / 10;
            let sid;
            sid = setInterval(() => {
                if (timer > 0) {
                    timer -= 0.1;
                    timer = Math.round(timer * 10) / 10;
                } else {
                    clearInterval(sid);
                }
                this.timeStr(timer, true, "分", "秒");
            }, 100);
            // === circle動畫 ===
            const circleTime = time.toFixed(2) * 1000; //ex:1230
            bar = new ProgressBar.Circle(container2, {
                strokeWidth: 6,
                easing: "linear",
                duration: circleTime,
                color: "#1ca7ec",
                trailColor: "#4a4a4a",
                trailWidth: 1,
                svgStyle: null,
            });
            bar.animate(-1.0);
            setTimeout(() => {
                document.getElementById("container2").innerHTML = "";
                document.getElementById("timer2").classList.add("none");
                document.querySelector(".function03").classList.add("none");
            }, circleTime + 100);
        },
        // === 秒數計算 ===
        timeStr(time, decimal, f1, f2) {
            let m = Math.floor(time / 60);
            let s = m > 0 ? Math.floor(time - m * 60) : Math.floor(time);
            if (String(s).length < 2 && f2 === "") s = "0" + s; // f2 === 0 為「只在時間軸上補零，錄音倒數不補」意思
            let ss = time - m * 60 - s;
            ss = Math.round(ss * 10) / 10;
            ss = String(ss).substr(1) || ".0";
            //
            let str = "";
            if (m > 0) str += m + f1;
            if (m <= 0 && f2 === "") str += "00:"; // f2 === 0 為「只在時間軸上補零，錄音倒數不補」意思
            str += s;
            if (decimal) str += ss;
            str += f2;
            this.timer = str;
        },
        // ==========================================
        // === 錄製下一句 ===
        // ==========================================
        // === 先檢查是否為最後一句 ===
        checkLast() {
            let length = "";
            if (this.role == "A") {
                length = this.Arecord_start_time.length - 1;
            } else if (this.role == "B") {
                length = this.Brecord_start_time.length - 1;
            }
            if (this.recordIndex == length) {
                this.recDone = true;
            }
        },
        nextRec() {
            if (
                document.getElementById(`myAudio_${app.recordIndex}`) !==
                undefined
            ) {
                document.getElementById(`myAudio_${app.recordIndex}`).remove();
            }
            const audio = document.createElement("audio");
            audio.controls = true; // true => 產生可操控介面
            audio.preload = "auto";
            audio.load();
            audio.setAttribute("id", "myAudio_" + app.recordIndex);
            document.getElementById("audioBox").append(audio);

            //簡單利用URL生成播放地址，注意不用了時需要revokeObjectURL，否則霸占暫存
            audio.src = (window.URL || webkitURL).createObjectURL(
                app.recBlob[app.recordIndex]
            );
            setTimeout(function () {
                (window.URL || webkitURL).revokeObjectURL(audio.src);
            }, 1000);

            this.mode = "正常";
            this.recordIndex += 1;
            this.en_content = this.subtitle[`${this.sIndex + 1}`]["en_content"];
            this.ch_content = this.subtitle[`${this.sIndex + 1}`]["ch_content"];
            document.querySelector(".function04").classList.add("none");
            player.seekTo(this.sentence_end);
            player.unMute().playVideo();
        },
        // ==========================================
        // === 重錄角色 ===
        // ==========================================
        restartRecord() {
            document.querySelector(".function06").classList.add("none");
            document.getElementById("audioBox").innerHTML = "";
            this.RecordingList = {};
            this.recBlob = [];
            this.recDone = false;
            this.progress = "0%";
            this.startRecord();
        },
        // ==========================================
        // === 替換角色 ===
        // ==========================================
        changeRole() {
            if (this.role == "A") {
                this.role = "B";
            } else {
                this.role = "A";
            }
            document.querySelector(".function06").classList.add("none");
            this.recBlob = [];
            this.recDone = false;
            this.progress = "0%";
            this.startRecord();
        },
        // ==========================================
        // === 播放整段錄音 ===
        // ==========================================
        playAll(type) {
            this.recordIndex = 0;
            document.getElementById("audioBox").innerHTML = "";
            // document.querySelector(".demo_button").classList.remove("none");
            this.mode = "全部播放";

            if (type == "start") {
                document.getElementById("allAudioPause").style.display =
                    "block";
                document.getElementById("allAudioStart").style.display = "none";

                if (app.role == "A") {
                    app.recBlobLength = app.roleAindex.length;
                } else {
                    app.recBlobLength = app.roleBindex.length;
                }

                const sentence_start = this.record_start_time[0];
                const min = Number(sentence_start.slice(3, 5)) * 60;
                const sec = Number(
                    sentence_start.slice(6, 11).replace(",", ".")
                );
                const time = min + sec;
                player.seekTo(time - 1);
                player.unMute().playVideo();
            } else if (type == "stop") {
                document.getElementById("allAudioStart").style.display =
                    "block";
                document.getElementById("allAudioPause").style.display = "none";
                app.nowplayingAudio.pause();
                app.nowplayingAudio.currentTime = 0;
                player.pauseVideo();
            }
        },
        // ==========================================
        // == 上傳後獲取配音資料 ==
        // ==========================================
        audioList() {
            // document.querySelector(".audioTab").classList.remove("none");
            let mid = 0;
            if (sessionStorage.getItem("mindx") !== null) {
                mid = sessionStorage.getItem("mindx");
            }
            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/RecordingList.asp?indx=${this.videoId}&member_id=${mid}`
                )
                .then((response) => {
                    // console.log(response);
                    let audioObject = []; //物件重組
                    let aAudio = false;
                    let bAudio = false;
                    let newObjectA = "";
                    let newObjectB = "";
                    for (
                        let i = 0;
                        i < response.data["Recording List"].length;
                        i++
                    ) {
                        const array = response.data["Recording List"][i];
                        // console.log(array.files);
                        if (array.files !== undefined) {
                            const files = array.files[0].split(",");
                            for (let j = 0; j < files.length; j++) {
                                const singleFile = files[j].substr(-8, 3);
                                // console.log(singleFile);
                                if (singleFile == this.roleAindex[0]) {
                                    aAudio = true;
                                } else if (singleFile == this.roleBindex[0]) {
                                    bAudio = true;
                                }
                                // console.log(aAudio);
                                // console.log(bAudio);
                            }
                        }

                        if (aAudio && bAudio) {
                            newObjectA = {
                                HasPromote: array.HasPromote,
                                Pmember_id: array.Pmember_id,
                                Sex: array.Sex == 0 ? "female" : "male",
                                Promote: array.Promote,
                                Pmember_nickname: array.Pmember_nickname,
                                Pcustomer_id: array.Pcustomer_id,
                                fileType: array.fileType,
                                role: "A",
                            };
                            newObjectB = {
                                HasPromote: array.HasPromote,
                                Pmember_id: array.Pmember_id,
                                Sex: array.Sex == 0 ? "female" : "male",
                                Promote: array.Promote,
                                Pmember_nickname: array.Pmember_nickname,
                                Pcustomer_id: array.Pcustomer_id,
                                fileType: array.fileType,
                                role: "B",
                            };
                            audioObject.push(newObjectA);
                            audioObject.push(newObjectB);
                        } else if (aAudio && !bAudio) {
                            newObjectA = {
                                HasPromote: array.HasPromote,
                                Pmember_id: array.Pmember_id,
                                Sex: array.Sex == 0 ? "female" : "male",
                                Promote: array.Promote,
                                Pmember_nickname: array.Pmember_nickname,
                                Pcustomer_id: array.Pcustomer_id,
                                fileType: array.fileType,
                                role: "A",
                            };
                            audioObject.push(newObjectA);
                        } else if (!aAudio && bAudio) {
                            newObjectB = {
                                HasPromote: array.HasPromote,
                                Pmember_id: array.Pmember_id,
                                Sex: array.Sex == 0 ? "female" : "male",
                                Promote: array.Promote,
                                Pmember_nickname: array.Pmember_nickname,
                                Pcustomer_id: array.Pcustomer_id,
                                fileType: array.fileType,
                                role: "B",
                            };
                            audioObject.push(newObjectB);
                        }
                    }
                    console.log("123");
                    this.RecordingList = audioObject;
                });
        },
        // ==========================================
        // === 收藏 ===
        // ==========================================
        fnAddToCollection(e) {
            //判斷是否登入
            // console.log(e.target);
            if (this.mid == null) {
                document.getElementById("myModal01").classList.remove("none");
                return;
            }

            //取得點擊到的該篇影片id
            let VideoId = e.target.attributes["id"].value;
            let mid = 0;
            //登入後memberId
            if (this.mid !== null) {
                mid = this.mid;
            }
            //此API在同一個歌曲編號的狀況下，再打一次為取消收藏
            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/Behavior.asp?member_id=${mid}&ref_id=${VideoId}&action=favorite`
                )
                .then((res) => {
                    // console.log(res);
                    if (res.data.State == 1) {
                        //新增成功
                        e.target.classList.add("favorites");
                    }

                    if (res.data.State == 2) {
                        //刪除成功
                        e.target.classList.remove("favorites");
                    }
                })
                .catch((error) => console.log(error));
        },
    },
    watch: {
        // ==========================================
        // === 字幕同步 ===
        // ==========================================
        currentTimeMin: function (value) {
            if (this.startTimeArr.indexOf(value) !== -1) {
                console.log(this.startTimeArr.indexOf(value));
                const subtitleIndex = this.startTimeArr.indexOf(value);
                this.sIndex = subtitleIndex;
                // === 播放區塊字幕顯示 ===
                this.en_content =
                    this.subtitle[`${subtitleIndex}`]["en_content"];
                this.ch_content =
                    this.subtitle[`${subtitleIndex}`]["ch_content"];

                if (this.subtitle[`${subtitleIndex}`]["role"] == "A") {
                    document
                        .querySelector(".lds-rippleA")
                        .classList.remove("none");
                    document
                        .querySelector(".lds-rippleB")
                        .classList.add("none");
                } else if (this.subtitle[`${subtitleIndex}`]["role"] == "B") {
                    document
                        .querySelector(".lds-rippleB")
                        .classList.remove("none");
                    document
                        .querySelector(".lds-rippleA")
                        .classList.add("none");
                } else {
                    document
                        .querySelector(".lds-rippleB")
                        .classList.add("none");
                    document
                        .querySelector(".lds-rippleA")
                        .classList.add("none");
                }
            }
        },
    },
});
