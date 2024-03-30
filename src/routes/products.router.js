

import express from "express";
import path from "path";
import ProductManager  from "../controllers/productmanager.js";
import { getCurrentDirname } from '../utils.js'; // Importa solo la función getCurrentDirname
const __dirname = getCurrentDirname(import.meta.url);


const router = express.Router();

const productsJSONPath = path.join(__dirname, "../models/listadoDeProductos.json");
const pml = new ProductManager(productsJSONPath);




//esto va a ir a products router

//MOSTRAR PRODUCTOS
router.get("/products", async (req, res) => {
    try {
          // Llamado a productManager
      let productList = await pml.getProduct();
      //limite query
      const { limit } = req.query;
      if (!limit) {
        res.send(productList);//enviar todos los productos
      } else if (Number.isInteger(Number(limit)) && Number(limit) > 0) {
        res.send(productList.slice(0, limit)); //transformar en numero el string y enviar el limit
      } else {
        res.status(400).json({ status: false, msg: `El límite ${limit} es inválido.` });//ingreso de datos no validos
      }
    } catch (error) {
      // Salida
      // Manejar errores aquí
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
  });

  //MOSTRAR PRODUCTO POR ID
  router.get("/products/:pid", async (req, res) => {
    try {
        let productId = parseInt(req.params.pid);
        console.log(parseInt(req.params.pid));
      // Llamado a productManager
      let productList =  await pml.getProductById(productId);
      // Salida
      if (productList) {
        res.json({ status: true, productList });
    } else {
        res.status(404).json({ status: false, msg: "Producto no encontrado" });
    }
    } catch (error) {
      // Manejar errores 
      console.error(error.message); 
      res.status(500).json({ status: false, msg: "Error al obtener el producto" }); // Envía una respuesta 404 al cliente
    }
  });

  //AGREGAR PRODUCTO
  router.post("/products", async (req,res)=>{
    try{
        let {title, description, price, thumbnail, code, stock, status, category}= req.body;
       const respuesta = await pml.addProduct({title, description, price, thumbnail, code, stock, status, category});
       if (respuesta.status) {
       return res.status(200).json(respuesta)
       } else {
        res.status(400).json(respuesta)}
       //res.status(201).json({ status: true, msg: "Producto agregado exitosamente" });
    }catch (error){
      res.status(400).json({ status: false, msg: "Error al agregar el producto" });
    }
  });
//ACTUALIZAR PRODUCTO
router.put("/products/:pid", async (req, res) => {
  try {
      let productId = parseInt(req.params.pid);
      const { campo, valor } = req.body;
      const respuesta = await pml.updateProduct(productId, campo, valor);
      if (respuesta.status) {
          res.status(200).json(respuesta);
      } else {
          res.status(400).json(respuesta);
      }
  } catch (error) {
      res.status(500).json({ status: false, msg: "Error interno del servidor: " + error.message });
  }
});
/*
PARA ACTUALIZAR EL PRODUCTO SE ESCRIBE CON EL SIGUIENTE FORMATO:
{
    "campo": "price",
    "valor": 2222
}
*/

//BORRAR PRODUCTO
  router.delete("/products/:pid",async (req,res)=>{
    try{
        let productId = parseInt(req.params.pid)
        const respuesta = await pml.deleteProduct(productId);
        if (respuesta.status) {
            res.status(200).json(respuesta);
        } else {
            res.status(400).json(respuesta);
        }
    } catch (error) {
        res.status(500).json({ status: false, msg: "Producto no encontrado: " + error.message });
    }
  });

export default router;
