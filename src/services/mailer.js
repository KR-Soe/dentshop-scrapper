const nodemailer = require('nodemailer');
const config = require('../config');


const mailer = {
  async onSendMail(products){
    console.log('products', products)
    const content = products.reduce((i, row) => {
      return i + '<tr><td>' + row.title + '</td></tr>';
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
      html: `
      <div>
        <h1>La sincronizacion de productos ha finalizado exitosamente!</h1>
        <table><thead><tr><th>Productos agregados</th></tr></thead><tbody> ${content} </tbody></table>
      </div>`
    }

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
};


module.exports = mailer;
