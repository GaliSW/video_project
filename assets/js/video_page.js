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
        mode: 0, //播放模式 0循環,1單曲,2隨機
        randomMode: true, //隨機模式
        sIndex: "0", //字幕Index
        timeupdate: false, //時間更新才有開啟
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
        NoWord: false,
        clicks: false,
        RecordingList: {},
        audioStart: "", //配音開始時間
        audioEnd: "", //配音結束時間
        audioLength: "", //錄音檔長度
        roleAindex: [],
        roleBindex: [],
        audioSrc: [],
        recBlobLength: "",
        recBlob: [], //單一錄音檔案
        role: "", //選取配音的角色
        recordIndex: 0, //配音段落序號
        audioMid: "", //配音會員Id
        nowplayingAudio: "", //正在播放的配音檔案
        Arecord_start_time: [],
        Arecord_end_time: [],
        Brecord_start_time: [],
        Brecord_end_time: [],
        sentence_end: "", //片段開始時間
        sentence_start: "", //片段結束時間
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
        subMode: 0, //0中英,1英文,2中文,3無字幕
        audioStatus: false, //是否播放配音中
        hasChallenge: false, //是否有配音挑戰
        challenge: false, //是否開始配音挑戰(示範前)
        onSample: false, //是否正在示範
        onChallenge: false, //是否正在配音挑戰(示範後)
        endChallenge: false, //被音是否完整結束
        voice: "", //正在播放哪個角色
        firstDialog: "", //角色配音第一句Index
        last_record_end: "", // 角色配音最後一句Index
        isPass: false, //是否略過示範
        leavingCheck: false, //離開確認視窗
        wave: -1, //開啟的聲波編號
        recordMode: 1, //播放配音的模式 0:全部播放 1:原音播放 2:錄音播放
        recordSingle: false, //播放錄音的單句開關
        progress: "0%", //上傳進度
        isUpload: false, //是否上傳成功
        singerId: "", //分享歌手資訊
        lastAudioRole: "",
        lastAudioIndex: "",
        lastAudioMid: "",
        singerImg: "", //
        singerName: "", //
        singerSex: "", //
        singerFile: "",
        singerMid: "", //配音歌手Mid
        singerCid: "", //配音歌手Cid
        singerMode: false, //配音歌手頁面
        ads: true, //廣告預設開啟
        baseForm: {}, //kk音標
        vdLoading: false, //影片是否讀取
        confirm: false,
    },
    created() {
        var player;
        this.createPlayer();
        this.audioList();
        if (sessionStorage.getItem("cycle")) {
            this.mode = sessionStorage.getItem("cycle");
        }
        if (sessionStorage.getItem("mindx") !== null) {
            this.mid = sessionStorage.getItem("mindx");
        } else {
            setTimeout(() => {
                document.getElementById("myModal01").classList.remove("none");
            }, 15000);
        }
        if (location.hash.indexOf("mid") > -1) {
            console.log(location.hash);
            this.singerMode = true;
            let str = location.hash.replace("#", "").split("=")[1];
            this.singerCid = str.split("-")[0];
            this.singerMid = str.split("-")[1];
            const vid = this.videoId.replace("#mid");
            axios
                .get(
                    `https://musicapi.funday.asia/api/Share/GetMember?customer_id=${this.singerCid}&member_id=${this.singerMid}`
                )
                .then((res) => {
                    console.log(res);
                    this.singerImg = res.data.content.imgUrl;
                    this.singerSex = res.data.content.sex;
                    this.singerName = res.data.content.nickName;
                    this.singerFile = `https://funday.asia/FundayKtv/files/${this.singerCid}-${this.singerMid}-${this.videoId}.mp3`;
                });
            this.hint = "歌手列表:讀取中";
            this.nowTab = 1;
            setTimeout(() => {
                this.tabChange(0);
            }, 2000);
        }
    },
    methods: {
        // ==========================================
        // == 主內容資料 ==
        // ==========================================
        createPlayer() {
            const url = window.location.search;
            this.URL = window.location.href;
            // console.log(url);
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
                    // console.log(response.data);

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
                            this.cate = "News";
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
                    const roleIndex = [];
                    for (let i = 0; i < startTimeLength; i++) {
                        let startTime = response.data.data[i].starttime
                            .slice(3, 11)
                            .replace(",", ".");
                        let time =
                            Number(startTime.slice(0, 2) * 60) +
                            Number(startTime.slice(3, 5)) +
                            startTime.slice(5, 7);
                        // console.log(
                        //     Number(startTime.slice(0, 2) * 60) +
                        //         Number(startTime.slice(3, 5)) +
                        //         startTime.slice(5, 8)
                        // );

                        startTimeArr.push(time);
                        if (response.data.data[i].role !== "") {
                            roleIndex.push(i);
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
                    //第一句配音編號
                    this.firstDialog = roleIndex[0];

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
                        this.hasChallenge = true;
                        document
                            .querySelector(".tabs")
                            .classList.remove("none");
                        document
                            .querySelector(".audioList_li")
                            .classList.remove("none");
                        document.querySelector(".audioList_li").style.width =
                            "50%";
                        document.querySelector(".cc_li").style.width = "50%";

                        //配音最後一句結束時間
                        this.last_record_end =
                            Number(
                                this.record_end_time[
                                    this.record_end_time.length - 1
                                ].slice(3, 5) * 60
                            ) +
                            Number(
                                this.record_end_time[
                                    this.record_end_time.length - 1
                                ]
                                    .slice(6, 10)
                                    .replace(",", ".")
                            );

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
                        let sec = (sentence_end - sentence_start + 4).toFixed(
                            0
                        );

                        this.audioLength = `00:${sec}`; //配音長度
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
                        // console.log(allSec);
                        if (sec == "0") {
                            sec = "00";
                        }
                        // console.log(sec);
                        // console.log(sec);s
                        app.allTime = `${allMin}:${sec}`; //影片總長
                        setInterval(app.fnTimeChecking, 1); //timeUpdate
                        document
                            .querySelector(".loading_blk")
                            .classList.add("none");
                    }
                    function onPlayerStateChange(e) {
                        let btn = document.getElementById("play_btn");
                        switch (e.data) {
                            case 0: //=== 結束 ===
                                app.playstate = 0;
                                if (app.mode == 1) {
                                    player.playVideo();
                                    app.playstate = 1;
                                } else if (app.mode == 0) {
                                    location.href = `./video.html?id=${app.next}&cate=${app.cate}`;
                                } else if (app.mode == 2) {
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
                                    // if (window.innerWidth < 991) {
                                    //     document
                                    //         .querySelector(".time_bar")
                                    //         .classList.add("none");
                                    // }

                                    app.playstate = 1;
                                    player.unMute().playVideo();
                                    app.vdLoading = true;
                                    app.timeupdate = true;

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
                                app.timeupdate = false;
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
                    // console.log(response);
                    this.cateList = response.data[`${this.cate}`];
                });
            //影片點擊會員登入判斷
        },
        // ==========================================
        // == 配音列表資料 ==
        // ==========================================
        audioList() {
            // app.nowtab = 1;
            let mid = 0;
            if (sessionStorage.getItem("mindx") !== null) {
                mid = sessionStorage.getItem("mindx");
            }
            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/RecordingListNew.asp?indx=${this.videoId}&member_id=${mid}`
                )
                .then((response) => {
                    // console.log(response);
                    let audioObject = []; //物件重組

                    let newObjectA = "";
                    let newObjectB = "";
                    for (
                        let i = 0;
                        i < response.data["Recording List"].length;
                        i++
                    ) {
                        const array = response.data["Recording List"][i];
                        let aAudio = false;
                        let bAudio = false;
                        if (array.files !== undefined) {
                            const files = array.files[0].split(",");
                            for (let j = 0; j < files.length; j++) {
                                const singleFile = files[j].substr(-6, 1);
                                console.log(singleFile);
                                // console.log(this.roleAindex[0]);
                                if (singleFile == "A") {
                                    aAudio = true;
                                } else if (singleFile == "B") {
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
            if (Number(sessionStorage.getItem("free")) > 1) {
                player.stopVideo();
                document.getElementById("myModal01").classList.remove("none");
            } else {
                if (app.playstate == 0 || app.playstate == -1) {
                    if (app.playstate == -1 && app.cate == "News") {
                        document
                            .getElementById("subtitle0")
                            .classList.add("subtitle_checked");
                    }

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
                                app.clicks = true;
                            });
                    }
                } else {
                    player.pauseVideo();
                    if (this.audioStatus) {
                        app.nowplayingAudio.pause();
                        app.nowplayingAudio.currentTime = 0;
                        document
                            .querySelector(
                                `.timer${app.lastAudioMid}${app.lastAudioRole}`
                            )
                            .classList.add("none");
                        document
                            .querySelector(
                                `.clock${app.lastAudioMid}${app.lastAudioRole}`
                            )
                            .classList.remove("none");
                        document
                            .getElementById(`audioPlay${app.lastAudioIndex}`)
                            .classList.remove("click");
                        app.goTimer(false);
                    }
                }
            }
        },
        vdPrev() {
            if (this.mode == 0) {
                location.href = `./video.html?id=${this.prev}&cate=${this.cate}`;
            } else if (this.mode == 2) {
                location.href = `./video.html?id=${this.random}&cate=${this.cate}`;
            } else {
                player.seekTo(0);
                player.playVideo();
            }
        },
        vdNext() {
            if (this.mode == 0) {
                location.href = `./video.html?id=${this.next}&cate=${this.cate}`;
            } else if (this.mode == 2) {
                location.href = `./video.html?id=${this.random}&cate=${this.cate}`;
            } else {
                player.seekTo(0);
                player.playVideo();
            }
        },
        // ==========================================
        // === 取得影片時間軸 && 字幕匹配 && 單句重播 && 播放配音模式===
        // ==========================================
        fnTimeChecking() {
            if (this.timeupdate == false) {
                return false;
            }
            // console.log("run");
            const time = player.getCurrentTime();
            const allTime = player.getDuration();
            // ==========================================
            // === 單句重播模式&播放配音模式&錄音模式 ===
            // ==========================================
            if (this.single) {
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
                            .slice(6, 10)
                            .replace(",", ".")
                    );
                const now_time = Number(player.getCurrentTime().toFixed(1));
                // console.log(sentence_end);
                // console.log(now_time);
                if (now_time === sentence_end) {
                    player.seekTo(sentence_start);
                }
            } else if (this.audioStatus) {
                // console.log("audiostatus");
                this.fnRecordPlayer();
            } else if (this.challenge && !this.onChallenge) {
                const now_time = Number(player.getCurrentTime().toFixed(1));
                if (now_time === app.last_record_end + 1) {
                    player.seekTo(time - 3);
                    player.pauseVideo();
                }
            } else if (this.onChallenge && !this.endChallenge) {
                const now_time = Number(player.getCurrentTime().toFixed(1));
                let start;
                let end;
                if (app.role == "A") {
                    end = app.Arecord_end_time;
                    start = app.Arecord_start_time;
                } else {
                    end = app.Brecord_end_time;
                    start = app.Brecord_start_time;
                }
                if (app.recordIndex < end.length) {
                    const sentence_end =
                        Number(end[`${app.recordIndex}`].slice(3, 5) * 60) +
                        Number(
                            end[`${app.recordIndex}`]
                                .slice(6, 11)
                                .replace(",", ".")
                        );
                    const sentence_start =
                        Number(start[`${app.recordIndex}`].slice(3, 5) * 60) +
                        Number(
                            start[`${app.recordIndex}`]
                                .slice(6, 11)
                                .replace(",", ".")
                        );
                    app.sentence_end = Number(sentence_end.toFixed(1));
                    app.sentence_start = Number(sentence_start.toFixed(1));

                    if (now_time === app.sentence_start) {
                        player.mute();
                    }

                    if (now_time === app.sentence_end) {
                        player.unMute();
                        app.recordIndex++;
                    }
                }

                if (now_time === app.last_record_end + 1) {
                    this.endChallenge = true;
                    let sentence_start = app.record_start_time[0];
                    const min = Number(sentence_start.slice(3, 5)) * 60;
                    const sec = Number(
                        sentence_start.slice(6, 11).replace(",", ".")
                    );
                    const time = min + sec;
                    player.seekTo(time - 4);
                    player.pauseVideo();
                    this.endRecord();
                    app.recordIndex = 0;
                }
            } else if (this.endChallenge) {
                const audio = document.getElementById("myAudio");

                if (this.recordMode == 0) {
                    player.unMute();
                    audio.muted = true;
                } else {
                    this.fnRecordPlayer();
                    audio.muted = false;
                }

                if (this.recordSingle) {
                    const index = this.sIndex;
                    const sentence_end =
                        Number(this.subtitle[index].endtime.slice(3, 5) * 60) +
                        Number(
                            this.subtitle[index].endtime
                                .slice(6, 10)
                                .replace(",", ".")
                        );
                    const sentence_start =
                        Number(
                            this.subtitle[index].starttime.slice(3, 5) * 60
                        ) +
                        Number(
                            this.subtitle[index].starttime
                                .slice(6, 10)
                                .replace(",", ".")
                        );
                    const now_time = Number(player.getCurrentTime().toFixed(1));
                    const first_start =
                        Number(app.record_start_time[0].slice(3, 5) * 60) +
                        Number(
                            app.record_start_time[0]
                                .slice(6, 11)
                                .replace(",", ".")
                        );
                    const audioSeek = sentence_start - first_start + 3;
                    // console.log(sentence_end);
                    // console.log(now_time);
                    if (now_time === sentence_end) {
                        player.seekTo(sentence_start);
                        audio.currentTime = audioSeek;
                        setTimeout(() => {
                            audio.play();
                        }, 500);
                    }
                }

                //結束時回到配音影片開頭

                const now_time = Number(player.getCurrentTime().toFixed(1));
                if (now_time === app.last_record_end + 1) {
                    let sentence_start = app.record_start_time[0];
                    const min = Number(sentence_start.slice(3, 5)) * 60;
                    const sec = Number(
                        sentence_start.slice(6, 11).replace(",", ".")
                    );
                    const time = min + sec;
                    player.seekTo(time - 3);
                    player.pauseVideo();
                    app.recordIndex = 0;
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
                let minsec = (time % 60).toFixed(2);
                // console.log(time.toFixed(2));
                app.currentTimeMin = time.toFixed(1);
                if (min < 10 && minsec < 10) {
                    app.currentTime = `0${min}:0${sec}`;
                    // app.currentTimeMin = `0${min}:0${minsec}`;
                } else if (min < 10 && minsec >= 10) {
                    app.currentTime = `0${min}:${sec}`;
                    // app.currentTimeMin = `0${min}:${minsec}`;
                } else if (min >= 10 && minsec < 10) {
                    app.currentTime = `${min}:0${sec}`;
                    // app.currentTimeMin = `${min}:0${minsec}`;
                } else {
                    app.currentTime = `${min}:${sec}`;
                    // app.currentTimeMin = `${min}:${minsec}`;
                }
            }
        },
        // 原音與錄音交錯模式
        fnRecordPlayer() {
            // console.log("1");
            const now_time = Number(player.getCurrentTime().toFixed(1));
            let start;
            let end;
            if (app.role == "A") {
                end = app.Arecord_end_time;
                start = app.Arecord_start_time;
            } else {
                end = app.Brecord_end_time;
                start = app.Brecord_start_time;
            }
            if (app.recordIndex < end.length) {
                const sentence_end =
                    Number(end[`${app.recordIndex}`].slice(3, 5) * 60) +
                    Number(
                        end[`${app.recordIndex}`].slice(6, 11).replace(",", ".")
                    );
                const sentence_start =
                    Number(start[`${app.recordIndex}`].slice(3, 5) * 60) +
                    Number(
                        start[`${app.recordIndex}`]
                            .slice(6, 11)
                            .replace(",", ".")
                    );
                app.sentence_end = Number(sentence_end.toFixed(1));
                app.sentence_start = Number(sentence_start.toFixed(1));

                if (now_time === app.sentence_start) {
                    player.mute();
                    console.log("mute");
                }

                if (now_time === app.sentence_end) {
                    player.unMute();
                    app.recordIndex++;
                }
            }

            if (now_time === app.last_record_end + 1) {
                // this.endChallenge = true;
                let sentence_start = app.record_start_time[0];
                const min = Number(sentence_start.slice(3, 5)) * 60;
                const sec = Number(
                    sentence_start.slice(6, 11).replace(",", ".")
                );
                const time = min + sec;
                player.seekTo(time - 3);
                player.pauseVideo();
                app.recordIndex = 0;
                this.audioStatus = false;
            }
        },
        // ==========================================
        // === 字幕切換 ===
        // ==========================================
        subChange() {
            if (this.subMode < 3) {
                this.subMode++;
                switch (this.subMode) {
                    case 1:
                        app.hint = "字幕模式:英文";
                        break;
                    case 2:
                        app.hint = "字幕模式:中文";
                        break;
                    case 3:
                        app.hint = "字幕模式:無字幕";
                        break;
                }
            } else {
                this.subMode = 0;
                app.hint = "字幕模式:英文及中文";
            }
        },
        // ==========================================
        // === 播放模式按鍵切換 ===
        // ==========================================
        modeChange() {
            if (this.mode < 2) {
                this.mode++;
                switch (this.mode) {
                    case 1:
                        app.hint = "播放模式:單曲";
                        sessionStorage.setItem("cycle", 1);
                        break;
                    case 2:
                        app.hint = "播放模式:隨機";
                        sessionStorage.setItem("cycle", 2);
                        break;
                }
            } else {
                this.mode = 0;
                app.hint = "播放模式:循環";
                sessionStorage.setItem("cycle", 0);
            }
        },
        // ==========================================
        // === 單句模式按鍵切換 ===
        // ==========================================
        singleMode() {
            this.single = !this.single;
            switch (this.single) {
                case true:
                    app.hint = "單句模式:開啟";
                    break;
                case false:
                    app.hint = "單句模式:關閉";
                    break;
            }
        },
        // ==========================================
        // === 電腦板tab頁面切換 ===
        // ==========================================
        tabChangePC() {
            if (this.challenge) {
                app.hint = "正在配音挑戰";
                setTimeout(() => {
                    app.hint = "";
                }, 2000);
                return false;
            }
            if (app.nowtab == 0) {
                app.nowtab = 1;
                this.audioList();
                app.hint = "配音列表:開啟";
            } else {
                app.nowtab = 0;
                app.hint = "配音列表:關閉";
                if (document.querySelector(".subtitle_checked")) {
                    setTimeout(() => {
                        // ==== 字幕條滾動 ===
                        const container =
                            document.querySelector(".tab_container");
                        //字幕區塊上方與瀏覽器距離
                        const sutitleBlkTop =
                            document.querySelector(
                                ".subtitle_checked"
                            ).offsetTop;
                        // 字幕條滾動距離
                        container.scrollTo({
                            top: sutitleBlkTop,
                            behavior: "smooth",
                        });
                    }, 300);
                }
            }
        },
        // ==========================================
        // === 手機板tab頁面切換 ===
        // ==========================================
        tabChange() {
            if (app.nowtab == 0) {
                app.nowtab = 1;
                if (app.playstate == -1) {
                    player.playVideo();
                    setTimeout(() => {
                        player.pauseVideo();
                    }, 500);
                }
                this.audioList();
                app.hint = "配音列表:開啟";
            } else {
                app.nowtab = 0;
                app.hint = "配音列表:關閉";
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
            if (this.challenge) return;
            this.sIndex = index;
            console.log(index);
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
            if (this.challenge) return;
            let vm = this;
            vm.baseForm = "";
            vm.keyWordResult = "";
            vm.DrWord = target;
            vm.NoWord = false;
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
                    if (res.data.baseform == undefined) {
                        vm.NoWord = true;
                        return false;
                    }
                    vm.keyWordResult = res.data;
                    vm.baseForm = res.data.baseform.text;
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
        vdFav(e) {
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
                        this.bookmark = 1;
                        // console.log(res);
                    }

                    if (res.data.State == 2) {
                        //刪除成功
                        this.bookmark = 0;
                    }
                })
                .catch((error) => console.log(error));
        },
        // ==========================================
        // === 配音列表播放 ===
        // ==========================================
        playAudio(role, index, mid, e) {
            if (this.challenge) {
                app.hint = "正在配音模式";
                return false;
            }
            this.audioStatus = true;
            if (Number(sessionStorage.getItem("free")) <= 1) {
                this.recordIndex = 0;

                if (
                    this.nowplayingAudio.id !== `${role}${mid}` &&
                    this.nowplayingAudio.id
                ) {
                    this.nowplayingAudio.pause();
                    this.nowplayingAudio.currentTime = 0;
                    document
                        .querySelector(
                            `.timer${this.lastAudioMid}${this.lastAudioRole}`
                        )
                        .classList.add("none");
                    document
                        .querySelector(
                            `.clock${this.lastAudioMid}${this.lastAudioRole}`
                        )
                        .classList.remove("none");
                    document
                        .getElementById(`audioPlay${this.lastAudioIndex}`)
                        .classList.remove("click");
                    this.goTimer(false);
                }

                if (!e.target.classList.contains("click")) {
                    const audio = document.getElementById(`${role}${mid}`);
                    this.nowplayingAudio = audio;
                    this.lastAudioIndex = index;
                    this.lastAudioMid = mid;
                    this.lastAudioRole = role;
                    document
                        .getElementById(`audioPlay${index}`)
                        .classList.add("click");
                    if (role == "A") {
                        // this.recBlobLength = this.roleAindex.length;
                        this.role = "A";
                        this.audioMid = mid;
                    } else {
                        // this.recBlobLength = this.roleBindex.length;
                        this.role = "B";
                        this.audioMid = mid;
                    }

                    document
                        .querySelector(`.timer${mid}${role}`)
                        .classList.remove("none");
                    document
                        .querySelector(`.clock${mid}${role}`)
                        .classList.add("none");
                    player.seekTo(this.audioStart - 4);
                    player.playVideo();
                    setTimeout(() => {
                        audio.play();
                    }, 1000);

                    // === 秒數倒數 ===
                    const time = this.audioEnd - this.audioStart + 4;
                    let timer = Math.round(time * 10) / 10;
                    this.goTimer(true, timer, mid, role);
                } else {
                    document
                        .querySelector(`.timer${mid}${role}`)
                        .classList.add("none");
                    document
                        .querySelector(`.clock${mid}${role}`)
                        .classList.remove("none");
                    document
                        .getElementById(`audioPlay${index}`)
                        .classList.remove("click");
                    this.nowplayingAudio.pause();
                    this.nowplayingAudio.currentTime = 0;
                    player.pauseVideo();
                    this.goTimer(false);
                    return false;
                }
            } else {
                document.getElementById("myModal01").classList.remove("none");
                this.audioStatus = false;
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
            if (m >= 10 && s >= 10) {
                str = `${m}:${s}`;
            } else if (m >= 10 && s < 10) {
                str = `${m}:0${s}`;
            } else if (m < 10 && s >= 10) {
                str = `0${m}:${s}`;
            } else if (m < 10 && s < 10) {
                str = `0${m}:0${s}`;
            }
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
                            let num =
                                e.target.parentNode.childNodes[2].innerText;
                            num = parseInt(num) + 1;

                            e.target.parentNode.childNodes[2].innerText = num;
                        } else {
                            e.target.classList.remove("click");
                            let num = Number(
                                e.target.parentNode.childNodes[2].innerText
                            );
                            if (num == 0) {
                                return false;
                            } else {
                                num = parseInt(num) - 1;
                            }
                            e.target.parentNode.childNodes[2].innerText = num;
                        }
                    });
            }
        },
        // ==========================================
        // === 分享 ===
        // ==========================================
        share(status) {
            let singer;
            if (status == 1) {
                const originalUrl = window.location.href.replace("#", "");
                this.URL = `${originalUrl}#mid=${app.singerId}`;
                singer = `mid=${this.singerId}`;
                //分享配音時的cid - mid (411-213132)
            } else if (status == 0) {
                this.URL = window.location.href.replace("#", "");
                singer = "";
                console.log(this.URL);
            }

            document.querySelector(".share_blk").classList.toggle("none");
            let link = encodeURIComponent(
                `https://tube.funday.asia/video.html?id=${this.videoId}#${singer}`
            );
            // *FB
            //www.facebook.com/sharer.php?u=http://blog.ja-anything.com/&quote=大家跟我一起用Facebook分享吧!
            // this.fburl = `https://www.facebook.com/sharer.php?u=https://music.funday.asia/video.html?videoId=1060`;
            this.fburl = `javascript: void(window.open('http://www.facebook.com/share.php?u='.concat(encodeURIComponent('https://tube.funday.asia/video.html?id=${this.videoId}#${singer}'))));`;
            //*Line
            this.lineurl = `https://social-plugins.line.me/lineit/share?url=${link}`;
            //*twitter
            this.twitterurl = `https://twitter.com/intent/tweet?url=https://tube.funday.asia/video.html?id=${this.videoId}#${singer}`;
            //*email
            this.emailurl = `mailto:?to=&subject=FunTube&body=${link}`;
            //*Whatsapp
            this.whatsurl = `https://api.whatsapp.com/send?text=https://tube.funday.asia/video.html?id=${this.videoId}#${singer}`;
            //*Linkedin
            this.linkedinurl = `https://www.linkedin.com/sharing/share-offsite/?url=${link}`;
            // this.linkedinurl = `https://www.linkedin.com/shareArticle?mini=true&title=test&url=${link}`;
        },
        shareClose() {
            document.querySelector(".share_blk").classList.toggle("none");
        },
        copyURL() {
            this.hint = "已複製";
            setTimeout(() => {
                this.hint = "";
            }, 2000);
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
            this.dialogCancel();

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
                    // console.log(newRec);
                    // console.log(
                    //     Recorder.FrequencyHistogramView({
                    //         elem: ".recwave",
                    //     })
                    // );
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
            const audio = document.getElementById("myAudio");
            // audio.muted = true;
            // audio.play();
            // setTimeout(() => {
            //     audio.pause();
            //     console.log("in");
            // }, 500);
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
            // console.log("end");
            if (!(app.rec && Recorder.IsOpen())) {
                return;
            }
            app.rec.stop(function (blob, duration) {
                console.log("in");
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
                audio.setAttribute("id", "myAudio");
                document.getElementById("audioBox").append(audio);

                //簡單利用URL生成播放地址，注意不用了時需要revokeObjectURL，否則霸占暫存
                audio.src = URL.createObjectURL(app.recBlob[0]);
                console.log(audio.src);
                console.log(document.getElementById("audioBox"));
                // setTimeout(function () {
                //     (window.URL || webkitURL).revokeObjectURL(audio.src);
                // }, 1000);
                app.recClose();
            });
        },
        // === 前往配音挑戰(登入判斷) ===
        goChallenge() {
            if (this.cid == null) {
                document.getElementById("myModal01").classList.remove("none");
                return false;
            } else {
                app.nowtab = 0;
                this.pauseBlk = false;
                this.single = false;
                player.pauseVideo();
                this.en_content = "";
                this.ch_content = "";
                this.voice = "";
                this.isPass = false;
                this.leavingCheck = false;

                //配音字幕加上角色標籤
                const roleA = document.querySelectorAll(".role_A");
                const roleB = document.querySelectorAll(".role_B");
                const li = document.querySelectorAll(".side_li");
                for (let i = 0; i < roleA.length; i++) {
                    roleA[i].classList.add("role_A_label");
                }
                for (let j = 0; j < roleB.length; j++) {
                    roleB[j].classList.add("role_B_label");
                }
                for (let k = 0; k < li.length; k++) {
                    li[k].classList.add("role_padding");
                }
                //滾動到配音字幕區間
                const container = document.querySelector(".tab_container");
                //字幕視窗高
                const listWindowHeight =
                    document.querySelector(".tab_container").offsetHeight;
                //字幕視窗上方與瀏覽器距離
                const listWindowTop =
                    document.querySelector(".tab_container").offsetTop;

                //字幕區塊上方與瀏覽器距離
                const sutitleBlkTop = document.querySelector(
                    `#subtitle${this.firstDialog}`
                ).offsetTop;
                const listWindow = listWindowHeight - listWindowTop;
                // 字幕條滾動距離

                if (window.innerWidth < 991) {
                    container.scrollTo({
                        top: sutitleBlkTop,
                        behavior: "smooth",
                    });
                } else {
                    container.scrollTo({
                        top: sutitleBlkTop - 36,
                        behavior: "smooth",
                    });
                }
            }
            this.challenge = true;
        },
        leaveChallenge() {
            this.hasChallenge = true;
            if (this.leavingCheck) {
                this.leavingCheck = false;
            }
            if (this.onChallenge && !this.endChallenge) {
                this.leavingCheck = true;
                this.onChallenge = false;
                this.recStop();
            }
            if (this.endChallenge) {
                app.recBlob.splice(0, 1);
                const idName = "myAudio";
                const audio = document.getElementById(idName);
                audio.remove();
            }
            this.pauseBlk = true;
            this.onSample = false;
            this.en_content = "";
            this.ch_content = "";
            this.wave = -1;
            this.endChallenge = false;
            this.onChallenge = false;
            player.pauseVideo();
            document.querySelector(".video_bar").style.display = "block";
            //配音字幕去掉角色標籤
            const roleA = document.querySelectorAll(".role_A");
            const roleB = document.querySelectorAll(".role_B");
            const li = document.querySelectorAll(".side_li");
            for (let i = 0; i < roleA.length; i++) {
                roleA[i].classList.remove("role_A_label");
            }
            for (let j = 0; j < roleB.length; j++) {
                roleB[j].classList.remove("role_B_label");
            }
            for (let k = 0; k < li.length; k++) {
                li[k].classList.remove("role_padding");
            }
            this.challenge = false;
        },
        // === 開始示範 ===
        startSample() {
            if (this.cid == null) {
                document.getElementById("myModal01").classList.remove("none");
            } else {
                this.recordIndex = 0;
                this.onSample = true;
                document.getElementById("startSample").classList.add("none");
                document.querySelector(".begin_mask").classList.add("none");
                const sentence_start = this.record_start_time[this.recordIndex];
                const min = Number(sentence_start.slice(3, 5)) * 60;
                const sec = Number(
                    sentence_start.slice(6, 11).replace(",", ".")
                );
                const time = min + sec;
                player.seekTo(time - 3);
                player.unMute().playVideo();

                setTimeout(() => {
                    //滾動到配音字幕區間
                    const container = document.querySelector(".tab_container");
                    const height = container.scrollHeight;
                    if (window.innerWidth < 991) {
                        container.scrollTo({
                            top: height,
                            behavior: "smooth",
                        });
                    }
                }, 500);
            }
        },
        // === 選擇腳色 ===
        chooseRole(role) {
            let r;
            if (role == "A") {
                r = "B";
            } else {
                r = "A";
            }

            //配音字幕選擇角色標籤
            const chooseRole = document.querySelectorAll(`.role_${r}`);
            const noneChooseRole = document.querySelectorAll(`.role_${role}`);
            for (let i = 0; i < chooseRole.length; i++) {
                chooseRole[i].classList.remove(`role_${r}_label`);
            }
            for (let j = 0; j < noneChooseRole.length; j++) {
                noneChooseRole[j].classList.add(`role_${role}_label`);
            }

            this.role = role;

            //控制影片聲音開關
        },
        // === 略過示範 ===
        passSample() {
            player.pauseVideo();
            this.isPass = true;
            this.voice = "";
            this.wave = -1;
            document
                .getElementById(`subtitle${this.sIndex}`)
                .classList.remove("subtitle_checked");
        },
        // === 開始配音 ===
        startRecord() {
            if (this.role == "") {
                alert("請先選擇任一角色來扮演");
            } else {
                let fileName = `${this.role}${this.mid}`;
                if (document.getElementById(`${fileName}`)) {
                    app.confirm = true;
                    return false;
                }
                this.onChallenge = true;
                this.en_content = "";
                this.ch_content = "";
                document.querySelector(".video_bar").style.display = "none";
                document.querySelector(".demo_button").style.pointerEvents =
                    "none";
                app.recOpen();

                setTimeout(() => {
                    app.recStart();
                    let sentence_start = this.record_start_time[0];
                    const min = Number(sentence_start.slice(3, 5)) * 60;
                    const sec = Number(
                        sentence_start.slice(6, 11).replace(",", ".")
                    );
                    const time = min + sec;
                    player.seekTo(time - 3);
                    player.unMute().playVideo();
                }, 3000);
            }
        },
        //重新配音確認彈窗
        recConfirm(e) {
            this.confirm = false;
            if (e) {
                this.onChallenge = true;
                this.en_content = "";
                this.ch_content = "";
                document.querySelector(".video_bar").style.display = "none";
                document.querySelector(".demo_button").style.pointerEvents =
                    "none";
                app.recOpen();

                setTimeout(() => {
                    app.recStart();
                    let sentence_start = this.record_start_time[0];
                    const min = Number(sentence_start.slice(3, 5)) * 60;
                    const sec = Number(
                        sentence_start.slice(6, 11).replace(",", ".")
                    );
                    const time = min + sec;
                    player.seekTo(time - 3);
                    player.unMute().playVideo();
                }, 3000);
            } else {
                this.leaveChallenge();
            }
        },
        // ====錄音完成結束配音===
        endRecord() {
            app.timeupdate = false;
            this.recStop();
            this.isUpload = false;
        },
        //===重新配音===
        reRecord() {
            new Promise((resolve, reject) => {
                this.leaveChallenge();
                resolve();
            }).then(() => {
                this.goChallenge();
                app.recBlob.splice(0, 1);
                const audio = document.getElementById("myAudio");
                audio.remove();
            });
        },
        // === 錄音後音檔播放模式切換 ===
        fnRecordMode() {
            if (this.recordMode < 1) {
                this.recordMode++;
            } else {
                this.recordMode = 0;
            }
        },
        //=== 錄音後音檔播放控制 ===
        recordPlay() {
            const audio = document.getElementById("myAudio");
            if (app.playstate == 0 || app.playstate == -1) {
                player.playVideo();
                setTimeout(() => {
                    audio.play();
                }, 100);
            } else {
                player.pauseVideo();
                audio.pause();
            }
        },
        // ==========================================
        // == 錄音上傳
        // ==========================================
        uploadFile() {
            if (this.isUpload) {
                app.hint = "已經成功上傳";
                this.share(1);
                return false;
            }
            app.hint = "上傳0%";
            var formData = new FormData();
            const blob = this.recBlob[0];
            const cid = this.cid;
            const mid = this.mid;
            const vid = this.videoId;
            const role = this.role;
            formData.append("upfile", blob, `${cid}-${mid}-${vid}-${role}.mp3`);
            formData.append("member_id", `${mid}`);
            formData.append("customer_id", `${cid}`);
            formData.append("news_id", `${vid}`);
            formData.append("role", `${role}`);
            //上傳api
            axios({
                method: "post",
                url: "https://funday.asia/newmylessonmobile/api/InteractiveVideoUpload_new",
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
                        // app.progress = complete;
                        if (complete >= 100) {
                            app.hint = "上傳100%";
                        }
                    }
                },
            })
                .then(function (response) {
                    setTimeout(function () {
                        // document
                        //     .getElementById("uploadProgress")
                        //     .classList.add("none");
                        app.hint = "上傳成功";
                    }, 1000);
                })
                .catch(function (error) {
                    console.log(error);
                });
            this.singerId = `${app.cid}-${app.mid}`;
            this.isUpload = true;
        },
        backToSinger() {
            this.singerMode = false;
        },
        //第一次點擊頁面
        firstClickPage() {
            this.firstClick = true;
            document.getElementById("myModal01").classList.remove("none");
        },
    },
    watch: {
        // ==========================================
        // === 字幕同步 ===
        // ==========================================
        currentTimeMin: function (value) {
            console.log(value);
            // console.log(this.startTimeArr);
            if (this.startTimeArr.indexOf(value) !== -1) {
                const subtitleIndex = this.startTimeArr.indexOf(value);
                this.sIndex = subtitleIndex;
                // === 播放區塊字幕顯示 ===
                this.en_content =
                    this.subtitle[`${subtitleIndex}`]["en_content"];
                this.ch_content =
                    this.subtitle[`${subtitleIndex}`]["ch_content"];
                // === 側邊欄字幕active ===
                if (app.nowtab == 0 && app.subMode !== 3 && !app.single) {
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
                            this.voice = "A";
                            if (app.challenge) {
                                app.wave = subtitleIndex;
                            }
                        } else if (
                            document
                                .getElementById(`subtitle${subtitleIndex}`)
                                .classList.contains("role_B")
                        ) {
                            document
                                .getElementById(`subtitle${subtitleIndex}`)
                                .classList.add("role_B_checked");
                            this.voice = "B";
                            if (app.challenge) {
                                app.wave = subtitleIndex;
                            }
                        }
                        if (this.subMode !== 1) {
                            document.querySelector(
                                ".subtitle_checked .side_tw"
                            ).style.fontWeight = "500";
                        }
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
                        if (!this.single) {
                            //單句模式不滾動
                            if (window.innerWidth < 991) {
                                container.scrollTo({
                                    top: sutitleBlkTop,
                                    behavior: "smooth",
                                });
                            } else {
                                container.scrollTo({
                                    top: sutitleBlkTop,
                                    behavior: "smooth",
                                });
                            }
                        }
                    }
                }
            }
        },
        hint: function (val, oldVal) {
            if (val == "") return;
            clearTimeout(disable);
            document.querySelector(".hint").style.visibility = "visible";
            document.querySelector(".hint").style.opacity = 1;
            disable();
            function disable() {
                setTimeout(() => {
                    document.querySelector(".hint").style.visibility = "hidden";
                    document.querySelector(".hint").style.opacity = 0;
                }, 1500);
            }
        },
    },
});
