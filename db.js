const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const Product = sequelize.define('Product', {
  name: DataTypes.STRING,
  desc: DataTypes.STRING,
  price: DataTypes.FLOAT,
  category: DataTypes.STRING,
  stock: DataTypes.INTEGER,
  img: DataTypes.STRING
});

const Dealer = sequelize.define('Dealer', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  phone: DataTypes.STRING,
  city: DataTypes.STRING,
  wallet: DataTypes.FLOAT,
  status: DataTypes.STRING,
  joinDate: DataTypes.STRING,
  avatar: DataTypes.STRING
});

const Order = sequelize.define('Order', {
  dealerId: DataTypes.INTEGER,
  productId: DataTypes.INTEGER,
  qty: DataTypes.INTEGER,
  total: DataTypes.FLOAT,
  date: DataTypes.STRING,
  status: DataTypes.STRING
});

const Transaction = sequelize.define('Transaction', {
  dealerId: DataTypes.INTEGER,
  type: DataTypes.STRING,
  amount: DataTypes.FLOAT,
  desc: DataTypes.STRING,
  date: DataTypes.STRING
});

const Activity = sequelize.define('Activity', {
  action: DataTypes.STRING,
  detail: DataTypes.STRING,
  user: DataTypes.STRING,
  date: DataTypes.STRING
});

const Notification = sequelize.define('Notification', {
  title: DataTypes.STRING,
  desc: DataTypes.STRING,
  type: DataTypes.STRING,
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  date: DataTypes.STRING
});

const Setting = sequelize.define('Setting', {
  key: { type: DataTypes.STRING, unique: true },
  value: DataTypes.JSON
});

module.exports = {
  sequelize,
  Product,
  Dealer,
  Order,
  Transaction,
  Activity,
  Notification,
  Setting
};
