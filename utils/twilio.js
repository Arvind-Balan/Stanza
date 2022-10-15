// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
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
        client.verify.v2.services('VAfcfd1d9c73c0fa1f93ac70fb5faff39c')
        .verificationChecks
        .create({to: '+91' + number, code: otp})
        .then(verification_check => console.log(verification_check.status));
        response.status=true
        res(response)
    })
}}


