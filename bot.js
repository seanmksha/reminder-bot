const discord = require("discord.js");
const client = new discord.Client;
//Create a file key.js that exports your discord token
const key = require("./key.js");
//Private messages, in gitignore
const private = require("./casual_messages/private.js");
const time = require("./time/time.js");

setInterval(time.pollTimestamp,1000,client);
client.on("message", message => {
    var lowercase = message.content.toLowerCase();
    time.main(message,client);
    private.reply(message);
});

client.on("guildMemberAdd", member=>{
    const channel = member.guild.channels.find(ch=>ch.name === 'public');
    if(!channel)return;
    channel.send(`Welcome to the server, ${member}`);
});


client.login(key);