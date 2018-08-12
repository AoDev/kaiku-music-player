const fs = require('fs')
const dotenv = require('dotenv')
const envConfig = dotenv.parse(fs.readFileSync('.env'))
for (var k in envConfig) {
  process.env[k] = envConfig[k]
}

/**
 * PUBLISH CONFIG
 * If it's minio:
 * -  we need to provide the endpoint. eg: http://192.168.0.100:9000
 * If it's real S3
 * -  let electron-builder guess everything.
 *    Even if the endpoint is a valid S3 one, like: https://s3.eu-central-1.amazonaws.com
 *    electron-builder will fail to guess the correct region.
 */

const publish = {
  provider: 's3',
  bucket: process.env.S3_BUCKET,
}

if (process.env.DEPLOY_TO === 'minio') {
  publish.endpoint = process.env.S3_ENDPOINT
}

const config = {
  productName: 'Kaiku',
  appId: 'com.kevinpurnelle.kaiku',
  publish,
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ]
  },
  files: [
    'dist/',
    'images/',
    'main/',
    'node_modules/',
    'package.json',
    '!main.js',
  ],
  mac: {
    category: 'public.app-category.music',
    target: [
      'zip',
      'dmg'
    ]
  },
  win: {
    target: [
      'nsis'
    ]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
  linux: {
    target: [
      'AppImage'
    ]
  },
  directories: {
    buildResources: 'buildResources',
    output: 'electronReleases'
  }
}

function checkConfig (config) {
  if (typeof config.publish.bucket !== 'string') {
    throw new Error('config.publish.bucket invalid')
  }
}

checkConfig(config)

module.exports = config
