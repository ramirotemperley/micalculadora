import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const ARTICULOS_CATALOGO = [
  "acelga",
  "ajo",
  "albahaca",
  "alcaucil",
  "anana",
  "apio",
  "arandano",
  "arveja",
  "avena",
  "banana",
  "batata",
  "berenjena",
  "brocoli",
  "cereza",
  "cebolla",
  "cebolla de verdeo",
  "chaucha",
  "choclo",
  "cilantro",
  "ciruela",
  "coliflor",
  "coco",
  "damasco",
  "durazno",
  "esparrago",
  "espinaca",
  "frambuesa",
  "frutilla",
  "granada",
  "haba",
  "higo",
  "jengibre",
  "kiwi",
  "lechuga",
  "lima",
  "limon",
  "mandarina",
  "mandioca",
  "mango",
  "manzana",
  "maracuya",
  "melon",
  "membrillo",
  "menta",
  "mora",
  "morron amarillo",
  "morron rojo",
  "morron verde",
  "nabo",
  "naranja",
  "oregano",
  "palta",
  "papaya",
  "papa",
  "pepino",
  "pera",
  "perejil",
  "pomelo",
  "puerro",
  "rabanito",
  "remolacha",
  "repollo",
  "repollo morado",
  "repollo de bruselas",
  "romero",
  "rucula",
  "sandia",
  "tomate",
  "tomate cherry",
  "uva",
  "zanahoria",
  "zapallito",
  "zapallo",
  "zucchini",
  "calabaza",
  "berenjena rayada",
  "lenteja",
  "garbanzo",
  "poroto",
  "pepino japones",
  "melon piel de sapo",
];

const T9 = {
  a: "2",
  b: "2",
  c: "2",
  d: "3",
  e: "3",
  f: "3",
  g: "4",
  h: "4",
  i: "4",
  j: "5",
  k: "5",
  l: "5",
  m: "6",
  n: "6",
  o: "6",
  p: "7",
  q: "7",
  r: "7",
  s: "7",
  t: "8",
  u: "8",
  v: "8",
  w: "9",
  x: "9",
  y: "9",
  z: "9",
};

const ARTICULOS = ARTICULOS_CATALOGO.map((nombre) => ({
  nombre,
  codigo: nombre
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .split("")
    .map((letra) => T9[letra] ?? "")
    .join(""),
}));

const ARTICULO_POR_DEFECTO = "verduleria";
const STORAGE_KEY = "micalculadora-state-v1";

function numero(v) {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
}

function formatoGramos(g) {
  return `${parseFloat(g.toFixed(3))} g`;
}

function pesoEntradaAKg(v, unidad) {
  if (unidad === "g") return v / 1000;
  return v;
}

function mostrarPesoInput(input, unidad = "kg") {
  if (input === "") return unidad === "g" ? "0 g" : "0.000 kg";
  if (input.endsWith(".")) return `${input} ${unidad}`;
  const v = numero(input);
  if (unidad === "g") return formatoGramos(v);
  return `${v.toFixed(3)} kg`;
}

function decimalAInput(valor) {
  if (!valor) return "";
  return `${valor}`.replace(/\.0+$/, "");
}

function convertirPesoInput(input, desdeUnidad, haciaUnidad) {
  if (input === "" || input === ".") return input;
  const valor = numero(input);
  const convertido = desdeUnidad === "kg" && haciaUnidad === "g" ? valor * 1000 : valor / 1000;
  return decimalAInput(convertido);
}

function leerEstadoGuardado() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function capitalizarArticulo(nombre) {
  if (!nombre) return "Verduleria";
  return nombre.replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function abreviarArticulo(nombre, max = 16) {
  const capitalizado = capitalizarArticulo(nombre);
  if (capitalizado.length <= max) return capitalizado;

  const palabras = capitalizado.split(" ");
  if (palabras.length > 1) {
    const abreviado = palabras
      .map((palabra, index) => (index === palabras.length - 1 ? palabra : `${palabra[0]}.`))
      .join(" ");
    if (abreviado.length <= max) return abreviado;
  }

  return `${capitalizado.slice(0, Math.max(0, max - 1))}…`;
}

function TeclaT9({ numero, letras, onClick, modoArticulo = false }) {
  return (
    <button
      translate="no"
      className={`tecla-t9 ${modoArticulo ? "modo-articulo" : ""}`}
      onClick={onClick}
    >
      <span className="tecla-numero">{numero}</span>
      <span className="tecla-letras">{letras}</span>
    </button>
  );
}

function MonedaDisplay({ valor, className = "" }) {
  const fijo = valor.toFixed(2);
  const [entero, decimal] = fijo.split(".");

  return (
    <span className={`moneda ${className}`.trim()}>
      <span className="moneda-signo">$</span>
      <span className="moneda-entero">{entero}</span>
      <span className="moneda-decimal">.{decimal}</span>
    </span>
  );
}

function IconoAccion({ tipo }) {
  if (tipo === "editar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="ticket-icono-svg">
        <path
          d="M4 20h4l10-10-4-4L4 16v4zm12.7-12.3 1.6-1.6a1 1 0 0 1 1.4 0l1.2 1.2a1 1 0 0 1 0 1.4L19.3 10l-2.6-2.3z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="ticket-icono-svg">
      <path
        d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9zm1 11c-1.1 0-2-.9-2-2V8h12v10c0 1.1-.9 2-2 2H8z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function App() {
  const vendedor = "RAMIRO";
  const estadoInicial = useMemo(() => leerEstadoGuardado() ?? {}, []);

  const [campoActivo, setCampoActivo] = useState(estadoInicial.campoActivo ?? "precio");
  const [precioInput, setPrecioInput] = useState(estadoInicial.precioInput ?? "");
  const [pesoInput, setPesoInput] = useState(estadoInicial.pesoInput ?? "");
  const [unidadPeso, setUnidadPeso] = useState(estadoInicial.unidadPeso ?? "kg");
  const [articuloQuery, setArticuloQuery] = useState(estadoInicial.articuloQuery ?? "");
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(
    estadoInicial.articuloSeleccionado ?? "",
  );
  const [panelArticuloAbierto, setPanelArticuloAbierto] = useState(
    estadoInicial.panelArticuloAbierto ?? false,
  );
  const [historialExpandido, setHistorialExpandido] = useState(false);
  const [articulos, setArticulos] = useState(
    Array.isArray(estadoInicial.articulos) ? estadoInicial.articulos : [],
  );
  const [preciosPorArticulo, setPreciosPorArticulo] = useState(
    estadoInicial.preciosPorArticulo && typeof estadoInicial.preciosPorArticulo === "object"
      ? estadoInicial.preciosPorArticulo
      : {},
  );
  const [editingId, setEditingId] = useState(estadoInicial.editingId ?? null);
  const nextId = useRef(estadoInicial.nextId ?? 1);

  const precio = numero(precioInput);
  const pesoIngresado = numero(pesoInput);
  const pesoKg = pesoEntradaAKg(pesoIngresado, unidadPeso);
  const tienePeso = pesoInput !== "" && pesoInput !== ".";
  const pesoEfectivo = tienePeso ? pesoKg : 1;
  const importe = precio * pesoEfectivo;
  const enCarga =
    precioInput !== "" ||
    pesoInput !== "" ||
    articuloQuery !== "" ||
    articuloSeleccionado !== "" ||
    campoActivo !== "precio" ||
    panelArticuloAbierto;
  const editandoItem = editingId !== null;

  const sugerencias = useMemo(() => {
    if (!articuloQuery) {
      if (!articuloSeleccionado) return ARTICULOS;
      return [
        ...ARTICULOS.filter((articulo) => articulo.nombre === articuloSeleccionado),
        ...ARTICULOS.filter((articulo) => articulo.nombre !== articuloSeleccionado),
      ];
    }

    return ARTICULOS.filter((articulo) => articulo.codigo.startsWith(articuloQuery));
  }, [articuloQuery, articuloSeleccionado]);

  const articuloActual =
    articuloSeleccionado ||
    (articuloQuery !== "" && sugerencias.length === 1 ? sugerencias[0].nombre : "");
  const precioRecordadoArticulo =
    articuloActual && typeof preciosPorArticulo[articuloActual] === "number"
      ? preciosPorArticulo[articuloActual]
      : null;

  const total = useMemo(() => {
    return articulos.reduce((acumulado, item) => acumulado + item.total, 0);
  }, [articulos]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        campoActivo,
        precioInput,
        pesoInput,
        unidadPeso,
        articuloQuery,
        articuloSeleccionado,
        panelArticuloAbierto,
        articulos,
        preciosPorArticulo,
        editingId,
        nextId: nextId.current,
      }),
    );
  }, [
    campoActivo,
    precioInput,
    pesoInput,
    unidadPeso,
    articuloQuery,
    articuloSeleccionado,
    panelArticuloAbierto,
    articulos,
    preciosPorArticulo,
    editingId,
  ]);

  function setInputActivo(cb) {
    if (historialExpandido) {
      setHistorialExpandido(false);
    }

    if (campoActivo === "precio") {
      setPrecioInput(cb);
      return;
    }

    if (campoActivo === "peso") {
      setPesoInput(cb);
    }
  }

  function escribirArticulo(n) {
    if (!/[2-9]/.test(n)) return;
    if (historialExpandido) {
      setHistorialExpandido(false);
    }
    setPanelArticuloAbierto(true);
    setArticuloSeleccionado("");
    setArticuloQuery((valor) => valor + n);
  }

  function escribir(n) {
    if (panelArticuloAbierto) {
      escribirArticulo(n);
      return;
    }

    setInputActivo((valor) => valor + n);
  }

  function punto() {
    if (panelArticuloAbierto) return;
    if (historialExpandido) {
      setHistorialExpandido(false);
    }
    setInputActivo((valor) => (valor.includes(".") ? valor : `${valor}.`));
  }

  function borrar() {
    if (panelArticuloAbierto) {
      if (articuloQuery.length > 0) {
        setPanelArticuloAbierto(true);
        setArticuloSeleccionado("");
        setArticuloQuery((valor) => valor.slice(0, -1));
        return;
      }

      if (articuloSeleccionado) {
        setPanelArticuloAbierto(true);
        setArticuloSeleccionado("");
      }

      return;
    }

    setInputActivo((valor) => valor.slice(0, -1));
  }

  function borrarTecla() {
    if (historialExpandido) {
      setHistorialExpandido(false);
    }

    if (panelArticuloAbierto) {
      if (articuloQuery.length > 0 || articuloSeleccionado) {
        borrar();
        return;
      }
      limpiar();
      return;
    }

    const activo = campoActivo === "precio" ? precioInput : pesoInput;
    if (activo.length === 0) {
      limpiar();
      return;
    }
    borrar();
  }

  function limpiar() {
    setPrecioInput("");
    setPesoInput("");
    setUnidadPeso("kg");
    setArticuloQuery("");
    setArticuloSeleccionado("");
    setPanelArticuloAbierto(false);
    setCampoActivo("precio");
    setEditingId(null);
  }

  function cerrarHistorial() {
    setHistorialExpandido(false);
  }

  function irAModoPeso() {
    if (precio > 0) {
      setPanelArticuloAbierto(false);
      setCampoActivo("peso");
    }
  }

  function abrirArticulo() {
    setPanelArticuloAbierto(true);
  }

  function cicloModo() {
    if (campoActivo === "precio") {
      irAModoPeso();
      return;
    }

    if (campoActivo === "peso" && unidadPeso === "kg") {
      setPesoInput((valor) => convertirPesoInput(valor, "kg", "g"));
      setUnidadPeso("g");
      return;
    }

    if (campoActivo === "peso" && unidadPeso === "g") {
      setPesoInput((valor) => convertirPesoInput(valor, "g", "kg"));
      setUnidadPeso("kg");
    }

    setPanelArticuloAbierto(false);
    setCampoActivo("precio");
  }

  function seleccionarArticulo(nombre) {
    const precioRecordado =
      typeof preciosPorArticulo[nombre] === "number" ? preciosPorArticulo[nombre] : null;

    setArticuloSeleccionado(nombre);
    setArticuloQuery("");
    setPanelArticuloAbierto(false);
    setPrecioInput(precioRecordado !== null ? decimalAInput(precioRecordado) : "");
    setCampoActivo(precioRecordado !== null ? "peso" : "precio");
  }

  function borrarArticulo(id) {
    setArticulos((valor) => valor.filter((item) => item.id !== id));
    if (editingId === id) {
      limpiar();
      cerrarHistorial();
    }
  }

  function editarArticulo(id) {
    const item = articulos.find((articulo) => articulo.id === id);
    if (!item) return;

    setPrecioInput(decimalAInput(item.precio));
    setPesoInput(
      item.peso
        ? decimalAInput(item.unidadPeso === "g" ? item.peso * 1000 : item.peso)
        : "",
    );
    setUnidadPeso(item.unidadPeso ?? "kg");
    setArticuloSeleccionado(item.articulo || ARTICULO_POR_DEFECTO);
    setArticuloQuery("");
    setPanelArticuloAbierto(false);
    setCampoActivo(item.peso ? "peso" : "precio");
    setEditingId(id);
    cerrarHistorial();
  }

  function confirmarArticulo() {
    if (!sugerencias.length) return;
    seleccionarArticulo(sugerencias[0].nombre);
  }

  function accionIgual() {
    if (panelArticuloAbierto) {
      confirmarArticulo();
      return;
    }

    agregar();
  }

  function agregar() {
    if (precio <= 0) return;
    if (tienePeso && pesoKg <= 0) return;

    const articulo = articuloActual || ARTICULO_POR_DEFECTO;
    const nuevo = {
      id: editingId ?? nextId.current++,
      articulo,
      precio,
      peso: tienePeso ? pesoKg : null,
      unidadPeso: tienePeso ? unidadPeso : "kg",
      total: precio * (tienePeso ? pesoKg : 1),
    };

    setPreciosPorArticulo((valor) => ({
      ...valor,
      [articulo]: precio,
    }));

    setArticulos((valor) => {
      if (editingId === null) return [...valor, nuevo];
      return valor.map((item) => (item.id === editingId ? nuevo : item));
    });
    limpiar();
  }

  const pesoVista = mostrarPesoInput(pesoInput, unidadPeso);
  const articuloVista = capitalizarArticulo(articuloActual);
  const articuloImporteVista = abreviarArticulo(articuloActual, 18);
  const codigoVista = articuloQuery ? `T9 ${articuloQuery}` : "Tap o 2-9";
  const mostrarPanelArticulo = panelArticuloAbierto;
  const listaArticulosVista = mostrarPanelArticulo ? sugerencias : [];

  return (
    <div className="container">
      <header className="barra">
        <div className="dato empleado-dato">
          <span className="dato-titulo">EMPLEADO</span>
          <strong>{vendedor}</strong>
        </div>
        <div className="barra-resumen">
          <button
            className={`dato articulos-dato articulos-toggle ${
              articulos.length > 0 ? "habilitado" : "bloqueado"
            }`}
            onClick={() => {
              if (articulos.length > 0) {
                setHistorialExpandido((valor) => !valor);
              }
            }}
          >
            <span className="dato-titulo">ARTICULOS</span>
            <div className="articulos-valor">
              <strong>{articulos.length}</strong>
              <span className="articulos-flecha">
                {articulos.length > 1 ? (historialExpandido ? "▲" : "▼") : ""}
              </span>
            </div>
          </button>
          <div className="dato total-dato">
            <span className="dato-titulo">TOTAL</span>
            <strong>
              <MonedaDisplay valor={total} className="moneda-total" />
            </strong>
          </div>
        </div>
      </header>

      <section className="contenido en-carga">
        <div className="visor carga">
          <div className={`estado-carga ${panelArticuloAbierto ? "articulo" : campoActivo}`}>
            {enCarga || editandoItem
              ? `EDITANDO ${
                  editandoItem && !panelArticuloAbierto
                    ? "ITEM"
                    : panelArticuloAbierto
                      ? "ARTICULO"
                      : campoActivo === "peso"
                        ? `PESO ${unidadPeso.toUpperCase()}`
                        : campoActivo.toUpperCase()
                }`
              : "LISTO"}
          </div>

          <div
            className={`pantalla total pantalla-importe ${panelArticuloAbierto ? "activa" : ""}`}
            onClick={() => {
              abrirArticulo();
            }}
          >
            <div className="importe-head">
              <div className="titulo">IMPORTE</div>
              <div className="subvalor">{codigoVista}</div>
            </div>
            <div className="importe-cuerpo">
              <div className="importe-articulo-wrap">
                <div className="subvalor subvalor-articulo">ARTICULO</div>
                <div className="valor-articulo importe-articulo" title={articuloVista}>
                  {articuloImporteVista}
                </div>
              </div>
              <div className="valor importe-color importe-valor">
                <MonedaDisplay valor={importe} className="moneda-principal" />
              </div>
            </div>
          </div>

          <div
            className={`pantalla pantalla-precio ${campoActivo === "precio" && !panelArticuloAbierto ? "activa" : ""}`}
            onClick={() => {
              setPanelArticuloAbierto(false);
              setCampoActivo("precio");
            }}
          >
            <div className="titulo">PRECIO</div>
            <div className="valor">
              <MonedaDisplay valor={precio} className="moneda-principal" />
            </div>
          </div>

          <div
            className={`pantalla pantalla-peso ${campoActivo === "peso" && !panelArticuloAbierto ? "activa" : ""}`}
            onClick={irAModoPeso}
          >
            <div className="titulo">{`PESO ${unidadPeso.toUpperCase()}`}</div>
            <div className="valor">{pesoVista}</div>
          </div>
        </div>

      </section>

      {mostrarPanelArticulo && (
        <div className="panel-articulos-flotante" translate="no">
          <div className="panel-articulos">
            <div className="panel-articulos-head">
              <div>
                <div className="panel-titulo">Seleccion de articulo</div>
                <div className="panel-subtitulo">
                  {articuloQuery
                    ? `Filtro T9 ${articuloQuery} · ${sugerencias.length} resultado(s)`
                    : "Desplaza la lista o usa el teclado T9 para acotar"}
                </div>
              </div>
              <button
                className="cerrar-panel-articulos"
                onClick={() => {
                  setPanelArticuloAbierto(false);
                }}
              >
                Cerrar
              </button>
            </div>

            <div className="panel-articulos-resumen">
              <span className="resumen-etiqueta">SEL</span>
              <div className="panel-articulos-resumen-texto">
                <strong>{articuloVista}</strong>
                <span className="panel-articulos-precio">
                  {precioRecordadoArticulo !== null
                    ? `Ult. precio $${precioRecordadoArticulo.toFixed(2)}`
                    : "Sin precio guardado"}
                </span>
              </div>
            </div>

            <div className="ayuda-selector-articulos">
              Toca las letras del teclado para filtrar. Al elegir un articulo se carga su ultimo
              precio.
            </div>

            <div className="sugerencias-articulo">
              {listaArticulosVista.map((articulo) => (
                <button
                  key={articulo.nombre}
                  className={`chip-articulo ${
                    articulo.nombre === articuloActual ? "seleccionado" : ""
                  }`}
                  onClick={() => seleccionarArticulo(articulo.nombre)}
                >
                  <span className="chip-articulo-nombre" title={capitalizarArticulo(articulo.nombre)}>
                    {abreviarArticulo(articulo.nombre, 20)}
                  </span>
                  <small className="chip-articulo-precio">
                    {typeof preciosPorArticulo[articulo.nombre] === "number"
                      ? `Ult. $${preciosPorArticulo[articulo.nombre].toFixed(2)}`
                      : "Sin precio"}
                  </small>
                </button>
              ))}

              {articuloQuery !== "" && sugerencias.length === 0 && (
                <div className="sin-sugerencias">Sin coincidencias para {articuloQuery}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {historialExpandido && (
        <div className="ticket-overlay" translate="no">
          <div className="ticket-sheet">
            <div className="ticket-head">
              <div>
                <div className="ticket-kicker">DETALLE DE VENTA</div>
                <h2 className="ticket-title">Ticket</h2>
              </div>
              <button className="ticket-close" onClick={cerrarHistorial}>
                Cerrar
              </button>
            </div>

            <div className="ticket-resumen">
              <div className="ticket-resumen-item">
                <span>Vendedor</span>
                <strong>{vendedor}</strong>
              </div>
              <div className="ticket-resumen-item">
                <span>Items</span>
                <strong>{articulos.length}</strong>
              </div>
              <div className="ticket-resumen-item total">
                <span>Total</span>
                <strong>
                  <MonedaDisplay valor={total} className="moneda-ticket-resumen" />
                </strong>
              </div>
            </div>

            <div className="ticket-lista">
              {articulos.map((item, index) => (
                <article key={item.id} className="ticket-item">
                  <span className="ticket-num">{index + 1}</span>
                  <strong className="ticket-articulo">{capitalizarArticulo(item.articulo)}</strong>
                  <div className="ticket-meta">
                    <span>
                      P.Unit <MonedaDisplay valor={item.precio} className="moneda-ticket-meta" />
                    </span>
                    <span>
                      {item.peso
                        ? mostrarPesoInput(
                            decimalAInput(item.unidadPeso === "g" ? item.peso * 1000 : item.peso),
                            item.unidadPeso ?? "kg",
                          )
                        : "Sin peso"}
                    </span>
                  </div>
                  <strong className="ticket-total">
                    <MonedaDisplay valor={item.total} className="moneda-ticket-total" />
                  </strong>
                  <div className="ticket-actions">
                    <button
                      className="ticket-btn editar"
                      onClick={() => editarArticulo(item.id)}
                      aria-label={`Editar ${capitalizarArticulo(item.articulo)}`}
                      title="Editar"
                    >
                      <IconoAccion tipo="editar" />
                    </button>
                    <button
                      className="ticket-btn borrar"
                      onClick={() => borrarArticulo(item.id)}
                      aria-label={`Borrar ${capitalizarArticulo(item.articulo)}`}
                      title="Borrar"
                    >
                      <IconoAccion tipo="borrar" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`teclado ${panelArticuloAbierto ? "modo-articulo" : ""}`}
        translate="no"
      >
        <TeclaT9
          numero="7"
          letras="PQRS"
          modoArticulo={panelArticuloAbierto}
          onClick={() => escribir("7")}
        />
        <TeclaT9
          numero="8"
          letras="TUV"
          modoArticulo={panelArticuloAbierto}
          onClick={() => escribir("8")}
        />
        <TeclaT9
          numero="9"
          letras="WXYZ"
          modoArticulo={panelArticuloAbierto}
          onClick={() => escribir("9")}
        />
        <button translate="no" className="del-arriba" onClick={borrarTecla}>
          DEL
        </button>

        <TeclaT9
          numero="4"
          letras="GHI"
          modoArticulo={panelArticuloAbierto}
          onClick={() => escribir("4")}
        />
        <TeclaT9
          numero="5"
          letras="JKL"
          modoArticulo={panelArticuloAbierto}
          onClick={() => escribir("5")}
        />
        <TeclaT9
          numero="6"
          letras="MNO"
          modoArticulo={panelArticuloAbierto}
          onClick={() => escribir("6")}
        />
        <button translate="no" className="igual igual-arriba" onClick={accionIgual}>
          =
        </button>

        <button translate="no" onClick={() => escribir("1")}>
          1
        </button>
        <TeclaT9
          numero="2"
          letras="ABC"
          modoArticulo={panelArticuloAbierto}
          onClick={() => escribir("2")}
        />
        <TeclaT9
          numero="3"
          letras="DEF"
          modoArticulo={panelArticuloAbierto}
          onClick={() => escribir("3")}
        />

        <button translate="no" onClick={punto}>
          .
        </button>
        <button translate="no" onClick={() => escribir("0")}>
          0
        </button>
        <button translate="no" className="multiplicar" onClick={cicloModo}>
          {campoActivo === "peso" ? unidadPeso.toUpperCase() : "×"}
        </button>
        <button translate="no" className="sumar sumar-grande" onClick={agregar}>
          +
        </button>
      </div>
    </div>
  );
}
