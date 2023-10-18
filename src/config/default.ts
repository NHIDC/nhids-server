

console.log(process.env)


export default {
    port: process.env.PORT,
    dbUri: String(process.env.DBURI),
    saltWorkFactor: parseInt(process.env.SALTWORKFACTOR ?? "10"),
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL,
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL,
    mailingPassword: process.env.MAILING_PASSWORD,
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
};

