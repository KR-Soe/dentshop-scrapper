const nodemailer = require('nodemailer');


const mailer = {
  onSendMail(){
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dospuntodos2021@gmail.com',
        pass: 'dospuntodos20212022'
      }
    });

    const mailOptions = {
      from: 'dospuntodos2021@gmail.com',
      to: 'dentshop@mailinator.com',
      subject: 'Sincronizacion de productos',
      text: 'La sincronizacion de productos ha finalizado exitosamente!'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}


module.exports = mailer;
