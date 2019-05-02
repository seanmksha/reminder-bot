const discord = require("discord.js");
const client = new discord.Client;
//Create a file key.js that exports your discord token
const key = require("./key.js");
//Private messages, in gitignore
const private = require("./casual_messages/private.js");
const time = require("./time/time.js");

client.on("message", message => {
    var lowercase = message.content.toLowerCase();
    time.main(message);
    private.reply(message);
});

client.login(key);