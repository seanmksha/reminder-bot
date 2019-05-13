const defaultVolume = 5;
const Handler = require("../handler.js");
const ytdl = require('ytdl-core');
const prefix = "~";
module.exports= class MusicHandler extends Handler{
    constructor(client, dbo){
        super(client);
        this.queue = new Map();
        this.dbo=dbo;
        this.defaultVolume=5;
        this.volume= new Map();
        /*
        this.dbo.collection("settings").find().each((err,doc)=>{
                if(err)throw err;
                if(doc==null)return;
                //set default volume
                if(!doc.defaultVolume){
                    this.volumes.set(doc.guildId,doc.defaultVolume);
                }
            }
       
        );*/
    }

    async processChat(message){
        var lowercase = message.content.toLowerCase();
        if(!message.content.startsWith(prefix)){
            return;
        }
        /*if(message.isMentioned(client.user) && lowercase.includes("!asobi")){
            const channel = message.author.channel;
            if (!channel) return console.error("The channel does not exist!");
             channel.join().then(connection => {
                // Yay, it worked!
                message.channel.send("Joined "+channel);
            }).catch(e => {
    
            console.error(e);
            });
        }*/
        const serverQueue = this.queue.get(message.guild.id);

        if(lowercase.startsWith(`${prefix}play`)){
            this.execute(message,serverQueue);
        }
        else if(lowercase.startsWith(`${prefix}skip`)){
            this.skip(message,serverQueue);
        }
        else if(lowercase.startsWith(`${prefix}stop`)){
            this.stop(message, serverQueue);
        }
        else if(lowercase.startsWith(`${prefix}setdefaultvolume`)){
            //this.setDefaultVolume(message);
        }
        else if(lowercase.startsWith(`${prefix}setvolume`)){
            this.setVolume(message);
        }
        else if(lowercase.startsWith(`${prefix}join`)){
            this.join(message);
        }
        else if(lowercase.startsWith(`${prefix}leave`)){
            this.leave(message);
        }
    }

    setVolume(message){
        const args = message.content.split(" ");
        const vol = parseInt(args[1]);
        //doesn't support multiserver
        this.defaultVolume = vol;
    }
    async execute(message,serverQueue){
        const args = message.content.split(" ");
        if(!this.checkPermissions(args,message)|| !this.checkIfInVoice(args,message)){
            return;
        }

        const songInfo = await ytdl.getInfo(args[1]);
        const song = {
            title: songInfo.title,
            url: songInfo.video_url
        }
        if(!this.volume.has(message.member.guild.id)){
            this.volume.set(message.member.guild.id,defaultVolume);
        }
        if(!serverQueue){
            return message.channel.send("Not part of a channel");
        }   
        else{
            serverQueue.songs.push(song);
            this.play(message.guild,serverQueue.songs[0]);
            return message.channel.send(`${song.title} has been added to the queue`);
        }
       
    }
    checkIfInVoice(args,message){
        if(!this.queue.has(message.guild.id)){
            message.channel.send("I'm currently not inside a voice channel, type !join when you are inside one");
            return false;
        }
        

        return true;
    }

    checkPermissions(args,message){
        const voiceChannel = message.member.voiceChannel;
        var serverQueue = this.queue.get(message.guild.id);
        if(!voiceChannel){
            message.channel.send("You need to be in a voice channel to play music");
            return false;
        }
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has("CONNECT")||!permissions.has("SPEAK")){
            message.channel.send("I need the permissions to join and speak in the voice channel you currently are in");
            return false;
        }
        return true;
    }

    async join(message){
        const args = message.content.split(" ");
        if(!this.checkPermissions(args,message)){
            return;
        }
        this.dbo.collection("settings").find().each((err,doc)=>{
            if(err)throw err;
            if(doc==null)return;
            //set default volume
            if(!doc.defaultVolume){
                this.volume.set(doc.guildId,doc.defaultVolume);
            }
        });
        this.volume.set(message.member.guild.id,defaultVolume);
        const voiceChannel = message.member.voiceChannel;
        voiceChannel.join().then(connection=>{
            const construct = {
                textChannel : message.channel,
                voiceChannel : voiceChannel,
                connection : connection,
                songs: [],
                volume: this.volume.get(message.member.guild.id),
                playing:false
            };
            this.queue.set(message.guild.id,construct);
            message.channel.send("Joined "+voiceChannel);
        }).catch(e => {
            console.error(e);
           
        });
    }
    async leave(message){
        if(this.queue.has(message.guild.id)){
            const serverQueue = this.queue.get(message.guild.id);
            this.queue.delete(message.guild.id);
            serverQueue.voiceChannel.leave();
            message.channel.send("Leaving "+serverQueue.voiceChannel);
        }

    }

    play(guild,song){
        const serverQueue = this.queue.get(guild.id);
        if(!song){
            return;
        }
        const dispatcher = serverQueue.connection.playStream(ytdl(song.url)).on(
            "end",()=>{
                console.log("music ended");
                serverQueue.songs.shift();
                if(serverQueue.length>0){
                    play(guild, serverQueue.songs[0]);
                }
            }
        ).on("error", error=>{
            console.error(error);
        });
        dispatcher.setVolumeLogarithmic(serverQueue.volume/5);
    }

    skip(message,serverQueue){
        const args = message.content.split(" ");
        if(!this.checkIfInVoice(args,message)){
            return;
        }
        if(!serverQueue||!serverQueue.songs.length==0){
            return message.channel.send("There is no song to skip");
        }
        message.channel.send("Song skipped");
        serverQueue.connection.dispatcher.end();
    }

    stop(message,serverQueue){
        if(!message.member.voiceChannel){
            return message.channel.send("You have to be in a voice channel");
        }
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
}
    
