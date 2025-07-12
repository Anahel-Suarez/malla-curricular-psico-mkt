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

  // Agrupar cursos por ciclo
  const ciclos = {};
  cursos.forEach(curso => {
    if (!ciclos[curso.ciclo]) {
      ciclos[curso.ciclo] = [];
    }
    ciclos[curso.ciclo].push(curso);
  });

  // Crear columnas por ciclo
  Object.keys(ciclos).sort((a, b) => a - b).forEach(ciclo => {
    const col = document.createElement("div");
    col.classList.add("ciclo");

    const titulo = document.createElement("h2");
    titulo.textContent = ciclo;
    col.appendChild(titulo);

    ciclos[ciclo].forEach(curso => {
      const div = document.createElement("div");
      div.classList.add("curso");
      div.textContent = curso.nombre;
      div.dataset.codigo = curso.codigo;
      div.dataset.requisitos = JSON.stringify(curso.requisitos || []);

      // Añadir el clic directamente aquí
      div.addEventListener("click", () => {
        if (div.classList.contains("bloqueado")) return;
        div.classList.toggle("completado");
        actualizarCursos();
      });

      col.appendChild(div);
    });

    malla.appendChild(col);
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
}
