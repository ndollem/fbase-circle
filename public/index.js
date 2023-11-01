//import { json } from "body-parser";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getDatabase, ref, set, serverTimestamp, onValue, query, orderByKey, orderByChild, limitToFirst, limitToLast, remove  } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "AIzaSyCLm01sBd7KezRtjisGehIx3WPRyPWZWio",
    authDomain: "kly-firebase.firebaseapp.com",
    databaseURL: "https://kly-firebase-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kly-firebase",
    storageBucket: "kly-firebase.appspot.com",
    messagingSenderId: "990064158101",
    appId: "1:990064158101:web:ed3692e315b7e64a1b829c",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database
const database = getDatabase(firebaseApp);

// Setup necessary constant
const userID_cookieName = "circle_userID";
const initial_cookieName = "circle_initial";
var currentUrl = window.kly.url;
const dbPath = "userVisit/" + currentUrl + "/";
const dbCommentPath = "comments/" + currentUrl + "/";

var userId = setUserIDCookie();
var [userInitial, userName] = generateRandomInitialsAndNames();
var userInitial = setOrGetInitialsCookie(userInitial);
var userStatus = "anonymous";


// Function to generate random initials and names for anonymous users
function generateRandomInitialsAndNames() {
    const colors = ["Amber", "Blue", "Cyan", "Dandelion", "Emerald", "Fuchsia", "Gold", "Heliotrope", "Indigo", "Jade", "Khaki", "Lavender", "Magenta", "Navy", "Orange", "Purple", "Quartz", "Red", "Sienna", "Teal", "Ultramarine", "Violet", "White", "Xanadu", "Yellow", "Zaffre"];
    const animals = ["Alligator", "Bear", "Cat", "Dog", "Elephant", "Fox", "Giraffe", "Hippopotamus", "Ibis", "Jaguar", "Kangaroo", "Lion", "Monkey", "Newt", "Ostrich", "Panda", "Quail", "Rhinoceros", "Snake", "Tiger", "Umbrellabird", "Vulture", "Walrus", "Xenarthra", "Yak", "Zebra"];

    var initial = getCookie(initial_cookieName);
    if (initial != '' && initial != null) {
        const initialColor = colors.find((color) => color.startsWith(initial.charAt(0).toUpperCase()));
        const initialAnimal = animals.find((animal) => animal.startsWith(initial.charAt(1).toUpperCase()));

        if (initialColor && initialAnimal) {
            const name = `${initialColor} ${initialAnimal}`;
            return [initial, name];
        }
    }

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const initials = randomColor.charAt(0) + randomAnimal.charAt(0);
    const name = `${randomColor} ${randomAnimal}`;

    return [initials, name];
}

// Function to update user activity when the page is loaded
function updateUserActivity() {
    const userAgent = navigator.userAgent;
    const { browserName, browserVersion, osName } = parseUserAgent(userAgent);

    set(ref(database, dbPath + userId), {
        userid: userId,
        initial: userInitial,
        name: userName,
        userAgent: navigator.userAgent,
        browserName: browserName,
        browserVersion: browserVersion,
        operatingSystem: osName,
        ip: window.kly.ip,
        last_update: serverTimestamp()
    });
    displayActiveUsers();
}

// Function to display active users' initials
function displayActiveUsers() {
    const currentTime = Date.now();
    const threshold = currentTime - 600000; // 10 minutes in milliseconds

    onValue(ref(database, dbPath), (snapshot) => {
        const userActivityList = [];
        let allUsers = 0; // Initialize row count
        let activeUsers = 0; // Initialize row count
        var dt = Array();

        snapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();
            const initials = userData.initial;
            const timestamp = userData.last_update;            
            dt.push(userData);
            const timeDifferenceInSeconds = Math.floor((currentTime - timestamp) / 1000);
            if (timeDifferenceInSeconds <= 300) {
                userActivityList.push({ initials, timeDifferenceInSeconds });
                activeUsers++; // Increment the row count for each active user child
            }
            allUsers++; // Increment the row count for each child

        });

        // Display only the last 5 users in userActivityList
        if (userActivityList.length > 5) {
            userActivityList.splice(0, userActivityList.length - 5);
        }

        const initialsDisplay = userActivityList.map((user) => {
            return `<li><span>${user.initials}</span></li>`;
        }).join(' ');
        document.getElementById('user-initials').innerHTML = initialsDisplay + `<span id="active-user">` +activeUsers+` user sedang aktif</span>`;

        // Log user activity list and time differences to the console
        console.log(userActivityList);
        console.log('Row Count:', allUsers);
        //document.getElementById('active-user').innerHTML = activeUsers;
        document.getElementById('all-user').innerHTML = allUsers;

        document.getElementById('debug-row').textContent = JSON.stringify(dt, undefined, 2);
    });
}

// Function to get or generate a user ID and set it as a cookie
function setUserIDCookie() {
    const cookieName = userID_cookieName;
    const existingUserID = getCookie(cookieName);
    if (!existingUserID) {
        // Generate a new user ID if one doesn't exist
        const generatedUserID = getAuth(firebaseApp).currentUser ? getAuth(firebaseApp).currentUser.uid : 'anon-' + Math.floor(Math.random() * 10000);

        // Set the user ID as a cookie that expires in 90 days (adjust as needed)
        document.cookie = `${cookieName}=${generatedUserID}; expires=${getCookieExpiration(90)}`;
        return generatedUserID;
    } else {
        return existingUserID;
    }
}

// Function to set or retrieve user's initials from a cookie
function setOrGetInitialsCookie(userInitial) {
    const cookieName = initial_cookieName;
    const existingInitials = getCookie(cookieName);

    if (!existingInitials) {
        // Set the user's initials as a cookie if not already set
        document.cookie = `${cookieName}=${userInitial}; expires=${getCookieExpiration(7)}`;
        return userInitial;
    } else {
        return existingInitials;
    }
}

// Function to get a cookie value by name
function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].split("=");
        if (cookie[0] === name) {
            return cookie[1];
        }
    }
    return null;
}

// Function to get a cookie expiration date
function getCookieExpiration(days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    return d.toUTCString();
}

// Breakdown information from browser User Agent
function parseUserAgent(userAgent) {
    const browserPatterns = {
        Edge: /Edg/i,
        Chrome: /Chrome/i,
        Firefox: /Firefox/i,
        Safari: /Safari/i,
        Opera: /Opera|OPR/i,
        IE: /Trident|MSIE/i,
    };

    const osPatterns = {
        Windows: /Windows/i,
        macOS: /Mac OS X/i,
        iOS: /iPhone|iPad/i,
        Android: /Android/i,
        Linux: /Linux/i,
    };

    // Find the browser
    let browserName = "Unknown";
    let browserVersion = "Unknown";
    for (const browser in browserPatterns) {
        if (browserPatterns[browser].test(userAgent)) {
            browserName = browser;
            const versionMatch = userAgent.match(new RegExp(`${browser}(?:/| )([\\d.]+)`));
            if (versionMatch) {
                browserVersion = versionMatch[1];
            }
            break;
        }
    }

    // Find the OS
    let osName = "Unknown";
    for (const os in osPatterns) {
        if (osPatterns[os].test(userAgent)) {
            osName = os;
            break;
        }
    }

    return {
        browserName,
        browserVersion,
        osName,
    };
}

// Call updateUserActivity when the page loads
updateUserActivity();

var btnSend = document.getElementById("btn-send");
var inputComment = document.getElementById("input-comment");

inputComment.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        btnSend.click();
    }
});

btnSend.addEventListener("click", function(){
    let inputValue = inputComment.value;
    inputValue = inputValue.trim();

    if(inputValue != ''){
        addComment(inputValue);
        inputComment.value = ''
    }
})

function addComment(text){
    let commentId = new Date().getTime();
    
    set(ref(database, dbCommentPath + commentId), {
        userid: userId,
        initial: userInitial,
        name: userName,
        textcomment : text,
    });

    updateCommentsList()
}

function updateCommentsList(){
    let chatContainer = document.getElementById("chat-container");
    
    onValue(query(ref(database, dbCommentPath), limitToLast(100)), (snapshot) => {
        let totalComments = 0;
        const commentsList = [];
        // snapshot.remove();
        snapshot.forEach((commentSnapshot) => {                        
            const commentData = commentSnapshot.val();
            const userInitialComment = commentData.initial;
            const userNameComment = commentData.name;
            const textcomment = commentData.textcomment;
            const timestamp = commentSnapshot.key;
            commentsList.push({userNameComment, userInitialComment, textcomment, timestamp})
            totalComments++;
        })

        chatContainer.innerHTML = "";
        commentsList.forEach((cmt) => {
            let item = `
            <div class="chat-item">
                <div class="avatar">
                    <span>${cmt.userInitialComment}</span>
                </div>
                <div class="chat-content">
                    <span>${cmt.userNameComment} <span>${cmt.timestamp}</span></span>
                    <p>${cmt.textcomment}</p>
                </div>
            </div>
            `;

            chatContainer.innerHTML += item;
        })
    })
}

updateCommentsList();

