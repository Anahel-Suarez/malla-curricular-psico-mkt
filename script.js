let cursos = [];

fetch("cursos.json")
  .then(res => res.json())
  .then(data => {
    cursos = data;
    mostrarMalla();
  });

function mostrarMalla() {
  const malla = document.getElementById("malla");
  malla.innerHTML = "";

  const estadoGuardado = JSON.parse(localStorage.getItem("progreso")) || {};

  // Agrupar por ciclo
  const ciclos = {};
  cursos.forEach(curso => {
    if (!ciclos[curso.ciclo]) ciclos[curso.ciclo] = [];
    ciclos[curso.ciclo].push(curso);
  });

  // Filtros activos
  const tipoFiltro = document.getElementById("filtro-tipo")?.value || "todos";
  const mencionFiltro = document.getElementById("filtro-mencion")?.value || "todas";

  Object.keys(ciclos).sort((a, b) => a - b).forEach(ciclo => {
    const columna = document.createElement("div");
    columna.classList.add("ciclo");

    const titulo = document.createElement("h2");
    titulo.textContent = ciclo;
    columna.appendChild(titulo);

    ciclos[ciclo].forEach(curso => {
      const div = document.createElement("div");
      div.classList.add("curso");
      div.textContent = curso.nombre;
      div.dataset.codigo = curso.codigo;
      div.dataset.requisitos = JSON.stringify(curso.requisitos || []);
      div.dataset.tipo = curso.condicion.toLowerCase();
      div.dataset.mencion = curso.mencion?.toLowerCase() || "todas";

      // Aplicar filtros
      if (
        (tipoFiltro !== "todos" && div.dataset.tipo !== tipoFiltro) ||
        (mencionFiltro !== "todas" && div.dataset.mencion !== mencionFiltro)
      ) return;

      if (div.dataset.tipo === "electivo") div.classList.add("electivo");

      // Restaurar progreso guardado
      if (estadoGuardado[curso.codigo]) {
        div.classList.add("completado");
      }

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

  cursosDOM.forEach(curso => {
    const requisitos = JSON.parse(curso.dataset.requisitos);
    const completados = Array.from(document.querySelectorAll(".curso.completado"))
                             .map(el => el.dataset.codigo);

    const habilitado = requisitos.length === 0 || requisitos.every(req => completados.includes(req));

    curso.classList.remove("bloqueado");

    if (!habilitado && !curso.classList.contains("completado")) {
      curso.classList.add("bloqueado");
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

// Reiniciar progreso
document.getElementById("reiniciar").addEventListener("click", () => {
  localStorage.removeItem("progreso");
  document.querySelectorAll(".curso").forEach(c => c.classList.remove("completado"));
  actualizarCursos();
});

// Filtros
document.getElementById("filtro-tipo").addEventListener("change", mostrarMalla);
document.getElementById("filtro-mencion").addEventListener("change", mostrarMalla);
