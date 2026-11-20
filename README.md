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
- MediaPipe Tasks Vision (reconocimiento gestual con cámara web)
- Oxlint para análisis estático
- Vitest (pruebas automatizadas)

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

### Abrir desde un teléfono

El servidor de desarrollo escucha en la red local (`0.0.0.0`) y utiliza el puerto fijo **5173**. Conecta el teléfono y el PC a la misma red y abre `http://IP_DEL_PC:5173` desde el teléfono; `localhost` o `127.0.0.1` en el teléfono apuntan al propio teléfono, no al PC. Consulta la IP del PC con `ipconfig`.

Si el puerto está ocupado, Vite mostrará el error en vez de cambiarlo silenciosamente. Comprueba que Windows permita Node.js en la red privada; no es necesario desactivar el firewall. Usa este servidor solo en redes de confianza.

Un enlace de túnel/proxy debe reenviar al puerto **5173**. Un HTTP 502 puede indicar que ese destino no está disponible. Para usar la **cámara desde el teléfono necesitas HTTPS** (con certificado de confianza o un túnel HTTPS autorizado); la IP local por HTTP permite probar la interfaz, pero no la cámara.

Otros comandos disponibles:

```bash
npm run build
npm run lint
npm run test
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
- Reconocimiento gestual con MediaPipe (pinza, mano abierta, pulgar arriba, puño cerrado) activable desde el laboratorio.
- Pruebas automatizadas con Vitest (motor, editor, inicio, persistencia, cámara y acciones gestuales).

La clave usada en `localStorage` es `codemotion_progress`. El estado inicial es nivel 1, cero puntos, sin insignias y sin niveles completados.

## Inicio interactivo

- Bienvenida con robot ilustrado que saluda al entrar y al tocarlo, y animaciones breves con Framer Motion.
- Demostración «Avanzar → Avanzar → Meta», ejecutada con el intérprete real. Permite probar, reiniciar y repetir sin modificar el robot del laboratorio, el programa guardado, los puntos ni el progreso.
- Camino de cinco misiones con estados disponible, completada y bloqueada; accesos reales al laboratorio, a los niveles y a las insignias.
- «Continuar misión» utiliza el progreso recuperado de LocalStorage. Al completar las cinco misiones, ofrece ver los logros en vez de abrir un nivel inexistente.
- Distribución adaptada al teléfono y al PC. Las animaciones respetan la preferencia de movimiento reducido y no se activa la cámara ni se reproduce audio automáticamente.

La portada está en `src/components/screens/HomeScreen.tsx`; sus componentes y estilos propios se encuentran en `src/components/home/`.

## Laboratorio responsive

- **PC (desde 1200 × 700):** aprovecha el ancho y la altura de la ventana. Tablero a la izquierda y editor de 400–520 px a la derecha. Solo la secuencia de un programa largo tiene scroll interno.
- **Teléfono, tableta y ventanas bajas:** tablero sobre el editor, con un único desplazamiento de página y controles fijos al pie que respetan el área segura del dispositivo.
- Los cuatro bloques están visibles en una cuadrícula de dos columnas. Se añaden con un clic o toque; se ordenan arrastrando exclusivamente desde el asa, sin interferir con la eliminación ni los campos numéricos.
- La biblioteca y la secuencia comparten piezas con encajes, iconos y degradados: azul para avanzar, morado para girar y naranja para repetir. Las formas SVG son decorativas y no recortan los controles ni el foco del teclado; las animaciones respetan la preferencia de movimiento reducido.
- También se pueden ordenar con teclado: enfocar el asa, espacio, flechas y espacio para soltar.
- La cámara está en un panel opcional y se activa manualmente. Cerrar el panel libera la cámara; no ocupa permanentemente espacio del editor.
- El encuadre 3D se ajusta al tamaño del panel. En dispositivos táctiles no captura el desplazamiento de la página para rotar el tablero.

Las reglas de distribución están en `src/index.css`. La navegación del laboratorio utiliza React Router y dispone de un menú móvil.

## Cámara y control gestual

1. Abre un desafío, pulsa **Cámara y gestos → Activar cámara** y permite el acceso.
2. Muestra una mano abierta completa. Hay un cursor virtual suavizado; funciona con la mano derecha o izquierda y acompaña la vista previa en espejo.
3. Para añadir una pieza, sitúa el cursor sobre un bloque de la biblioteca, haz pinza con pulgar e índice (otros dedos abiertos), muévelo a **Tu programa** y abre la mano para colocarlo.
4. Puedes ordenar piezas del programa de la misma forma. Soltar fuera cancela; soltar en la zona roja elimina la pieza. Si se pierde la mano, el movimiento se cancela sin cambiar los bloques.
5. Para pulsar un botón, haz pinza y abre la mano sobre el mismo botón. Esto permite eliminar piezas, ajustar repeticiones con +/−, detener la ejecución y responder a la confirmación de reinicio.

**Acciones protegidas:** mantener pulgar arriba 0,6 s ejecuta el programa; mantener puño cerrado 0,9 s solicita reiniciar. Ningún puño borra directamente: hay que elegir **Sí, reiniciar**. Mantener un gesto no repite su acción; abre la mano antes de intentarlo de nuevo. El mouse utiliza la misma confirmación y las mismas acciones del editor.

El panel se puede minimizar sin apagar la detección. **Centrar cursor** utiliza la posición actual como centro y el control de sensibilidad ajusta el alcance. Acerca el cursor a los bordes superior/inferior para desplazar la página o la secuencia de un programa largo.

**Requisitos y privacidad:** cámara y contexto seguro (HTTPS o localhost). Abrir la IP del PC desde el teléfono por HTTP no permite usar la cámara. El primer inicio necesita internet para descargar el modelo oficial; el WASM procede de la misma versión instalada del SDK, no de un CDN `latest`. Se intenta GPU y, si no está disponible, CPU. Las imágenes se procesan localmente, no se envían ni se graban. Cerrar el panel, cambiar de ruta o cambiar de pestaña libera la cámara. Puedes cancelar incluso mientras carga el modelo.

La clasificación, la estabilidad temporal, el cursor, las operaciones de bloques y los permisos/cancelaciones tienen pruebas automatizadas con muestras sintéticas. También se comprueba la inicialización del SDK/modelo real con vídeo de prueba de Chromium. **Esto no sustituye una validación con manos y cámaras físicas:** iluminación, oclusiones y rendimiento deben comprobarse en los dispositivos objetivo.

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
    gesture/      MediaPipe, cursor, gestos y confirmación segura de reinicio
    home/         Robot de bienvenida, demostración y camino de misiones
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

- La persistencia es local y no está sincronizada entre dispositivos.
- `progressStore.reset()` necesita revisar su comportamiento: delega el reinicio real a `resetProgress()`, pero su implementación actual vuelve a cargar el progreso existente.
- La precisión del reconocimiento debe validarse con manos y cámaras físicas, ambas manos, diferentes distancias e iluminación y los teléfonos objetivo. Las pruebas sintéticas no certifican esos escenarios.
- `dist/` y `node_modules/` están excluidos por `.gitignore` y se deben generar o instalar localmente.

## Contexto para continuar

Para continuar el desarrollo, validar los cinco niveles y sus soluciones, comprobar el reconocimiento con cámaras físicas y revisar el reinicio de progreso global. Mantener las pruebas de regresión del motor, el editor y los gestos al realizar cambios. La cámara utiliza MediaPipe real; las pruebas automatizadas comprueban su ciclo de vida y usan muestras sintéticas para las poses y las acciones del editor.
