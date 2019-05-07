const discord = require("discord.js");
const client = new discord.Client;
//Create a file key.js that exports your discord token
const key = require("./key.js");
//Private messages, in gitignore
const CustomMessages = require("./casual_messages/CustomMessages.js");
const TimeHandler = require("./time/TimeHandler.js");
const ScheduleHandler = require("./time/ScheduleHandler.js");
const music = require("./music/MusicHandler.js");
const AdminHandler = require("./admin/admin.js");
var url = "mongodb://localhost:27017/AllPurposeDiscord";
const MongoClient = require('mongodb').MongoClient;

var secretMessageClient = new CustomMessages(client,"./casual_messages/privateMessage.json");
var timeMessageClient;
var scheduleHandler;
var adminClient = new AdminHandler(client,secretMessageClient);
var dbo;
MongoClient.connect(url,(err,db)=>{
    if(err){
        throw err;
    }    
    dbo = db.db("AllPurposeDiscord");
    timeMessageClient= new TimeHandler(client,dbo);
    scheduleHandler = new ScheduleHandler(client,dbo);

    
    setInterval(()=>
        timeMessageClient.pollTimestamp()
    ,1000,url);
});

client.on("message", message => {
    if(message.author.id==client.user.id || message.member==null){
        return;
    }
    adminClient.processChat(message);
    if(scheduleHandler!=null){
        scheduleHandler.processChat(message);
    }
    if(timeMessageClient!=null){
        timeMessageClient.processChat(message);
    }

    secretMessageClient.processChat(message);
    music.chat(message,client);
});

client.on("guildMemberAdd", member=>{
    const channel = member.guild.channels.find(ch=>ch.name === 'public');
    if(!channel)return;
    channel.send(`Welcome to the server, ${member}`);
});


client.login(key);