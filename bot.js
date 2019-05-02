const discord = require("discord.js");
const client = new discord.Client;
//Create a file key.js that exports your discord token
const key = require("./key.js");
//Private messages, in gitignore
const private = require("./casual_messages/private.js/index.js.js");
const time = require("./time/time.js");
const music = require("./music/music.js");

setInterval(time.pollTimestamp,1000,client);
client.on("message", message => {
    if(message.author.id==client.user.id || message.member==null){
        return;
    }
    var lowercase = message.content.toLowerCase();
    time.main(message,client);
    private.reply(message,client);
    music.chat(message,client);
});

client.on("guildMemberAdd", member=>{
    const channel = member.guild.channels.find(ch=>ch.name === 'public');
    if(!channel)return;
    channel.send(`Welcome to the server, ${member}`);
});


client.login(key);