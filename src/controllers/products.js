const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    // find({argument1: ...}) Los argumentos permiten filtrar los elementos recuperados.
    const products = await Product
    .find({price:{$gt:30}})//$gt=greater than $lt=less than
    .sort('name')
    .select('name price')
    res.status(200).json({ Products: products, nbHits: products.length});
}

const getAllProducts = async(req, res) => {
    const { featured, company, name, sort, fields, numericFilters } = req.query;
    const queryObject = {}
    if (featured){
        queryObject.featured = featured === 'true' ? true : false;
    }
    if (company){
        queryObject.company = company;
    }
    if (name){
        //añade un patron para el filtrado por nombre, 'i'=incase-sensitive
        queryObject.name = {$regex: name, $options: 'i'};
    }
    if (numericFilters){
        const operatorMap = {
            '>': '$gt',
            '<': '$lt',
            '=': '$eq',
            '>=': '$gte',
            '<=': '$lte'
        }
        const regEx = /\b(<|>|>=|<=|=)\b/g
        let filters = numericFilters.replace(regEx, 
            (match) => `-${operatorMap[match]}-`)
        const options = ['price', 'rating'];
        filters = filters.split(',').forEach(element => {
            const [field, operator, value] = element.split(`-`);
            if (options.includes(field)){
                queryObject[field] = {[operator]:Number(value)}
            }
        });           
    }

    let result = Product.find(queryObject);
    if (sort){
        // result = result.sort('name')
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    } else {
        result = result.sort('createdAt')
    }
    if (fields){
        const fieldsList = fields.split(',').join(' ');
        result = result.select(fieldsList); 
    }
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page -1) * limit;

    //skip define cuantos datos ignora antes de iniciar el retorno(read)
    result = result.skip(skip).limit(limit);
    
    const products = await result;
    res.status(200).json({ Products: products, nbHits: products.length});
}


module.exports = {
    getAllProductsStatic,
    getAllProducts
}
