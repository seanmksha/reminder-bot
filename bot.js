const discord = require("discord.js");
const client = new discord.Client;
//Create a file key.js that exports your discord token
const key = require("key.js");

client.on("message", message => {
    if(message.content == "Hi Bot"){
        message.reply("Hello World");
    }
});

client.login(key);