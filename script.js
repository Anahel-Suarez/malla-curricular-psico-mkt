let cursos = [];

fetch("cursos.json")
  .then(res => res.json())
  .then(data => {
    cursos = data;
    console.log("Cursos cargados:", cursos);
    restaurarFiltros();
    mostrarMalla();
  })
  .catch(err => {
    console.error("Error al cargar cursos.json:", err);
    alert("Hubo un problema al cargar los cursos.");
  });

function normalizarTexto(txt) {
  return txt?.toLowerCase().replace(/[:\s]/g, "-") || "";
}

function obtenerMencionesSeleccionadas() {
  const select = document.getElementById("filtro-mencion");
  const menciones = Array.from(select?.selectedOptions || []).map(opt => normalizarTexto(opt.value));
  console.log("Menciones seleccionadas:", menciones);
  return menciones;
}

function mostrarMalla() {
  const malla = document.getElementById("malla");
  if (!malla) return;
  malla.innerHTML = "";

  const tipoFiltro = document.getElementById("filtro-tipo")?.value || "todos";
  const mencionesSeleccionadas = obtenerMencionesSeleccionadas();
  const progreso = JSON.parse(localStorage.getItem("progreso") || "{}");

  const ciclos = {};
  cursos.forEach(curso => {
    if (!ciclos[curso.ciclo]) ciclos[curso.ciclo] = [];
    ciclos[curso.ciclo].push(curso);
  });

  Object.keys(ciclos)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(ciclo => {
      const columna = document.createElement("div");
      columna.classList.add("ciclo");

      const titulo = document.createElement("h2");
      titulo.textContent = ciclo;
      columna.appendChild(titulo);

      ciclos[ciclo].forEach(curso => {
        const tipo = curso.condicion?.toLowerCase() || "";
        const mencion = normalizarTexto(curso.mencion || "");

        const esObligatorio = tipo === "obligatorio";
        const esElectivo = tipo === "electivo";

        const visiblePorTipo =
          tipoFiltro === "todos" ||
          (tipoFiltro === "obligatorio" && esObligatorio) ||
          (tipoFiltro === "electivo" && esElectivo);

        const visiblePorMencion =
          mencionesSeleccionadas.length === 0 ||
          esObligatorio ||
          (esElectivo && mencionesSeleccionadas.includes(mencion));

        const mostrar = visiblePorTipo && visiblePorMencion;
        console.log(`Curso: ${curso.nombre}, tipo: ${tipo}, mencion: ${mencion}, mostrar: ${mostrar}`);

        if (!mostrar) return;

        const div = crearCursoDOM(curso, Object.keys(progreso));
        columna.appendChild(div);
      });

      malla.appendChild(columna);
    });

  actualizarCursos();
}

function crearCursoDOM(curso, completados) {
  const div = document.createElement("div");
  div.className = "curso";
  div.textContent = curso.nombre;
  div.dataset.codigo = curso.codigo;
  div.dataset.requisitos = JSON.stringify(curso.requisitos || []);
  div.dataset.tipo = curso.condicion?.toLowerCase() || "";
  div.dataset.mencion = normalizarTexto(curso.mencion || "");

  div.setAttribute("tabindex", "0");
  div.setAttribute("role", "button");
  div.setAttribute("aria-pressed", completados.includes(curso.codigo));

  if (div.dataset.tipo === "electivo") div.classList.add("electivo");
  if (completados.includes(curso.codigo)) div.classList.add("completado");

  div.addEventListener("click", () => {
    if (div.classList.contains("bloqueado")) return;
    div.classList.toggle("completado");
    div.setAttribute("aria-pressed", div.classList.contains("completado"));
    guardarProgreso();
    actualizarCursos();
  });

  return div;
}

function aplicarEstilosCurso(curso) {
  const tipo = curso.dataset.tipo;
  const completado = curso.classList.contains("completado");
  const bloqueado = curso.classList.contains("bloqueado");

  if (tipo === "electivo") {
    curso.style.backgroundColor = completado
      ? "#4ea8de"
      : bloqueado ? "#d8f3dc" : "#74c69d";
    curso.style.color = completado ? "#fff" : "#000";
  } else {
    curso.style.backgroundColor = completado
      ? "#CDB4DB"
      : bloqueado ? "#FFC8DD" : "#FFAFCC";
    curso.style.color = completado ? "#555" : "#000";
  }
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

    aplicarEstilosCurso(curso);
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

function restaurarFiltros() {
  const tipoGuardado = localStorage.getItem("filtro-tipo");
  const mencionGuardado = JSON.parse(localStorage.getItem("filtro-mencion") || "[]");

  if (tipoGuardado) document.getElementById("filtro-tipo").value = tipoGuardado;
  if (mencionGuardado.length > 0) {
    const select = document.getElementById("filtro-mencion");
    Array.from(select.options).forEach(opt => {
      opt.selected = mencionGuardado.includes(opt.value);
    });
  }
}

// === EVENTOS ===

document.getElementById("reiniciar")?.addEventListener("click", () => {
  localStorage.removeItem("progreso");
  mostrarMalla();
});

document.getElementById("filtro-tipo")?.addEventListener("change", e => {
  localStorage.setItem("filtro-tipo", e.target.value);
  mostrarMalla();
});

document.getElementById("filtro-mencion")?.addEventListener("change", e => {
  const menciones = Array.from(e.target.selectedOptions).map(opt => opt.value);
  localStorage.setItem("filtro-mencion", JSON.stringify(menciones));
  mostrarMalla();
});
