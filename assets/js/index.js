import Vue from "https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.js";
var player;
// ***********************************navbar**************************************
const channelList = new Vue({
    el: "#sidebar",
    data: {
        list: "",
        notifications: "",
    },
    created() {
        if (
            sessionStorage.getItem("free") == undefined &&
            sessionStorage.getItem("mindx") == undefined
        ) {
            sessionStorage.setItem("free", 0); //設置試用次數
        }
        axios
            .get("https://funday.asia/api/ProgramWeb/defaultlist.asp")
            .then((response) => {
                // console.log(response);
                const length = response.data.Category.length;
                for (let i = 0; i < length; i++) {
                    const str = response.data.Category[i]["Category"];
                    this.list += `<li onclick="scrollToBlk('ca0${
                        i + 1
                    }')">${str}</a></li>`;
                }
            })
            .catch((error) => console.log(error));
        this.notification();
    },
    methods: {
        notification() {
            setInterval(getNotification, 5000);
            function getNotification() {
                axios
                    .get("https://funday.asia/api/programweb/RealTimeList.asp")
                    .then((response) => {
                        // console.log(response);
                        if (response.data.length !== 0) {
                            const length = response.data.length;
                            if (length < 7) {
                                channelList.notifications =
                                    response.data.reverse();
                            } else {
                                channelList.notifications = response.data
                                    .reverse()
                                    .slice(length - 8, -1);
                            }
                        }
                    })
                    .catch((error) => console.log(error));
            }
        },
    },
});

// ***********************************Banner**************************************
const video_frame_top = new Vue({
    el: "#video_frame_top",
    data: {
        bannerImg: "",
        bannerId: "",
        bannerVd: "",
        videoDubbing: "",
        hotVideo: "",
        state: 0,
    },
    created() {
        this.createPlayer();
    },
    methods: {
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
                    const youtubeUrl = `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&controls=0&showinfo=0&autoplay=0&rel=0&mute=0`;
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
                            },
                        });
                    };

                    function onPlayerReady(e) {
                        e.target.mute().playVideo();
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
    },
});
// ***********************************Bottom**************************************
const video_frame_bottom = new Vue({
    el: "#video_frame_bottom",
    data: {
        Cinephile: "",
        WeeklyNews: "",
        LifeStyle: "",
        Knowledge: "",
        微電影: "",
    },
    created() {
        // console.log(window.innerWidth);
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
                // console.log(response.data.Cinephile);
                const length = response.data.Category.length;
                // console.log(length);
                for (let j = 0; j < length; j++) {
                    const nav = response.data.Category[j]["Category"];
                    for (let i = 0; i < 4; i++) {
                        const title = response.data[`${nav}`][i]["Title"];
                        const pic = response.data[`${nav}`][i]["Pic"];
                        const id = response.data[`${nav}`][i]["Id"];
                        const click = response.data[`${nav}`][i]["Clicks"];
                        const record = response.data[`${nav}`][i]["Recordings"];
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
                            <div class="number video_icon">
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
                                    >${nav}</span
                                >${title}
                        </div>
                        </div>
                        `;
                    }
                }
            })
            .catch((error) => console.log(error));
    },
    methods: {},
});
