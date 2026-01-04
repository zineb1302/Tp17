const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

// Charger la définition Protobuf depuis employee.proto
const root = protobuf.loadSync('employee.proto');
const EmployeeList = root.lookupType('Employees');

// Construire la liste d'employés
const employees = [];

employees.push({
  id: 1,
  name: 'Ali',
  salary: 9000
});

employees.push({
  id: 2,
  name: 'Kamal',
  salary: 22000
});

employees.push({
  id: 3,
  name: 'Amal',
  salary: 23000
});

// Objet racine compatible avec message Employees
let jsonObject = { employee: employees };

// ---------- JSON ----------

// JSON : encodage
console.time('JSON encode');
let jsonData = JSON.stringify(jsonObject);
console.timeEnd('JSON encode');

// JSON : décodage
console.time('JSON decode');
let jsonDecoded = JSON.parse(jsonData);
console.timeEnd('JSON decode');

// ---------- XML ----------

// Options de conversion JSON -> XML
const options = {
  compact: true,
  ignoreComment: true,
  spaces: 0
};

// XML : encodage
console.time('XML encode');
let xmlData = "<root>\n" + convert.json2xml(jsonObject, options) + "\n</root>";
console.timeEnd('XML encode');

// XML : décodage
console.time('XML decode');
// Conversion XML -> JSON (texte) -> objet JS
let xmlJson = convert.xml2json(xmlData, { compact: true });
let xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');

// ---------- Protobuf ----------

// Vérification de conformité avec le schéma Protobuf
let errMsg = EmployeeList.verify(jsonObject);
if (errMsg) {
  throw Error(errMsg);
}

// Protobuf : encodage
console.time('Protobuf encode');
let message = EmployeeList.create(jsonObject);
let buffer = EmployeeList.encode(message).finish();
console.timeEnd('Protobuf encode');

// Protobuf : décodage
console.time('Protobuf decode');
let decodedMessage = EmployeeList.decode(buffer);
// Optionnel : conversion vers objet JS "classique"
let protoDecoded = EmployeeList.toObject(decodedMessage);
console.timeEnd('Protobuf decode');

// ---------- Écriture des fichiers ----------

fs.writeFileSync('data.json', jsonData);
fs.writeFileSync('data.xml', xmlData);
fs.writeFileSync('data.proto', buffer);

// ---------- Mesure des tailles ----------

const jsonFileSize = fs.statSync('data.json').size;
const xmlFileSize = fs.statSync('data.xml').size;
const protoFileSize = fs.statSync('data.proto').size;

console.log(`\nTaille de 'data.json' : ${jsonFileSize} octets`);
console.log(`Taille de 'data.xml'  : ${xmlFileSize} octets`);
console.log(`Taille de 'data.proto': ${protoFileSize} octets`);

