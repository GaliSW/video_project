//logo及其他連結設定
$("#logo").click(function () {
    location.href = "index.html";
});
//預載圖片
var img = new Image();
// img.src="../img/input_radio_do.svg"
function toCopyRight() {
    window.open("./copyright/copyright.html");
}
$("#toFav_btn").click(function () {
    if (sessionStorage.getItem("mindx") == null) {
        document.getElementById("myModal01").classList.remove("none");
        return;
    } else {
        location.href = "video_collect.html";
    }
});
//頁籤效果
$(function () {
    if (sessionStorage.getItem("mindx") == undefined) {
        document.getElementById("join_button").classList.remove("none");
    } else {
        document.getElementById("menu").classList.remove("none");
    }
    google.accounts.id.initialize({
        client_id:
            "424336502494-0lqsgtdqhq1eq58dspl52uc13k168uon.apps.googleusercontent.com",
        callback: handleCredentialResponse,
    });
    //判斷是否登入
    if (localStorage.getItem("fdtk")) {
        const token = localStorage.getItem("fdtk");
        document.querySelector(".subWeb").innerHTML = "";
        str_pc = `<a href="https://music.funday.asia?fdtk=${token}" target="_blank">FunMusic</a>
                <a href="https://tales.funday.asia?fdtk=${token}" target="_blank">FunTales</a>
                <a href="https://funradio.funday.asia?fdtk=${token}" target="_blank">FunRadio</a>
                <a href="https://dic.funday.asia?fdtk=${token}" target="_blank">FunDictionary</a>
                <a href="https://funday.asia/api/SSO.asp?fdtk=${token}" target="_blank">FunDay</a>
                <a href="https://funday.asia/api/SSOGOLink.asp?fdtk=${token}&Path=Subscription" target="_blank" class="more_service">更多會員服務</a>
            `;
        document
            .querySelector(".subWeb")
            .insertAdjacentHTML("afterbegin", str_pc);
    }
    if (
        location.search.indexOf("fdtk") > -1 &&
        location.search.split("=")[1] !== "" &&
        !sessionStorage.getItem("mindx")
    ) {
        //判斷token
        const token = location.search.split("=")[1];
        tokenCheck(token);
    } else {
        if (localStorage.getItem("fdtk") && !sessionStorage.getItem("mindx")) {
            const token = localStorage.getItem("fdtk");
            console.log(
                localStorage.getItem("fdtk"),
                sessionStorage.getItem("mindx")
            );
            tokenCheck(token);
        } else {
            return false;
        }
    }
    //* === Token check ===
    function tokenCheck(token) {
        axios
            .get(`https://webaspapi.funday.asia/api/User/Login?Token=${token}`)
            .then((res) => {
                if (res.data.IsSuccess) {
                    sessionStorage.setItem("mindx", res.data.Content.Mindx);
                    sessionStorage.setItem("cindx", res.data.Content.Cindx);
                    sessionStorage.setItem("level", res.data.Content.UserLevel);
                    sessionStorage.setItem(
                        "nickName",
                        res.data.Content.Nickname
                    );
                    sessionStorage.setItem("sex", res.data.Content.Sex);
                    localStorage.setItem("fdtk", token);
                    sessionStorage.setItem("pic", res.data.Content.Pic);
                    // location.href = "https://tube.funday.asia";
                    location.reload();
                } else {
                    return false;
                }
            });
    }

    // 預設顯示第一個 Tab
    var _showTab = 0;
    $(".switch_tab2").each(function () {
        // 目前的頁籤區塊
        var $tab = $(this);

        var $defaultLi = $("ul.tabs li", $tab).eq(_showTab).addClass("active");
        $($defaultLi.find("a").attr("href")).siblings().hide();

        // 當 li 頁籤被點擊時...
        // 若要改成滑鼠移到 li 頁籤就切換時, 把 click 改成 mouseover
        $("ul.tabs li", $tab)
            .click(function () {
                // 找出 li 中的超連結 href(#id)
                var $this = $(this),
                    _clickTab = $this.find("a").attr("href");
                // 把目前點擊到的 li 頁籤加上 .active
                // 並把兄弟元素中有 .active 的都移除 class
                $this
                    .addClass("active")
                    .siblings(".active")
                    .removeClass("active");
                // 淡入相對應的內容並隱藏兄弟元素
                $(_clickTab).stop(false, true).fadeIn().siblings().hide();

                return false;
            })
            .find("a")
            .focus(function () {
                this.blur();
            });
    });
});
window.addEventListener("resize", { passive: true }, () => {
    // We execute the same script as before
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
});
//logoChange
$(function () {
    setInterval(() => {
        if ($("#logoImg").hasClass("none")) {
            $("#logoImg").removeClass("none");
            $("#logoText").addClass("none");
        } else {
            $("#logoText").removeClass("none");
            $("#logoImg").addClass("none");
        }
    }, 6000);
});
//滾動調距
$(window).scroll(function () {
    var h = document.body.scrollHeight; //網頁文檔的高度
    var c = $(document).scrollTop(); //滾動條距離網頁頂部的高度
    var wh = $(window).height(); //頁面可視化區域高度
    if (window.innerWidth > 991) {
        if (Math.ceil(wh + c) >= h - 34) {
            $(".ads_blk").css({ bottom: "190px" });
            $(".message_board_blk").css({ bottom: "34px" });
        } else {
            $(".ads_blk").css({ bottom: "190px" });
            $(".message_board_blk").css({ bottom: "0px" });
        }
    } else if (window.innerWidth < 991 && window.innerWidth > 622) {
        if (Math.ceil(wh + c) >= h - 34) {
            $(".ads_blk").css({ bottom: "90px" });
            $(".message_board_blk").css({ bottom: "36px" });
        } else {
            $(".ads_blk").css({ bottom: "56px" });
            $(".message_board_blk").css({ bottom: "0px" });
        }
    } else {
        if (Math.ceil(wh + c) >= h - 34) {
            $(".ads_blk").css({ bottom: "104px" });
            $(".message_board_blk").css({ bottom: "48px " });
        } else {
            $(".ads_blk").css({ bottom: "56px" });
            $(".message_board_blk").css({ bottom: "0px" });
        }
    }
});
//愛心的點擊變色
$(".heart").click(function () {
    var $this = $(this);
    $this.toggleClass("favorites");
});
//撥放的點擊變色
$("ul.voice_items .digi .img").click(function () {
    var $this = $(this);
    $this.toggleClass("click");
});

//撥放bar裏的單句與單曲切換
// $(".buootn.cutover01").click(function () {
//     $(".buootn.cutover01 .cut01").toggle();
//     $(".buootn.cutover01 .cut02").toggle();
// });
// $(".buootn.cutover02").click(function () {
//     $(".buootn.cutover02 .cut01").toggle();
//     $(".buootn.cutover02 .cut02").toggle();
// });
// $(".buootn.cutover03 .cut01").click(function () {
//     $(".buootn.cutover03 .cut01").toggle();
//     $(".buootn.cutover03 .cut02").toggle();
// });
// $(".buootn.cutover03 .cut02").click(function () {
//     $(".buootn.cutover03 .cut02").toggle();
//     $(".buootn.cutover03 .cut03").toggle();
// });
// $(".buootn.cutover03 .cut03").click(function () {
//     $(".buootn.cutover03 .cut03").toggle();
//     $(".buootn.cutover03 .cut04").toggle();
// });
// $(".buootn.cutover03 .cut04").click(function () {
//     $(".buootn.cutover03 .cut04").toggle();
//     $(".buootn.cutover03 .cut01").toggle();
// });

//配音頁的設定
// $("#video_playing .begin_button").click(function () {
//     var $this = $(this);
//     $this.hide();
//     $(".video_bar .subtitle").show();
//     $(".function_items .demo_button").show();
//     $(".function_items .function01").show();
// });

$(".function01 .pass_button a").click(function () {
    $(".function_items .function01").hide();
    $(".function_items .function02").show();
});
// $(".function02 .begin_button a").click(function () {
//     $(".video_bar .subtitle").addClass("show");
//     $(".function_items .function02").hide();
//     $(".function_items .function03").show();
// });
// $(".function02 .begin_button a").click(function () {
//     $(".function_items .function02").hide();
//     $(".function_items .function03").show();
// });
// $(".function03 .record a").click(function () {
//     $(".function_items .function03").hide();
//     $(".function_items .function04").show();
// });
// $(".function04 a.next").click(function () {
//     $(".function_items .function04").hide();
//     $(".function_items .function05").show();
// });
// $(".function05 a.upload").click(function () {
//     $(".function_items .function05").hide();
//     $(".function_items .function06").show();
// });

//收藏該篇歌曲
function fnAddToCollection(item) {
    //判斷是否登入
    if (sessionStorage.getItem("mindx") == null) {
        document.getElementById("myModal01").classList.remove("none");
        return;
    }

    //取得點擊到的該篇影片id
    let VideoId = item.attributes["id"].value;
    let mid = 0;
    //登入後memberId
    if (sessionStorage.getItem("mindx") !== null) {
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
                item.classList.add("favorites");
            }

            if (res.data.State == 2) {
                //刪除成功
                item.classList.remove("favorites");
            }
        })
        .catch((error) => console.log(error));
}
