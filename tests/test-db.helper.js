import mongoose from 'mongoose';
import config from '../src/config/env.config.js';
import { UserModel } from '../src/models/user.model.js';
import { OrderModel } from '../src/models/order.model.js';
import { DeliveryModel } from '../src/models/delivery.model.js';
import { ProductModel } from '../src/models/product.model.js';

let usingRealMongo = false;
let inMemoryInstalled = false;

const memoryStore = {
  User: [],
  Order: [],
  Delivery: [],
  Product: [],
};

/**
 * Evalúa si un documento cumple con un filtro básico de Mongoose (incluyendo operadores $gt).
 */
const matchesFilter = (doc, filter = {}) => {
  for (const [key, cond] of Object.entries(filter)) {
    const val = doc[key];
    if (cond && typeof cond === 'object' && !Array.isArray(cond) && !(cond instanceof mongoose.Types.ObjectId)) {
      if ('$gt' in cond && !(Number(val) > Number(cond.$gt))) {
        return false;
      }
    } else if (String(val) !== String(cond)) {
      return false;
    }
  }
  return true;
};

/**
 * Aplica proyección básica de Mongoose (ej. '-password -__v' o 'nombre email rol').
 */
const applySelect = (doc, selectStr) => {
  if (!doc) return null;
  const clone = structuredClone(doc);
  if (!selectStr) return clone;

  const tokens = selectStr.trim().split(/\s+/);
  const isExclusion = tokens.every((t) => t.startsWith('-'));

  if (isExclusion) {
    for (const token of tokens) {
      const field = token.slice(1);
      delete clone[field];
    }
    return clone;
  }

  const picked = { _id: clone._id };
  for (const token of tokens) {
    if (token in clone) {
      picked[token] = clone[token];
    }
  }
  return picked;
};

/**
 * Crea un objeto Query encadenable compatible con .populate(), .select(), .sort() y .lean().
 */
const createChainableQuery = (resolverFn) => {
  const state = {
    populates: [],
    selectStr: null,
    sortSpec: null,
  };

  const execute = async () => {
    const rawResult = await resolverFn();
    if (!rawResult) return null;

    const processSingle = (item) => {
      if (!item) return null;
      const copy = structuredClone(item);

      for (const pop of state.populates) {
        if (pop.path === 'cliente' && copy.cliente) {
          const userDoc = memoryStore.User.find((u) => String(u._id) === String(copy.cliente));
          if (userDoc) {
            copy.cliente = applySelect(userDoc, pop.select || '-password -__v');
          }
        }
        if (pop.path === 'repartidor' && copy.repartidor) {
          const driverDoc = memoryStore.User.find((u) => String(u._id) === String(copy.repartidor));
          if (driverDoc) {
            copy.repartidor = applySelect(driverDoc, pop.select || '-password -__v');
          }
        }
        if (pop.path === 'pedido' && copy.pedido) {
          const orderDoc = memoryStore.Order.find((o) => String(o._id) === String(copy.pedido));
          if (orderDoc) {
            copy.pedido = applySelect(orderDoc, pop.select || '-__v');
          }
        }
      }

      return applySelect(copy, state.selectStr);
    };

    if (Array.isArray(rawResult)) {
      const processed = rawResult.map(processSingle);
      if (state.sortSpec && state.sortSpec.createdAt === -1) {
        processed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return processed;
    }

    return processSingle(rawResult);
  };

  const query = {
    populate(path, select) {
      state.populates.push({ path, select });
      return query;
    },
    select(selectStr) {
      state.selectStr = selectStr;
      return query;
    },
    sort(sortSpec) {
      state.sortSpec = sortSpec;
      return query;
    },
    lean() {
      return execute();
    },
    then(onFulfilled, onRejected) {
      return execute().then(onFulfilled, onRejected);
    },
  };

  return query;
};

/**
 * Envuelve un objeto plano como documento con método .toObject() para compatibilidad con Repositories.
 */
const wrapDocument = (plainObj) => ({
  ...plainObj,
  toObject() {
    return structuredClone(plainObj);
  },
});

/**
 * Instala el adaptador en memoria sobre un modelo de Mongoose cuando no hay un servidor MongoDB activo.
 */
const attachInMemoryModel = (Model, storeKey) => {
  Model.find = (filter = {}) =>
    createChainableQuery(() => memoryStore[storeKey].filter((doc) => matchesFilter(doc, filter)));

  Model.findById = (id) =>
    createChainableQuery(() =>
      memoryStore[storeKey].find((doc) => String(doc._id) === String(id)) || null
    );

  Model.findOne = (filter = {}) =>
    createChainableQuery(() =>
      memoryStore[storeKey].find((doc) => matchesFilter(doc, filter)) || null
    );

  Model.create = async (data) => {
    const now = new Date().toISOString();
    const defaults = {};
    if (storeKey === 'User') {
      defaults.documents = [];
    } else if (storeKey === 'Order') {
      defaults.items = [];
      defaults.comprobantes = [];
    } else if (storeKey === 'Delivery') {
      defaults.comprobantes = [];
    }

    const record = {
      _id: data._id ? String(data._id) : new mongoose.Types.ObjectId().toString(),
      ...defaults,
      ...structuredClone(data),
      createdAt: now,
      updatedAt: now,
      __v: 0,
    };
    memoryStore[storeKey].push(record);
    return wrapDocument(record);
  };

  Model.insertMany = async (items = []) => {
    const inserted = [];
    for (const item of items) {
      const doc = await Model.create(item);
      inserted.push(doc);
    }
    return inserted;
  };

  Model.findByIdAndUpdate = (id, updateData) =>
    createChainableQuery(() => {
      const idx = memoryStore[storeKey].findIndex((doc) => String(doc._id) === String(id));
      if (idx === -1) return null;

      const currentDoc = structuredClone(memoryStore[storeKey][idx]);
      const payload = structuredClone(updateData || {});

      if (payload.$push && typeof payload.$push === 'object') {
        for (const [arrField, itemToPush] of Object.entries(payload.$push)) {
          if (!Array.isArray(currentDoc[arrField])) {
            currentDoc[arrField] = [];
          }
          currentDoc[arrField].push(itemToPush);
        }
        delete payload.$push;
      }

      if (payload.$set && typeof payload.$set === 'object') {
        Object.assign(currentDoc, payload.$set);
        delete payload.$set;
      }

      Object.assign(currentDoc, payload);
      currentDoc.updatedAt = new Date().toISOString();
      memoryStore[storeKey][idx] = currentDoc;
      return memoryStore[storeKey][idx];
    });

  Model.findByIdAndDelete = (id) =>
    createChainableQuery(() => {
      const idx = memoryStore[storeKey].findIndex((doc) => String(doc._id) === String(id));
      if (idx === -1) return null;
      const [removed] = memoryStore[storeKey].splice(idx, 1);
      return removed;
    });

  Model.deleteMany = async () => {
    const deletedCount = memoryStore[storeKey].length;
    memoryStore[storeKey] = [];
    return { acknowledged: true, deletedCount };
  };
};

/**
 * Inicializa la base de datos de testing (conecta a MONGODB_URI_TEST o activa el motor de testing aislado).
 */
export const setupTestDatabase = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI_TEST, {
      serverSelectionTimeoutMS: 1200,
    });
    usingRealMongo = true;
  } catch {
    usingRealMongo = false;
    if (!inMemoryInstalled) {
      attachInMemoryModel(UserModel, 'User');
      attachInMemoryModel(OrderModel, 'Order');
      attachInMemoryModel(DeliveryModel, 'Delivery');
      attachInMemoryModel(ProductModel, 'Product');
      inMemoryInstalled = true;
    }
  }
  await clearTestDatabase();
};

/**
 * Limpia todas las colecciones de la base de datos de testing para garantizar independencia entre tests.
 */
export const clearTestDatabase = async () => {
  if (usingRealMongo) {
    await Promise.all([
      DeliveryModel.deleteMany({}),
      OrderModel.deleteMany({}),
      UserModel.deleteMany({}),
      ProductModel.deleteMany({}),
    ]);
  } else {
    memoryStore.Delivery = [];
    memoryStore.Order = [];
    memoryStore.User = [];
    memoryStore.Product = [];
  }
};

/**
 * Cierra la conexión al finalizar la ejecución de la suite de pruebas.
 */
export const teardownTestDatabase = async () => {
  await clearTestDatabase();
  if (usingRealMongo && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
