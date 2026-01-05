import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Esquema del modelo Admin
const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Middleware Mongoose que se ejecuta antes de guardar
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 
  const salt = await bcrypt.genSalt(10);           
  this.password = await bcrypt.hash(this.password, salt); 
  next();
});

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;
