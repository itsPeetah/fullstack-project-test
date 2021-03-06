import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, subject: string, html: string) {
    // Generate test SMTP service account from ethereal.email
    // let testAccount = await nodemailer.createTestAccount();
    // console.log("NodeMailer Test Account:", testAccount); // run this once to get the test account, just to avoid spamming nodemailer's server by generating a new one per email

    // NodeMailer Test Account: {
    //     user: 'v54psflwtotpu53j@ethereal.email',
    //     pass: 'xubT4WvyKt8QH4jG4T',
    //     smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
    //     imap: { host: 'imap.ethereal.email', port: 993, secure: true },
    //     pop3: { host: 'pop3.ethereal.email', port: 995, secure: true },
    //     web: 'https://ethereal.email'
    //   }

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "v54psflwtotpu53j@ethereal.email", // generated ethereal user
            pass: "xubT4WvyKt8QH4jG4T", // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: html,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
