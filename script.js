import { db }
from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
    query,
    orderBy,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

function escapeHtml(text){

    if(text == null){
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function loadThreads(){

    const list =
        document.getElementById(
            "threadList"
        );

    if(!list) return;

    const q =
        query(
            collection(
                db,
                "threads"
            ),
            orderBy(
                "lastUpdated",
                "desc"
            )
        );

    onSnapshot(
        q,
        (snapshot)=>{

            list.innerHTML = "";

            snapshot.forEach(
                (doc)=>{

                const thread =
                    doc.data();

                const replyCount =
    thread.replies
        ? thread.replies.length + 1
        : 1;

list.innerHTML += `
<div class="thread-row">

<a
class="thread-title"
href="thread.html?id=${doc.id}">
${escapeHtml(thread.title)}
</a>

<span class="reply-count">
(${replyCount})
</span>

</div>
`;

            }
        );
    }
);
}

async function createThread(){

    const title =
    document.getElementById(
        "threadTitle"
    ).value;

const name =
    document.getElementById(
        "threadName"
    ).value;

localStorage.setItem(
    "userName",
    name
);

const message =
    document.getElementById(
        "threadMessage"
    ).value;

if(!title || !message) return;

    await addDoc(
    collection(
        db,
        "threads"
    ),
    {

        title:title,

        createdBy:
            name || "スレ主",

        firstMessage:
            message,

        createdAt:
            serverTimestamp(),

        lastUpdated:
            serverTimestamp()

    }
);

alert(
    "スレッドを作成しました"
);

location.href =
    "threads.html";

}

async function loadThreadPage(){

    const titleArea =
        document.getElementById(
            "title"
        );

    if(!titleArea) return;

    const params =
        new URLSearchParams(
            location.search
        );

    const id =
        params.get("id");

    const docRef =
        doc(
            db,
            "threads",
            id
        );

    const docSnap =
        await getDoc(
            docRef
        );

    if(
        !docSnap.exists()
    ) return;

    const thread =
        docSnap.data();

    const createdDate =
    thread.createdAt
        ? thread.createdAt
            .toDate()
            .toLocaleString("ja-JP")
        : "日時不明";

    titleArea.textContent =
        thread.title;

    const firstPost =
    document.getElementById(
        "firstPost"
    );

firstPost.innerHTML = `
<div
class="post"
id="reply-1">

<strong>

<span
onclick="quoteReply(1)"
style="cursor:pointer;color:blue;">

1

</span>

:

${escapeHtml(thread.createdBy)}

</strong>

<br>

<small>
${createdDate}
</small>

<p>
${escapeHtml(thread.firstMessage)}
</p>

</div>
`;
}

async function postReply(){

    const params =
        new URLSearchParams(
            location.search
        );

    const id =
        params.get("id");

    const name =
        document.getElementById(
            "name"
        ).value;

    localStorage.setItem(
        "userName",
        name
    );

    const message =
        document.getElementById(
            "message"
        ).value;

    if(!message) return;

    const threadRef =
        doc(
            db,
            "threads",
            id
        );

    await updateDoc(
        threadRef,
        {

            replies:
                arrayUnion({

                    name:
                        name || "名無しさん",

                    message:
                        message,

                    date:
                        new Date()
                        .toLocaleString(
                            "ja-JP"
                        )

                }),

            lastUpdated:
                serverTimestamp()

        }
    );

    document.getElementById(
        "message"
    ).value = "";

    alert(
        "投稿しました"
    );
}

function loadReplies(){

    const area =
        document.getElementById(
            "replies"
        );

    if(!area) return;

    const params =
        new URLSearchParams(
            location.search
        );

    const id =
        params.get("id");

    const threadRef =
        doc(
            db,
            "threads",
            id
        );

    onSnapshot(
        threadRef,
        (docSnap)=>{

            if(
                !docSnap.exists()
            ){
                return;
            }

            const thread =
                docSnap.data();

            area.innerHTML = "";

            if(
                !thread.replies
            ){
                return;
            }

            thread.replies.forEach(
                (reply,index)=>{

                    const replyNumber =
                        index + 2;

                    area.innerHTML += `
<div class="post"
id="reply-${replyNumber}">

<strong>

<span
onclick="quoteReply(${replyNumber})"
style="cursor:pointer;color:blue;">

${replyNumber}

</span>

:

${escapeHtml(reply.name)}

</strong>

<br>

<small>
${reply.date || "日時不明"}
</small>

<p>
${formatReplyText(reply.message)}
</p>

</div>
`;
                }
            );
        }
    );
}

function quoteReply(number){

    const textarea =
        document.getElementById(
            "message"
        );

    if(!textarea) return;

    textarea.value +=
        ">>" + number + "\n";

    textarea.focus();
}

function formatReplyText(text){

    return escapeHtml(text)

        .replace(
            />>(\d+)/g,
            '<a href="#reply-$1">>>$1</a>'
        )

        .replace(
            /\n/g,
            "<br>"
        );
}

async function firebaseTest(){

    const snapshot =
        await getDocs(
            collection(
                db,
                "threads"
            )
        );

    console.log(
        "Firebase接続成功",
        snapshot.size
    );
}

function loadSavedName(){

    const savedName =
        localStorage.getItem(
            "userName"
        );

    if(!savedName) return;

    const replyName =
        document.getElementById(
            "name"
        );

    if(replyName){

        replyName.value =
            savedName;
    }

    const threadName =
        document.getElementById(
            "threadName"
        );

    if(threadName){

        threadName.value =
            savedName;
    }
}

loadThreads();
loadThreadPage();
loadReplies();
loadSavedName();

console.log("script.js実行成功");

firebaseTest();

window.createThread =
    createThread;

window.postReply =
    postReply;

window.quoteReply =
    quoteReply;