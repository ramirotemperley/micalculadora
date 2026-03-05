import { useMemo, useRef, useState } from "react";
import "./App.css";

function numero(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function formatoPeso(p) {
  if (!p) return "0.000 kg";
  if (p < 1) return `${Math.round(p * 1000)} g`;
  return `${p.toFixed(3)} kg`;
}

function formatoMoneda(n) {
  return `$ ${n.toFixed(2)}`;
}

function formatoGramos(g) {
  return `${parseFloat(g.toFixed(3))} g`;
}

function pesoEntradaAKg(v) {
  if (v >= 50) return v / 1000;
  return v;
}

function mostrarPesoInput(input) {
  if (input === "") return "0.000 kg";
  if (input.endsWith(".")) return `${input} kg`;
  const v = numero(input);
  if (v >= 50) return formatoGramos(v);
  return `${v.toFixed(3)} kg`;
}

export default function App() {
  const vendedor = "RAMIRO";

  const [modo, setModo] = useState("precio");
  const [precioInput, setPrecioInput] = useState("");
  const [pesoInput, setPesoInput] = useState("");
  const [articulos, setArticulos] = useState([]);
  const nextId = useRef(1);

  const precio = numero(precioInput);
  const pesoIngresado = numero(pesoInput);
  const pesoKg = pesoEntradaAKg(pesoIngresado);
  const pesoEfectivo = pesoInput !== "" && pesoInput !== "." ? pesoKg : 1;
  const importe = modo === "peso" ? precio * pesoEfectivo : precio;
  const enCarga = modo === "peso" || precioInput !== "" || pesoInput !== "";

  const total = useMemo(() => {
    return articulos.reduce((a, b) => a + b.total, 0);
  }, [articulos]);

  function setInputActivo(cb) {
    if (modo === "precio") {
      setPrecioInput(cb);
      return;
    }
    setPesoInput(cb);
  }

  function escribir(n) {
    setInputActivo((v) => v + n);
  }

  function punto() {
    setInputActivo((v) => (v.includes(".") ? v : `${v}.`));
  }

  function borrar() {
    setInputActivo((v) => v.slice(0, -1));
  }

  function borrarTecla() {
    const activo = modo === "precio" ? precioInput : pesoInput;
    if (activo.length === 0) {
      limpiar();
      return;
    }
    borrar();
  }

  function limpiar() {
    setPrecioInput("");
    setPesoInput("");
    setModo("precio");
  }

  function modoPeso() {
    if (precio > 0) setModo("peso");
  }

  function modoPrecio() {
    setModo("precio");
  }

  function agregar() {
    if (precio <= 0) return;
    if (modo === "peso" && pesoKg <= 0) return;

    const nuevo = {
      id: nextId.current++,
      precio,
      peso: modo === "peso" ? pesoKg : null,
      total: modo === "peso" ? precio * pesoKg : precio,
    };

    setArticulos((v) => [...v, nuevo]);
    limpiar();
  }

  const precioVista = formatoMoneda(precio);
  const pesoVista = mostrarPesoInput(pesoInput);
  const importeVista = formatoMoneda(importe);
  const totalVista = formatoMoneda(total);

  return (
    <div className="container">
      <header className="barra">
        <div className="dato empleado-dato">
          <span className="dato-titulo">EMPLEADO</span>
          <strong>{vendedor}</strong>
        </div>
        <div className="barra-resumen">
          <div className="dato articulos-dato">
            <span className="dato-titulo">ARTICULOS</span>
            <strong>{articulos.length}</strong>
          </div>
          <div className="dato total-dato">
            <span className="dato-titulo">TOTAL</span>
            <strong>{totalVista}</strong>
          </div>
        </div>
      </header>

      <section className={`contenido ${enCarga ? "en-carga" : ""}`}>
        {enCarga && (
          <div className="visor carga">
            <div className={`estado-carga ${modo === "peso" ? "peso" : "precio"}`}>
              EDITANDO {modo === "peso" ? "PESO" : "PRECIO"}
            </div>

            <div className="pantalla total pantalla-importe">
              <div className="titulo">IMPORTE</div>
              <div className="valor importe-color">{importeVista}</div>
            </div>

            <div
              className={`pantalla pantalla-precio ${modo === "precio" ? "activa" : ""}`}
              onClick={modoPrecio}
            >
              <div className="titulo">PRECIO</div>
              <div className="valor">{precioVista}</div>
            </div>

            <div
              className={`pantalla pantalla-peso ${modo === "peso" ? "activa" : ""}`}
              onClick={modoPeso}
            >
              <div className="titulo">PESO</div>
              <div className="valor">{pesoVista}</div>
            </div>
          </div>
        )}

        <div className="lista">
          <div className="lista-head">
            <span>#</span>
            <span>P.UNIT</span>
            <span>PESO</span>
            <span>SUBTOTAL</span>
          </div>

          {articulos.map((a, i) => (
            <div key={a.id} className="item">
              <span>{i + 1}</span>
              <span>{formatoMoneda(a.precio)}</span>
              <span>{a.peso ? formatoPeso(a.peso) : "-"}</span>
              <strong>{formatoMoneda(a.total)}</strong>
            </div>
          ))}

          {articulos.length === 0 && (
            <div className="lista-vacia">
              Sin articulos cargados. Para carga por peso: ingresa precio y toca
              PESO. Si en PESO ingresas 50 o mas, se interpreta como gramos.
            </div>
          )}
        </div>
      </section>

      <div className="teclado">
        <button onClick={() => escribir("7")}>7</button>
        <button onClick={() => escribir("8")}>8</button>
        <button onClick={() => escribir("9")}>9</button>
        <button className="del-arriba" onClick={borrarTecla}>
          DEL
        </button>

        <button onClick={() => escribir("4")}>4</button>
        <button onClick={() => escribir("5")}>5</button>
        <button onClick={() => escribir("6")}>6</button>
        <button className="sumar sumar-grande" onClick={agregar}>
          +
        </button>

        <button onClick={() => escribir("1")}>1</button>
        <button onClick={() => escribir("2")}>2</button>
        <button onClick={() => escribir("3")}>3</button>

        <button onClick={punto}>.</button>
        <button onClick={() => escribir("0")}>0</button>
        <button className="multiplicar" onClick={modoPeso}>
          x
        </button>
        <button className="igual igual-abajo" onClick={agregar}>
          =
        </button>
      </div>
    </div>
  );
}
