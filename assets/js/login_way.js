function loginTo(item, modal) {
    google.accounts.id.renderButton(document.getElementById("google_signup"), {
        theme: "outline",
        size: "large",
        width: "318px",
        text: "signup_with",
    });
    item.classList.toggle("none");
    if (modal !== null) {
        modal.classList.remove("none");
    }
    if ((modal !== null && modal.attributes.id.value) == "myModal09") {
        google.accounts.id.renderButton(
            document.getElementById("google_login"),
            {
                theme: "outline",
                size: "large",
                width: "360px",
                text: "signin_with",
            }
        );
    }
}

function modal_close(n) {
    if (n === 10) {
        document.getElementById(`myModal${n}`).classList.toggle("none");
    } else {
        document.getElementById(`myModal0${n}`).classList.toggle("none");
    }
}

function toVideo(item) {
    const id = item.id;
    const cate = item.attributes.name.value;
    // debugger;
    location.href = `./video.html?id=${id}&cate=${cate}`;
    if (
        sessionStorage.getItem("free") !== undefined &&
        sessionStorage.getItem("mindx") == undefined
    ) {
        let useNum = Number(sessionStorage.getItem("free")) + 1;
        sessionStorage.setItem("free", useNum);
        // sessionStorage.removeItem("free");
    }
}

function loginTo1() {
    document.getElementById("myModal01").classList.remove("none");
}
let content1 = document.getElementById(`modal-content1`);
let content2 = document.getElementById(`modal-content2`);
let content3 = document.getElementById(`modal-content3`);
let content4 = document.getElementById(`modal-content4`);
let content5 = document.getElementById(`modal-content5`);
let content6 = document.getElementById(`modal-content6`);
let content7 = document.getElementById(`modal-content7`);
let content8 = document.getElementById(`modal-content8`);
let content9 = document.getElementById(`modal-content9`);
let playBtn = document.getElementById("play_btn");

let joinBtn = document.getElementById("join_button");
// document.addEventListener("click", (e) => {
//     if (
//         content1.contains(e.target) ||
//         joinBtn.contains(e.target) ||
//         content2.contains(e.target) ||
//         content3.contains(e.target) ||
//         content4.contains(e.target) ||
//         content5.contains(e.target) ||
//         content6.contains(e.target) ||
//         content7.contains(e.target) ||
//         content8.contains(e.target) ||
//         content9.contains(e.target)
//         // playBtn.contains(e.target)
//     ) {
//         return false;
//     } else {
//         if (!document.getElementById(`myModal05`).classList.contains("none")) {
//             loginTo(myModal05, myModal02);
//         } else {
//             for (let i = 1; i < 10; i++) {
//                 document.getElementById(`myModal0${i}`).classList.add("none");
//             }
//         }
//     }
// });
