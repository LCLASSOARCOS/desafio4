
import express from "express";
import path from "path";
import CartManager from "../controllers/cartmanager.js";
import { getCurrentDirname } from '../utils.js'; // Importa solo la función getCurrentDirname
const __dirname = getCurrentDirname(import.meta.url);
const router = express.Router();

const carritosJSONPath = path.join(__dirname, "../models/carrito.json");
const cm = new CartManager(carritosJSONPath);


//Comenzar carrito nuevo 
router.post("/carts", async (req,res)=>{
    try{
        const respuesta = await cm.addCart(req.body);
        if (respuesta.status) {
            res.status(200).send(respuesta);
        } else {
            res.status(400).send(respuesta);
        }
    }catch(error){
        res.status(500).send("Error interno del servidor: " + error.message);
    }
});

//Agregar productos al carrito
router.post("/carts/:cid/product/:pid", async (req,res)=>{
    try{
        const cartId = parseInt(req.params.cid);
		const productId = parseInt(req.params.pid);
        const respuesta = await cm.addProductToCart(cartId, productId);
        if (respuesta.status) {
            res.status(200).send(respuesta);
        } else {
            res.status(400).send(respuesta);
        }
    }catch(error){
        res.status(500).send("Error interno del servidor: " + error.message);
    }
});


//Ver carritos
router.get("/carts", async (req,res)=>{
    try{
        const listaCarritos = await cm.getCarts();
        res.status(200).send(listaCarritos);
    }catch(error){
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});

//Buscar mi carrito
router.get("/carts/:cid", async (req,res)=>{
    try{
        const carritoId = parseInt(req.params.cid);
        console.log(parseInt(req.params.cid));
        const traerCarrito = await cm.getCartById(carritoId);
        if(traerCarrito){
            res.json({ status: true, traerCarrito });
        }else{
            res.status(404).json({ status: false, msg: "Carrito no encontrado" });
        }
    }catch(error){
        console.error(error.message); 
        res.status(500).json({ status: false, msg: "Error al obtener carrito" });
    }
});


//Borrar carrito
router.delete("/carts/:cid", async (req,res)=>{
    try{
    const cartId = parseInt(req.params.cid);
    const respuesta = await cm.deleteCart(cartId)
    if (respuesta.status) {
        res.status(200).json(respuesta);
    } else {
        res.status(400).json(respuesta);
    }
    }catch(error){
        res.status(500).json({ status: false, msg: "Carrito no encontrado: " + error.message });
    }
});

export default router;

