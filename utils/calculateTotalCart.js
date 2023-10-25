const calculateTotalCart = (products) => {
  let cartTotal = 0;
  for (let i = 0; i < products.length; i++) {
    cartTotal += products[i].price * products[i].count;
  }
  return cartTotal;
};

module.exports = calculateTotalCart
