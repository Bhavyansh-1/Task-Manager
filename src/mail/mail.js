const SG = require('@sendgrid/mail')

const apiKey = process.env.SENDGRID_API_KEY

SG.setApiKey(apiKey)
const Created=(email,name)=>{
    SG.send({
        to:email,
        from:'bhavyansh2@gmail.com',
        subject:'Welcome Onboard',
        text:`Hello ${name} We welcome you to our brand new project hope you will have a great time`
    })
}
const Deleted = (email,name)=>{
    SG.send({
        to:email,
        from:'bhavyansh2@gmail.com',
        subject:'We regret',
        text:`We are Sorry ${name} for the inconvinence hope to see you back soon!` 
    })
}

module.exports={
    Deleted:Deleted,
    Created:Created
}