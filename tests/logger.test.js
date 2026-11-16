import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
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
      assert.deepEqual(Object.keys(CUSTOM_LOG_LEVELS.levels), expectedLevels);
      assert.equal(CUSTOM_LOG_LEVELS.levels.fatal, 0);
      assert.equal(CUSTOM_LOG_LEVELS.levels.error, 1);
      assert.equal(CUSTOM_LOG_LEVELS.levels.warning, 2);
      assert.equal(CUSTOM_LOG_LEVELS.levels.info, 3);
      assert.equal(CUSTOM_LOG_LEVELS.levels.http, 4);
      assert.equal(CUSTOM_LOG_LEVELS.levels.debug, 5);
    });

    it('Debe exponer métodos en el logger para los 6 niveles', () => {
      for (const level of ['debug', 'http', 'info', 'warning', 'error', 'fatal']) {
        assert.equal(typeof logger[level], 'function', `Falta método logger.${level}`);
      }
    });

    it('Debe diferenciar el nivel activo según el entorno (development vs production)', () => {
      assert.equal(resolveLogLevelByEnv('development'), 'debug');
      assert.equal(resolveLogLevelByEnv('production'), 'info');
    });

    it('Debe formatear las entradas con timestamp + [nivel] alineado + mensaje', () => {
      const infoLine = formatLogEntry({
        timestamp: '2026-08-01 10:12:03',
        level: 'info',
        message: 'Servidor ShipNow escuchando en el puerto 3000',
      });
      assert.equal(
        infoLine,
        '2026-08-01 10:12:03 [info]    Servidor ShipNow escuchando en el puerto 3000'
      );

      const warnLine = formatLogEntry({
        timestamp: '2026-08-01 10:14:21',
        level: 'warning',
        message: 'Pedido #A-102 sin repartidor asignado',
      });
      assert.equal(
        warnLine,
        '2026-08-01 10:14:21 [warning] Pedido #A-102 sin repartidor asignado'
      );
    });
  });

  describe('2. Endpoint de prueba (/api/loggerTest y /loggerTest) y persistencia en /logs/error.log', () => {
    it('Debe disparar todos los niveles y persistir en /logs/error.log únicamente error y fatal', async () => {
      const errorLogPath = path.join(LOGS_DIR, 'error.log');
      if (fs.existsSync(errorLogPath)) {
        fs.writeFileSync(errorLogPath, '', 'utf8');
      }

      const server = app.listen(0);
      const { port } = server.address();
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        const res = await fetch(`${baseUrl}/api/loggerTest`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.equal(body.success, true);
        assert.deepEqual(body.testedLevels, ['fatal', 'error', 'warning', 'info', 'http', 'debug']);

        // Esperamos brevemente a que los streams de archivo de Winston hagan flush en disco
        await new Promise((resolve) => setTimeout(resolve, 150));

        assert.equal(fs.existsSync(errorLogPath), true, 'El archivo logs/error.log debe existir');
        const errorLogContent = fs.readFileSync(errorLogPath, 'utf8').trim();
        const lines = errorLogContent.split('\n').filter(Boolean);

        assert.ok(lines.length >= 2, 'logs/error.log debe contener los registros error y fatal');
        assert.equal(
          lines.some((line) => line.includes('[error]')),
          true,
          'logs/error.log debe incluir nivel [error]'
        );
        assert.equal(
          lines.some((line) => line.includes('[fatal]')),
          true,
          'logs/error.log debe incluir nivel [fatal]'
        );

        // Verificamos que NO se filtren niveles inferiores en error.log
        for (const forbidden of ['[info]', '[warning]', '[http]', '[debug]']) {
          assert.equal(
            lines.some((line) => line.includes(forbidden)),
            false,
            `logs/error.log NO debe contener registros de nivel ${forbidden}`
          );
        }
      } finally {
        server.close();
      }
    });
  });
});
