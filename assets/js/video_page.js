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
        mode: "循環", //播放模式
        randomMode: true, //隨機模式
        sIndex: "0", //字幕Index
        timeupdate: "false", //時間更新才有開啟
        random: "", //隨機影片
        next: "", //下一部影片
        prev: "", //上一部影片
        subtitle_en: [], //側邊欄字幕
        videoId: "", //影片ID
        record_start_time: [],
        record_end_time: [],
        cid: "",
        mid: "",
        keyWordResult: {}, //字典搜尋結果
        DrWordModal: false, //字典modal開關
        DrWord: "", //字本人
        clicks: false,
        RecordingList: {},
        audioStart: "", //配音開始時間
        audioEnd: "", //配音結束時間
        audioLength: "", //錄音檔長度
        roleAindex: [],
        roleBindex: [],
        audioSrc: [],
        recBlobLength: "",
        role: "", //選取配音的角色
        recordIndex: 0, //配音檔案序號
        audioMid: "", //配音會員Id
        nowplayingAudio: "", //正在播放的配音檔案
        Arecord_start_time: [],
        Arecord_end_time: [],
        Brecord_start_time: [],
        Brecord_end_time: [],
        sid: "", //倒數fn
        timer: "", //計時器
        videoCheck: 0, //影片點擊會員判斷
        bookmark: 0,
        playstate: -1,
        hint: "字幕模式：英文及中文",
        modetext: "循環",
        nowtextmode: "字幕模式：英文及中文",
        nowtab: 0,
        fburl: "", //臉書分享網址
        lineurl: "", //Line分享網址
        twitterurl: "", //Line分享網址
        emailurl: "", //ig分享網址
        whatsurl: "", //whats app分享網址
        linkedinurl: "", //linkedin分享網址
        URL: "",
        single: false,
        role: "",
        pauseBlk: true,
    },
    created() {
        var player;
        this.createPlayer();
    },
    methods: {
        // ==========================================
        // == 主內容資料 ==
        // ==========================================
        createPlayer() {
            const url = window.location.search;
            this.URL = window.location.href;
            console.log(url);
            const memberid = sessionStorage.getItem("mindx");
            let id = "";
            if (url.indexOf("?") != -1) {
                const ary = url.split("?")[1].split("&");
                // console.log(ary);
                for (i = 0; i <= ary.length - 1; i++) {
                    if (ary[i].split("=")[0] == "id") {
                        id = decodeURI(ary[i].split("=")[1]);
                        this.videoId = id;
                    }
                }
            }

            // ===影片資料===
            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/ProgramJson.asp?indx=${id}&member_id=${memberid}`
                )
                .then((response) => {
                    console.log(response.data);

                    // ==========================================
                    // == 影片各資料取得
                    // ==========================================

                    //取得播放清單(上下一首 或 隨機)
                    this.next = response.data.others.next_id;
                    this.prev = response.data.others.previous_id;
                    this.random = response.data.others.random_id;
                    //取得影片封面
                    const ytImg = response.data.info.photo_url;
                    //取得影片資訊
                    const ytInfo = response.data.info.description;

                    // ===產生分享網址===
                    // *FB
                    this.fburl = `javascript: void(window.open('http://www.facebook.com/share.php?u='.concat(encodeURIComponent('https://newb2b.funday.asia/mylesson/video_project/video.html${url}'))));`;
                    //*Line
                    this.lineurl = `https://social-plugins.line.me/lineit/share?url=https://newb2b.funday.asia/mylesson/video_project/video.html${url}`;
                    //*twitter
                    this.twitterurl = `https://twitter.com/intent/tweet?url=https://newb2b.funday.asia/mylesson/video_project/video.html${url}`;
                    //*email
                    this.emailurl = `mailto:?to=&subject=Funtube&body=https://newb2b.funday.asia/mylesson/video_project/video.html${url}`;
                    //*Whatsapp
                    this.whatsurl = `https://api.whatsapp.com/send?text=https://newb2b.funday.asia/mylesson/video_project/video.html${url}`;
                    //*Linkedin
                    this.linkedinurl = `https://www.linkedin.com/shareArticle?mini=true&title=Funtube&url=https://newb2b.funday.asia/mylesson/video_project/video.html${url}`;
                    //取得字幕列表
                    this.subtitle = response.data.data;
                    for (let i = 0; i < this.subtitle.length; i++) {
                        let en = unescape(
                            escape(JSON.stringify(this.subtitle[i].en_content))
                                .replace(/\%A0/g, " ")
                                .replace(/\%22/g, "")
                        ).split(" ");
                        this.subtitle_en[i] = en;
                    }
                    switch (response.data.info.Category_id) {
                        case "15":
                            this.cate = "Cinephile";
                            break;
                        case "21":
                            this.cate = "Weekly News";
                            break;
                        case "14":
                            this.cate = "Life Style";
                            break;
                        case "16":
                            this.cate = "Knowledge";
                            break;
                        case "20":
                            this.cate = "微電影";
                            break;
                    }
                    //取得是否收藏
                    this.bookmark = response.data.info.Bookmark;
                    //取得字幕開始時間陣列&取得配音片段開始時間&結束時間
                    const startTimeLength = parseInt(response.data.data.length);
                    const startTimeArr = [];
                    for (let i = 0; i < startTimeLength; i++) {
                        let startTime = response.data.data[i].starttime
                            .slice(3, 10)
                            .replace(",", ".");
                        startTimeArr.push(startTime);
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
                    this.startTimeArr = startTimeArr;
                    for (let i = 0; i < startTimeLength; i++) {
                        if (response.data.data[i].role !== "") {
                            this.record_start_time.push(
                                response.data.data[i].starttime //配音開始時間陣列
                            );
                            this.record_end_time.push(
                                response.data.data[i].endtime //配音結束時間陣列
                            );
                        }
                    }
                    //是否有配音挑戰
                    if (this.record_end_time.length !== 0) {
                        document
                            .querySelector(".tabs")
                            .classList.remove("none");
                        document
                            .querySelector(".audioList_li")
                            .classList.remove("none");
                        document.querySelector(".audioList_li").style.width =
                            "50%";
                        document.querySelector(".cc_li").style.width = "50%";
                        document
                            .getElementById("check_cate")
                            .classList.remove("none");
                        document
                            .getElementById("check_cate2")
                            .classList.remove("none");
                        // console.log(this.record_end_time);
                        const sentence_end =
                            Number(
                                this.record_end_time[
                                    this.record_end_time.length - 1
                                ].slice(3, 5) * 60
                            ) +
                            Number(
                                this.record_end_time[
                                    this.record_end_time.length - 1
                                ]
                                    .slice(6, 11)
                                    .replace(",", ".")
                            );
                        const sentence_start =
                            Number(this.record_start_time[0].slice(3, 5) * 60) +
                            Number(
                                this.record_start_time[0]
                                    .slice(6, 11)
                                    .replace(",", ".")
                            );

                        this.audioStart = sentence_start; //配音開始時間
                        this.audioEnd = sentence_end; //配音結束時間
                        let sec = (sentence_end - sentence_start).toFixed(1);

                        this.audioLength = sec; //配音長度
                    }
                    //會員資料
                    this.cid = sessionStorage.getItem("cindx");
                    this.mid = sessionStorage.getItem("mindx");
                    // 取得 youtube 網址轉換
                    const youtubeId =
                        response.data.info.urls.split("https://youtu.be/")[1];
                    const youtubeUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&controls=0&showinfo=0&autoplay=0&rel=0&cc_lang_pref=en&cc_load_policy=0`;
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
                        //配音段落字幕上色
                        for (let i = 0; i < app.roleAindex.length; i++) {
                            document
                                .getElementById(`subtitle${app.roleAindex[i]}`)
                                .classList.add("role_A");
                        }
                        for (let i = 0; i < app.roleBindex.length; i++) {
                            document
                                .getElementById(`subtitle${app.roleBindex[i]}`)
                                .classList.add("role_B");
                        }
                        //取得影片時間軸
                        let allSec = player.getDuration();
                        let allMin = Math.floor(allSec / 60).toFixed(0);
                        let sec = allSec % 60;
                        if ((sec = "0")) {
                            sec = "00";
                        }
                        // console.log(sec);s
                        app.allTime = `${allMin}:${sec}`; //影片總長
                        setInterval(app.fnTimeChecking, 10); //timeUpdate
                    }
                    function onPlayerStateChange(e) {
                        let btn = document.getElementById("play_btn");
                        switch (e.data) {
                            case 0: //=== 結束 ===
                                app.playstate = 0;
                                if (app.mode == "單曲") {
                                    player.playVideo();
                                    app.playstate = 1;
                                } else if (
                                    app.mode == "循環" &&
                                    app.randomMode == false
                                ) {
                                    location.href = `./video.html?id=${app.next}&cate=${app.cate}`;
                                } else if (
                                    app.mode == "循環" &&
                                    app.randomMode == true
                                ) {
                                    location.href = `./video.html?id=${app.random}&cate=${app.cate}`;
                                } else {
                                    player.stopVideo();
                                }
                                break;
                            case 1: //=== 播放 ===
                                if (
                                    Number(sessionStorage.getItem("free")) > 1
                                ) {
                                    player.stopVideo();
                                    // alert("您的試用已結束");
                                    document
                                        .getElementById("myModal01")
                                        .classList.remove("none");
                                } else {
                                    if (window.innerWidth < 991) {
                                        document
                                            .querySelector(".time_bar")
                                            .classList.add("none");
                                    }

                                    app.playstate = 1;
                                    // btn.classList.remove("fa-play-circle");
                                    // btn.classList.add("fa-pause-circle");
                                    player.unMute().playVideo();
                                    app.timeupdate = "true";

                                    //點擊計算
                                    let mid = 0; //預設給0
                                    if (app.mid !== null) {
                                        mid = app.mid;
                                    }
                                    if (!app.clicks) {
                                        axios
                                            .get(
                                                `https://funday.asia/api/ProgramWeb/Behavior.asp?member_id=${mid}&ref_id=${app.videoId}&action=click`
                                            )
                                            .then((response) => {
                                                // console.log(response);
                                                app.clicks = true;
                                            });
                                    }
                                }
                                break;
                            case 2: //=== 暫停 ===
                                app.playstate = 0;
                                // btn.classList.add("fa-play-circle");
                                // btn.classList.remove("fa-pause-circle");
                                player.pauseVideo();
                                app.timeupdate = "false";
                                if (
                                    document.querySelector(".audioTimer") !==
                                    null
                                ) {
                                    const length =
                                        document.querySelectorAll(
                                            ".audioTimer"
                                        ).length;

                                    for (let i = 0; i < length; i++) {
                                        document
                                            .querySelectorAll(".audioTimer")
                                            [i].classList.add("none");
                                        document
                                            .querySelectorAll(".audioLength")
                                            [i].classList.remove("none");
                                        document
                                            .querySelectorAll(".audioBtn")
                                            [i].classList.remove("click");
                                    }
                                }

                                app.goTimer(false);
                                break;
                        }
                    }
                });

            // === 相關推薦列表 ===
            //登入後memberId
            let mid = 0; //預設給0
            if (sessionStorage.getItem("mindx") !== null) {
                mid = sessionStorage.getItem("mindx");
            }
            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/defaultlist.asp?member_id=${mid}`
                )
                .then((response) => {
                    this.cateList = response.data[`${this.cate}`];
                });
            //影片點擊會員登入判斷
        },
        // ==========================================
        // == 配音列表資料 ==
        // ==========================================
        audioList() {
            app.nowtab = 1;
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
                    this.RecordingList = audioObject;
                });
        },
        // ==========================================
        // == play bar ==
        // ==========================================
        //影片播放鈕
        vdController() {
            console.log(app.playstate);
            // const btn = document.getElementById("play_btn_mobile");
            if (Number(sessionStorage.getItem("free")) > 1) {
                player.stopVideo();
                document.getElementById("myModal01").classList.remove("none");
            } else {
                if (app.playstate == 0 || app.playstate == -1) {
                    player.playVideo();
                    //點擊計算
                    let mid = 0; //預設給0
                    if (app.mid !== null) {
                        mid = app.mid;
                    }
                    if (!app.clicks) {
                        axios
                            .get(
                                `https://funday.asia/api/ProgramWeb/Behavior.asp?member_id=${mid}&ref_id=${app.videoId}&action=click`
                            )
                            .then((response) => {
                                // console.log(response);
                                app.clicks = true;
                            });
                    }
                } else {
                    player.pauseVideo();
                }
            }
        },
        vdPrev() {
            if (this.mode == "循環") {
                if (this.randomMode == true) {
                    location.href = `./video.html?id=${this.random}&cate=${this.cate}`;
                } else {
                    location.href = `./video.html?id=${this.prev}&cate=${this.cate}`;
                }
            } else if (this.mode == "單句") {
                return false;
            } else {
                player.seekTo(0);
                player.playVideo();
            }
        },
        vdNext() {
            if (this.mode == "循環") {
                if (this.randomMode == true) {
                    location.href = `./video.html?id=${this.random}&cate=${this.cate}`;
                } else {
                    location.href = `./video.html?id=${this.next}&cate=${this.cate}`;
                }
            } else if (this.mode == "單句") {
                return false;
            } else {
                player.seekTo(0);
            }
        },
        // ==========================================
        // === 取得影片時間軸 && 字幕匹配 && 單句重播 && 播放配音模式===
        // ==========================================
        fnTimeChecking() {
            if (this.timeupdate == "false") {
                return false;
            }
            // console.log(app.timeupdate);
            const time = player.getCurrentTime();
            const allTime = player.getDuration();
            // ==========================================
            // === 單句重播模式&播放配音模式 ===
            // ==========================================
            if (this.mode == "單句") {
                const index = this.sIndex;
                const sentence_end =
                    Number(this.subtitle[index].endtime.slice(3, 5) * 60) +
                    Number(
                        this.subtitle[index].endtime
                            .slice(6, 10)
                            .replace(",", ".")
                    );
                const sentence_start =
                    Number(this.subtitle[index].starttime.slice(3, 5) * 60) +
                    Number(
                        this.subtitle[index].starttime
                            .slice(6, 11)
                            .replace(",", ".")
                    );
                const now_time = Number(player.getCurrentTime().toFixed(1));
                // console.log(sentence_end);
                // console.log(now_time);
                if (now_time === sentence_end - 0.1) {
                    player.seekTo(sentence_start);
                }
            } else if (this.mode == "配音") {
                let idNameArr = []; //音檔名稱陣列
                if (this.role == "A") {
                    for (let i = 0; i < this.roleAindex.length; i++) {
                        let idName = `audio${this.roleAindex[i]}${this.audioMid}`;
                        idNameArr.push(idName);
                    }
                } else if (this.role == "B") {
                    for (let i = 0; i < this.roleBindex.length; i++) {
                        let idName = `audio${this.roleBindex[i]}${this.audioMid}`;
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
        // ==========================================
        // === 字幕切換 ===
        // ==========================================
        subChange() {
            const hint = document.querySelector(".hint");
            function timeoutHandle() {
                setTimeout(() => {
                    hint.style.opacity = "0";
                }, 1500);
            }
            function timeoutHandle2() {
                setTimeout(() => {
                    hint.style.display = "none";
                }, 2000);
            }
            clearTimeout(timeoutHandle);
            clearTimeout(timeoutHandle2);
            hint.style.opacity = "0";
            hint.style.display = "none";
            const en = document.querySelector(".en1");
            const ch = document.querySelector(".ch1");
            const en_ch = document.querySelector(".en_ch1");
            const close = document.querySelector(".close1");
            const en2 = document.querySelector(".en2");
            const ch2 = document.querySelector(".ch2");
            const en_ch2 = document.querySelector(".en_ch2");
            const close2 = document.querySelector(".close2");
            const side_en = document.querySelectorAll(".side_en");
            const side_tw = document.querySelectorAll(".side_tw");
            const voiceImg = document.querySelectorAll(".voiceImg");
            const noWord = document.querySelector(".noWord");
            const side_li = document.querySelectorAll(".side_li");
            const en_blk = document.querySelector(".en");
            const ch_blk = document.querySelector(".tw");
            //init字幕
            if (app.nowtab == 1) {
                app.nowtab = 0;
                app.hint = "字幕模式：英文及中文";

                hint.style.opacity = "1";
                hint.style.display = "block";
                en.classList.add("none");
                ch.classList.add("none");
                en_ch.classList.remove("none");
                close.classList.add("none");
                en2.classList.add("none");
                ch2.classList.add("none");
                en_ch2.classList.remove("none");
                close2.classList.add("none");
                en_blk.classList.remove("none");
                ch_blk.classList.remove("none");
                for (let i = 0; i < side_en.length; i++) {
                    side_en[i].classList.remove("none");
                    side_tw[i].classList.remove("none");
                }
                timeoutHandle();
                timeoutHandle2();
                return false;
            }

            if (!en.classList.contains("none")) {
                app.hint = "字幕模式：中文";
                hint.style.opacity = "1";
                hint.style.display = "block";
                en.classList.toggle("none");
                ch.classList.toggle("none");
                en2.classList.toggle("none");
                ch2.classList.toggle("none");
                en_blk.classList.toggle("none");
                ch_blk.classList.toggle("none");
                for (let i = 0; i < side_en.length; i++) {
                    side_en[i].classList.toggle("none");
                    side_tw[i].classList.toggle("none");
                    side_tw[i].style.fontSize = "16px";
                }
            } else if (!ch.classList.contains("none")) {
                app.hint = "字幕模式：無字幕";
                hint.style.opacity = "1";
                hint.style.display = "block";
                ch.classList.toggle("none");
                ch2.classList.toggle("none");
                close2.classList.toggle("none");
                close.classList.toggle("none");
                noWord.classList.toggle("none");
                ch_blk.classList.toggle("none");
                for (let i = 0; i < side_en.length; i++) {
                    side_tw[i].classList.toggle("none");
                    // voiceImg[i].classList.toggle("none");
                    side_li[i].style.borderBottom = "none";
                }
            } else if (!en_ch.classList.contains("none")) {
                app.hint = "字幕模式：英文";
                hint.style.opacity = "1";
                hint.style.display = "block";
                en_ch.classList.toggle("none");
                en_ch2.classList.toggle("none");
                en.classList.toggle("none");
                en2.classList.toggle("none");
                // en_blk.classList.toggle("none");
                ch_blk.classList.toggle("none");
                for (let i = 0; i < side_en.length; i++) {
                    side_tw[i].classList.toggle("none");
                }
            } else if (!close.classList.contains("none")) {
                app.hint = "字幕模式：英文及中文";
                hint.style.opacity = "1";
                hint.style.display = "block";
                en_ch.classList.toggle("none");
                en_ch2.classList.toggle("none");
                close.classList.toggle("none");
                close2.classList.toggle("none");
                ch_blk.classList.toggle("none");
                en_blk.classList.toggle("none");
                noWord.classList.toggle("none");
                for (let i = 0; i < side_en.length; i++) {
                    side_tw[i].classList.toggle("none");
                    side_en[i].classList.toggle("none");
                    // voiceImg[i].classList.toggle("none");
                    side_li[i].style.borderBottom = "1px solid #525252";
                    side_tw[i].style.fontSize = "14px";
                }
            }
            timeoutHandle();
            timeoutHandle2();
        },
        // ==========================================
        // === 播放模式按鍵切換 ===
        // ==========================================
        modeChange() {
            const hint = document.querySelector(".hint");
            function timeoutHandle() {
                setTimeout(() => {
                    hint.style.opacity = "0";
                }, 1500);
            }
            function timeoutHandle2() {
                setTimeout(() => {
                    hint.style.display = "none";
                }, 2000);
            }
            clearTimeout(timeoutHandle);
            clearTimeout(timeoutHandle2);
            hint.style.opacity = "0";
            hint.style.display = "none";
            const random = document.querySelectorAll(".cut04")[1];
            const cycle = document.querySelectorAll(".cut01")[1];
            const single = document.querySelectorAll(".cut02")[1];
            const per = document.querySelectorAll(".cut03")[1];
            // const on = document.querySelectorAll(".cut01")[2];
            // console.log(on);
            // const close1 = document.querySelectorAll(".cut02")[2];
            // const close2 = document.querySelectorAll(".cut03")[2];
            const play_bar = document.querySelector(".play_bar");
            if (!cycle.classList.contains("none")) {
                app.hint = "單曲播放";
                hint.style.opacity = "1";
                hint.style.display = "block";
                cycle.classList.toggle("none");
                single.classList.toggle("none");
                this.mode = "正常";
                this.modetext = "單曲";
                this.randomMode = false;
            } else if (!single.classList.contains("none")) {
                app.hint = "隨機播放";
                hint.style.opacity = "1";
                hint.style.display = "block";
                single.classList.toggle("none");
                // per.classList.toggle("none");
                random.classList.toggle("none");
                this.mode = "循環";
                this.modetext = "隨機";
                this.randomMode = true;
            } else if (!random.classList.contains("none")) {
                app.hint = "全部播放";
                hint.style.opacity = "1";
                hint.style.display = "block";
                random.classList.toggle("none");
                cycle.classList.toggle("none");
                this.mode = "循環";
                this.modetext = "循環";
                this.randomMode = false;
            }
            timeoutHandle();
            timeoutHandle2();
        },
        // ==========================================
        // === 單句模式按鍵切換 ===
        // ==========================================
        singleMode() {
            const hint = document.querySelector(".hint");
            function timeoutHandle() {
                setTimeout(() => {
                    hint.style.opacity = "0";
                }, 1500);
            }
            function timeoutHandle2() {
                setTimeout(() => {
                    hint.style.display = "none";
                }, 2000);
            }
            clearTimeout(timeoutHandle);
            clearTimeout(timeoutHandle2);
            hint.style.opacity = "0";
            hint.style.display = "none";
            if (this.mode == "單句") {
                this.mode = "正常";
                this.single = false;
                app.hint = "單句模式關閉";
                hint.style.opacity = "1";
                hint.style.display = "block";
            } else {
                this.mode = "單句";
                this.single = true;
                app.hint = "單句模式開啟";
                hint.style.opacity = "1";
                hint.style.display = "block";
            }
            timeoutHandle();
            timeoutHandle2();
        },
        // ==========================================
        // === 手機板tab頁面切換 ===
        // ==========================================
        tabChange() {
            let timeoutHandle;
            let timeoutHandle2;
            function hintTimeout() {
                timeoutHandle = setTimeout(() => {
                    hint.style.opacity = "0";
                }, 1500);
                timeoutHandle2 = setTimeout(() => {
                    hint.style.display = "none";
                }, 1500);
            }
            const hint = document.querySelector(".hint");
            if (app.nowtab == 0) {
                app.nowtab = 1;
                this.audioList();
                app.hint = "配音列表";
                clearTimeout(hintTimeout);
                hint.style.opacity = "1";
                hint.style.display = "block";
                hintTimeout();
            } else {
                app.nowtab = 0;
                app.hint = "配音列表關閉";
                clearTimeout(hintTimeout);
                hint.style.opacity = "1";
                hint.style.display = "block";
                hintTimeout();
            }
        },
        // ==========================================
        // === 隨機開關 ===
        // ==========================================
        randomChange() {
            const on = document.querySelectorAll(".cut01")[2];
            const close = document.querySelectorAll(".cut02")[2];
            if (!on.classList.contains("none")) {
                on.classList.toggle("none");
                close.classList.toggle("none");
                this.randomMode = false;
            } else if (!close.classList.contains("none")) {
                close.classList.toggle("none");
                on.classList.toggle("none");
                this.randomMode = true;
            }
        },
        // ==========================================
        // === 點擊側欄字幕跳轉影片片段 ===
        // ==========================================
        findPara(index) {
            const sentence_start = this.subtitle[index].starttime;
            const min = Number(sentence_start.slice(3, 5)) * 60;
            const sec = Number(sentence_start.slice(6, 11).replace(",", "."));
            const time = min + sec;
            for (let i = 0; i < this.subtitle.length; i++) {
                document
                    .getElementById(`subtitle${i}`)
                    .classList.remove("subtitle_checked");
                document
                    .getElementById(`subtitle${i}`)
                    .classList.remove("role_A_checked");
                document
                    .getElementById(`subtitle${i}`)
                    .classList.remove("role_B_checked");
            }
            player.seekTo(time + 0.1);
            document
                .getElementById(`subtitle${index}`)
                .classList.add("subtitle_checked");

            if (
                document
                    .getElementById(`subtitle${index}`)
                    .classList.contains("role_A")
            ) {
                document
                    .getElementById(`subtitle${index}`)
                    .classList.add("role_A_checked");
                console.log("A");
            } else if (
                document
                    .getElementById(`subtitle${index}`)
                    .classList.contains("role_B")
            ) {
                document
                    .getElementById(`subtitle${index}`)
                    .classList.add("role_B_checked");
            }

            document.querySelector(
                ".subtitle_checked .side_tw"
            ).style.fontWeight = "500";
            this.en_content = this.subtitle[`${index}`]["en_content"];
            this.ch_content = this.subtitle[`${index}`]["ch_content"];
        },
        // ==========================================
        // === 側欄字典功能 ===
        // ==========================================
        //搜尋單字
        fnSearchWord(target, e) {
            let vm = this;
            vm.DrWord = target;
            const str = target
                .replace(".", "")
                .replace("?", "")
                .replace("!", "")
                .replace(";", "")
                .replace("’", "'")
                .replace(")", "")
                .replace("(", "")
                .replace('"', "")
                .replace("--", "")
                .replace(",", "");
            $(".Dr_title .word h3").html(str);
            console.log(str);
            const md5str = md5(`${str}|Funday1688`);

            axios
                .get(
                    `https://funday.asia/api/dr.eye.asp?keyword=${str}&Fundaykey=${md5str}`
                )
                .then((res) => {
                    if (JSON.stringify(res.data) === "{}") {
                        vm.keyWordResult = 0;
                    } else {
                        vm.keyWordResult = res.data;
                    }
                    let keys = Object.keys(vm.keyWordResult);
                    let re = /@/gi;
                    let re2 = /,/gi;
                    // console.log(res.data.length);

                    for (var i = 0; i < keys.length; i++) {
                        let fixWord = [];
                        for (
                            var j = 0;
                            j < vm.keyWordResult[keys[i]].text.length;
                            j++
                        ) {
                            fixWord.push(
                                vm.keyWordResult[keys[i]].text[j]
                                    .toString()
                                    .replace(re, "")
                                    .replace(re2, " ")
                            );
                        }
                        vm.keyWordResult[keys[i]].text = fixWord;
                    }

                    if (window.innerWidth > 600) {
                        // $(".DrWord").css({ right: 25, top: evt.pageY + 10 });
                        document.querySelector(".DrWord").style.right = "25px";
                        document.querySelector(".DrWord").style.top = `${
                            e.pageY + 10
                        }px`;
                    }
                    this.DrWordModal = true;
                })
                .catch((error) => console.log(error));

            //查詢是否有收錄過該字詞
            this.getDrWordModal();
        },
        //查詢已收錄字典
        getDrWordModal(e) {
            //api/Articla/CheckWords
            if (this.cid !== null) {
                axios
                    .get(
                        `https://funday.asia/NewMylessonmobile/api/vocabulary?customer_id=${this.cid}&member_id=${this.mid}&Enkeyword=${this.DrWord}&Chkeyword=`
                    )
                    .then((res) => {
                        // console.log(res.data.En_word);
                        if (res.data.En_word == "") {
                            // console.log("n");
                            $(".collect .icon .fas.fa-heart").hide();
                            $(".collect .icon .far.fa-heart").show();
                        } else {
                            // console.log("y");
                            $(".collect .icon .fas.fa-heart").show();
                            $(".collect .icon .far.fa-heart").hide();
                        }
                    })
                    .catch((error) => console.log(error));
            }
        },
        //會員單字收錄
        fnWordsCollect(e) {
            //api/Article/WordsCollect
            if (!this.mid) {
                // alert("請先登入");
                document.getElementById("myModal09").classList.remove("none");
                return;
            }
            axios
                .get(
                    `https://funday.asia/NewMylessonmobile/C/api/vocabulary/join?customer_id=${this.cid}&member_id=${this.mid}&Enkeyword=${this.DrWord}&Chkeyword=`
                )
                .then((res) => {
                    // alert(res.data.StateMessage);
                    $(".collect .icon .fas.fa-heart").show();
                    $(".collect .icon .far.fa-heart").hide();
                })
                .catch((error) => console.log(error));
        },
        //刪除單字
        deleteWord($event) {
            axios
                .get(
                    `https://funday.asia/NewMylessonmobile/D/api/vocabulary/join?customer_id=${this.cid}&member_id=${this.mid}&Enkeyword=${this.DrWord}&Chkeyword=`
                )
                .then((res) => {
                    // alert(res.data.ReturnMessage);
                    $(".collect .icon .fas.fa-heart").hide();
                    $(".collect .icon .far.fa-heart").show();
                })
                .catch((error) => console.log(error));
        },
        fnCloseDrWordModal() {
            $(".DrWordModal").removeClass("active");
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
                        this.bookmark = 1;
                        // console.log(res);
                    }

                    if (res.data.State == 2) {
                        //刪除成功
                        e.target.classList.remove("favorites");
                        this.bookmark = 0;
                    }
                })
                .catch((error) => console.log(error));
        },
        // ==========================================
        // === 配音列表播放 ===
        // ==========================================
        playAudio(role, e, mid) {
            if (Number(sessionStorage.getItem("free")) <= 1) {
                this.recordIndex = 0;
                this.mode = "配音";

                if (!e.target.classList.contains("click")) {
                    e.target.classList.add("click");
                    if (role == "A") {
                        this.recBlobLength = this.roleAindex.length;
                        this.role = "A";
                        this.audioMid = mid;
                    } else {
                        this.recBlobLength = this.roleBindex.length;
                        this.role = "B";
                        this.audioMid = mid;
                    }
                    document
                        .querySelector(`.timer${mid}${role}`)
                        .classList.remove("none");
                    document
                        .querySelector(`.clock${mid}${role}`)
                        .classList.add("none");
                    player.seekTo(this.audioStart);
                    player.playVideo();

                    // === 秒數倒數 ===
                    const time = this.audioEnd - this.audioStart;
                    let timer = Math.round(time * 10) / 10;
                    this.goTimer(true, timer, mid, role);
                } else {
                    document
                        .querySelector(`.timer${mid}${role}`)
                        .classList.add("none");
                    document
                        .querySelector(`.clock${mid}${role}`)
                        .classList.remove("none");
                    e.target.classList.remove("click");
                    this.nowplayingAudio.pause();
                    player.pauseVideo();
                    this.goTimer(false);
                    return false;
                }
            } else {
                document.getElementById("myModal01").classList.remove("none");
            }
        },
        //配音時間倒數
        goTimer(status, timer, mid, role) {
            // var sid;
            if (status) {
                this.sid = setInterval(() => {
                    if (timer > 0) {
                        timer -= 0.1;
                        timer = Math.round(timer * 10) / 10;
                    } else {
                        clearInterval(this.sid);
                        document
                            .querySelector(`.timer${mid}${role}`)
                            .classList.add("none");

                        document
                            .querySelector(`.clock${mid}${role}`)
                            .classList.remove("none");
                        for (
                            let i = 0;
                            i < document.querySelectorAll(".audioBtn").length;
                            i++
                        ) {
                            document
                                .querySelectorAll(".audioBtn")
                                [i].classList.remove("click");
                        }
                    }
                    app.timeStr(timer, true, "分", "秒");
                }, 100);
            } else {
                clearInterval(this.sid);
                this.timer = "";
            }
        },
        // === 秒數計算 ===
        timeStr(time, decimal, f1, f2) {
            let m = Math.floor(time / 60);
            let s = m > 0 ? Math.floor(time - m * 60) : Math.floor(time);
            if (String(s).length < 2 && f2 === "") s = "00" + s; // f2 === 0 為「只在時間軸上補零，錄音倒數不補」意思
            let ss = time - m * 60 - s;
            ss = Math.round(ss * 10) / 10;
            ss = String(ss).substr(1) || ".0";
            //
            // console.log(s);
            let str = "";
            if (m > 0) str += m + f1;
            if (m <= 0 && f2 === "") str += "00:"; // f2 === 0 為「只在時間軸上補零，錄音倒數不補」意思
            if (s < 10) {
                str += "0" + s;
            } else {
                str += s;
            }
            if (decimal) str += ss;
            // str += f2;
            this.timer = str;
        },
        // ==========================================
        // === 按讚 ===
        // ==========================================
        like(pid, e) {
            if (this.mid == null) {
                document.getElementById("myModal01").classList.remove("none");
            } else {
                axios
                    .get(
                        `https://funday.asia/api/ProgramWeb/Behavior.asp?member_id=${this.mid}&ref_id=${this.videoId}&action=promote&p_member_id=${pid}`
                    )
                    .then(function (response) {
                        if (response.data.State == 1) {
                            e.target.classList.add("click");
                            let num = e.target.nextSibling.innerText;
                            num = parseInt(num) + 1;
                            e.target.nextSibling.innerText = num;
                        } else {
                            e.target.classList.remove("click");
                            let num = e.target.nextSibling.innerText;
                            if (parseInt(num) == 0) {
                                return false;
                            } else {
                                num = parseInt(num) - 1;
                            }
                            e.target.nextSibling.innerText = num;
                        }
                    });
            }
        },
        // ==========================================
        // === 分享 ===
        // ==========================================
        share() {
            document.querySelector(".share_blk").classList.toggle("none");
        },
        shareClose() {
            document.querySelector(".share_blk").classList.toggle("none");
        },
        copyURL() {
            var url = document.getElementById("copyUrl");
            url.select();
            document.execCommand("copy");
        },

        // ==========================================
        // === 配音挑戰區塊 ===
        // ==========================================

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
        // === 前往配音挑戰(登入判斷) ===
        goChallenge() {
            if (this.cid == null) {
                document.getElementById("myModal01").classList.remove("none");
            } else {
                this.pauseBlk = false;
                player.pauseVideo();
                document.querySelector(".begin_mask").classList.remove("none");
                document
                    .querySelector(".start_challenge")
                    .classList.remove("none");
                document
                    .querySelector(".check_cate_leave")
                    .classList.remove("none");
                document.querySelector(".check_cate").classList.add("none");
                if (window.innerWidth < 991) {
                    document
                        .querySelector(".leave_challenge")
                        .classList.remove("none");
                    document
                        .querySelector(".tool_bar_mobile")
                        .classList.add("none");
                    document
                        .getElementById("video_list2")
                        .classList.add("none");
                    document
                        .getElementById("video_frame_bottom")
                        .classList.add("none");
                    document.getElementById("footer").classList.add("none");
                }
            }
        },
        leaveChallenge() {
            this.pauseBlk = true;
            document.querySelector(".begin_mask").classList.add("none");
            document.querySelector(".start_challenge").classList.add("none");
            document.querySelector(".check_cate_leave").classList.add("none");
            document.querySelector(".check_cate").classList.remove("none");
            if (window.innerWidth < 991) {
                document
                    .querySelector(".leave_challenge")
                    .classList.add("none");
                document
                    .querySelector(".tool_bar_mobile")
                    .classList.remove("none");
                document.getElementById("video_list2").classList.remove("none");
                document
                    .getElementById("video_frame_bottom")
                    .classList.remove("none");
                document.getElementById("footer").classList.remove("none");
            }
        },
        // === 開始示範 ===
        startSample() {
            if (this.cid == null) {
                document.getElementById("myModal01").classList.remove("none");
            } else {
                app.mode = "配音模式";
                app.plastate = 0;
                document.querySelector(".subtitle").classList.add("sub_bg");
                document.querySelector(".time_bar").classList.add("none");
                document.querySelector(".video_bar").style.border = "none";
                document
                    .querySelector(".subtitle_mobile")
                    .classList.remove("none");
                document
                    .querySelector(".function_area")
                    .classList.remove("none");
                document
                    .querySelector(".tool_bar_desktop")
                    .classList.add("none");
                document
                    .querySelector(".leave_challenge")
                    .classList.add("none");
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
        // === 選擇腳色 ===
        chooseRole(role) {
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
        // === 略過示範 ===
        passSample() {
            player.pauseVideo();
            document.querySelector(".lds-rippleA").classList.add("none");
            document.querySelector(".lds-rippleB").classList.add("none");
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
    },
    watch: {
        // ==========================================
        // === 字幕同步 ===
        // ==========================================
        currentTimeMin: function (value) {
            // console.log(this.startTimeArr.indexOf(value));
            if (this.startTimeArr.indexOf(value) !== -1) {
                const subtitleIndex = this.startTimeArr.indexOf(value);
                this.sIndex = subtitleIndex;
                // === 播放區塊字幕顯示 ===
                this.en_content =
                    this.subtitle[`${subtitleIndex}`]["en_content"];
                this.ch_content =
                    this.subtitle[`${subtitleIndex}`]["ch_content"];
                // === 側邊欄字幕active ===
                if (app.nowtab == 0) {
                    if (subtitleIndex == 0) {
                        document
                            .getElementById(`subtitle${subtitleIndex}`)
                            .classList.add("subtitle_checked");
                    } else {
                        for (let i = 0; i < this.subtitle.length; i++) {
                            document
                                .getElementById(`subtitle${i}`)
                                .classList.remove("subtitle_checked");
                            document
                                .getElementById(`subtitle${i}`)
                                .classList.remove("role_A_checked");
                            document
                                .getElementById(`subtitle${i}`)
                                .classList.remove("role_B_checked");
                        }

                        document
                            .getElementById(`subtitle${subtitleIndex}`)
                            .classList.add("subtitle_checked");

                        if (
                            document
                                .getElementById(`subtitle${subtitleIndex}`)
                                .classList.contains("role_A")
                        ) {
                            document
                                .getElementById(`subtitle${subtitleIndex}`)
                                .classList.add("role_A_checked");
                            console.log("A");
                        } else if (
                            document
                                .getElementById(`subtitle${subtitleIndex}`)
                                .classList.contains("role_B")
                        ) {
                            document
                                .getElementById(`subtitle${subtitleIndex}`)
                                .classList.add("role_B_checked");
                        }
                        document.querySelector(
                            ".subtitle_checked .side_tw"
                        ).style.fontWeight = "500";
                        // ==== 字幕條滾動 ===
                        const container =
                            document.querySelector(".tab_container");
                        //字幕視窗高
                        const listWindowHeight =
                            document.querySelector(
                                ".tab_container"
                            ).offsetHeight;
                        //字幕視窗上方與瀏覽器距離
                        const listWindowTop =
                            document.querySelector(".tab_container").offsetTop;
                        //字幕區塊高
                        const sutitleBlkHeight =
                            document.querySelector(
                                ".subtitle_checked"
                            ).offsetHeight;
                        //字幕區塊上方與瀏覽器距離
                        const sutitleBlkTop =
                            document.querySelector(
                                ".subtitle_checked"
                            ).offsetTop;
                        const listWindow = listWindowHeight - listWindowTop;
                        // 字幕條滾動距離
                        if (this.mode !== "單句") {
                            if (window.innerWidth < 991) {
                                //單句模式不滾動
                                container.scrollTo({
                                    top: sutitleBlkTop,
                                    behavior: "smooth",
                                });
                            } else {
                                container.scrollTo({
                                    top: sutitleBlkTop - sutitleBlkHeight,
                                    behavior: "smooth",
                                });
                            }

                            // container.scrollBy({
                            //     top: sutitleBlkTop - 30,
                            //     behavior: "smooth",
                            // });
                        }
                    }
                }
            }
        },
    },
});
