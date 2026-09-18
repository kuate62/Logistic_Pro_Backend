import ejs from 'ejs'
import { resolve, dirname } from 'node:path'
import juice from 'juice'
import { readFile } from 'fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import transport from '../../config/transport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getHtmlContent(template, props = {}) {
    const basePath = resolve(__dirname, `../../views/emails/${template}/email.`)
    const templatePath = `${basePath}ejs`
    const cssPath = `${basePath}css`

    const htmlContent = await ejs.renderFile(templatePath, props)

    if (existsSync(cssPath)) {
        const cssContent = await readFile(cssPath, 'utf8')
        return juice.inlineContent(htmlContent, cssContent)
    }

    return htmlContent
}

export const sendTemplateEmail = async (to, subject, template, props = {}) => {
    const html = await getHtmlContent(template, props)
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"LogisticPro" <no-reply@logisticpro.com>',
        to,
        subject,
        html
    };

    await transport.sendMail(mailOptions);
};
