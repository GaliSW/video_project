let app = new Vue({
    el: "#app",
    data: {
        cid: "",
        mid: "",
        myAudioList: [],
        myFavList: [],
        sidebar: [],
        myFav: "",
        myAudio: "",
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
        notifications: "", //推波
        alert: "", //留言板錯誤訊息
        ads: true, //廣告預設開啟
        captcha: "", //驗證碼
        songLessMb: false,
        favLess: false,
        favLessMb: false,
    },
    created() {
        this.cid = sessionStorage.getItem("cindx");
        this.mid = sessionStorage.getItem("mindx");
        this.Audio();
        this.Myfav();
        this.sideBar();
        this.notification();
    },
    methods: {
        Audio() {
            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/ClassifyPg.asp?PG=1&CategoryId=9997&member_id=${this.mid}`
                )
                .then(function (response) {
                    if (response.data["我的配音"].length < 3) {
                        app.songLessMb = true;
                    }
                    if (response.data["我的配音"][0].Id == "") {
                        app.myAudio = 0;
                    } else {
                        app.myAudio = 1;
                    }
                    for (let i = 0; i < response.data["我的配音"].length; i++) {
                        let cate = response.data["我的配音"][i]["Category_id"];

                        switch (cate) {
                            case "15":
                                response.data["我的配音"][i]["Category_id"] =
                                    "Cinephile";
                                break;
                            case "21":
                                response.data["我的配音"][i]["Category_id"] =
                                    "Weekly News";
                                break;
                            case "14":
                                response.data["我的配音"][i]["Category_id"] =
                                    "Life Style";
                                break;
                            case "16":
                                response.data["我的配音"][i]["Category_id"] =
                                    "Knowledge";
                                break;
                            case "20":
                                response.data["我的配音"][i]["Category_id"] =
                                    "微電影";
                                break;
                        }
                    }
                    app.myAudioList = response.data["我的配音"];
                });
        },
        Myfav() {
            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/ClassifyPg.asp?PG=1&CategoryId=9996&member_id=${this.mid}`
                )
                .then(function (response) {
                    console.log(response.data["我的收錄"].length);
                    if (response.data["我的收錄"].length < 4) {
                        app.favLess = true;
                    }
                    if (response.data["我的收錄"].length < 3) {
                        app.favLessMb = true;
                    }
                    if (response.data["我的收錄"][0].Id == "") {
                        app.myFav = 0;
                    } else {
                        app.myFav = 1;
                    }
                    for (let i = 0; i < response.data["我的收錄"].length; i++) {
                        let cate = response.data["我的收錄"][i]["Category_id"];

                        switch (cate) {
                            case "15":
                                response.data["我的收錄"][i]["Category_id"] =
                                    "Cinephile";
                                break;
                            case "21":
                                response.data["我的收錄"][i]["Category_id"] =
                                    "Weekly News";
                                break;
                            case "14":
                                response.data["我的收錄"][i]["Category_id"] =
                                    "Life Style";
                                break;
                            case "16":
                                response.data["我的收錄"][i]["Category_id"] =
                                    "Knowledge";
                                break;
                            case "20":
                                response.data["我的收錄"][i]["Category_id"] =
                                    "微電影";
                                break;
                        }
                    }
                    app.myFavList = response.data["我的收錄"];
                });
        },
        sideBar() {
            axios
                .get(`https://funday.asia/api/ProgramWeb/defaultlist.asp?`)
                .then((response) => {
                    // console.log(response);
                    this.sidebar = response.data.Category;
                });
        },
        // ==========================================
        // === 收藏 ===
        // ==========================================
        fnAddToCollection(e) {
            //判斷是否登入
            // console.log(e.target);
            if (this.mid == null) {
                alert("請先登入");
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
        goBack() {
            window.history.back();
        },
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
    },
});
