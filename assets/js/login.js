// ********************************mail註冊********************************
async function mailSignUp() {
    const mail = document.querySelector("input[name='account_mail']").value;
    const regex =
        /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!regex.test(mail)) {
        alert("信箱格式錯誤");
        return false;
    }
    const pass = document.getElementById("mail_account_mobile").value;
    if (pass == "") {
        alert("請填寫密碼");
        return false;
    }
    const name = document.getElementById("mail_account_name").value;
    if (name == "") {
        alert("請填寫中文姓名");
        return false;
    } else {
        var reg = /^[\u4E00-\u9FA5]+$/;
        if (!reg.test(name)) {
            alert("請填寫中文姓名");
            return false;
        }
    }
    const sexColumn = document.querySelector(
        "input[name='account_gender']:checked"
    );
    if (sexColumn == null) {
        alert("請選擇性別");
        return false;
    }
    const sex = sexColumn.value;
    let Adid = 60;
    if (sessionStorage.getItem("ADid") !== undefined) {
        Adid = sessionStorage.getItem("ADid");
    }
    // console.log(Adid);
    const json = JSON.stringify({
        ID: mail,
        realname: name,
        sex: sex,
        tel: pass,
        ADid: Adid,
    });
    await axios
        .post("https://funday.asia/api/Application.asp", json)
        .then((res) => {
            // console.log(res);
            if (res.data.StateId == 0) {
                alert("此帳號已註冊，請進行登入");
                document.getElementById("myModal02").classList.add("none");
                document.getElementById("myModal09").classList.remove("none");
            } else {
                document.cookie = `phone = ${pass}`;
                sessionStorage.setItem("phone", pass);
                loginTo(myModal02, myModal03);
            }
        });
}
// ********************************FB SDK Login & Logout & UserInfo********************************
function fbLogin(fbLogin) {
    FB.getLoginStatus(
        function (response) {
            // console.log(response);
            if (response.status == "connected") {
                GetFbProfile(fbLogin);
            } else if (
                response.status === "not_authorized" ||
                response.status === "unknown"
            ) {
                //未授權或用戶登出FB網站才讓用戶執行登入動作

                FB.login(function (response) {
                    //console.log(response);
                    if (response.status === "connected") {
                        GetFbProfile();
                    } else {
                        alert("Facebook帳號無法登入");
                    }
                });
            }
        },
        { scope: "email" }
    );
}
function fbLogout() {
    FB.getLoginStatus(function (response) {
        if (response && response.status === "connected") {
            FB.logout(function (response) {
                document.location.reload();
            });
        }
    });
}
function GetFbProfile(fbLogin) {
    //FB.api()使用說明：https://developers.facebook.com/docs/javascript/reference/FB.api
    //取得用戶個資
    FB.api("/me", "GET", { fields: "id,email" }, function (user) {
        //user物件的欄位：https://developers.facebook.com/docs/graph-api/reference/user
        if (user.error) {
            // console.log(response);
        } else {
            // console.log(user);
            sessionStorage.setItem("id", `FB${user.id}`);
            sessionStorage.setItem("email", `${user.email}`);
            if (fbLogin !== "fbLogin") {
                loginTo(myModal01, myModal06);
            }
        }
    });
}
// ********************************FB註冊********************************

async function fbSignUp() {
    const fbid = sessionStorage.getItem("id");
    const mail = sessionStorage.getItem("email");
    const pass = document.getElementById("fb_account_mobile").value;
    if (pass == "") {
        alert("請填寫密碼");
        return false;
    }
    const name = document.getElementById("fb_account_name").value;
    if (name == "") {
        alert("請填寫中文姓名");
        return false;
    }
    const sexColumn = document.querySelector(
        "input[name='account_gender']:checked"
    );
    if (sexColumn == null) {
        alert("請選擇性別");
        return false;
    }
    const sex = sexColumn.value;
    let Adid = 60;
    if (sessionStorage.getItem("ADid") !== undefined) {
        Adid = sessionStorage.getItem("ADid");
    }
    const json = JSON.stringify({
        ID: fbid,
        FBFemail: mail,
        realname: name,
        sex: sex,
        tel: pass,
        ADid: Adid,
    });
    await axios
        .post("https://funday.asia/api/Application.asp", json)
        .then((res) => {
            // console.log(res);
            if (res.data.StateId == 0) {
                alert("此帳號已註冊，請進行登入");
                loginTo(myModal06, myModal09);
            } else {
                document.cookie = `phone = ${pass}`;
                sessionStorage.setItem("phone", pass);
                loginTo(myModal06, myModal03);
            }
        });
}

// ********************************google註冊********************************

async function handleCredentialResponse(response) {
    const token = response.credential;
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );
    const data = await JSON.parse(jsonPayload);

    axios
        .post(
            ` https://funday.asia/api/GoogleOAuth/IDCheck.asp?id=${data.sub}&name=${data.name}&email=${data.email}`
        )
        .then((res) => {
            const state = res.data.State;
            if (state === "0") {
                sessionStorage.setItem("email", res.data.id);
                loginTo(myModal01, myModal06);
            } else {
                const id = res.data.id;
                axios
                    .get(
                        `https://webaspapi.funday.asia/api/User/Login?GoogleID=${id}`
                    )
                    .then((res) => {
                        // loginTo(myModal06, null);
                        document
                            .getElementById("join_button")
                            .classList.add("none");
                        document
                            .getElementById("menu")
                            .classList.remove("none");
                        sessionStorage.setItem("mindx", res.data.Content.Mindx);
                        sessionStorage.setItem("cindx", res.data.Content.Cindx);
                        sessionStorage.setItem(
                            "nickName",
                            res.data.Content.Nickname
                        );
                        sessionStorage.setItem("sex", res.data.Content.Sex);
                        sessionStorage.setItem("pic", res.data.Content.Pic);
                        localStorage.setItem("fdtk", res.data.Content.Token);
                        sessionStorage.removeItem("free");
                        let hash = window.location.href;
                        if (hash.indexOf("landing") > -1) {
                            location.href = `https://tube.funday.asia/`;
                        } else {
                            window.location.reload();
                        }
                    });
            }
        });
}

async function googleSignUp() {
    const mail = sessionStorage.getItem("email");
    const pass = document.getElementById("google_account_mobile").value;
    if (pass == "") {
        alert("請填寫密碼");
        return false;
    }
    const name = document.getElementById("google_account_name").value;
    if (name == "") {
        alert("請填寫中文姓名");
        return false;
    }
    const sexColumn = document.querySelector(
        "input[name='account_gender']:checked"
    );
    if (sexColumn == null) {
        alert("請選擇性別");
        return false;
    }
    const sex = sexColumn.value;
    let Adid = 60;
    if (sessionStorage.getItem("ADid") !== undefined) {
        Adid = sessionStorage.getItem("ADid");
    }
    const json = JSON.stringify({
        ID: mail,
        realname: name,
        sex: sex,
        tel: pass,
        ADid: Adid,
    });
    await axios
        .post("https://funday.asia/api/Application.asp", json)
        .then((res) => {
            if (res.data.StateId === "0") {
                alert(res.data.StateMessage);
                loginTo(myModal06, myModal09);
            } else {
                document.cookie = `phone = ${pass}`;
                sessionStorage.setItem("phone", pass);
                loginTo(myModal06, myModal03);
            }
        });
}
// ********************************驗證信檢查********************************

function joinCheck(status) {
    if (status == "origin") {
        const number = document.getElementById("check_account_mobile").value;
        const json = JSON.stringify({
            chk: number,
        });
        axios
            .post("https://funday.asia/api/JoinCheck.asp", json)
            .then((res) => {
                // console.log(res);
                // console.log(number);
                if (res.data.StateId == 0) {
                    alert("驗證碼錯誤");
                } else {
                    alert("成功加入");
                    location.href = "https://tube.funday.asia/thankyou.html";
                }
            });
    } else if (status == "new") {
        const number = document.getElementById("new_account_mobile").value;
        const json = JSON.stringify({
            chk: number,
        });
        axios
            .post("https://funday.asia/api/JoinCheck.asp", json)
            .then((res) => {
                // console.log(res);
                // console.log(number);
                if (res.data.StateId == 0) {
                    alert("驗證碼錯誤");
                } else {
                    alert("成功加入");
                    location.href = "https://tube.funday.asia/thankyou.html";
                }
            });
    }
}

// ********************************修改手機&重發驗證信********************************
function changeMobile() {
    const newPhone = document.getElementById("new_mobile_number").value;
    const oldPhone = sessionStorage.getItem("phone");
    // console.log(newPhone);
    if (newPhone == "") {
        alert("請輸入驗證碼");
    } else {
        // console.log(oldPhone);
        const json = JSON.stringify({
            EditTel: newPhone,
            Tel: oldPhone,
        });
        axios
            .post("https://funday.asia/api/TelResend.asp", json)
            .then((res) => {
                // console.log(res);
            });
    }
}

// ********************************登入********************************
// async function mailLoginCheck() {
//     const account = document.getElementById("login_account").value;
//     const pass = document.getElementById("login_pass").value;
//     const json = JSON.stringify({
//         ID: account,
//         password: pass,
//         FBID: "",
//     });
//     await axios.post("https://funday.asia/api/Member.asp", json).then((res) => {
//         console.log(res);
//         if (res.data.StateId == 0) {
//             alert("帳號或密碼錯誤");
//         } else {
//             loginTo(myModal09, null);
//             document.getElementById("join_button").classList.add("none");
//             document.getElementById("menu").classList.remove("none");
//             sessionStorage.setItem("mindx", res.data.mindx);
//             sessionStorage.setItem("cindx", res.data.cindx);
//             sessionStorage.setItem("nickName", res.data.nickname);
//             sessionStorage.setItem("sex", res.data.sex);
//             sessionStorage.setItem("pic", res.data.pic);
//             sessionStorage.removeItem("free");
//             sessionStorage.removeItem("id");
//             sessionStorage.removeItem("email");
//             let hash = window.location.href;
//             if (hash.indexOf("landing") > -1) {
//                 location.href = `https://tube.funday.asia/`;
//             } else {
//                 window.location.reload();
//             }
//         }
//     });
// }
async function mailLoginCheck() {
    const account = document.getElementById("login_account").value;
    const pass = document.getElementById("login_pass").value;
    await axios
        .get(
            `https://webaspapi.funday.asia/api/User/Login?ID=${account}&Password=${pass}`
        )
        .then((res) => {
            console.log(res);
            if (res.data.IsSuccess) {
                loginTo(myModal09, null);
                document.getElementById("join_button").classList.add("none");
                document.getElementById("menu").classList.remove("none");
                sessionStorage.setItem("mindx", res.data.Content.Mindx);
                sessionStorage.setItem("cindx", res.data.Content.Cindx);
                sessionStorage.setItem("nickName", res.data.Content.Nickname);
                sessionStorage.setItem("sex", res.data.Content.Sex);
                sessionStorage.setItem("pic", res.data.Content.Pic);
                localStorage.setItem("fdtk", res.data.Content.Token);
                sessionStorage.removeItem("free");
                sessionStorage.removeItem("id");
                sessionStorage.removeItem("email");
                let hash = window.location.href;
                if (hash.indexOf("landing") > -1) {
                    location.href = `https://tube.funday.asia/`;
                } else {
                    window.location.reload();
                }
            } else {
                alert("帳號或密碼錯誤");
            }
        });
}
function fbLoginCheck() {
    fbLogin("fbLogin");
    setTimeout(() => {
        const id = sessionStorage.getItem("id");
        if (id == null) {
            alert("此Facebook帳號尚未註冊");
            loginTo(myModal09, myModal06);
        } else {
            axios
                .get(`https://webaspapi.funday.asia/api/User/Login?FBID=${id}`)
                .then((res) => {
                    // console.log(res);
                    if (res.data.IsSuccess) {
                        loginTo(myModal09, null);
                        document
                            .getElementById("join_button")
                            .classList.add("none");
                        document
                            .getElementById("menu")
                            .classList.remove("none");
                        sessionStorage.setItem("mindx", res.data.Content.Mindx);
                        sessionStorage.setItem("cindx", res.data.Content.Cindx);
                        sessionStorage.setItem(
                            "nickName",
                            res.data.Content.Nickname
                        );
                        sessionStorage.setItem("sex", res.data.Content.Sex);
                        sessionStorage.setItem("pic", res.data.Content.Pic);
                        localStorage.setItem("fdtk", res.data.Content.Token);
                        sessionStorage.removeItem("free");
                        sessionStorage.removeItem("id");
                        sessionStorage.removeItem("email");
                        let hash = window.location.href;
                        if (hash.indexOf("landing") > -1) {
                            location.href = `https://tube.funday.asia/`;
                        } else {
                            window.location.reload();
                        }
                    } else {
                        alert("此Facebook帳號尚未註冊");
                    }
                });
        }
    }, 2000);
}

// ********************************登出********************************
function logOut() {
    sessionStorage.clear("id,email,phone,mindx,cindx");
    document.getElementById("join_button").classList.remove("none");
    document.getElementById("menu").classList.add("none");
    localStorage.removeItem("fdtk");
    location.reload();
}

// ********************************忘記密碼********************************
function forgotPass() {
    const phoneColumn = document.getElementById("forgot_account_mobile");
    if (phoneColumn == "") {
        alert("請輸入手機號碼");
    } else {
        const phone = phoneColumn.value;
        axios
            .get(`https://funday.asia/api/PwdSend.asp?tel=${phone}`)
            .then((res) => {
                // console.log(res);
                if (res.data.State == 0) {
                    alert("此號碼尚未註冊");
                } else {
                    loginTo(myModal08, myModal09);
                }
            });
    }
}

// ********************************記住密碼********************************
function remember() {
    const remember_btn = document.getElementById("rememberCheck");
    const account = document.getElementById("login_account");
    const pass = document.getElementById("login_pass");
    if (remember_btn.checked) {
        sessionStorage.setItem("account", account.value);
        sessionStorage.setItem("pass", pass.value);
    } else {
        sessionStorage.clear("account", account.value);
        sessionStorage.clear("pass", pass.value);
    }
}

// ********************************登入判斷********************************

window.onload = function () {
    const user_id = sessionStorage.getItem("mindx");
    if (user_id !== null) {
        document.getElementById("join_button").classList.add("none");
        document.getElementById("menu").classList.remove("none");
    }
};
