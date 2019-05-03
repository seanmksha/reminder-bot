const discord = require("discord.js");
const client = new discord.Client;
//Create a file key.js that exports your discord token
const key = require("./key.js");
//Private messages, in gitignore
const CustomMessages = require("./casual_messages/CustomMessages.js");
const TimeMessages = require("./time/TimeMessages.js");
const music = require("./music/music.js");
const AdminHandler = require("./admin/admin.js");
var url = "mongodb://localhost:27017/reminders";


var secretMessageClient = new CustomMessages(client,"./casual_messages/privateMessage.json");
var timeMessageClient = new TimeMessages(client, "mongodb://localhost:27017/reminders");
var adminClient = new AdminHandler(client,secretMessageClient);
client.on("message", message => {
    if(message.author.id==client.user.id || message.member==null){
        return;
    }
    adminClient.processChat(message);
    timeMessageClient.processChat(message);
    secretMessageClient.processChat(message);
    music.chat(message,client);
});

client.on("guildMemberAdd", member=>{
    const channel = member.guild.channels.find(ch=>ch.name === 'public');
    if(!channel)return;
    channel.send(`Welcome to the server, ${member}`);
});


client.login(key);