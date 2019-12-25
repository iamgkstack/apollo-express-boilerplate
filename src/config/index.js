import fs from 'fs';

const env = process.env.NODE_ENV || 'development';
const config = {};

/**
 * Base configuration
 */
fs.readFileSync(__dirname)
    .filter(f => !f.includes('index.js') && !f.includes('env'))
    .forEach((filename) => {
        Object.assign(config, require(`./${filename}`));
    });

/**
 * Environment configuration overrides
 */

const envDir = `${__dirname}/env`;
const isEnvExisting = fs.existsSync(envDir);

if(isEnvExisting) {
    fs.readdirSync(envDir).forEach((filename) => {
        const basename = filename.split('.')[0];

        if(env === basename){
            Object.assign(config, require(`./env/${filename}`))
        }
    });
}

module.exports = config;