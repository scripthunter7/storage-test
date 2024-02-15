const zip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const zipFile = new zip();

fs.readdirSync('background/dist').forEach(file => {
    zipFile.addLocalFile(path.join(__dirname, `background/dist/${file}`), 'background/dist');
});

fs.readdirSync('popup').forEach(file => {
    zipFile.addLocalFile(path.join(__dirname, `popup/${file}`), 'popup');
});


zipFile.addLocalFile('icon.png', '', 'icon.png');
zipFile.addLocalFile('manifest-ff.json', '', 'manifest.json');

zipFile.writeZip('firefox.zip');
