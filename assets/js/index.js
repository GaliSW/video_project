import Vue from "https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.js";
var player;
import badWordsPlus from "https://cdn.skypack.dev/bad-words-plus";
import zhBadWords from "./words.js";
// ***********************************navbar**************************************
const app = new Vue({
    el: ".all_wrap",
    data: {
        list: "",
        notifications: "",
        podcast: false,
        radio: false,
        stream: "",
        recommend: false,
        notiStatus: "", //手機板推播訊息
        notiSex: "", //手機版推播性別
        notiName: "", //手機版推播姓名
        notiPic: "", //手機版推播頭像
        notiIndex: -1, //手機版推播則數
        notiChange: false, //手機版推播動畫開關
        bannerImg: "",
        bannerId: "",
        bannerVd: "",
        videoDubbing: "",
        hotVideo: "",
        state: 0,
        Cinephile: "",
        News: "",
        LifeStyle: "",
        Knowledge: "",
        微電影: "",
        board: false, //留言板開關
        emoji: false, //emoji開關
        boardContent: {}, //留言板內容
        boardMessage: {}, //留言板跑馬燈訊息
        boardNow: 0, //留言板顯示訊息
        messageObj: {}, //發送者訊息
        userPic: "",
        userImg: "", //發送者頭像
        userName: "", //發送者姓名
        message: "", //發送者訊息
        userSex: "", //發送者性別
        notifications: "", //推波
        alert: "", //留言板錯誤訊息
        ads: true, //廣告預設開啟
        captcha: "", //驗證碼
        nav: false,
    },
    created() {
        if (
            sessionStorage.getItem("free") == undefined &&
            sessionStorage.getItem("mindx") == undefined
        ) {
            sessionStorage.setItem("free", 0); //設置試用次數
        }

        //側邊欄資料
        axios
            .get("https://funday.asia/api/ProgramWeb/defaultlist.asp")
            .then((response) => {
                // console.log(response);
                const length = response.data.Category.length;
                for (let i = 0; i < length; i++) {
                    const str = response.data.Category[i]["Category"];
                    if (str !== "Life Style") {
                        this.list += `<li onclick="scrollToBlk('ca0${
                            i + 1
                        }')">${str}</a></li>`;
                    }
                }
            })
            .catch((error) => console.log(error));
        let mid = 0;
        //登入後memberId
        if (sessionStorage.getItem("mindx") !== null) {
            mid = sessionStorage.getItem("mindx");
            // this.firstClick = true;
        } else {
            setTimeout(() => {
                document.getElementById("myModal01").classList.remove("none");
            }, 15000);
        }

        axios
            .get(
                `https://funday.asia/api/ProgramWeb/defaultlist.asp?member_id=${mid}`
            )
            .then((response) => {
                console.log(response.data);
                const length = response.data.Category.length;
                // console.log(length);
                for (let j = 0; j < length; j++) {
                    const nav = response.data.Category[j]["Category"];
                    if (nav !== "Life Style") {
                        for (let i = 0; i < 4; i++) {
                            const title = response.data[`${nav}`][i]["Title"];
                            const pic = response.data[`${nav}`][i]["Pic"];
                            const id = response.data[`${nav}`][i]["Id"];
                            const click = response.data[`${nav}`][i]["Clicks"];
                            const record =
                                response.data[`${nav}`][i]["Recordings"];
                            const video = response.data[`${nav}`][i]["Video"];
                            let heart = "";

                            if (response.data[`${nav}`][i]["Bookmark"] == 1) {
                                heart = "favorites";
                            }
                            this[`${nav.replace(/ /g, "")}`] += `
                            <div class="item">
                                <div class="video_img"
                                id=${id}
                                name=${nav}
                                onclick="toVideo(this)">
                                <img
                                        src="${pic}"
                                        class="img"
                                /></a>
                            </div>
                            <div class="tool_bar">
                                <div class="subtitles"
                                id=${id}
                                name=${nav}
                                onclick="toVideo(this)">
                                    中英字幕
                                </div>
                                <div class="blank"></div>
                                <div class="number video_icon" >
                                    <img
                                        src="images/web_icon/video_icon.svg"
                                        class="icon"
                                    /><span class="digi"
                                        >${record}</span
                                    >
                                    次
                                </div>
                                <div class="number view_icon">
                                    <img
                                        src="images/web_icon/view_icon.svg"
                                        class="icon"
                                    /><span class="digi"
                                        >${click}</span
                                    >
                                    次
                                </div>
                                <div
                                    id="${id}"
                                    class="heart ${heart}"
                                    onclick="fnAddToCollection(this)"
                                ></div>
                            </div>
                            <div class="more_title"
                            id=${id}
                            name=${nav}
                            onclick="toVideo(this)">
                               
                                    <span class="category"
                                        >${nav} | </span
                                    >${title}
                            </div>
                            </div>
                            `;
                        }
                    }
                }
            })
            .catch((error) => console.log(error));
        this.notification();
        this.createPlayer();
        this.getMessage();
        let nickname = sessionStorage.getItem("nickName");
        let sex = sessionStorage.getItem("sex");
        let pic = sessionStorage.getItem("pic");
        this.nickname = nickname;
        if (pic == null || pic == "") {
            this.userPic = false;
        } else {
            this.userPic = true;
            this.pic = pic;
        }
        this.sex = sex;
    },
    watch: {
        alert: function (val, oldVal) {
            if (val == "") {
                return false;
            }
            clearTimeout(disable);
            document.querySelector(".alertHint").style.visibility = "visible";
            document.querySelector(".alertHint").style.opacity = 1;
            disable();
            function disable() {
                setTimeout(() => {
                    document.querySelector(".alertHint").style.visibility =
                        "hidden";
                    document.querySelector(".alertHint").style.opacity = 0;
                }, 1500);
            }
        },
    },
    methods: {
        //推播
        notification() {
            "use strict";
            function getNotification() {
                axios
                    .get("https://funday.asia/api/programweb/RealTimeList.asp")
                    .then((response) => {
                        // console.log(response.data.reverse());
                        if (response.data.length !== 0) {
                            const length = response.data.length;
                            if (length < 10) {
                                app.notifications = response.data;
                            } else {
                                app.notifications = response.data.slice(0, 9);
                            }
                            // if(window.innerHeight < )
                            if (app.notiIndex < app.notifications.length - 1) {
                                app.notiIndex++;

                                app.notiName =
                                    app.notifications[app.notiIndex].Nickname;
                                app.notiStatus =
                                    app.notifications[app.notiIndex].Status;
                                app.notiSex =
                                    app.notifications[app.notiIndex].Sex;
                                app.notiPic =
                                    app.notifications[app.notiIndex].Pic;
                                app.notiChange = true;
                            } else {
                                // console.log("123");
                                app.notiIndex = 0;
                                app.notiName =
                                    app.notifications[app.notiIndex].Nickname;
                                app.notiStatus =
                                    app.notifications[app.notiIndex].Status;
                                app.notiSex =
                                    app.notifications[app.notiIndex].Sex;
                                app.notiPic =
                                    app.notifications[app.notiIndex].Pic;

                                app.notiChange = true;
                            }
                        }
                        setTimeout(() => {
                            app.notiChange = false;
                        }, 2000);
                    })
                    .catch((error) => console.log(error));
            }
            getNotification();
            setInterval(getNotification, 10000);
        },
        //播放radio
        fnRadio() {
            const audio = document.getElementById("Fun_audio");
            if (this.radio) {
                this.stream = "";
                this.radio = false;
                audio.pause();
            } else {
                this.stream = "https://s1.phx.icastcenter.com:9008/stream";
                this.radio = true;
                setTimeout(() => {
                    audio.play();
                }, 1000);
            }
        },
        //更新驗證碼
        getCaptcha() {
            if (sessionStorage.getItem("mindx") == null) {
                document.getElementById("myModal01").classList.remove("none");
                return;
            }
            if (!this.recommend) {
                this.recommend = true;
            }
            let captcha2 = new CaptchaMini({
                lineWidth: 1, //线条宽度
                lineNum: 3, //线条数量
                dotR: 2, //点的半径
                dotNum: 10, //点的数量
                preGroundColor: [255, 255], //前景色区间
                backGroundColor: [0, 0], //背景色区间
                fontSize: 18, //字体大小
                fontFamily: ["Georgia", "微软雅黑", "Helvetica", "Arial"], //字体类型
                fontStyle: "stroke", //字体绘制方法，有fill和stroke
                content: "abcdefghijklmnopqrstuvwxyz", //验证码内容
                length: 6, //验证码长度
            });
            setTimeout(() => {
                captcha2.draw(document.querySelector("#captcha1"), (r) => {
                    this.captcha = r;
                });
            }, 500);
        },
        //驗證碼比對
        captchaConfirm() {
            const val = document.getElementById("captcha_val").value;
            if (this.captcha == val) {
                document.getElementById("captcha_val").style.border =
                    "1px solid #fff";
                document.querySelector(".recommend_submit").style.background =
                    "#174780";
                document.querySelector(".recommend_submit").style.color =
                    "#fff";
                this.canRecommend = true;
            } else {
                document.getElementById("captcha_val").style.border =
                    "1px solid red";
            }
        },
        //送出推薦訊息
        sendRecommend() {
            if (!this.canRecommend) {
                document.getElementById("captcha_val").style.border =
                    "1px solid red";
                return false;
            }
            let member_id = sessionStorage.getItem("mindx"),
                recommendMessage = document.querySelector(
                    'textarea[name="my_recommend"]'
                ).value,
                isClick = false;

            if (!recommendMessage) {
                document
                    .querySelector('textarea[name="my_recommend"]')
                    .setAttribute("placeholder", "請填寫內容");
                return false;
            }
            if (isClick == true) return;

            //過濾字元
            let filterTxt;
            function xssScript(s) {
                const pattern = new RegExp(
                    "[%--` ~!@#$^&;*()=|{}':;',//[//].<>/?~!@#￥……&;*()――|{}【】‘;:”“'。,、?]"
                );
                let rs = "";
                for (var i = 0; i < s.length; i++) {
                    rs = rs + s.substr(i, 1).replace(pattern, "");
                }
                filterTxt = rs;
            }

            xssScript(recommendMessage);
            console.log(filterTxt);
            const json = JSON.stringify({
                member_id: member_id,
                message: filterTxt,
            });

            axios
                .post(
                    `https://funday.asia/api/MusicboxWeb/PromoteSong.asp`,
                    json
                )
                .then((res) => {
                    alert(res.data.message);
                    isClick = true;
                    this.recommend = false;
                })
                .catch((error) => console.log(error));
        },
        createPlayer() {
            axios
                .get("https://funday.asia/api/ProgramWeb/defaultlist.asp")
                .then((response) => {
                    // console.log(response.data.Banner[0]);
                    //Banner圖片
                    this.bannerImg = response.data.Banner[0].Pic;
                    this.bannerId = response.data.Banner[0].Id;
                    // Banner影片網址處理
                    // https://youtu.be/pAD3QjweNfQ => https://www.youtube.com/embed/pAD3QjweNfQ
                    const youtubeId =
                        response.data.Banner[0].Video.split(
                            "https://youtu.be/"
                        )[1];
                    sessionStorage.setItem("ytid", youtubeId);
                    const youtubeUrl = `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&controls=0&showinfo=0&autoplay=0&rel=0&mute=0&loop=1`;
                    this.bannerVd = youtubeUrl;

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

                    function onPlayerReady(e) {
                        console.log("1");
                        e.target.mute();
                        e.target.playVideo();
                    }
                    function onPlayerStateChange(e) {
                        let btn = document.getElementById("play_btn");
                        switch (e.data) {
                            case 0: //=== 結束 ===
                                player.playVideo();
                        }
                    }
                    //配音大挑戰
                    const rlength = response.data["Recording List"].length;
                    for (let i = 0; i < rlength; i++) {
                        const title =
                            response.data["Recording List"][i]["Title"];
                        const click =
                            response.data["Recording List"][i]["Clicks"];
                        const id = response.data["Recording List"][i]["Id"];
                        const pic = response.data["Recording List"][i]["Pic"];
                        const video =
                            response.data["Recording List"][i]["Video"];
                        const record =
                            response.data["Recording List"][i]["Recordings"];
                        this.videoDubbing += `
                    <li>
                    <div class="item_num">0${i + 1}</div>
                        <div class="item">
                            <div class="img"
                            id=${id} 
                            name="Cinephile"
                            onclick="toVideo(this)">
                                <img
                                        src="${pic}"
                                /></a>
                            </div>
                            <div class="title"
                            id=${id} 
                            name="Cinephile"
                            onclick="toVideo(this)">
                                <span
                                        class="category"
                                        >Cinephile
                                        電影迷</span
                                    >${title}
                            </div>
                            <div
                                class="
                                    number
                                    video_icon
                                "
                            >
                                <img
                                    src="images/web_icon/video_icon.svg"
                                    class="icon"
                                /><span class="digi"
                                    >${record}</span
                                >
                                次
                            </div>
                        </div>
                    </li>
                    `;
                    }
                    //熱門排行
                    const hlength = response.data["Hot List"].length;
                    for (let i = 0; i < hlength; i++) {
                        const title = response.data["Hot List"][i]["Title"];
                        const click = response.data["Hot List"][i]["Clicks"];
                        const pic = response.data["Hot List"][i]["Pic"];
                        const id = response.data["Hot List"][i]["Id"];
                        const video = response.data["Hot List"][i]["Video"];
                        const record =
                            response.data["Hot List"][i]["Recordings"];
                        this.hotVideo += `
                                <li>
                                <div class="item_num">0${i + 1}</div>
                                    <div class="item">
                                    <div class="img"
                                    id=${id}
                                    name="Cinephile"
                                    onclick="toVideo(this)">
                                        <img
                                                src="${pic}"
                                        /></a>
                                    </div>
                                    <div class="title"
                                    id=${id} 
                                    name="Cinephile"
                                    onclick="toVideo(this)">
                                    <span
                                                class="category"
                                                >Cinephile
                                                電影迷</span
                                            >${title}
                                        
                                    </div>
                                    <div
                                        class="number view_icon"
                                    >
                                        <img
                                            src="images/web_icon/view_icon.svg"
                                            class="icon"
                                        /><span class="digi"
                                            >${click}
                                        次
                                    </div>
                                </div>
                            </li>
                    `;
                    }
                })
                .catch((error) => console.log(error));
        },
        volume() {
            // console.log(player.isMuted());
            if (this.state == 0) {
                document
                    .querySelector(".fa-volume-high")
                    .classList.remove("none");
                document
                    .querySelector(".fa-volume-xmark")
                    .classList.add("none");
                this.state = 1;
                player.unMute();
            } else {
                document.querySelector(".fa-volume-high").classList.add("none");
                document
                    .querySelector(".fa-volume-xmark")
                    .classList.remove("none");
                // this.player.playVideo();
                this.state = 0;
                player.mute();
            }
        },
        //留言板

        //取得留言訊息
        getMessage() {
            //GET留言板資料
            function get() {
                axios
                    .get(
                        `https://videoapi.funday.asia/api/BulletinBoard/BulletinBoardLastThirtyRecords`
                    )
                    .then((res) => {
                        // console.log(res);
                        app.boardContent = res.data.content.reverse();
                        app.boardMessage = res.data.content;
                        app.fnBoardMessage();
                    })
                    .catch((error) => console.log(error));
            }

            get(); //優先執行一次

            setInterval(() => {
                get();
            }, 5000);
        },

        //留言板開關
        fnBoardToggle() {
            if (this.board) {
                document.body.style.overflowY = "scroll";
            } else {
                if (window.innerWidth < 1200) {
                    document.body.style.overflowY = "hidden";
                    this.fnBoardOpen();
                }
            }
            this.board = !this.board;
            this.emoji = false;
        },

        //當前留言板顯示訊息
        fnBoardMessage() {
            if (this.boardNow < this.boardContent.length - 1) {
                this.boardNow++;
            } else {
                this.boardNow = 0;
            }
        },

        //留言板開啟時滾動至最底
        fnBoardOpen() {
            const scroll = document.querySelector(".board_open .content");
            scroll.scrollTo(0, scroll.scrollHeight);
        },

        //訊息加入貼圖
        addEmoji(evt) {
            const input = document.getElementById("message");
            const emoji = evt.target.innerHTML;
            input.focus();
            var prefix = input.value.substring(0, input.selectionStart);
            var suffix = input.value.substring(input.selectionEnd);
            input.value = prefix + emoji + suffix;
        },

        //送出訊息與過濾
        send() {
            console.log("send");
            //判斷是否登入
            if (!sessionStorage.getItem("mindx")) {
                // alert("請先登入");
                document.getElementById("myModal09").classList.remove("none");
                return;
            }
            const input = document.getElementById("message");

            // 超過限制的字數
            var maxChars = 200;
            if (input.value.length > maxChars) {
                input.style.outline = "1px solid #E84149";
                input.style.boxShadow = " 0px 0px 0px 4px rgb(232, 65, 73,0.1)";
                app.alert = "超過字數限制(200字)";
                return false;
            } else if (input.value.length == 0) {
                // 未填寫內容
                // input.style.outline = "1px solid #E84149";
                input.style.borderRadius = "100px";
                input.style.boxShadow = " 0px 0px 0px 4px rgb(232, 65, 73,0.5)";
                input.setAttribute("placeholder", "請填寫內容");
                input.classList.add("input_change");
                // app.alert = "請填寫內容";
                return false;
            } else {
                input.style.outline = "none";
                app.alert = "";
            }

            let text; // 過濾後的文字
            //判斷是否有英文

            let chineseList = zhBadWords.words;
            if (/[a-z]/i.test(input.value)) {
                zhFilter(input.value);
                enFilter(text);
            } else {
                zhFilter(input.value);
            }

            // === 過濾中文髒話 ===
            function zhFilter(str) {
                for (let i = 0; i < chineseList.length; i++) {
                    if (str.indexOf(chineseList[i]) > -1) {
                        // console.log(str.indexOf(chineseList[i]));
                        str = replaceWord(str, chineseList[i]);
                    }
                }
                text = str;
            }

            function replaceWord(str, target) {
                let t = "";
                var placeHolder = "*";
                for (var i = 0; i < target.length; i++) {
                    t += placeHolder;
                }
                return str.replace(new RegExp(target, "g"), t);
            }

            // === 過濾英文髒話 ===
            function enFilter(str) {
                var Filter = badWordsPlus;
                var customFilter = new Filter({ placeHolder: "*" });
                text = customFilter.clean(str);
            }
            // === 過濾前後空格 ===
            text = text.replace(/(^[\s]*)|([\s]*$)/g, "");

            // console.log(text);
            // const blk = document.getElementById("content_blk");
            const scroll = document.querySelector(".board_open .content");
            let sex;
            if (this.sex == 1) {
                sex = "male";
            } else {
                sex = "female";
            }
            // debugger;
            let mid = sessionStorage.getItem("mindx");
            let cid = sessionStorage.getItem("cindx");
            //輸入留言api
            axios
                .post(
                    `https://videoapi.funday.asia/api/BulletinBoard/BulletinBoardRecord?customer_id=${cid}&member_id=${mid}&content=${text}`
                )
                .then((res) => {
                    this.getMessage();
                });
            input.value = "";
            scroll.scrollTo(0, scroll.scrollHeight);
        },

        //init input的狀態
        inputKeydown() {
            const input = document.getElementById("message");
            input.style.outline = "unset";
            input.setAttribute("placeholder", "說點什麼...");
            input.classList.remove("input_change");
            input.style.boxShadow = " 0px 0px 0px 4px rgb(0 ,0, 0,0.1)";
        },
        //第一次點擊頁面
        // firstClickPage() {
        //     this.firstClick = true;
        //     document.getElementById("myModal01").classList.remove("none");
        // },
    },
});
