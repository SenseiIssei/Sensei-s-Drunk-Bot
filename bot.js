const settings = require("./settings.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const players = require("./players.json");
const tournament = require("./tournament.json");

client.login(settings.token);

client.on("ready", ready =>{
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    client.user.setActivity(`Drunk Simulator`);
})

client.on("message", msg =>{
    let com = msg.content.toLowerCase().split(' ')[0];
    let args = msg.content.split(' ');
    console.log(com)
    if(com === settings.prefix + "addplayer" || com === settings.prefix + "ap" && msg.member.hasPermission("ADMINISTRATOR")){
        console.log("Added Player!")
        //addplayer || ap @user1
        let users = msg.mentions.users.array();
        let name = args[0];
        msg.guild.roles.create({name : name}).then(role =>{
            for(let i = 0; i < users.length; i++){
                msg.guild.members.cache.get(users[i].id).add(role);
            }
            players.players.push({player : name, role : role.id});
            fs.writeFile("players.json", JSON.stringify(players, ' ', 2), function(err){
                if(err) console.log(err);
            })
            msg.reply("Player added");

        })
    }
    if(com === settings.prefix + "clearplayers" || com === settings.prefix + "cp" && msg.member.hasPermission("ADMINISTRATOR")){
        for(let i = 0; i < players.players.length; i++){
            msg.guild.roles.cache.delete(role => role.name === players[i]);
        }
        players.players = [];
        fs.writeFile("players.json", JSON.stringify(players, ' ', 2), function(err){
            if(err) console.log(err);
        })
        msg.reply("Players were cleared");

    }
    if(com === settings.prefix + "pingplayer" && msg.member.hasPermission("ADMINISTRATOR")){
        //pingTeam @playerName
        let playerS = msg.mentions.roles.array()[0];
        for(let i = 0; i < players.players.member;i++){
            let player = msg.mentions.members.array();
            msg.channel.send(player);
        }
        msg.channel.send(`<@&${playerS.id}> get ready to play!`);
    }
    if(com === settings.prefix + "nextround" && msg.member.hasPermission("ADMINISTRATOR")){
        //nextRound @won1 @won2
        let player = msg.mentions.roles.array();
        for(let i = 0; i < tournament.tournament.length; i++){
            let won = false;
            for(let j = 0; j < player.length; j++){
                if(player[j].id === tournament.tournament[i].role){
                    won = true;
                }
            }
            if(!won){
                tournament.tournament.splice(i, 1);
                fs.writeFile("tournament.json", JSON.stringify(tournament, ' ', 2), function(err){
                    if(err) console.log(err);
                })
                i--;
            }
            console.log(won);
        }
        if(tournament.tournament.length === 1){
            let embed = new Discord.RichEmbed();
            embed.setDescription(`Winner : ${tournament.tournament[0].player}`);
            msg.channel.send(embed);

        }
        else{
            let embed = new Discord.RichEmbed();
            embed.setTitle("Tournament bracket");
            let desc = '';
            for(let i = 0; i < tournament.tournament.length; i++){
                if(i % 2 === 0 || i !== 0){
                    desc += "\n                   |";
                }
                desc += "\n" + tournament.tournament[i].player + "-------------------------";
            }
            embed.setDescription(desc);
            msg.channel.send(embed);
        }
    }
    if(com === settings.prefix + "serverbooster"){
        // let serverbooster = msg.guild.members.array();
        // if (serverbooster.premiumSince) {
        //     for(let i = 0; i < serverbooster.length;i++) {
        //         msg.channel.send(serverbooster);
        //     }
        // }
        const boostedUsers = msg.guild.members.array().filter(member => member.roles.find(role => role.name === 'Server Booster'));
        for(let i = 0; i < boostedUsers.length;i++){
           msg.channel.send(boostedUsers);
        }
    }

})

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

client.on("raw", packet => {
    if (!["MESSAGE_REACTION_ADD"].includes(packet.t)) return;
    const channel = client.channels.get(packet.d.channel_id);

    if (channel.messages.has(packet.d.message_id)) return;
    channel.fetchMessage(packet.d.message_id).then(message => {
        const emoji = packet.d.emoji.id
            ? `${packet.d.emoji.name}:${packet.d.emoji.id}`
            : packet.d.emoji.name;
        const reaction = message.reactions.get(emoji);
        if (packet.t === "MESSAGE_REACTION_ADD") {
            client.emit(
                "messageReactionAdd",
                reaction,
                client.users.get(packet.d.user_id)
            );
        }
    });
});