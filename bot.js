const discord = require("discord.js");
const client = new discord.Client;
//Create a file key.js that exports your discord token
const key = require("key.js");

client.on("message", message => {
    if(message.content == "Hi Bot"){
        message.reply("Hello World");
    }
    else if(message.content == "Hello Bot" ){
        message.reply("Hello "+message.member.toString()+"!");
    }
});

client.login(key);