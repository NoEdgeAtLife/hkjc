const accountname = ""
const password = ""
const question1 = ""
const question2 = ""
const question3 = ""
const answer1 = ""
const answer2 = ""
const answer3 = ""

const securityQuestion = {};
securityQuestion[question1] = answer1;
securityQuestion[question2] = answer2;
securityQuestion[question3] = answer3;

function login() {
    document.getElementById("account").value = accountname;
    document.getElementById("password").value = password;
    document.getElementById("loginButton").click();
}

function security() {
    let question = document.getElementById("ekbaSeqQuestion").innerHTML
    if (question in securityQuestion) {
        document.getElementById("ekbaDivInput").value = securityQuestion[question];
        document.getElementById("pic_confirm").click();
        }
    else {
        console.log("Question not found");
    }
}

login()
setTimeout(security, 1000);
setTimeout(ShowDisclaimer,3000,false, true);
setTimeout(document.getElementsByClassName("welcomeDiv")[0].click(), 4000);