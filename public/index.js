//import { json } from "body-parser";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getDatabase, ref, set, serverTimestamp, onValue, query, orderByKey, orderByChild, limitToFirst, limitToLast, remove, update} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

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
const thumbColor_cookieName = "circle_thumbColor";

var currentUrl = window.kly.url;
const dbPath = "userVisit/" + currentUrl + "/";
const dbCommentPath = "comments/" + currentUrl + "/";

var userId = setUserIDCookie();
var [userInitial, userName] = generateRandomInitialsAndNames();
var userInitial = setOrGetInitialsCookie(userInitial);
var userStatus = "anonymous";
var randomThumbColor = generateRandomColorThumb();
var thumbColor = setOrGetThumbColorCookie(randomThumbColor);
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

function generateRandomColorThumb(){
    var thumbColor = getCookie(thumbColor_cookieName);
    if (thumbColor != '' && thumbColor != null) {
        return thumbColor;
    }

    const thumbColors = [
        '#ff5733', // tomato
        '#c70039', // crimson
        '#900c3f', // maroon
        '#ffc0cb', // pink
        '#800000', // navy
        '#4b0082', // indigo
        '#282828', // slate grey
        '#4682b4', // steel blue
        '#0000ff', // blue
        '#00ff00', // lime
        '#008000', // green
        '#00ffff', // aqua
        '#008080', // teal
        '#000080', // navy
        '#800080', // purple
        '#008080', // cyan
        '#ffa500', // orange
        '#daa520', // goldenrod
        '#808080', // grey
        '#b8860b', // dark goldenrod
        '#a9a9a9', // dark grey
        '#a0522d', // sienna
        '#add8e6', // light blue
        '#800080', // purple
        '#6a5acd', // slate blue
        '#6b8e23', // olive drab
    ];
    const randomThumbColor = thumbColors[Math.floor(Math.random() * thumbColors.length)];

    return randomThumbColor;
}
// Function to update user activity when the page is loaded
function updateUserActivity() {
    const userAgent = navigator.userAgent;
    const { browserName, browserVersion, osName } = parseUserAgent(userAgent);    

    set(ref(database, dbPath + userId), {
        userid: userId,
        initial: userInitial,
        thumbColor: thumbColor,
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
        var userList = Array();
        var userTimelapse = "online";

        snapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();
            const initials = userData.initial;
            const thumbColor = userData.thumbColor ? userData.thumbColor : '#808080';
            const timestamp = userData.last_update;            
            dt.push(userData);
            const timeDifferenceInSeconds = Math.floor((currentTime - timestamp) / 1000);
            if (timeDifferenceInSeconds <= 300) { //less than 5 min
                userActivityList.push({ initials, timeDifferenceInSeconds, thumbColor });
                activeUsers++; // Increment the row count for each active user child
            }else if(timeDifferenceInSeconds<=3600){ //less than 1 hour
                userTimelapse = "aktif " + parseInt(timeDifferenceInSeconds/60) + " menit yang lalu";
            }else if(timeDifferenceInSeconds<=86400){ //less than 24 hour
                userTimelapse = "aktif " + parseInt(timeDifferenceInSeconds/3600) + " jam yang lalu";
            }else{
                userTimelapse = "offline";
            }
            allUsers++; // Increment the row count for each child

            //add user detail list
            userList.push(`
                <div class="chat-item">
                    <div class="avatar" style="background-color: ${thumbColor}">
                        <span>`+userData.initial+`</span>
                    </div>
                    <div class="chat-content">
                        <span>`+userTimelapse+`</span>
                        <p>`+userData.name+`</p>
                    </div>
                </div>
            `);

        });

        // Display only the last 5 users in userActivityList
        if (userActivityList.length > 5) {
            userActivityList.splice(0, userActivityList.length - 5);
        }

        const initialsDisplay = userActivityList.map((user) => {      
            let thumbColor = user.thumbColor ? user.thumbColor : '#808080';            
            return `<li style="background-color: ${thumbColor}"><span>${user.initials}</span></li>`;                
        }).join(' ');
        document.getElementById('user-initials').innerHTML = initialsDisplay + `<span id="active-user">` +activeUsers+` user sedang aktif</span>`;

        // Log user activity list and time differences to the console
        console.log(userActivityList);
        console.log('Row Count:', allUsers);
        //document.getElementById('active-user').innerHTML = activeUsers;
        document.getElementById('all-user').innerHTML = allUsers;

        document.getElementById('debug-row').textContent = JSON.stringify(dt, undefined, 2);
        document.getElementsByClassName('viewer-container')[0].innerHTML = userList.join(' ');
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

function setOrGetThumbColorCookie(thumbColor) {
    const cookieName = thumbColor_cookieName;
    const existingThumbColor = getCookie(cookieName);

    if (!existingThumbColor) {
        // Set the user's initials as a cookie if not already set
        document.cookie = `${cookieName}=${thumbColor}; expires=${getCookieExpiration(7)}`;
        return thumbColor;
    } else {
        return existingThumbColor;
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






/**=================================== */
//comment section
/**=================================== */


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
    const currentTime = Date.now();

    onValue(query(ref(database, dbCommentPath), limitToLast(100)), (snapshot) => {
        let totalComments = 0;
        const commentsList = [];
        var userTimelapse = "";
        // snapshot.remove();
        snapshot.forEach((commentSnapshot) => {                        
            const commentData = commentSnapshot.val();
            const userInitialComment = commentData.initial;
            const userNameComment = commentData.name;
            const textcomment = commentData.textcomment;
            const timestamp = commentSnapshot.key;
            const likes = commentData.likes;
            let userThumbColor = '';
            onValue(ref(database, dbPath + commentData.userid), (snapshot) => {
                const user = snapshot.val();
                userThumbColor = user.thumbColor
            })

            const timeDifferenceInSeconds = Math.floor((currentTime - timestamp) / 1000);
            if (timeDifferenceInSeconds <= 300) { //less than 5 min
                userTimelapse = "baru saja"
            }else if(timeDifferenceInSeconds<=3600){ //less than 1 hour
                userTimelapse = parseInt(timeDifferenceInSeconds/60) + " menit yang lalu";
            }else if(timeDifferenceInSeconds<=86400){ //less than 24 hour
                userTimelapse = parseInt(timeDifferenceInSeconds/3600) + " jam yang lalu";
            }else{
                userTimelapse = "beberapa hari yang lalu";
            }
            commentsList.push({userNameComment, userInitialComment, textcomment, timestamp, userTimelapse, userThumbColor, likes})
            totalComments++;
        })

        chatContainer.innerHTML = "";
        commentsList.forEach((cmt) => {
            
            let likes = 0;
            let btnThumbsUpClass = `fa-regular fa-thumbs-up`;
            let thumbColor = cmt.userThumbColor ? cmt.userThumbColor : '#808080';            
            let style = `style="background-color: ${thumbColor};"`;            

            if(cmt.likes){
                likes = (cmt.likes).length;
                if((cmt.likes).indexOf(userId) > -1){
                    btnThumbsUpClass = `fa-solid fa-thumbs-up`;
                }
            }

            let item = `
            <div class="chat-item">
                <div class="avatar" ${style}>
                    <span>${cmt.userInitialComment}</span>
                </div>
                <div class="chat-content">
                    <span><b>${cmt.userNameComment}</b> <span>${cmt.userTimelapse}</span></span>
                    <p>${cmt.textcomment}</p>
                    <div class="comment-activity d-flex gap-1 mb-2">
                        <button data-target="${cmt.timestamp}" class="btn btn-sm btn-outline-light btn-like"><span class="like-btn"><i class="${btnThumbsUpClass}"></i> <span class="total-likes">${likes}</span></span></button>                        
                    </div>                    
                </div>
            </div>
            `;

            chatContainer.innerHTML += item;

        })
    })


}

updateCommentsList();



/**=================================== */
//Like section
/**=================================== */

function onElement(selector, eventType, callback) {
    const observer = new MutationObserver((mutations) => {
       mutations.forEach((mutation) => {
         if (mutation.type === 'childList') {
           Array.from(mutation.target.querySelectorAll(selector)).forEach((element) => {
             element.addEventListener(eventType, callback);
           });
         }
       });
    });
   
    observer.observe(document.body, { childList: true, subtree: true });
   
    // Apply the event to existing elements
    Array.from(document.body.querySelectorAll(selector)).forEach((element) => {
       element.addEventListener(eventType, callback);
    });
   }
   
   onElement('.btn-like', 'click', function() {            
        let comment_id = this.getAttribute('data-target')        
        let lastLikes = [];
        var userLikes = [];
        onValue(ref(database, dbCommentPath + comment_id), (snapshot) => {
            let likes = snapshot.val().likes;
            if(likes){
                userLikes = lastLikes.concat(likes);
            }
        })

        const useridIndex = userLikes.indexOf(userId);        

        let newUserLikes;
        if(userLikes && useridIndex > -1){
            userLikes.splice(useridIndex, 1);
            newUserLikes = userLikes;
        }else{
            newUserLikes = userLikes.concat([userId]);
        }

        if((newUserLikes).length == 0){
            newUserLikes = null;
        }

        update(ref(database, dbCommentPath + comment_id), {
            likes: newUserLikes
        });
    });
