import Product from '../models/Product.js';

// @desc    Obtener lista de productos con filtros, búsqueda y paginación
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { search, categoria, area, bajoStock, page = 1, limit = 20 } = req.query;

    const query = { activo: true };

    // Filtro por término de búsqueda (código o nombre)
    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } },
      ];
    }

    // Filtro por categoría
    if (categoria) {
      query.categoria = categoria;
    }

    // Filtro por área física
    if (area) {
      query['ubicacion.area'] = area;
    }

    // Filtro para productos con existencias por debajo del stock mínimo
    if (bajoStock === 'true') {
      query.$expr = { $lte: ['$cantidadDisponible', '$stockMinimo'] };
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ nombre: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalProducts: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener un producto específico por ID
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.activo) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Registrar nuevo producto médico
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { codigo, nombre, descripcion, categoria, unidadMedida, stockMinimo, ubicacion } = req.body;

    const exists = await Product.findOne({ codigo });
    if (exists) {
      return res.status(400).json({ message: 'Ya existe un producto con ese código' });
    }

    const product = await Product.create({
      codigo,
      nombre,
      descripcion,
      categoria,
      unidadMedida,
      stockMinimo,
      ubicacion,
      cantidadDisponible: 0, // Las cantidades se alimentan formalmente mediante entradas de lotes
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Editar información técnica o ubicación del producto
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.activo) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // No se permite alterar 'cantidadDisponible' directamente por este endpoint
    const { cantidadDisponible, ...updateData } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Desactivar un producto (Baja lógica)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (product.cantidadDisponible > 0) {
      return res.status(400).json({
        message: 'No se puede dar de baja un producto con existencias disponibles en almacén',
      });
    }

    product.activo = false;
    await product.save();

    res.json({ message: 'Producto dado de baja exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};