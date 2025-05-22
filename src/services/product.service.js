import {Product} from '../models/Products.js';

export const findProducts = async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
};


export const findProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.send(product);
}

export const createProduct = async (req, res) => {
    const { productName, productYear, productDescription, productImage, productCountry, productPrice, productStock, productState } = req.body;

    if (!productName || !productYear || !productImage || !productCountry || !productPrice || !productStock) {
        return res.status(400).json({ message: 'Nombre, año, imagen, pais, precio y stock son campos requeridos' });
    }
    const newProduct = await Product.create({
        productName,
        productYear,
        productDescription,
        productImage,
        productCountry,
        productPrice,
        productStock,
        productState
    });
    
    res.send(newProduct)
};


export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { productName, productYear, productDescription, productImage, productCountry, productPrice, productStock, productState } = req.body;

    if (!productName || !productYear || !productImage || !productCountry || !productPrice || !productStock) {
        return res.status(400).json({ message: 'Nombre, año, imagen, pais, precio y stock son campos requeridos' });
    }

    const product = await Product.findByPk(id);

    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await product.update({
        productName,
        productYear,
        productDescription,
        productImage,
        productCountry,
        productPrice,
        productStock,
        productState
    });

    res.send(product);
}

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await Product.update({    
        productState: false
    }, {
        where: { productId: id }
    });
    res.sendStatus(204).json({ message: 'Producto eliminado' });
}

export const restoreProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await Product.update({    
        productState: true
    }, {
        where: { productId: id }
    });
    res.sendStatus(204);
}