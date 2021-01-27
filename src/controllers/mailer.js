const nodemailer = require('nodemailer');
const config = require('./../config');

const mailer = {
  onSendMail(products){
    const content = products.reduce((i, row) => {
      return i + '<tr><td>' + row.name + '</td></tr>';
    }, '');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.mailer.emit.user,
        pass: config.mailer.emit.pass
      }
    });

    const mailOptions = {
      from: config.mailer.emit.user,
      to: config.mailer.to.user,
      subject: 'Sincronizacion de productos',
      text: `La sincronizacion de productos ha finalizado exitosamente! ${content}`
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
