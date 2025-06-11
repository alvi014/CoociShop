import bcrypt from 'bcryptjs';

// Esquema del modelo Admin
const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true // No se permiten emails duplicados
  },
  password: {
    type: String,
    required: true
  }
});

// Middleware Mongoose que se ejecuta antes de guardar
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Solo hashea si la contraseña cambió
  const salt = await bcrypt.genSalt(10);           // Genera salt aleatorio
  this.password = await bcrypt.hash(this.password, salt); // Hashea la contraseña
  next();
});

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;
