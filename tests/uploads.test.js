import fs from 'node:fs';
import path from 'node:path';
import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import {
  USER_ROLES,
  USER_DOCUMENT_TYPES,
  RECEIPT_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../src/constants/index.js';
import {
  UPLOADS_DIRECTORIES,
  ensureUploadDirectories,
} from '../src/config/multer.config.js';
import { swaggerSpec } from '../src/config/swagger.config.js';
import {
  setupTestDatabase,
  clearTestDatabase,
  teardownTestDatabase,
} from './test-db.helper.js';

/**
 * Helper para validar que la estructura de error devuelta por el middleware global
 * coincida con el formato general de errores del proyecto.
 */
const assertErrorStructure = (res, expectedStatus, expectedCode) => {
  expect(res.status).to.equal(expectedStatus);
  expect(res.body).to.be.an('object');
  expect(res.body).to.have.property('success', false);
  expect(res.body).to.have.property('message').that.is.a('string').and.is.not.empty;
  expect(res.body).to.have.property('error').that.is.an('object');
  expect(res.body.error).to.have.property('code', expectedCode);
  expect(res.body.error).to.have.property('statusCode', expectedStatus);
  expect(res.body.error).to.have.property('name').that.is.a('string');
  expect(res.body.error).to.have.property('path').that.is.a('string');
  expect(res.body.error).to.have.property('method').that.is.a('string');
  expect(res.body.error).to.have.property('timestamp').that.is.a('string');
};

/**
 * Helper para limpiar los archivos generados en las subcarpetas de uploads durante las pruebas,
 * preservando los archivos .gitkeep.
 */
const cleanupTestUploads = () => {
  ensureUploadDirectories();
  const subdirs = [
    UPLOADS_DIRECTORIES.DOCUMENTS,
    UPLOADS_DIRECTORIES.LICENSES,
    UPLOADS_DIRECTORIES.RECEIPTS,
  ];

  for (const dir of subdirs) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (entry === '.gitkeep') continue;
      const fullPath = path.join(dir, entry);
      if (fs.statSync(fullPath).isFile()) {
        fs.unlinkSync(fullPath);
      }
    }
  }
};

describe('Pre-entrega Módulo 7 — Carga de archivos, documentos y comprobantes con Multer', () => {
  const samplePdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
  const samplePngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);

  before(async () => {
    ensureUploadDirectories();
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
    cleanupTestUploads();
  });

  after(async () => {
    cleanupTestUploads();
    await teardownTestDatabase();
  });

  describe('1. Estructura de carpetas, .gitignore y documentación en Swagger (multipart/form-data)', () => {
    it('Debe existir la estructura de subcarpetas en /uploads y estar ignorada en .gitignore', () => {
      expect(fs.existsSync(UPLOADS_DIRECTORIES.ROOT)).to.be.true;
      expect(fs.existsSync(UPLOADS_DIRECTORIES.DOCUMENTS)).to.be.true;
      expect(fs.existsSync(UPLOADS_DIRECTORIES.LICENSES)).to.be.true;
      expect(fs.existsSync(UPLOADS_DIRECTORIES.RECEIPTS)).to.be.true;

      const gitignorePath = path.resolve(process.cwd(), '.gitignore');
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      expect(gitignoreContent).to.include('uploads/');
    });

    it('Debe documentar en Swagger los endpoints de carga como multipart/form-data con FileMetadata y errores', () => {
      const userDocEndpoint = swaggerSpec.paths['/api/users/{id}/documents']?.post;
      const orderReceiptEndpoint = swaggerSpec.paths['/api/orders/{id}/receipt']?.post;
      const deliveryReceiptEndpoint = swaggerSpec.paths['/api/deliveries/{id}/receipt']?.post;

      expect(userDocEndpoint).to.be.an('object');
      expect(userDocEndpoint.requestBody.content).to.have.property('multipart/form-data');
      expect(
        userDocEndpoint.requestBody.content['multipart/form-data'].schema.properties
      ).to.include.all.keys('file', 'documentType');

      expect(orderReceiptEndpoint).to.be.an('object');
      expect(orderReceiptEndpoint.requestBody.content).to.have.property('multipart/form-data');

      expect(deliveryReceiptEndpoint).to.be.an('object');
      expect(deliveryReceiptEndpoint.requestBody.content).to.have.property('multipart/form-data');

      expect(swaggerSpec.components.schemas).to.have.property('FileMetadata');
    });
  });

  describe('2. Carga de documentos y licencias de usuario (POST /api/users/:id/documents)', () => {
    let createdUser = null;

    beforeEach(async () => {
      const res = await request(app).post('/api/users').send({
        nombre: 'Sofía Martínez',
        email: 'sofia.martinez@shipnow.com',
        rol: USER_ROLES.REPARTIDOR,
      });
      createdUser = res.body.data;
    });

    it('Debe subir correctamente un documento de identificación (PDF), guardarlo en uploads/documents y registrar solo metadatos en el usuario', async () => {
      const res = await request(app)
        .post(`/api/users/${createdUser._id}/documents`)
        .field('documentType', USER_DOCUMENT_TYPES.IDENTIFICACION)
        .attach('file', samplePdfBuffer, {
          filename: 'dni_sofia.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('document').that.is.an('object');

      const docMeta = res.body.document;
      expect(docMeta).to.have.property('originalName', 'dni_sofia.pdf');
      expect(docMeta).to.have.property('generatedName').that.includes('dni_sofia.pdf');
      expect(docMeta).to.have.property('path').that.includes('uploads/documents/');
      expect(docMeta).to.have.property('mimeType', 'application/pdf');
      expect(docMeta).to.have.property('size', samplePdfBuffer.length);
      expect(docMeta).to.have.property('documentType', USER_DOCUMENT_TYPES.IDENTIFICACION);
      expect(docMeta).to.have.property('uploadedAt');
      expect(docMeta).to.not.have.property('buffer');

      // Verificar que el archivo físico existe en el servidor
      const storedFilePath = path.resolve(process.cwd(), docMeta.path);
      expect(fs.existsSync(storedFilePath)).to.be.true;

      // Verificar que los metadatos quedaron registrados en la entidad usuario en la base de datos
      expect(res.body.data.documents).to.be.an('array').with.lengthOf(1);
      expect(res.body.data.documents[0].originalName).to.equal('dni_sofia.pdf');
    });

    it('Debe guardar licencias de conducir en la subcarpeta uploads/licenses cuando documentType es licencia', async () => {
      const res = await request(app)
        .post(`/api/users/${createdUser._id}/documents`)
        .field('documentType', USER_DOCUMENT_TYPES.LICENCIA)
        .attach('file', samplePngBuffer, {
          filename: 'licencia_conducir.png',
          contentType: 'image/png',
        });

      expect(res.status).to.equal(201);
      expect(res.body.document.documentType).to.equal(USER_DOCUMENT_TYPES.LICENCIA);
      expect(res.body.document.path).to.include('uploads/licenses/');

      const storedFilePath = path.resolve(process.cwd(), res.body.document.path);
      expect(fs.existsSync(storedFilePath)).to.be.true;
    });

    it('Debe responder 400 (FILE_REQUIRED) cuando falta el archivo en la petición', async () => {
      const res = await request(app)
        .post(`/api/users/${createdUser._id}/documents`)
        .field('documentType', USER_DOCUMENT_TYPES.IDENTIFICACION);

      assertErrorStructure(res, 400, 'FILE_REQUIRED');
    });

    it('Debe responder 400 (INVALID_DOCUMENT_TYPE) cuando el tipo de documento es inválido o no se envía, y eliminar el archivo temporal', async () => {
      const res = await request(app)
        .post(`/api/users/${createdUser._id}/documents`)
        .field('documentType', 'tipo_inexistente_123')
        .attach('file', samplePdfBuffer, {
          filename: 'documento_invalido.pdf',
          contentType: 'application/pdf',
        });

      assertErrorStructure(res, 400, 'INVALID_DOCUMENT_TYPE');

      // Verifica que no haya quedado el archivo huérfano en disco
      const filesInDocs = fs
        .readdirSync(UPLOADS_DIRECTORIES.DOCUMENTS)
        .filter((f) => f !== '.gitkeep');
      expect(filesInDocs).to.have.lengthOf(0);
    });

    it('Debe responder 400 (INVALID_FILE_TYPE) cuando el formato de archivo no está permitido (ej. .exe o .txt)', async () => {
      const res = await request(app)
        .post(`/api/users/${createdUser._id}/documents`)
        .field('documentType', USER_DOCUMENT_TYPES.IDENTIFICACION)
        .attach('file', Buffer.from('contenido malicioso'), {
          filename: 'script.exe',
          contentType: 'application/x-msdownload',
        });

      assertErrorStructure(res, 400, 'INVALID_FILE_TYPE');
    });

    it('Debe responder 400 (FILE_SIZE_EXCEEDED) cuando el archivo supera el tamaño máximo permitido (5 MB)', async () => {
      const oversizedBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024, 'a');

      const res = await request(app)
        .post(`/api/users/${createdUser._id}/documents`)
        .field('documentType', USER_DOCUMENT_TYPES.CONTRATO)
        .attach('file', oversizedBuffer, {
          filename: 'contrato_gigante.pdf',
          contentType: 'application/pdf',
        });

      assertErrorStructure(res, 400, 'FILE_SIZE_EXCEEDED');
    });

    it('Debe responder 400 (INVALID_FILE_FIELD) cuando el nombre del campo de archivo no coincide con el esperado', async () => {
      const res = await request(app)
        .post(`/api/users/${createdUser._id}/documents`)
        .field('documentType', USER_DOCUMENT_TYPES.IDENTIFICACION)
        .attach('campo_incorrecto', samplePdfBuffer, {
          filename: 'dni.pdf',
          contentType: 'application/pdf',
        });

      assertErrorStructure(res, 400, 'INVALID_FILE_FIELD');
    });

    it('Debe responder 404 (USER_NOT_FOUND) cuando el usuario no existe y no dejar archivos huérfanos', async () => {
      const nonExistentUserId = '65f1a2b3c4d5e6f7a8b9c099';
      const res = await request(app)
        .post(`/api/users/${nonExistentUserId}/documents`)
        .field('documentType', USER_DOCUMENT_TYPES.IDENTIFICACION)
        .attach('file', samplePdfBuffer, {
          filename: 'dni_huérfano.pdf',
          contentType: 'application/pdf',
        });

      assertErrorStructure(res, 404, 'USER_NOT_FOUND');

      const filesInDocs = fs
        .readdirSync(UPLOADS_DIRECTORIES.DOCUMENTS)
        .filter((f) => f !== '.gitkeep');
      expect(filesInDocs).to.have.lengthOf(0);
    });
  });

  describe('3. Carga de comprobantes asociados a Pedidos y Entregas (POST /api/orders/:id/receipt y /api/deliveries/:id/receipt)', () => {
    let clientUser = null;
    let driverUser = null;
    let createdOrder = null;
    let createdDelivery = null;

    beforeEach(async () => {
      const clientRes = await request(app).post('/api/users').send({
        nombre: 'Cliente Comprobantes',
        email: 'cliente.comprobantes@shipnow.com',
        rol: USER_ROLES.CLIENTE,
      });
      clientUser = clientRes.body.data;

      const driverRes = await request(app).post('/api/users').send({
        nombre: 'Repartidor Comprobantes',
        email: 'repartidor.comprobantes@shipnow.com',
        rol: USER_ROLES.REPARTIDOR,
      });
      driverUser = driverRes.body.data;

      const orderRes = await request(app).post('/api/orders').send({
        cliente: clientUser._id,
        descripcion: 'Pedido con comprobante de pago',
        total: 18500,
        direccionEntrega: 'Av. Cabildo 2040, CABA',
      });
      createdOrder = orderRes.body.data;

      const deliveryRes = await request(app).post('/api/deliveries').send({
        pedido: createdOrder._id,
        repartidor: driverUser._id,
        direccion: 'Av. Cabildo 2040, CABA',
      });
      createdDelivery = deliveryRes.body.data;
    });

    it('POST /api/orders/:id/receipt debe guardar el comprobante en uploads/receipts y asociar sus metadatos al pedido', async () => {
      const res = await request(app)
        .post(`/api/orders/${createdOrder._id}/receipt`)
        .field('documentType', RECEIPT_TYPES.FACTURA)
        .attach('file', samplePdfBuffer, {
          filename: 'factura_pedido.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('receipt').that.is.an('object');
      expect(res.body.receipt).to.include({
        originalName: 'factura_pedido.pdf',
        mimeType: 'application/pdf',
        size: samplePdfBuffer.length,
        documentType: RECEIPT_TYPES.FACTURA,
      });
      expect(res.body.receipt.path).to.include('uploads/receipts/');

      expect(res.body.data).to.have.property('_id', createdOrder._id);
      expect(res.body.data.comprobantes).to.be.an('array').with.lengthOf(1);
      expect(res.body.data.comprobantes[0].originalName).to.equal('factura_pedido.pdf');

      const storedPath = path.resolve(process.cwd(), res.body.receipt.path);
      expect(fs.existsSync(storedPath)).to.be.true;
    });

    it('POST /api/deliveries/:id/receipt debe guardar el comprobante de entrega y devolver la entrega actualizada', async () => {
      const res = await request(app)
        .post(`/api/deliveries/${createdDelivery._id}/receipt`)
        .attach('file', samplePngBuffer, {
          filename: 'firma_recepcion.png',
          contentType: 'image/png',
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body.receipt.documentType).to.equal(RECEIPT_TYPES.COMPROBANTE_ENTREGA);
      expect(res.body.receipt.path).to.include('uploads/receipts/');
      expect(res.body.data.comprobantes).to.be.an('array').with.lengthOf(1);
      expect(res.body.data.comprobantes[0].originalName).to.equal('firma_recepcion.png');
    });

    it('Debe responder 404 (ORDER_NOT_FOUND / DELIVERY_NOT_FOUND) cuando la entidad del comprobante no existe', async () => {
      const fakeOrderId = '65f1a2b3c4d5e6f7a8b9c088';
      const orderRes = await request(app)
        .post(`/api/orders/${fakeOrderId}/receipt`)
        .attach('file', samplePdfBuffer, {
          filename: 'comprobante_sin_pedido.pdf',
          contentType: 'application/pdf',
        });

      assertErrorStructure(orderRes, 404, 'ORDER_NOT_FOUND');

      const fakeDeliveryId = '65f1a2b3c4d5e6f7a8b9c077';
      const deliveryRes = await request(app)
        .post(`/api/deliveries/${fakeDeliveryId}/receipt`)
        .attach('file', samplePngBuffer, {
          filename: 'comprobante_sin_entrega.png',
          contentType: 'image/png',
        });

      assertErrorStructure(deliveryRes, 404, 'DELIVERY_NOT_FOUND');

      // Verifica que no queden comprobantes huérfanos en uploads/receipts
      const filesInReceipts = fs
        .readdirSync(UPLOADS_DIRECTORIES.RECEIPTS)
        .filter((f) => f !== '.gitkeep');
      expect(filesInReceipts).to.have.lengthOf(0);
    });

    it('Debe responder 400 (FILE_REQUIRED) cuando falta el archivo de comprobante en pedidos o entregas', async () => {
      const orderRes = await request(app).post(`/api/orders/${createdOrder._id}/receipt`);
      assertErrorStructure(orderRes, 400, 'FILE_REQUIRED');

      const deliveryRes = await request(app).post(`/api/deliveries/${createdDelivery._id}/receipt`);
      assertErrorStructure(deliveryRes, 400, 'FILE_REQUIRED');
    });

    it('Debe responder 400 (INVALID_DOCUMENT_TYPE) si se envía un tipo de comprobante inválido en un pedido o entrega', async () => {
      const orderRes = await request(app)
        .post(`/api/orders/${createdOrder._id}/receipt`)
        .field('documentType', 'tipo_comprobante_invalido')
        .attach('file', samplePdfBuffer, {
          filename: 'recibo.pdf',
          contentType: 'application/pdf',
        });

      assertErrorStructure(orderRes, 400, 'INVALID_DOCUMENT_TYPE');
    });
  });
});
