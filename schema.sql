-- Script de inicialización de la base de datos
-- Taller Automotriz "MotorExpert Pro"

CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    cliente VARCHAR(100) NOT NULL,
    placa_vehiculo VARCHAR(20) NOT NULL,
    tipo_servicio VARCHAR(100) NOT NULL,
    fecha_hora VARCHAR(50) NOT NULL,
    precio_base NUMERIC(12, 2) NOT NULL CHECK (precio_base > 0),
    prioritario BOOLEAN NOT NULL DEFAULT FALSE,
    porcentaje_recargo NUMERIC(5, 2) NOT NULL DEFAULT 0,
    total_pagar NUMERIC(12, 2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos semilla iniciales para pruebas
INSERT INTO turnos (cliente, placa_vehiculo, tipo_servicio, fecha_hora, precio_base, prioritario, porcentaje_recargo, total_pagar)
VALUES 
('Carlos Méndez', 'ABC-123', 'Alineación y Balanceo', '2026-11-25 08:30:00', 80000.00, false, 0.00, 80000.00),
('Laura Restrepo', 'XYZ-789', 'Mantenimiento Preventivo 10K', '2026-11-25 10:00:00', 150000.00, true, 14.00, 171000.00)
ON CONFLICT DO NOTHING;
