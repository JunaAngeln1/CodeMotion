# CodeMotion

CodeMotion es una aplicación web educativa para aprender lógica y secuencias de programación mediante bloques visuales y un robot 3D. El usuario construye instrucciones, ejecuta el programa y debe llevar el robot hasta la meta evitando obstáculos.

## Tecnologías

- React 19 y TypeScript
- Vite 8
- React Router 7
- Zustand para estado global
- React Three Fiber, Drei y Three.js para la escena 3D
- Tailwind CSS 3
- dnd-kit para arrastrar y ordenar bloques
- Framer Motion y Lucide React
- Oxlint para análisis estático

## Requisitos

- Node.js compatible con Vite 8
- npm
- Navegador moderno

## Instalación y ejecución

```bash
npm install
npm run dev
```

Vite mostrará la URL local, normalmente `http://localhost:5173`.

Otros comandos disponibles:

```bash
npm run build
npm run lint
npm run preview
```

## Estado funcional

- Inicio con resumen de progreso.
- Cinco niveles ordenados y desbloqueables.
- Editor visual con bloques de avanzar, girar a la izquierda, girar a la derecha y repetir.
- Ejecución secuencial de bloques con animación del robot en una cuadrícula 3D.
- Detección de límites del tablero y obstáculos.
- Registro de puntos, insignias, nivel actual y soluciones en `localStorage`.
- Pantallas de resultados y reconocimientos.

La clave usada en `localStorage` es `codemotion_progress`. El estado inicial es nivel 1, cero puntos, sin insignias y sin niveles completados.

## Rutas

- `/`: pantalla de inicio.
- `/niveles`: selección de niveles.
- `/laboratorio/:levelId`: editor, tablero y ejecución.
- `/resultados`: resultado de un nivel.
- `/reconocimientos`: logros obtenidos.

## Arquitectura

```text
src/
  components/
    blocks/       Biblioteca y representación de bloques
    board/        Tablero 3D y composición de la escena
    editor/       Editor visual y barra de ejecución
    layout/       Navegación y estructura general
    robot/        Modelo y animación del robot
    screens/      Vistas principales
    ui/           Componentes visuales reutilizables
  engine/
    interpreter.ts       Interpreta instrucciones como un generador
    useProgramRunner.ts  Coordina ejecución, temporizador y estado 3D
  levels/
    data.ts              Configuración de los cinco niveles
  persistence/
    index.ts             Lectura y escritura de progreso
  store/
    appStore.ts          Navegación de pantalla
    programStore.ts      Programa construido y estado de ejecución
    progressStore.ts     Progreso del jugador
    robotStore.ts        Posición y orientación del robot
  types/
    index.ts             Tipos compartidos
  router.tsx
  App.tsx
  main.tsx
```

La ruta principal es `LabScreen`. Esta vista carga el nivel, muestra `Scene3D` y monta `Editor`. `useProgramRunner` convierte el programa de bloques en pasos del intérprete y actualiza `robotStore` cada 600 ms. El resultado se guarda mediante `progressStore` y `persistence`.

## Modelo de ejecución

Las instrucciones se representan con `BlockInstruction`:

- `move`: avanza una casilla según la dirección actual.
- `turnLeft`: gira 90 grados a la izquierda.
- `turnRight`: gira 90 grados a la derecha.
- `repeat`: repite instrucciones hijas una cantidad de veces.

`interpretProgram` devuelve pasos como `turn`, `move`, `obstacle`, `goal` y `done`. También limita la ejecución a 500 pasos para evitar bucles excesivos.

Las direcciones posibles son `north`, `east`, `south` y `west`. Las coordenadas crecen hacia la derecha y hacia abajo en el tablero lógico.

## Persistencia

El progreso se mantiene únicamente en el navegador. No existe backend ni API. Al borrar los datos del sitio se pierden:

- niveles completados;
- puntos;
- insignias;
- nivel actual;
- soluciones guardadas.

## Alias de imports

Vite configura `@` como alias de `./src`. Conservar este patrón en imports nuevos, por ejemplo:

```ts
import { LEVELS } from "@/levels/data";
```

## Convenciones importantes

- Mantener los tipos compartidos en `src/types/index.ts`.
- Mantener las configuraciones de niveles en `src/levels/data.ts`.
- Mantener el estado global en stores de Zustand.
- No escribir progreso directamente desde componentes; usar `progressStore` y `persistence`.
- Ejecutar `npm run build` después de cambios importantes.
- Considerar que el programa usa tanto coordenadas lógicas como posiciones visuales 3D; modificar ambos sistemas solo con cuidado.

## Limitaciones conocidas

- El reconocimiento gestual aparece mencionado en la interfaz, pero actualmente no hay un flujo MediaPipe implementado en los componentes del proyecto.
- La persistencia es local y no está sincronizada entre dispositivos.
- `progressStore.reset()` necesita revisar su comportamiento: delega el reinicio real a `resetProgress()`, pero su implementación actual vuelve a cargar el progreso existente.
- `useProgramRunner` contiene dependencias sensibles a cambios de posición y puede requerir estabilización para evitar ejecuciones duplicadas.
- No existe una suite de pruebas automatizadas en los scripts actuales.
- `dist/` y `node_modules/` están excluidos por `.gitignore` y se deben generar o instalar localmente.

## Contexto para continuar

Para continuar el desarrollo, primero ejecutar y validar los cinco niveles. Luego revisar el reinicio de progreso, estabilizar la ejecución del programa y, si se quiere completar la promesa de la interfaz, integrar realmente el reconocimiento gestual con MediaPipe. Después conviene añadir pruebas del intérprete, del cambio de estado y de la navegación.
