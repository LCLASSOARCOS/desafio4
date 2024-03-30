import path from "path";
import  ProductManager  from "./controllers/productmanager.js";
import express from "express";
//import multer from "multer"
import { getCurrentDirname } from './utils.js'; // Importa solo la función getCurrentDirname
const __dirname = getCurrentDirname(import.meta.url);
import routerProducts from "./routes/products.router.js"
import routerCarts from "./routes/carts.router.js"
import { Server } from "socket.io";
import exphbs from "express-handlebars";
import viewsRouter from "./routes/views.router.js";


const app = express();
const PUERTO = 8080;
// Rutas de archivos JSON
const productsJSONPath = path.join(__dirname, "./models/listadoDeProductos.json");

const pml = new ProductManager(productsJSONPath);
//const cm = new CartManager(cartJSONPath);

/* --------ESCUCHANDO ---------- */
const httpServer = app.listen(PUERTO, () => {
  console.log(`Esuchando en el puerto: ${PUERTO}`);
})

const io = new Server(httpServer);


//Middleware 
app.use(express.json())
//Voy a utilizar JSON para datos. 
app.use(express.urlencoded({extended:true}));
// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

//Configuramos Express-Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");


//Rutas
app.use("/api", routerProducts);
app.use("/api", routerCarts);
app.use('/', viewsRouter)
//app.use("/imagenes", express.static("public"))


/* --------Test de vida del servidor---------- */
app.get("/ping", (req, res) => {
  res.send("Pong");
});
/* --------RAIZ---------- */
app.get('/', (req, res)=>{
  res.status(200).send('<h1>Primer Pre entrega Ayelén Anca </h1>')
});
/* ------------------------------------------- */


/* --------------------SOCKET CONNECTION----------------------- */
io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado');
    //Enviamos el array de productos al cliente: 
    socket.emit("productos", await pml.getProduct());

    //Recibimos el evento "eliminarProducto" desde el cliente: 
    socket.on("eliminarProducto", async (id) => {
        await pml.deleteProduct(id);
        //Enviamos el array de productos actualizados: 
        socket.emit("productos", await pml.getProduct());
    })

  // Escucho evento para agregar producto
  socket.on('add_product', async (producto) => {
    if (!Array.isArray(producto.thumbnail)) {
      producto.thumbnail = [producto.thumbnail];
  }
    console.log(producto)
      const newProduct = await pml.addProduct(producto)
      if(newProduct) {
      socket.emit('success', {message: 'Producto agregado'});
      } else {
      socket.emit('error', { message: 'Error al agregar el producto' })}
  });
});

/*
//---------------- MULTER --------------------------- 
const storage = multer.diskStorage({
  destination: (req,file, cb)=>{
      cb(null, "./public/img")
  },
  filename : (req, file, cb ) => {
      cb(null, file.originalname);
  }

});

const upload = multer({storage});

app.post("/upload", upload.single("imagen"), (req, res)=>{
  res.send("imagen cargada")
})
*/

