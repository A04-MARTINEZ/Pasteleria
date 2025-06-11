//importar los framewors necesarios para ejecutar
//la app 
const express=require('express');//SW
const mongoose=require('mongoose');//mongo
const bodyParser=require('body-parser');//json
const cors=require('cors');//permitir solicitudes 
const bcrypt=require('bcrypt');//encriptar
const { parseURL } = require('whatwg-url');

//crear una instancia de la aplicacion express
const app=express();
//definir el puerto donde se ejcutaara el server
const PORT=3000;

//habilitar cors par permitir peticiones
app.use(cors());
// sentencia que permite a express entienda el formato
app.use(bodyParser.json());

//detectar archivos estaticos de la carpeta public
app.use(express.static('public'));

//conexion mongoDB

//conectarse a pasteleria
mongoose.connect('mongodb://localhost:27017/pasteleria',{
useNewUrlParser:true,//usar el parser de url
useUnifiedTopology: true //motor de monitoreo  
})

//si la conexion es exitosa, muestra mensaje
.then(() =>console.log('conectado a mongo'))
//si hay un error, que muestre un mensaje
.catch (err=>console.error(err));

//Define el esquema para los usurios
const UsuarioSchema= new mongoose.Schema({
    nombre: String, 
    email: String,
    password: String
});

//crear el modelo usurio basado en el esquema anterior
const Usuario= mongoose.model('Usuario', UsuarioSchema);

//Definir esquema pasteles
const PastelSchema=new mongoose.Schema({
    nombre: String,
    precio: Number
});

const Pastel= mongoose.model('Pastel',PastelSchema);
const EmpleadosSchema= new mongoose.Schema({
   nombre: String,
   rol: String 
});

const Empleado= mongoose.model('Empleado',EmpleadosSchema);

const PedidoSchema= new mongoose.Schema({
    cliente: String,
    producto: String
});
 const Pedido= mongoose.model('Pedido',PedidoSchema);

 //Rutas de autentificacion
 app.post ('/registro',async(req,res) => {
 
    //extrae el email y el password
    const{nombre,email,password}=req.body;

    //Encriptar la contraseña
    const hashedPassword=await bcrypt.hash(password,10);
   
    //crea un nuevo usuario con datos recibidos
    const nuevoUsuario= new Usuario({nombre,email,password: hashedPassword});

    //Guarda el usuario en la base de datos
    await nuevoUsuario.save();

    //Respone con un mensaje de exito
    res.status(201).send('Usuario registro');

 });

 // Ruta para iniciar sesion 

 app.post('/login', async(req, res)=>{
    //Extraer imail y password del cuerpo de la solicitud
    const {email, password} = req.body;
    //Busca un usuario con el email dado
    const usuario = await Usuario.findOne({email});
    //Si no existe el usario, responde con error (error 401)
    if(!usuario)return res.status(401).send('Usuario no encontrado');
    //Compara la contraseña proporcionada
    const valid = await bcrypt.compare(password, usuario.password);
    //Si la constraseña no es valida responde con error 401
    if(!valid) return res.status(401).send('Contraseña incorrecta');
    //Si todo conincide responde con un mensaje de exito
    res.send('Bienvenido' + usuario.nombre);
 });

 // CRUD pasteles

 //Ruta para obtener todos los pasteles
 app.get('/api/pasteles', async(req, res) =>{
    //busca todos los pasteles en la base 
    const pasteles=await Pastel.find();
    //devuelve la lista de pasteles en formato JSON 
    res.json(pasteles);
 });


 //crear un nuevo pastel
 app.post('/api/pasteles', async(req, res)=>{
    //crea un nuevo pastel
    const nuevo = new Pastel(req.body);
    //guarda el pastel en la base de datos 
    await nuevo.save();
//responde con un mensaje de exito
res.status(201).send ('pastel creado');
 });

 //eliminar un pastel por id
 app.delete('/api/pasteles/:id', async(req,res)=>{
    //elimina el pastel cuyo id se recibe 
    await Pastel.findByIdAndDelete(req.params.id);
    //responde con un mensaje de exito
    res.send('pastel eliminado');
 });


  // CRUD empleados
 
  //Ruta para obtener todos los empleados
 app.get('/api/empleados', async(req, res) =>{
    //busca todos los empleados en la base 
    const empleados=await Empleado.find();
    //devuelve la lista de empleados en formato JSON 
    res.json(empleados);
 });


 //crear un nuevo empleado
 app.post('/api/empleados', async(req, res)=>{
    //crea un nuevo empleado con los datos recibidos en la solicitud
    const nuevo = new Empleado(req.body);
    //guarda el empleado en la base de datos 
    await nuevo.save();
//responde con un mensaje de exito
res.status(201).send ('Empleado creado');
 });

 //eliminar un empleado por id
 app.delete('/api/empleados/:id', async(req,res)=>{
    //elimina el empleado cuyo id se recibe 
    await Empleado.findByIdAndDelete(req.params.id);
    //responde con un mensaje de exito
    res.send('Empleado eliminado');
 });


//Ruta para obtener todos los pedidos
app.get('/api/pedidos',async(req,res)=>{
   //Busca todos los pedidos en la base de datos
   const pedidos=await Pedido.find();
   //Devuelve la lista de pedidos en formato JSON
   res.json(pedidos);
});

//Ruta para crear un nuevo pédido
app.post('/api/pedidos',async(req,res)=>{
   //crea un nuevo pedido con los datos recibidos en la 
   const nuevo=new Pedido (req.body);
   //guarda el pedido en la base de datos
   await nuevo.save();
   //Responde con mensaje de exito y codigo 201(creado)
   res.status(201).send('Pedido registrado');
});

//Ruta para eliminar un pedido por su ID
app.delete('/api/pedidos/:id',async(req,res)=>{
   //Elimina el pedido cuyo ID se recibe en la URL
   await Pedido.findByIdAndDelete(req.params.id);
//Responde con mensaje de exito
res.send('Pedido eliminado') ;
});


//Iniciar servidor

//Inicia el servidor y lo pone a escuchar en el puerto definido
app.listen (3000,()=>{
//Muestra en la consola la URL donde esta corriendo el servidor
console.log('Servidor escuchando en http://localhost:3000');
});


 
