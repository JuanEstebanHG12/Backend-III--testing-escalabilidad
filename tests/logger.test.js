import fs from 'node:fs';
import path from 'node:path';
import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import {
  logger,
  CUSTOM_LOG_LEVELS,
  resolveLogLevelByEnv,
  formatLogEntry,
  LOGS_DIR,
} from '../src/config/logger.config.js';

describe('Pre-entrega Módulo 4 — Logging y monitoreo básico con Winston', () => {
  describe('1. Niveles personalizados y formato de Winston', () => {
    it('Debe definir exactamente los 6 niveles requeridos: fatal, error, warning, info, http y debug', () => {
      const expectedLevels = ['fatal', 'error', 'warning', 'info', 'http', 'debug'];
      expect(Object.keys(CUSTOM_LOG_LEVELS.levels)).to.deep.equal(expectedLevels);
      expect(CUSTOM_LOG_LEVELS.levels.fatal).to.equal(0);
      expect(CUSTOM_LOG_LEVELS.levels.error).to.equal(1);
      expect(CUSTOM_LOG_LEVELS.levels.warning).to.equal(2);
      expect(CUSTOM_LOG_LEVELS.levels.info).to.equal(3);
      expect(CUSTOM_LOG_LEVELS.levels.http).to.equal(4);
      expect(CUSTOM_LOG_LEVELS.levels.debug).to.equal(5);
    });

    it('Debe exponer métodos en el logger para los 6 niveles', () => {
      for (const level of ['debug', 'http', 'info', 'warning', 'error', 'fatal']) {
        expect(logger[level]).to.be.a('function');
      }
    });

    it('Debe diferenciar el nivel activo según el entorno (development vs production)', () => {
      expect(resolveLogLevelByEnv('development')).to.equal('debug');
      expect(resolveLogLevelByEnv('production')).to.equal('info');
    });

    it('Debe formatear las entradas con timestamp + [nivel] alineado + mensaje', () => {
      const infoLine = formatLogEntry({
        timestamp: '2026-08-01 10:12:03',
        level: 'info',
        message: 'Servidor ShipNow escuchando en el puerto 3000',
      });
      expect(infoLine).to.equal(
        '2026-08-01 10:12:03 [info]    Servidor ShipNow escuchando en el puerto 3000'
      );

      const warnLine = formatLogEntry({
        timestamp: '2026-08-01 10:14:21',
        level: 'warning',
        message: 'Pedido #A-102 sin repartidor asignado',
      });
      expect(warnLine).to.equal(
        '2026-08-01 10:14:21 [warning] Pedido #A-102 sin repartidor asignado'
      );
    });
  });

  describe('2. Endpoint de prueba (/api/loggerTest) con Supertest y persistencia en /logs/error.log', () => {
    it('Debe disparar todos los niveles y persistir en /logs/error.log únicamente error y fatal', async () => {
      const errorLogPath = path.join(LOGS_DIR, 'error.log');
      if (fs.existsSync(errorLogPath)) {
        fs.writeFileSync(errorLogPath, '', 'utf8');
      }

      const res = await request(app).get('/api/loggerTest');

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.testedLevels).to.deep.equal([
        'fatal',
        'error',
        'warning',
        'info',
        'http',
        'debug',
      ]);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(fs.existsSync(errorLogPath)).to.be.true;
      const errorLogContent = fs.readFileSync(errorLogPath, 'utf8').trim();
      const lines = errorLogContent.split('\n').filter(Boolean);

      expect(lines.length).to.be.at.least(2);
      expect(lines.some((line) => line.includes('[error]'))).to.be.true;
      expect(lines.some((line) => line.includes('[fatal]'))).to.be.true;

      for (const forbidden of ['[info]', '[warning]', '[http]', '[debug]']) {
        expect(lines.some((line) => line.includes(forbidden))).to.be.false;
      }
    });
  });
});
