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
    },
    created() {
        this.cid = sessionStorage.getItem("cindx");
        this.mid = sessionStorage.getItem("mindx");
        this.Audio();
        this.Myfav();
        this.sideBar();
    },
    methods: {
        Audio() {
            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/ClassifyPg.asp?PG=1&CategoryId=9997&member_id=${this.mid}`
                )
                .then(function (response) {
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
                    console.log(response.data["我的收錄"][0].Id);
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
    },
});
