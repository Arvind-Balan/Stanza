
const accountSid = process.env.ACCOUNTS_ID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports={getOtp:(number)=>{
    // console.log(client);
 return new Promise ((res,rej)=>{
    let response={}
    client.verify.v2.services(process.env.SERVICE_ID)
    .verifications
    .create({to: '+91' + number, channel: 'sms'})
    .then(verification => console.log(verification.status));
    console.log("wrkd");

 }).catch((e)=>{
    console.log(e);
 })
},
checkOtp:(otp,number)=>{
    return new Promise((res,rej)=>{
       let response={}
        client.verify.v2.services('VAf443d5cf1a51e07af4983b7ff6ba4136')
        .verificationChecks
        .create({to: '+91' + number, code: otp})
        .then(verification_check => console.log(verification_check.status));
        response.status=true
        res(response)
    })
}}


