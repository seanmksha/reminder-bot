const discord = require("discord.js");
const {
    prefix,
    key
} = require('./config.json');
const client = new discord.Client;
//Private messages, in gitignore
const CustomMessages = require("./casual_messages/CustomMessages.js");
const TimeHandler = require("./time/TimeHandler.js");
const ScheduleHandler = require("./time/ScheduleHandler.js");
const MusicHandler = require("./music/MusicHandler.js");
const AdminHandler = require("./admin/admin.js");


const url = "mongodb://localhost:27017/AllPurposeDiscord";
const MongoClient = require('mongodb').MongoClient;

var secretMessageClient = new CustomMessages(client,"./casual_messages/privateMessage.json");
var adminClient = new AdminHandler(client,secretMessageClient);
var timeMessageClient;
var scheduleHandler;
var musicHandler;


var dbo;
MongoClient.connect(url,(err,db)=>{
    if(err){
        throw err;
    }    
    dbo = db.db("AllPurposeDiscord");
    timeMessageClient= new TimeHandler(client,dbo);
    scheduleHandler = new ScheduleHandler(client,dbo);
    musicHandler = new MusicHandler(client,dbo);
    
    setInterval(()=>
        timeMessageClient.pollTimestamp()
    ,1000,url);
});

client.on("message", message => {

    if(message.author.bot|| message.author.id==client.user.id || message.member==null){
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
    musicHandler.processChat(message);
});

client.on("guildMemberAdd", member=>{
    const channel = member.guild.channels.find(ch=>ch.name === 'public');
    if(!channel)return;
    channel.send(`Welcome to the server, ${member}`);
});


client.login(key);