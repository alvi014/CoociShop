import bcrypt from 'bcryptjs';

console.log('Generando contraseña...');

const nuevaContrasena = 'admin123'; 

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(nuevaContrasena, salt);

console.log('\n--- COPIA ESTE CÓDIGO ---');
console.log(hash);
console.log('-------------------------\n');
