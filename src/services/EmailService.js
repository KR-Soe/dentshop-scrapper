const { promisify } = require('util');
const nodemailer = require('nodemailer');
const config = require('../config');


class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.mailer.emit.user,
        pass: config.mailer.emit.pass
      }
    });
    this.send = promisify(this.transporter.sendMail).bind(this.transporter);
  }

  async sendEmail(products, platformsCount) {
    const newProductsContent = products.reduce((acc, row) => {
      return acc + `<tr><td>${row.name}</td></tr>`;
    }, '');

    const productsByPlatformContent = Object.entries(platformsCount)
      .reduce((acc, entry) => {
        const [key, value] = entry;
        return acc + `<tr><td>${key}</td><td>${value}</td><tr>`;
      }, '');

    const mailOptions = {
      from: config.mailer.emit.user,
      to: config.mailer.to.user,
      subject: 'Sincronizacion de productos',
      html: `
      <div>
        <h1>La sincronizacion de productos ha finalizado exitosamente!</h1>
        <table>
          <thead>
            <tr>
              <th>Productos agregados</th>
            </tr>
          </thead>
          <tbody>
            ${newProductsContent}
          </tbody>
        </table>

        <table>
          <thead>
            <th>Plataforma</th>
            <th>Cantidad de productos procesados</th>
          </thead>
          <tbody>
            ${productsByPlatformContent}
          </tbody>
        </table>
      </div>`
    };

    try {
      await this.send(mailOptions);
    } catch (err) {
      console.error('email no se pudo enviar existosamente por esto', err);
    }
  }
}


module.exports = EmailService;
