import UserModel from "../model/UserModel.js";

export function generate(length) {
    let code = ""
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10)
    }
    return code
}

export const generateVerificationCode = async (length = 6, expiredMilliSeconds = (1) * 60 * 60 * 1000) => {

    let code = generate(length), bool = true

    while (bool) {
        const user = await UserModel.scope("withCode").findOne({where: {code}})
        if (user) code = generate(length)
        else bool = false
    }

    const expiredAt = new Date(Date.now() + expiredMilliSeconds)

    return {code, expiredAt}
}

export const isCodeValid = (code, user) => {
    if (user.code !== code || !user.expiredAt) return false
    const now = new Date();
    return now < user.expiredAt;
}

export const generateCodeRegex = (length) => {
    return new RegExp(`^\\d{${length}}$`);
}
