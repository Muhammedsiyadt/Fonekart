exports.categoryProducts = async (req, res) => {
  try {
      

      let products;
      const category = await categorydb.find({ delete: false });

      const cat = req.query.cat;
      const min = req.query.minPrice;
      const max = req.query.maxPrice;
      const sort = req.query.sort;

      if (req.query.search) {
          products = await productdb.find({ Pname: { $regex: req.query.search, $options: 'i' } });
      } else if (cat) {
          let query = { delete: false, Pcategory: cat };

          if (min && max) {
              query.price = { $gte: min, $lte: max };
          }
          products = await productdb.aggregate([
              { $match: query },
              {
                  $lookup: {
                      from: 'offers',
                      localField: 'offerId',
                      foreignField: '_id',
                      as: 'offerDetails'
                  }
              }
          ]);

          if (sort) {
              if (sort === 'highToLow') {
                  products.sort((a, b) => b.price - a.price)
              } else if (sort === 'lowToHigh') {
                  products.sort((a, b) => a.price - b.price)
              }
          }
      }

      if (cat === 'Allproducts') {
          products = await productdb.aggregate([
              { $match: { delete: false } },
              {
                  $lookup: {
                      from: 'offers',
                      localField: 'offerId',
                      foreignField: '_id',
                      as: 'offerDetails'
                  }
              }
          ]);
      }
      if (sort) {
          if (sort === 'highToLow') {
              products.sort((a, b) => b.price - a.price)
          } else if (sort === 'lowToHigh') {
              products.sort((a, b) => a.price - b.price)
          }
      }

      if (req.query.category) {
          products = await productdb.aggregate([
              { $match: { delete: false, Pcategory: req.query.category } },
              {
                  $lookup: {
                      from: 'offers',
                      localField: 'offerId',
                      foreignField: '_id',
                      as: 'offerDetails'
                  }
              }
          ]);
      }

      res.render('productList', { productList: products, categoryData: category });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
  }
};