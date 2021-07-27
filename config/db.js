const mongoose = require('mongoose')


const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/mystories'

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(dbUrl,
            {
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            })
        console.log(`Mongodb connected: ${conn.connection.host}`)

    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

module.exports = connectDB