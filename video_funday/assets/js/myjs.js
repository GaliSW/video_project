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
// $(function () {
//     //判斷是否登入
//     if (sessionStorage.getItem("mindx") == undefined) {
//         document.getElementById("join_button").classList.remove("none");
//     } else {
//         document.getElementById("menu").classList.remove("none");
//     }

//     // 預設顯示第一個 Tab
//     var _showTab = 0;
//     $(".switch_tab2").each(function () {
//         // 目前的頁籤區塊
//         var $tab = $(this);

//         var $defaultLi = $("ul.tabs li", $tab).eq(_showTab).addClass("active");
//         $($defaultLi.find("a").attr("href")).siblings().hide();

//         // 當 li 頁籤被點擊時...
//         // 若要改成滑鼠移到 li 頁籤就切換時, 把 click 改成 mouseover
//         $("ul.tabs li", $tab)
//             .click(function () {
//                 // 找出 li 中的超連結 href(#id)
//                 var $this = $(this),
//                     _clickTab = $this.find("a").attr("href");
//                 // 把目前點擊到的 li 頁籤加上 .active
//                 // 並把兄弟元素中有 .active 的都移除 class
//                 $this
//                     .addClass("active")
//                     .siblings(".active")
//                     .removeClass("active");
//                 // 淡入相對應的內容並隱藏兄弟元素
//                 $(_clickTab).stop(false, true).fadeIn().siblings().hide();

//                 return false;
//             })
//             .find("a")
//             .focus(function () {
//                 this.blur();
//             });
//     });
// });
window.addEventListener("resize", () => {
    // We execute the same script as before
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
});
//logoChange
$(function () {
    // console.log("222");
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
