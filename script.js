let cursos = [];

fetch("cursos.json")
  .then(res => res.json())
  .then(data => {
    cursos = data;
    mostrarMalla();
  });

function obtenerMencionesSeleccionadas() {
  const select = document.getElementById("filtro-mencion");
  return Array.from(select?.selectedOptions || []).map(opt => opt.value.toLowerCase());
}

function mostrarMalla() {
  const malla = document.getElementById("malla");
  if (!malla) return;
  malla.innerHTML = "";

  const tipoFiltro = document.getElementById("filtro-tipo")?.value || "todos";
  const mencionesSeleccionadas = obtenerMencionesSeleccionadas();
  const progreso = JSON.parse(localStorage.getItem("progreso") || "{}");

  // Agrupar cursos por ciclo
  const ciclos = {};
  cursos.forEach(curso => {
    if (!ciclos[curso.ciclo]) ciclos[curso.ciclo] = [];
    ciclos[curso.ciclo].push(curso);
  });

  Object.keys(ciclos).sort((a, b) => parseInt(a) - parseInt(b)).forEach(ciclo => {
    const columna = document.createElement("div");
    columna.classList.add("ciclo");

    const titulo = document.createElement("h2");
    titulo.textContent = ciclo;
    columna.appendChild(titulo);

    ciclos[ciclo].forEach(curso => {
      const tipo = curso.condicion?.toLowerCase() || "";
      const esObligatorio = tipo === "obligatorio";
      const esElectivo = tipo === "electivo";
      const mencion = (curso.mencion || "").toLowerCase();

      const mostrar =
        (tipoFiltro === "todos" || tipo === tipoFiltro) &&
        (esObligatorio || mencionesSeleccionadas.length === 0 || mencionesSeleccionadas.includes(mencion));

      if (!mostrar) return;

      const div = document.createElement("div");
      div.className = "curso";
      div.textContent = curso.nombre;
      div.dataset.codigo = curso.codigo;
      div.dataset.requisitos = JSON.stringify(curso.requisitos || []);
      div.dataset.tipo = tipo;
      div.dataset.mencion = mencion;

      if (esElectivo) div.classList.add("electivo");
      if (progreso[curso.codigo]) div.classList.add("completado");

      div.addEventListener("click", () => {
        if (div.classList.contains("bloqueado")) return;
        div.classList.toggle("completado");
        guardarProgreso();
        actualizarCursos();
      });

      columna.appendChild(div);
    });

    malla.appendChild(columna);
  });

  actualizarCursos();
}

function actualizarCursos() {
  const cursosDOM = document.querySelectorAll(".curso");

  const completados = Array.from(document.querySelectorAll(".curso.completado"))
                           .map(el => el.dataset.codigo);

  cursosDOM.forEach(curso => {
    const requisitos = JSON.parse(curso.dataset.requisitos || "[]");
    const habilitado = requisitos.length === 0 || requisitos.every(r => completados.includes(r));

    curso.classList.remove("bloqueado");

    if (!habilitado && !curso.classList.contains("completado")) {
      curso.classList.add("bloqueado");
    }

    const tipo = curso.dataset.tipo;
    if (tipo === "electivo") {
      curso.style.backgroundColor = curso.classList.contains("completado")
        ? "#4ea8de"
        : curso.classList.contains("bloqueado")
          ? "#d8f3dc"
          : "#74c69d";

      curso.style.color = curso.classList.contains("completado") ? "#fff" : "#000";
    } else {
      curso.style.backgroundColor = curso.classList.contains("completado")
        ? "#CDB4DB"
        : curso.classList.contains("bloqueado")
          ? "#FFC8DD"
          : "#FFAFCC";

      curso.style.color = curso.classList.contains("completado") ? "#555" : "#000";
    }
  });

  guardarProgreso();
}

function guardarProgreso() {
  const cursosDOM = document.querySelectorAll(".curso");
  const progreso = {};
  cursosDOM.forEach(curso => {
    if (curso.classList.contains("completado")) {
      progreso[curso.dataset.codigo] = true;
    }
  });
  localStorage.setItem("progreso", JSON.stringify(progreso));
}

document.getElementById("reiniciar")?.addEventListener("click", () => {
  localStorage.removeItem("progreso");
  mostrarMalla(); // reconstruye toda la malla
});

document.getElementById("filtro-tipo")?.addEventListener("change", mostrarMalla);
document.getElementById("filtro-mencion")?.addEventListener("change", mostrarMalla);
