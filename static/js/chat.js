/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);

const name = prompt("Username?");

/** called when connection opens, sends join info to server. */

ws.onopen = function (evt) {
  console.log("open", evt);

  let data = { type: "join", name: name };
  ws.send(JSON.stringify(data));
};

/** called when msg received from server; displays it. */

ws.onmessage = function (evt) {
  console.log("message", evt);

  let msg = JSON.parse(evt.data);
  let item;

  if (msg.type === "note") {
    item = $(`<li><i>${msg.text}</i></li>`);
  } else if (msg.type === "chat") {
    item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
  } else {
    return console.error(`bad message: ${msg}`);
  }

  $("#messages").append(item);
};

/** called on error; logs it. */

ws.onerror = function (evt) {
  console.error(`err ${evt}`);
};

/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
  console.log("close", evt);
};

/** send message when button pushed. */

$("form").submit(async function (evt) {
  evt.preventDefault();
  let data;
  if ($("#m").val() === "/joke") {
    await handleJoke();
  } else {
    data = { type: "chat", text: $("#m").val() };
  }

  ws.send(JSON.stringify(data));

  $("#m").val("");
});

async function handleJoke() {
  // send the joke to only this user (stays client side)
  try {
    const res = await axios.get("https://icanhazdadjoke.com/", {
      headers: {
        Accept: "text/plain",
      },
    });
    let item = $(`<li><b> Here's a joke for you: </b><i>${res.data}<i></li>`);
    $("#messages").append(item);
  } catch (e) {
    let err = $(`<li><i>Error retrieving joke. Please try again </i></li>`);
    $("#messages").append(err);
  }
}
