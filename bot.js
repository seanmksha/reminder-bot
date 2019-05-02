const discord = require("discord.js");
const client = new discord.Client;
//Create a file key.js that exports your discord token
const key = require("./key.js");
//Private messages, in gitignore
const private = require("./private.js");


client.on("message", message => {
    var lowercase = message.content.toLowerCase();
    if(lowercase.includes("what")&& lowercase.includes("time") && lowercase.includes("is") && lowercase.includes("it")){
       var date = new Date();
       var hour = date.getHours();
       var minute = date.getMinutes();
       message.channel.send(hour+":"+minute);
    }
    //From private.js
    private.reply(message);
});

client.login(key);