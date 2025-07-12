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

  cursos.forEach(curso => {
    const div = document.createElement("div");
    div.classList.add("curso");
    div.textContent = curso.nombre;
    div.dataset.codigo = curso.codigo;
    div.dataset.requisitos = JSON.stringify(curso.requisitos || []);
    div.dataset.estado = "bloqueado";
    malla.appendChild(div);
  });

  actualizarCursos();
}

function actualizarCursos() {
  document.querySelectorAll(".curso").forEach(curso => {
    const requisitos = JSON.parse(curso.dataset.requisitos);
    const completados = document.querySelectorAll(".curso.completado");

    const codigosCompletados = Array.from(completados).map(
      el => el.dataset.codigo
    );

    const habilitado = requisitos.every(req =>
      codigosCompletados.includes(req)
    );

    curso.classList.remove("completado", "bloqueado");

    if (requisitos.length === 0 || habilitado) {
      curso.dataset.estado = "activo";
    } else {
      curso.dataset.estado = "bloqueado";
      curso.classList.add("bloqueado");
    }
  });

  // Manejar clics
  document.querySelectorAll(".curso").forEach(curso => {
    curso.onclick = () => {
      if (curso.dataset.estado === "bloqueado") return;

      curso.classList.toggle("completado");
      actualizarCursos();
    };
  });
}
