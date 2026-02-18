/* ======================
   DATABASE INIT
====================== */

if (!localStorage.getItem("FPAS_DB")) {
    localStorage.setItem("FPAS_DB", JSON.stringify({
        users:{
            "Admin":{password:"admin@123",role:"admin"},
            "Faculty":{password:"faculty@123",role:"faculty"}
        },
        timetable:{},
        theme:"light",
        logs:[]
    }));
}

let DB = JSON.parse(localStorage.getItem("FPAS_DB"));
let currentUser = null;

/* ======================
   INIT
====================== */

document.addEventListener("DOMContentLoaded", () => {

    populateUsers();
    applyTheme();
    generateCaptcha();
    checkLogin();

    if("serviceWorker" in navigator){
        navigator.serviceWorker.register("service-worker.js");
    }

});

/* ======================
   LOGIN SYSTEM
====================== */

function populateUsers(){
    let select=document.getElementById("username");
    select.innerHTML="";
    for(let u in DB.users){
        let opt=document.createElement("option");
        opt.value=u;
        opt.textContent=u;
        select.appendChild(opt);
    }
}

let num1,num2;

function generateCaptcha(){
    num1=Math.floor(Math.random()*10);
    num2=Math.floor(Math.random()*10);
    document.getElementById("captchaQuestion").innerText=
    `What is ${num1} + ${num2}?`;
}

function login(){
    let user=document.getElementById("username").value;
    let pass=document.getElementById("password").value;
    let cap=parseInt(document.getElementById("captchaAnswer").value);

    if(!pass) return error("Password required");
    if(cap!==num1+num2) return error("Wrong captcha");
    if(DB.users[user].password!==pass) return error("Invalid password");

    currentUser=user;
    localStorage.setItem("loggedInUser",user);
    loadDashboard();
}

function error(msg){
    document.getElementById("error").innerText=msg;
}

/* ======================
   DASHBOARD
====================== */

function loadDashboard(){
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("dashboardPage").classList.remove("hidden");
    document.getElementById("welcomeUser").innerText=currentUser;
    buildHome();
    buildTimetable();
    buildAnalytics();
}

function showTab(id){
    document.querySelectorAll(".tab").forEach(t=>t.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

/* ======================
   HOME
====================== */

function buildHome(){
    document.getElementById("home").innerHTML=
    `<h2>Welcome ${currentUser}</h2>
     <div id="clock"></div>`;
    startClock();
}

function startClock(){
    setInterval(()=>{
        document.getElementById("clock").innerText=
        "Time: "+new Date().toLocaleTimeString();
    },1000);
}

/* ======================
   TIMETABLE GRID
====================== */

function buildTimetable(){
    let days=["Mon","Tue","Wed","Thu","Fri"];
    let periods=6;

    let html="<h3>Weekly Timetable</h3><table><tr><th>Day</th>";

    for(let i=1;i<=periods;i++) html+=`<th>P${i}</th>`;
    html+="</tr>";

    days.forEach(day=>{
        html+=`<tr><td>${day}</td>`;
        for(let i=1;i<=periods;i++){
            let value=DB.timetable[day]?.[i]||"";
            html+=`<td contenteditable="true"
             onblur="saveCell('${day}',${i},this.innerText)">
             ${value}</td>`;
        }
        html+="</tr>";
    });

    html+="</table>";
    html+=`<button onclick="exportPDF()">Export PDF</button>`;
    document.getElementById("timetable").innerHTML=html;
}

function saveCell(day,period,value){
    if(!DB.timetable[day]) DB.timetable[day]={};
    DB.timetable[day][period]=value;
    saveDB();
}

/* ======================
   ANALYTICS
====================== */

function buildAnalytics(){
    document.getElementById("analytics").innerHTML=
    `<h3>Analytics</h3>
     <p>Total Users: ${Object.keys(DB.users).length}</p>
     <p>Timetable Entries: ${Object.keys(DB.timetable).length}</p>`;
}

/* ======================
   SETTINGS
====================== */

function toggleTheme(){
    DB.theme = DB.theme==="light"?"dark":"light";
    saveDB();
    applyTheme();
}

function applyTheme(){
    if(DB.theme==="dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
}

/* ======================
   EXPORT / BACKUP
====================== */

function exportPDF(){
    window.print();
}

function saveDB(){
    localStorage.setItem("FPAS_DB",JSON.stringify(DB));
}

/* ======================
   SESSION
====================== */

function checkLogin(){
    let u=localStorage.getItem("loggedInUser");
    if(u){currentUser=u;loadDashboard();}
}

function logout(){
    localStorage.removeItem("loggedInUser");
    location.reload();
}

function togglePassword(){
    let p=document.getElementById("password");
    p.type=p.type==="password"?"text":"password";
}
