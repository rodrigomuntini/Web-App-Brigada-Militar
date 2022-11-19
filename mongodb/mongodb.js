const mongoose = require('mongoose');

async function main() {
    mongoose.connect('mongodb+srv://default:uuaWrwo6deEx7hSg@clusterapinovorumo.7juyycj.mongodb.net/defaultdb?retryWrites=true&w=majority')
        .then((mongoose) => {
            console.log("::MongoDB connected successfully!::");
        });
}

module.exports = main;