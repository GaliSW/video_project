Vue.directive("scroll", {
    inserted(el, binding) {
        const f = (evt) => {
            if (binding.value(evt, el)) {
                window.removeEventListener("scroll", f);
            }
        };
        window.addEventListener("scroll", f);
    },
});

let category = new Vue({
    el: "#main-body",
    data: {
        sidebar: "",
        title: "",
        mainList: "",
        vdData: [],
        order: 1,
        CategoryId: "",
        categoryIdList: {},
        loading: false,
        CategoryTitle: "",
    },
    methods: {
        handleScroll() {
            // 獲取捲軸被往下滾動的距離
            const scrollTop = Math.max(
                document.documentElement.scrollTop,
                document.body.scrollTop
            );
            // 獲取瀏覽器窗口高度
            const { innerHeight } = window;
            // 獲取頁面高度
            const { offsetHeight } = document.documentElement;

            let hasRun = false;

            // 當捲軸被滾動到最底部時觸發
            if (!hasRun && scrollTop + innerHeight + 1 > offsetHeight) {
                hasRun = true;
                // 切換頁碼
                this.order += 1;
                // 獲取遠端資源
                this.getData();
            }
            // 遠端資源回傳空陣列時，停止監聽 return this.noData;
        },
        getData() {
            let mid = 0;
            //登入後memberId
            if (sessionStorage.getItem("mindx") !== null) {
                mid = sessionStorage.getItem("mindx");
            }
            axios
                .get(
                    `https://funday.asia/api/ProgramWeb/ClassifyPg.asp?PG=${this.order}&CategoryId=${this.CategoryId}&member_id=${mid}`
                )
                .then((res) => {
                    // console.log(res);
                    this.CategoryTitle = Object.keys(res.data)[0];
                    if (!res.data[this.CategoryTitle]) {
                        return false;
                    }
                    if (res.data[this.CategoryTitle] == "") {
                        this.loading = false;
                        return false;
                    } else {
                        this.vdData.push(...res.data[this.CategoryTitle]);
                        this.loading = true;
                    }
                })
                .catch((error) => console.log(error));
        },
        // ==========================================
        // === 收藏 ===
        // ==========================================
        fnAddToCollection(e) {
            //判斷是否登入
            // console.log(e.target);
            if (sessionStorage.getItem("mindx") == undefined) {
                document.getElementById("myModal01").classList.remove("none");
                return;
            }

            //取得點擊到的該篇影片id
            let VideoId = e.target.attributes["id"].value;
            let mid = 0;
            //登入後memberId
            if (sessionStorage.getItem("mindx") !== undefined) {
                mid = sessionStorage.getItem("mindx");
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
    created() {
        //抓網址參數
        const url = window.location.search;
        let page = "";
        if (url.indexOf("?") != -1) {
            const ary = url.split("?")[1].split("&");
            for (i = 0; i <= ary.length - 1; i++) {
                if (ary[i].split("=")[0] == "p") {
                    // console.log(ary[i].split("=")[1]);
                    page = decodeURI(ary[i].split("=")[1]);
                    if (page == "WeeklyNews") {
                        page = "Weekly News";
                    } else if (page == "LifeStyle") {
                        page = "Life Style";
                    }
                    this.title = page;
                }
            }
        }
        axios
            .get(`https://funday.asia/api/ProgramWeb/defaultlist.asp?`)
            .then((response) => {
                // console.log(response);
                this.sidebar = response.data.Category;
                for (let i = 0; i < response.data.Category.length; i++) {
                    this.categoryIdList[
                        `${response.data.Category[i].Category}`
                    ] = `${response.data.Category[i].CategoryId}`;
                }
                this.CategoryId = this.categoryIdList[`${this.title}`];
                this.mainList = response.data[`${page}`];
                this.getData();
            });
    },
});
