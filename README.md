# API REST de Gestión de Turnos — Taller Automotriz "MotorExpert Pro"

Proyecto práctico desarrollado para la asignatura **Cliente-Servidor (2026-2)** en la **Corporación Instituto de Administración y Finanzas (CIAF)**. Consiste en una API REST robusta, modular y desacoplada construida con **Node.js** y **Express**, aplicando una arquitectura limpia por capas (`routes`, `controllers`, `services`, `repositories`) y persistencia híbrida en **PostgreSQL** con respaldo automático en memoria.

---

## 1. Integrantes del Equipo

Los integrantes se encuentran ordenados alfabéticamente por su primer apellido, conforme a los lineamientos oficiales de la asignatura:

| # Orden | Nombre Completo | Apellidos | Nombres | N° Lista Oficial |
|:---:|:---|:---|:---|:---:|
| **1** | **Santiago García** | García | Santiago | **#7** *(Primer integrante)* |
| **2** | **Miguel Zambrano** | Zambrano | Miguel | *(Segundo integrante)* |

---

## 2. Parámetro $N$ y Regla de Negocio

Siguiendo las instrucciones del taller:
* **Criterio de asignación:** El valor de $N$ corresponde al número de lista del primer integrante alfabéticamente ordenado por apellido (**Santiago García** $\rightarrow N = 7$).
* **Fórmula del porcentaje de recargo:**
  $$\text{porcentajeRecargo} = N \times 2\% = 7 \times 2\% = 14\%$$
* **Aplicación en la Capa de Servicios (`services/turnos.service.js`):**
  - Si el turno tiene el atributo `"prioritario": true`:
    $$\text{totalPagar} = \text{precioBase} + \left(\text{precioBase} \times \frac{14}{100}\right)$$
  - Si el turno tiene `"prioritario": false`:
    $$\text{totalPagar} = \text{precioBase}$$

---

## 3. Definición del Caso de Negocio

### Negocio: Taller Mecánico Automotriz "MotorExpert Pro"
**Actividad Principal:**  
Centro especializado en diagnóstico electrónico, mantenimiento preventivo, mecánica rápida y reparación integral de vehículos particulares y comerciales. Debido a la alta demanda en el taller, los clientes pueden agendar turnos ordinarios o solicitar turnos prioritarios con recargo para atención inmediata en fosa o elevador express.

### Atributos Específicos de una Solicitud de Turno:
* `id` *(Number, auto-generado)*: Identificador único del turno.
* `cliente` *(String, obligatorio)*: Nombre completo del propietario o conductor del vehículo.
* `placaVehiculo` *(String, obligatorio)*: Placa o matrícula vehicular (ej. `ABC-123`).
* `tipoServicio` *(String, obligatorio)*: Servicio técnico requerido (ej. *"Mantenimiento Preventivo 10K"*, *"Alineación y Balanceo"*, *"Cambio de Pastillas de Freno"*).
* `fechaHora` *(String, obligatorio)*: Fecha y hora programada para la cita.
* `precioBase` *(Number, obligatorio)*: Tarifa base en pesos colombianos ($> 0$).
* `prioritario` *(Boolean, obligatorio)*: Indicador booleano (`true`/`false`) que determina si el servicio requiere atención prioritaria inmediata.
* `porcentajeRecargo` *(Number, calculado)*: Porcentaje aplicado según la regla de negocio del equipo ($14\%$ si es prioritario, $0\%$ si es ordinario).
* `totalPagar` *(Number, calculado)*: Valor total final a cancelar por el cliente tras procesar la regla de negocio.
* `creadoEn` *(Timestamp, auto-generado)*: Fecha y hora exacta de registro en el sistema.

---

## 4. Arquitectura del Proyecto

El código está estructurado estrictamente en capas para garantizar la separación de responsabilidades:

```text
taller_final/
├── docker-compose.yml          # Contenedor PostgreSQL 16
├── schema.sql                  # Script DDL de la tabla 'turnos'
├── package.json                # Configuración ES Modules y scripts
├── .env.example                # Variables de entorno modelo
├── .gitignore                  # Exclusión de node_modules y .env
├── README.md                   # Documentación oficial
├── tests/
│   └── turnos.test.js          # Suite de pruebas automatizadas (node:test)
└── src/
    ├── index.js                # Inicialización de Express y arranque de servidor
    ├── config/
    │   ├── db.js               # Pool y chequeo de conexión PostgreSQL
    │   └── environment.js      # Lectura y tipado de variables de entorno
    ├── routes/
    │   └── turnos.routes.js    # Definición de endpoints HTTP (/api/turnos)
    ├── controllers/
    │   └── turnos.controller.js# Manejo de req/res, validaciones y códigos HTTP
    ├── services/
    │   └── turnos.service.js   # Lógica de cálculo matemático (N) y negocio
    └── repositories/
        └── turnos.repository.js# Persistencia PostgreSQL con fallback en memoria
```

### Persistencia Dual (PostgreSQL + Memoria):
Para cumplir con los deseos de uso de **PostgreSQL** y a la vez garantizar que cualquier docente o evaluador pueda ejecutar el proyecto sin necesidad de tener un motor de base de datos instalado, el repositorio (`turnos.repository.js`) detecta automáticamente si PostgreSQL está disponible:
1. **Con Docker / PostgreSQL:** Almacena y consulta en la tabla `turnos`.
2. **Sin Base de Datos Externa:** Realiza respaldo automático en memoria con datos semilla precargados, cumpliendo el requisito #2 del taller.

---

## 5. Endpoints de la API

| Método | Endpoint | Descripción | Códigos HTTP |
|:---:|:---|:---|:---:|
| `GET` | `/` | Información general del proyecto y estado de la regla $N$ | `200 OK` |
| `GET` | `/api/turnos` | Retorna el listado completo de turnos registrados | `200 OK` |
| `GET` | `/api/turnos/:id` | Retorna la información de un turno específico | `200 OK`, `404 Not Found` |
| `POST` | `/api/turnos` | Registra una nueva solicitud y ejecuta el cálculo de tarifa | `201 Created`, `400 Bad Request` |

---

## 6. Ejemplos de Pruebas de Endpoints

### 6.1. Caso Exitoso 1: Turno Prioritario (`201 Created`)
Se solicita un turno con `"prioritario": true` y `precioBase: 100000`. Con $N = 7$ (recargo del $14\%$), el sistema calcula automáticamente:
$$\text{totalPagar} = 100000 + (100000 \times 0.14) = 114000$$

**Petición (`POST /api/turnos`):**
```bash
curl -X POST http://localhost:3000/api/turnos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Marcela Valencia",
    "placaVehiculo": "QWE-987",
    "tipoServicio": "Sincronización Electrónica",
    "fechaHora": "2026-11-26 16:30:00",
    "precioBase": 100000,
    "prioritario": true
  }'
```

**Respuesta Obtenida (`201 Created`):**
```json
{
  "id": 4,
  "cliente": "Marcela Valencia",
  "placaVehiculo": "QWE-987",
  "tipoServicio": "Sincronización Electrónica",
  "fechaHora": "2026-11-26 16:30:00",
  "precioBase": 100000,
  "prioritario": true,
  "porcentajeRecargo": 14,
  "totalPagar": 114000,
  "creadoEn": "2026-11-24T07:43:04.505Z"
}
```

---

### 6.2. Caso Exitoso 2: Turno Ordinario (`201 Created`)
Se solicita un turno sin prioridad (`"prioritario": false`). El total a pagar coincide con el precio base.

**Petición (`POST /api/turnos`):**
```bash
curl -X POST http://localhost:3000/api/turnos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Andrés Felipe Castro",
    "placaVehiculo": "KLR-456",
    "tipoServicio": "Cambio de Pastillas de Freno",
    "fechaHora": "2026-11-26 14:00:00",
    "precioBase": 200000,
    "prioritario": false
  }'
```

**Respuesta Obtenida (`201 Created`):**
```json
{
  "id": 3,
  "cliente": "Andrés Felipe Castro",
  "placaVehiculo": "KLR-456",
  "tipoServicio": "Cambio de Pastillas de Freno",
  "fechaHora": "2026-11-26 14:00:00",
  "precioBase": 200000,
  "prioritario": false,
  "porcentajeRecargo": 0,
  "totalPagar": 200000,
  "creadoEn": "2026-11-24T07:43:04.497Z"
}
```

---

### 6.3. Caso de Error 1: Precio Base Inválido (`400 Bad Request`)
Se envía un valor numérico menor o igual a cero (`precioBase: -25000`).

**Petición (`POST /api/turnos`):**
```bash
curl -X POST http://localhost:3000/api/turnos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Pedro Infante",
    "placaVehiculo": "ZZZ-000",
    "tipoServicio": "Revisión General",
    "fechaHora": "2026-11-27 09:00:00",
    "precioBase": -25000,
    "prioritario": false
  }'
```

**Respuesta Obtenida (`400 Bad Request`):**
```json
{
  "error": "Bad Request",
  "mensaje": "El campo precioBase debe ser un valor numérico estrictamente mayor a cero (precioBase > 0)."
}
```

---

### 6.4. Caso de Error 2: Campos Obligatorios Faltantes (`400 Bad Request`)
Se omite el cliente y la placa del vehículo.

**Petición (`POST /api/turnos`):**
```bash
curl -X POST http://localhost:3000/api/turnos \
  -H "Content-Type: application/json" \
  -d '{
    "tipoServicio": "Revisión General",
    "fechaHora": "2026-11-27 09:00:00",
    "precioBase": 50000,
    "prioritario": false
  }'
```

**Respuesta Obtenida (`400 Bad Request`):**
```json
{
  "error": "Bad Request",
  "mensaje": "Faltan campos obligatorios en la solicitud: cliente, placaVehiculo."
}
```

---

### 6.5. Caso de Error 3: Identificador Inexistente (`404 Not Found`)
Se consulta un turno con un identificador que no existe en el sistema (`GET /api/turnos/999`).

**Petición:**
```bash
curl http://localhost:3000/api/turnos/999
```

**Respuesta Obtenida (`404 Not Found`):**
```json
{
  "error": "Not Found",
  "mensaje": "No se encontró ningún turno con el identificador '999'."
}
```

---

## 7. Instrucciones de Instalación y Ejecución

### Requisitos Previos:
* Node.js v18+ (probado en Node.js v24 LTS).
* Docker y Docker Compose *(opcional, solo si se desea levantar PostgreSQL)*.

### 1. Clonar el repositorio e instalar dependencias:
```bash
git clone <URL_DEL_REPOSITORIO>
cd taller_final
npm install
```

### 2. Configurar variables de entorno:
```bash
cp .env.example .env
```

### 3. Levantar la Base de Datos (Opcional):
```bash
npm run db:up
```
*(Si no ejecutas este comando, la API arrancará automáticamente en modo memoria sin fallos).*

### 4. Iniciar la aplicación:
```bash
# Modo desarrollo con recarga en caliente
npm run dev

# O modo producción
npm start
```

### 5. Ejecutar la Suite de Pruebas Automatizadas:
Con el servidor en ejecución, en otra terminal corre:
```bash
npm test
```
Resultados esperados: 8 pruebas pasando al 100%.

---

## Licencia
Este proyecto es de uso académico para la asignatura de Arquitectura Cliente-Servidor de la CIAF.
